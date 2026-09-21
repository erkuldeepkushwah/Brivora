// Generates a quiz bank (5 sets x 10 MCQ per active course) with Gemini
// and writes it to Firebase RTDB at brivora_quizzes/{courseId}.
// Runs in GitHub Actions with GEMINI_API_KEY from repo secrets.
// The API key never reaches the browser or the repo.
//
// Multi-model: tries several flash models in order, so a model that is
// retired / overloaded / out of quota does not block generation.
// Fail-fast: if every model is quota-blocked, skips remaining work instead of grinding.

import https from 'node:https';
import http from 'node:http';

const DB = process.env.RTDB_URL || 'https://career-68877-default-rtdb.firebaseio.com';
const KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE = process.env.GEMINI_BASE || 'https://generativelanguage.googleapis.com';
const MODEL_CANDIDATES = [
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-lite-latest'
];
const SETS = 5;
const QCOUNT = 10;

if (!KEY) {
  console.error('GEMINI_API_KEY env var missing');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function req(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https:') ? https : http;
    const r = mod.request(url, opts, (res) => {
      let b = '';
      res.on('data', (d) => (b += d));
      res.on('end', () => resolve({ status: res.statusCode, text: b }));
    });
    r.on('error', reject);
    if (opts.body) r.write(opts.body);
    r.end();
  });
}

async function rtdbGet(path) {
  const r = await req(`${DB}/${path}.json`);
  if (r.status !== 200) throw new Error(`RTDB read failed: ${r.status}`);
  return JSON.parse(r.text);
}

// Probe which models this key can actually use right now.
async function resolveModels() {
  const usable = [];
  const r = await req(`${GEMINI_BASE}/v1beta/models?pageSize=200`, { headers: { 'x-goog-api-key': KEY } });
  if (r.status === 200) {
    try {
      const data = JSON.parse(r.text);
      const names = (data.models || []).map((m) => (m.name || '').replace('models/', ''));
      for (const m of MODEL_CANDIDATES) if (names.includes(m)) usable.push(m);
      console.log(`Models visible to this key: ${names.filter((n) => /flash/.test(n)).join(', ') || '(none)'}`);
    } catch (e) {
      console.log(`Model list parse failed (${e.message}); using default candidates.`);
    }
  } else {
    console.log(`Model list request failed (${r.status}); using default candidates.`);
  }
  return usable.length ? usable : MODEL_CANDIDATES;
}

let MODELS = MODEL_CANDIDATES;
let QUOTA_BLOCKED = false; // true once every model said quota-exceeded in a full round

async function gemini(prompt) {
  let lastErr = 'unknown';
  for (const model of MODELS) {
    if (QUOTA_BLOCKED) break;
    for (let attempt = 0; attempt < 2; attempt++) {
      const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 1, responseMimeType: 'application/json' }
      };
      const r = await req(`${GEMINI_BASE}/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
        body: JSON.stringify(body)
      });
      if (r.status === 200) {
        const data = JSON.parse(r.text);
        const text = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
        return JSON.parse(text);
      }
      const quota = String(r.text).includes('exceeded your current quota');
      lastErr = `${model} -> ${r.status}${quota ? ' (quota)' : ''}`;
      if (quota) break; // switch model immediately
      if (r.status === 429 || r.status >= 500) {
        await sleep(20000 * (attempt + 1)); // 20s, 40s then give up on this model
        continue;
      }
      break; // other error (400/404) -> next model
    }
  }
  throw new Error(`all models failed (${lastErr})`);
}

function validSet(quiz) {
  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length !== QCOUNT) return false;
  return quiz.questions.every(
    (q) =>
      typeof q.q === 'string' &&
      q.q.trim().length > 5 &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      q.options.every((o) => typeof o === 'string' && o.trim().length > 0) &&
      Number.isInteger(q.answer) &&
      q.answer >= 0 &&
      q.answer <= 3
  );
}

function makePrompt(course, setNo) {
  return [
    'You are an expert exam setter for an Indian IT training institute.',
    `Create a brand-new multiple-choice quiz set (Set #${setNo}) for the course "${course.name}"`,
    `(category: ${course.category || 'IT'}, level: ${course.level || 'Beginner'}).`,
    '',
    'Rules:',
    `- Exactly ${QCOUNT} questions, each with exactly 4 options and exactly 1 correct answer.`,
    '- Cover different subtopics across the questions; mix easy, medium and hard.',
    '- Distribute the correct answer across positions A/B/C/D roughly evenly.',
    '- Questions in simple clear English, unambiguous, no trick wording.',
    '- Do not reuse the same question phrasing you produced for other sets of this course.',
    '',
    'Return ONLY JSON, no markdown fences:',
    '{"questions":[{"q":"...","options":["...","...","...","..."],"answer":0}]}',
    'where "answer" is the 0-based index of the correct option.'
  ].join('\n');
}

async function main() {
  MODELS = await resolveModels();
  console.log(`Model fallback order: ${MODELS.join(' -> ')}`);

  const courses = await rtdbGet('brivora_courses');
  if (!courses) {
    console.log('No courses found in RTDB, nothing to do.');
    return;
  }
  const ids = Object.keys(courses).filter((id) => (courses[id].status || 'active') === 'active');
  console.log(`Generating quiz bank: ${ids.length} active course(s) x ${SETS} sets x ${QCOUNT} questions`);

  let ok = 0;
  let fail = 0;
  for (const id of ids) {
    if (QUOTA_BLOCKED) { console.log(`SKIP ${courses[id].name}: quota blocked`); fail++; continue; }
    const c = courses[id];
    const sets = {};
    let made = 0;
    for (let s = 1; s <= SETS; s++) {
      let quiz = null;
      for (let t = 1; t <= 3 && !quiz; t++) {
        try {
          const out = await gemini(makePrompt(c, s * 17 + t));
          if (validSet(out)) quiz = out;
          else console.log(`  [${c.name}] set ${s} try ${t}: invalid format, retrying`);
        } catch (e) {
          console.log(`  [${c.name}] set ${s} try ${t}: ${e.message}`);
          if (/all models failed/.test(e.message)) QUOTA_BLOCKED = true;
        }
        if (QUOTA_BLOCKED) break;
        if (!quiz) await sleep(3000);
      }
      if (quiz) {
        sets['s' + s] = { questions: quiz.questions };
        made++;
        console.log(`  [${c.name}] set ${s}: OK`);
      }
      if (QUOTA_BLOCKED) break;
      await sleep(3000);
    }
    if (made) {
      const payload = { course: c.name, generatedAt: new Date().toISOString(), sets };
      const r = await req(`${DB}/brivora_quizzes/${encodeURIComponent(id)}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (r.status === 200) {
        console.log(`OK  ${c.name}: ${made}/${SETS} quiz sets written`);
        ok++;
      } else {
        console.log(`ERR ${c.name}: RTDB write failed ${r.status}`);
        fail++;
      }
    } else {
      console.log(`ERR ${c.name}: no valid sets generated`);
      fail++;
    }
  }
  console.log(`Done: ${ok} course(s) updated, ${fail} failed`);
  if (QUOTA_BLOCKED && !ok) {
    console.log('NOTE: every available model reported quota exceeded. Re-run this workflow after the daily quota resets (midnight Pacific time).');
  }
  if (fail && !ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
