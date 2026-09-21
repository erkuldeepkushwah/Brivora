# Brivora Instant AI Quiz Generator

Ye Cloudflare Worker student dashboard ke "Start Quiz" pe turant 10 naye MCQ
questions Gemini se banata hai. API key Worker ke secret me rehti hai — public
site me kahin nahi jaati.

## Deploy (ek baar, ~5 minute)

1. https://dash.cloudflare.com kholo (free account chalega)
2. **Workers & Pages -> Create Worker**
3. Naam: `brivora-quiz-gen` -> **Deploy**
4. Worker par **Edit code** -> `worker.js` ka pura content paste karo -> **Save and Deploy**
5. **Settings -> Variables and Secrets -> Add**:
   - Type: **Secret**, Name: `GEMINI_API_KEY`, Value: aapki Google AI Studio key
6. Worker URL copy karo (jaise `https://brivora-quiz-gen.yourname.workers.dev`)

## Enable karna

RTDB me `brivora_config/quizWorkerUrl` = Worker URL PUT karo. Dashboard turant
instant AI mode me chala jayega (koi deploy nahi chahiye). Value khaali karo
to wapas quiz-bank mode.

AI fail ho (quota/network) to dashboard khud quiz bank ke random set par fall
back kar deta hai.

## Notes

- Free plan: 100,000 requests/day — ek quiz attempt = 1 request.
- Key yaad na ho to https://aistudio.google.com par naya bana lo, aur GitHub
  secret `GEMINI_API_KEY` bhi update kar dena.
