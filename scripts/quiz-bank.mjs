// Generates a quiz bank (5 sets x 10 MCQ per active course) with Gemini
// and writes it to Firebase RTDB at brivora_quizzes/{courseId}.
// Runs in GitHub Actions with GEMINI_API_KEY from repo secrets.
// The API key never reaches the browser or the repo.

import https from 'node:https';
import http from 'node:http';

const DB = process.env.RTDB_URL || 'https://career-68877-default-rtdb.firebaseio.com';
const KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE = process.env.GEMINI_BASE || 'https://generativelanguage.googleapis.com';
const MODEL = 'gemini-2.0-flash';
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

async function gemini(prompt, attempt = 0) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 1, responseMimeType: 'application/json' }
  };
  const r = await req(`${GEMINI_BASE}/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
    body: JSON.stringify(body)
  });
  if ((r.status === 429 || r.status >= 500) && attempt < 5) {
    const wait = 15000 * Math.pow(2, attempt);
    console.log(`  rate-limited (${r.status}), waiting ${Math.round(wait / 1000)}s...`);
    await sleep(wait);
    return gemini(prompt, attempt + 1);
  }
  if (r.status !== 200) throw new Error(`Gemini ${r.status}: ${String(r.text).slice(0, 300)}`);
  const data = JSON.parse(r.text);
  const text = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
  return JSON.parse(text);
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
        }
        if (!quiz) await sleep(3000);
      }
      if (quiz) {
        sets['s' + s] = { questions: quiz.questions };
        made++;
      }
      await sleep(4000); // pacing to stay inside free-tier RPM
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
  if (fail && !ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
