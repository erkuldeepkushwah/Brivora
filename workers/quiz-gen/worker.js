// Brivora — Instant AI Quiz Generator (Cloudflare Worker)
// Student "Start Quiz" dabate hi Gemini se 10 fresh MCQ banata hai.
// Gemini API key is Worker ke SECRET me rehti hai — public site me kabhi nahi.
//
// Deploy (ek baar, 5 minute):
// 1. dash.cloudflare.com -> Workers & Pages -> Create Worker
// 2. Naam do: brivora-quiz-gen -> Deploy
// 3. "Edit code" me ye pura file paste karke Save & Deploy
// 4. Settings -> Variables and Secrets -> Add -> Type: Secret,
//    Name: GEMINI_API_KEY, Value: (aapki Google AI Studio key)
// 5. Worker URL copy karke bhejo (https://brivora-quiz-gen.<apna-subdomain>.workers.dev)

const ALLOWED_ORIGINS = [
  'https://erkuldeepkushwah.github.io'
];

const MODELS = [
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite'
];

function cors(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

const json = (obj, status, c) =>
  new Response(JSON.stringify(obj), { status: status, headers: Object.assign({ 'Content-Type': 'application/json' }, c) });

function makePrompt(course, category, level, nonce) {
  return [
    'You are an expert exam setter for an Indian IT training institute.',
    `Create a brand-new multiple-choice quiz for the course "${course}"`,
    `(category: ${category}, level: ${level}).`,
    `This is attempt number ${nonce} — the questions must be completely fresh and different from other attempts.`,
    '',
    'Rules:',
    '- Exactly 10 questions, each with exactly 4 options and exactly 1 correct answer.',
    '- Cover different subtopics; mix easy, medium and hard.',
    '- Distribute the correct answer across positions A/B/C/D roughly evenly.',
    '- Simple clear English, unambiguous, no trick wording.',
    '',
    'Return ONLY JSON, no markdown fences:',
    '{"questions":[{"q":"...","options":["...","...","...","..."],"answer":0}]}',
    'where "answer" is the 0-based index of the correct option.'
  ].join('\n');
}

function valid(quiz) {
  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length !== 10) return false;
  return quiz.questions.every(function (q) {
    return (
      typeof q.q === 'string' && q.q.trim().length > 5 &&
      Array.isArray(q.options) && q.options.length === 4 &&
      q.options.every(function (o) { return typeof o === 'string' && o.trim().length > 0; }) &&
      Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3
    );
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const c = cors(origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: c });

    if (request.method !== 'POST') return json({ error: 'POST only' }, 405, c);

    if (!env.GEMINI_API_KEY) return json({ error: 'GEMINI_API_KEY secret not set' }, 500, c);

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: 'invalid JSON body' }, 400, c); }

    const course = String((body && body.course) || '').trim().slice(0, 120);
    const category = String((body && body.category) || 'IT').trim().slice(0, 60);
    const level = String((body && body.level) || 'Beginner').trim().slice(0, 60);
    const nonce = String((body && body.nonce) || Date.now()).slice(0, 20);
    if (!course) return json({ error: 'course is required' }, 400, c);

    const prompt = makePrompt(course, category, level, nonce);
    let lastErr = 'no model attempted';

    for (const model of MODELS) {
      try {
        const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 1, responseMimeType: 'application/json' }
          })
        });
        if (r.status !== 200) { lastErr = model + ': HTTP ' + r.status; continue; }
        const data = await r.json();
        const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
        const text = parts.map(function (p) { return p.text || ''; }).join('');
        const quiz = JSON.parse(text);
        if (valid(quiz)) return json({ questions: quiz.questions }, 200, c);
        lastErr = model + ': invalid format';
      } catch (e) {
        lastErr = model + ': ' + (e && e.message ? e.message : 'error');
      }
    }

    return json({ error: 'generation failed (' + lastErr + ')' }, 502, c);
  }
};
