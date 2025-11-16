# Agentic YouTube Automation for n8n

Production-ready Next.js app providing AI endpoints and a simple dashboard for YouTube automation workflows. Designed to plug into n8n via HTTP Request nodes.

## Endpoints

- POST `/api/metadata`
  - Body: `{ topic: string, language?: string, audience?: string, style?: string }`
  - Returns: `{ ok, topic, data: { title, description, tags, thumbnailPrompt } }`
- POST `/api/chapters`
  - Body: `{ transcript: string, language?: string }`
  - Returns: `{ ok, data: { chapters: Array<{ start, end, title }> } }`
- POST `/api/replies`
  - Body: `{ comments: string[], persona?: string, language?: string }`
  - Returns: `{ ok, data: { replies: string[] } }`
- POST `/api/webhook/n8n`
  - Body: `{ action: "metadata"|"chapters"|"replies", payload: object }`
  - Delegates to the corresponding endpoint (useful single webhook URL for n8n)

All endpoints return JSON and are safe for n8n HTTP nodes.

## Environment

- `OPENAI_API_KEY` (required)

On Vercel, set this in Project Settings → Environment Variables.

## n8n Integration

Example simple workflow (pseudosteps):

1. Trigger: Schedule (e.g., daily)
2. HTTP Request → POST `https://agentic-ae915b71.vercel.app/api/metadata`
   - JSON: `{ "topic": "How to automate YouTube with n8n" }`
3. Set node to pick `title`, `description`, `tags` from response
4. (Optional) Use `/api/chapters` with transcript for chapters
5. (Optional) Use `/api/replies` to propose replies for comments
6. Continue with your YouTube upload or CMS nodes

Alternatively use a single webhook endpoint:

- POST `https://agentic-ae915b71.vercel.app/api/webhook/n8n`
  - Body: `{ "action": "metadata", "payload": { "topic": "..." } }`

## Local Development

```bash
pnpm i # or npm i / yarn
pnpm dev
```

Build:

```bash
pnpm build
```

## Notes

- This app focuses on AI assistance pieces designed to be reliable on serverless. Media uploads to YouTube should be handled by n8n directly using official nodes or a separate worker due to size/time constraints on serverless functions.
