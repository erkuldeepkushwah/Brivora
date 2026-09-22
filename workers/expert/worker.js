// Brivora — Prof. Rahul Gupta, AI Technical Expert (Cloudflare Worker)
// Student dashboard ke "Expert" section se aane wale technical questions
// Gemini se answer karta hai. API key is Worker ke SECRET me rehti hai.
//
// Deploy (ek baar, 5 minute):
// 1. dash.cloudflare.com -> Workers & Pages -> Create Worker
// 2. Naam do: brivora-expert -> Deploy
// 3. "Edit code" me ye pura file paste karke Save & Deploy
// 4. Settings -> Variables and Secrets -> Add -> Type: Secret,
//    Name: GEMINI_API_KEY, Value: (aapki Google AI Studio key)
// 5. Worker URL copy karke bhejo (https://brivora-expert.<apna-subdomain>.workers.dev)
//    — uska RTDB me brivora_config/expertWorkerUrl set karna hai

const ALLOWED_ORIGINS = [
  'https://brivora.pages.dev'
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

function persona(courses) {
  return [
    'You are Prof. Rahul Gupta — a senior IT professor and the official AI technical expert of Brivora IT Enterprise (an IT training institute in Indore, India).',
    'Your job: provide friendly, complete technical support to Brivora students.',
    '',
    'Style rules:',
    '- Reply in the SAME language the student uses: Hinglish (romanized Hindi) for casual/Hinglish messages, English for English.',
    '- Warm, encouraging professor tone. Simple explanations, small code examples where useful.',
    '- Be technically accurate. If unsure, say so honestly instead of guessing.',
    '- Keep answers focused and practical; use short paragraphs or bullet points. Not too long.',
    '- For non-technical questions, gently steer back to studies/technical topics.',
    '',
    courses && courses.length
    ? 'The student is enrolled in these Brivora courses (prioritise their topics): ' + courses.join(', ') + '.'
    : 'The student has no enrolled courses yet; you can suggest Brivora courses (Full Stack, Python, React, Data Science, Data Analytics).',
    '',
    'You are an AI assistant presented as Prof. Rahul Gupta. If asked directly whether you are an AI, be honest that you are Brivora\u2019s AI expert assistant.'
  ].join('\n');
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const c = cors(origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: c });
    if (request.method !== 'POST') return json({ error: 'POST only' }, 405, c);
    if (!ALLOWED_ORIGINS.includes(origin)) return json({ error: 'not allowed' }, 403, c);
    if (!env.GEMINI_API_KEY) return json({ error: 'GEMINI_API_KEY secret not set' }, 500, c);

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: 'invalid JSON body' }, 400, c); }

    const message = String((body && body.message) || '').trim().slice(0, 2000);
    if (!message) return json({ error: 'message is required' }, 400, c);

    const courses = Array.isArray(body && body.courses)
      ? body.courses.map(function (x) { return String(x).slice(0, 120); }).slice(0, 12)
      : [];
    const history = Array.isArray(body && body.history)
      ? body.history
          .filter(function (h) { return h && typeof h.role === 'string' && typeof h.text === 'string'; })
          .slice(-10)
          .map(function (h) { return { role: h.role === 'bot' ? 'model' : 'user', text: String(h.text).slice(0, 2000) }; })
      : [];

    const contents = [];
    for (const h of history) contents.push({ role: h.role, parts: [{ text: h.text }] });
    contents.push({ role: 'user', parts: [{ text: message }] });

    let lastErr = 'no model attempted';
    for (const model of MODELS) {
      try {
        const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
          body: JSON.stringify({
            contents: contents,
            systemInstruction: { parts: [{ text: persona(courses) }] },
            generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }
          })
        });
        if (r.status !== 200) { lastErr = model + ': HTTP ' + r.status; continue; }
        const data = await r.json();
        const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
        const reply = parts.map(function (p) { return p.text || ''; }).join('').trim();
        if (reply) return json({ reply: reply }, 200, c);
        lastErr = model + ': empty reply';
      } catch (e) {
        lastErr = model + ': ' + (e && e.message ? e.message : 'error');
      }
    }

    return json({ error: 'expert unavailable (' + lastErr + ')' }, 502, c);
  }
};
