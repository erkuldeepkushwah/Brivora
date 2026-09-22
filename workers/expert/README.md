# Brivora Expert — Prof. Rahul Gupta (AI Technical Expert)

Student dashboard ke sidebar me "Expert" section hai. Student apne technical
sawaal poochta hai, **Prof. Rahul Gupta** (Gemini-powered AI expert) jawaab deta hai.

## Architecture

```
Student (browser) -> Cloudflare Worker (brivora-expert) -> Gemini API
                            ^
                  GEMINI_API_KEY (Worker secret, kabhi public nahi)
```

- Site **kabhi** Gemini key use nahi karti — key sirf is Worker ke secret me hai.
- Worker sirf `https://erkuldeepkushwah.github.io` origin se requests accept karta hai.
- Worker URL RTDB me hota hai: `brivora_config/expertWorkerUrl` (dashboard live padhta hai).

## Deploy (ek baar, ~5 minute)

1. **dash.cloudflare.com** → Workers & Pages → **Create Worker**
2. Naam: `brivora-expert` → **Deploy**
3. **Edit code** → `workers/expert/worker.js` ka pura content paste → **Save and Deploy**
4. **Settings** → Variables and Secrets → **Add**
   - Type: **Secret**
   - Name: `GEMINI_API_KEY`
   - Value: aapki Google AI Studio key (aistudio.google.com → Get API key)
5. Worker ka URL copy karein: `https://brivora-expert.<subdomain>.workers.dev`
6. Ye URL RTDB me set karein: `brivora_config/expertWorkerUrl = <URL>`

Done — dashboard ka Expert section ab live answers dega.

## Test

```bash
curl -X POST https://brivora-expert.<subdomain>.workers.dev \
  -H "Content-Type: application/json" \
  -H "Origin: https://erkuldeepkushwah.github.io" \
  -d '{"message":"What is a Python list?","courses":["Python Programming"]}'
```

Response: `{"reply":"..."}`
