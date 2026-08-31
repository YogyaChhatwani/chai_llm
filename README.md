# DevKundli (Chai-LLM)

A workspace-based RAG assistant. Sign in with Google, add sources (PDFs, websites, YouTube, text), then chat against that knowledge. The model can also generate study artifacts (summaries, quizzes, flashcards, and more) and remember preferences across conversations.

The UI is a Next.js app. The API is Express on PostgreSQL, with background jobs on Inngest.

```
Browser (Vercel / localhost:3000)
        │  cookies + CORS
        ▼
Express API  ── Better Auth (Google OAuth)
        │
        ├── PostgreSQL (Prisma)     workspaces, sources, chats, artifacts
        ├── Pinecone                vector search for RAG
        ├── OpenAI                  chat + embeddings
        ├── Inngest                 ingest sources, artifacts, summaries
        ├── Mem0                   long-term user memory (optional)
        └── Firecrawl / Tavily / Cloudinary / YouTube transcripts
```

## Features

- **Google sign-in** via Better Auth (session cookies, CORS-aware origins)
- **Workspaces** with a default chat model (`gpt-4o-mini` or `gpt-4o`)
- **Sources**: PDF upload, website crawl, YouTube transcript, pasted text / markdown
- **RAG chat**: retrieve relevant chunks from Pinecone, stream answers with citations
- **Optional web search** (Tavily) during chat
- **Conversation memory**: rolling summaries every few messages
- **Long-term memory** (Mem0): list, create, edit, delete
- **Artifacts**: summary, takeaways, flashcards, quiz, report, mind map
- **Waitlist** on the login page

## Repository layout

```
Chai-LLM/
├── client/my-app/     Next.js 16 frontend (App Router, Tailwind, shadcn)
└── server/            Express 5 API, Prisma, Inngest jobs
```

## Prerequisites

- Node.js 20+
- A PostgreSQL database
- Accounts / keys for services you want to use (see [Environment](#environment))

## Local development

### 1. Database

Create a Postgres database and copy its URL. From `server/`:

```bash
cd server
npx prisma migrate deploy
# or, for a fresh schema: npx prisma db push
```

Prisma reads `DATABASE_URL` from `server/.env` (see `prisma.config.ts`).

### 2. API

```bash
cd server
cp .env.example .env   # if you have one; otherwise create .env from the table below
npm install
npm run dev            # tsx watch — default PORT=8081
```

Health check: [http://localhost:8081/health](http://localhost:8081/health)

Inngest functions are mounted at `/api/inngest`. For local jobs, run the Inngest Dev Server in another terminal:

```bash
npx inngest-cli@latest dev -u http://localhost:8081/api/inngest
```

### 3. Frontend

```bash
cd client/my-app
cp .env.example .env.local
npm install
npm run dev            # http://localhost:3000
```

`.env.local` should point at the API:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081
```

## Environment

### API (`server/.env`)

| Variable | Required | Notes |
| --- | --- | --- |
| `PORT` | yes | e.g. `8081` |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | yes | random secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | yes | public API origin, e.g. `http://localhost:8081` |
| `CLIENT_URL` | yes | comma-separated frontend origins, e.g. `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | yes | Google OAuth client |
| `GOOGLE_CLIENT_SECRET` | yes | Google OAuth secret |
| `OPENAI_API_KEY` | yes | chat + embeddings |
| `PINECONE_API_KEY` | yes | vector index |
| `PINECONE_INDEX` | no | default `chaibook` (1536 dims, `text-embedding-3-small`) |
| `FIRECRAWL_API_KEY` | for websites | website import |
| `CLOUDINARY_CLOUD_NAME` | for PDFs | PDF upload |
| `CLOUDINARY_UPLOAD_PRESET` | no | |
| `CLOUDINARY_API_KEY` | for PDFs | |
| `CLOUDINARY_API_SECRET` | for PDFs | |
| `TAVILY_API_KEY` | optional | web search in chat |
| `MEM0_API_KEY` | optional | long-term memory |
| `INNGEST_DEV` | local | set `1` for Inngest local mode |

When `BETTER_AUTH_URL` is `https://`, auth cookies use `SameSite=None; Secure` so a Vercel frontend can talk to a Railway (or similar) API.

`CLIENT_URL` may list several origins. If any of them is on `vercel.app`, `https://*.vercel.app` is also trusted so preview deployments work.

### Frontend (`client/my-app/.env.local`)

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | yes | API origin, no trailing slash |

This value is inlined at **build** time. Changing it on Vercel requires a redeploy.

## Google OAuth

In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → your OAuth client:

**Authorized JavaScript origins**

- Local: `http://localhost:3000`
- Production frontend: your Vercel URL (e.g. `https://your-app.vercel.app`)

**Authorized redirect URIs** (this is the **API**, not the Next.js app):

```
http://localhost:8081/api/auth/callback/google
https://<your-api-host>/api/auth/callback/google
```

Example production path:

```
https://<railway-or-api-host>/api/auth/callback/google
```

## Scripts

**Server**

| Script | What it does |
| --- | --- |
| `npm run dev` | watch + TypeScript |
| `npm run build` | `prisma generate` + `tsc` |
| `npm start` | `node dist/index.js` |

**Client**

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | production build |
| `npm start` | serve the production build |
| `npm run lint` | ESLint |

## How it works

### Auth

Better Auth is mounted at `/api/auth/*` **before** `express.json()`. The client uses `better-auth/react` with `credentials: "include"` and `baseURL` = `NEXT_PUBLIC_API_URL`.

### Sources (ingest)

Creating a source emits `source/created`. Inngest:

1. Marks the source `PROCESSING`
2. Extracts text (PDF / Firecrawl / YouTube / raw text)
3. Chunks (~1000 chars, 100 overlap)
4. Embeds with OpenAI and upserts into Pinecone
5. Marks `COMPLETED` or `FAILED`

### Chat (RAG)

`POST /api/v1/workspaces/:workspaceId/chat` streams a UI message stream:

1. Persist the user message
2. Retrieve top chunks from Pinecone (min similarity 0.35)
3. Pull Mem0 memories when configured
4. Stream with the workspace/default model
5. Persist the assistant reply and citations
6. Periodically enqueue a conversation summary

### Artifacts

`POST .../artifacts` creates a row and emits `artifact/generate`. The job fills JSON content for the requested type (summary, quiz, flashcards, etc.).

## HTTP API (summary)

All workspace routes require an authenticated session cookie except waitlist.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | liveness |
| `*` | `/api/auth/*` | Better Auth (sign-in, session, callback) |
| `POST` | `/api/v1/waitlist` | waitlist email |
| `GET/POST` | `/api/v1/workspaces` | list / create |
| `GET/PATCH/DELETE` | `/api/v1/workspaces/:workspaceId` | workspace CRUD |
| `GET/POST` | `/api/v1/workspaces/:id/sources` | list / create source |
| `POST` | `.../sources/upload` | PDF |
| `POST` | `.../sources/import/website` | Firecrawl |
| `POST` | `.../sources/import/youtube` | transcript |
| `POST` | `/api/v1/workspaces/:id/chat` | streamed chat |
| `GET/POST` | `.../conversations` | conversations |
| `GET/DELETE` | `.../conversations/:id` | messages / delete |
| `GET/POST` | `.../artifacts` | artifacts |
| `GET/PATCH/DELETE` | `/api/v1/memory` | Mem0 memories |

## Frontend routes

| Path | Page |
| --- | --- |
| `/login` | Google sign-in + waitlist |
| `/` | workspace list |
| `/workspaces/:id` | chat |
| `/workspaces/:id/sources` | sources |
| `/workspaces/:id/learn` | artifacts / learn hub |
| `/workspaces/:id/settings` | workspace settings |
| `/memory` | long-term memories |

## Deployment

Typical split:

| Piece | Host | Notes |
| --- | --- | --- |
| Frontend | Vercel | Root directory `client/my-app`, framework **Next.js**. Do not set Output Directory to `dist`. |
| API | Railway (or similar) | `cd server`, build `npm run build`, start `npm start` |
| Jobs | Inngest Cloud | point at `https://<api-host>/api/inngest` |

**Vercel**

- Root Directory: `client/my-app`
- Framework: Next.js
- Env: `NEXT_PUBLIC_API_URL=https://<your-api-host>`
- Redeploy after changing `NEXT_PUBLIC_*`

**API host**

- `BETTER_AUTH_URL=https://<your-api-host>`
- `CLIENT_URL=http://localhost:3000,https://<your-vercel-app>.vercel.app`
- Redeploy after changing `CLIENT_URL` so CORS and OAuth callbacks match

**Pinecone**

Index dimension must be **1536** (`text-embedding-3-small`). See `server/src/lib/ai-config.ts`.

## Tech stack

| Layer | Stack |
| --- | --- |
| Client | Next.js 16, React 19, TanStack Query, Tailwind 4, shadcn, AI SDK |
| API | Express 5, TypeScript, Zod |
| Auth | Better Auth + Google |
| Data | Prisma 7, PostgreSQL, Pinecone |
| AI | OpenAI (chat + embeddings), optional Tavily + Mem0 |
| Jobs | Inngest |

## License

ISC (server). Frontend is a private Next.js app.
