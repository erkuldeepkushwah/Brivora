// Generates a quiz bank (100 MCQ per active course, 10 batches x 10) with Gemini
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
const BATCHES = 10; // 10 batches x 10 questions = 100 MCQs per course

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
    `Create a batch of fresh multiple-choice questions (batch #${setNo} of a large pool) for the course "${course.name}"`,
    `(category: ${course.category || 'IT'}, level: ${course.level || 'Beginner'}).`,
    'This batch must NOT repeat questions from earlier batches of this course.',
    '',
    'Rules:',
    `- Exactly ${QCOUNT} questions, each with exactly 4 options and exactly 1 correct answer.`,
    '- Cover different subtopics; mix easy, medium and hard.',
    '- Distribute the correct answer across positions A/B/C/D roughly evenly.',
    '- Questions in simple clear English, unambiguous, no trick wording.',
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
  console.log(`Generating quiz bank: ${ids.length} active course(s) x 100 MCQs each (10 batches x ${QCOUNT})`);

  let ok = 0;
  let fail = 0;
  for (const id of ids) {
    if (QUOTA_BLOCKED) { console.log(`SKIP ${courses[id].name}: quota blocked`); fail++; continue; }
    const c = courses[id];
    const questions = [];
    const seen = new Set();
    let made = 0;
    for (let b = 1; b <= BATCHES; b++) {
      let quiz = null;
      for (let t = 1; t <= 3 && !quiz; t++) {
        try {
          const out = await gemini(makePrompt(c, b * 17 + t));
          if (validSet(out)) {
            // de-duplicate: only add fresh questions to the pool
            const fresh = out.questions.filter((q) => {
              const key = String(q.q).trim().toLowerCase();
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            quiz = { questions: fresh };
          }
          else console.log(`  [${c.name}] batch ${b} try ${t}: invalid format, retrying`);
        } catch (e) {
          console.log(`  [${c.name}] batch ${b} try ${t}: ${e.message}`);
          if (/all models failed/.test(e.message)) QUOTA_BLOCKED = true;
        }
        if (QUOTA_BLOCKED) break;
        if (!quiz) await sleep(3000);
      }
      if (quiz && quiz.questions.length) {
        questions.push(...quiz.questions);
        made++;
        console.log(`  [${c.name}] batch ${b}: OK (${quiz.questions.length} new, total ${questions.length})`);
      }
      if (QUOTA_BLOCKED) break;
      await sleep(3000);
    }
    if (questions.length) {
      const payload = { course: c.name, generatedAt: new Date().toISOString(), questions: questions };
      const r = await req(`${DB}/brivora_quizzes/${encodeURIComponent(id)}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (r.status === 200) {
        console.log(`OK  ${c.name}: ${questions.length} questions written to bank`);
        ok++;
      } else {
        console.log(`ERR ${c.name}: RTDB write failed ${r.status}`);
        fail++;
      }
    } else {
      console.log(`ERR ${c.name}: no questions generated`);
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
