# Knowledge Hub

## Description

This repository contains solution for [Assignment: Knowledge Hub RAG & Vector Database](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments-v2/10-ai-rag-vectordb/assignment.md). It has an implementation of a REST API for a Knowledge Hub platform using the Nest.js framework and Gemini API. The application is fully implemented according to the technical specification (**Basic + Advanced + Hacker Scope**).


## Prerequisites

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.
- Docker

## How to install

### 1. Clone repository

```bash
git clone https://github.com/Lorenzo-StJohn/nodejs-2026q1-knowledge-hub
```

### 2. Go to the project folder

```bash
cd nodejs-2026q1-knowledge-hub
```

### 3. Checkout to the ai-rag-vectordb branch

```bash
git checkout ai-rag-vectordb
```

### 4. Install dependencies

```bash
npm i
```

### 5. Create .env file

```bash
cp .env.example .env
```

### 6. Add your own Gemini API key in .env

Find `GEMINI_API_KEY=your-gemini-api-key` in `.env` and replace `your-gemini-api-key` with your own key (see instructions bellow how to get such a key).

## How to Obtain a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **"Create API key"** and select a Google Cloud project (or create a new one).
4. Copy the generated API key.
5. (Optional) If you are in a region where Gemini is not directly available, check the [habr article](https://habr.com/ru/articles/870494/) for different alternative access methods (especially relevant for users in Russia).

## Known Limitations for Gemini API

### Free-Tier Quotas

- Rate Limit: 5 RPM accordingly to official website
<img width="1087" height="102" alt="Screenshot 2026-05-04 at 01 22 01" src="https://github.com/user-attachments/assets/796f9068-fa52-4d9a-b0e8-e0250c676209" />
- Tokens per Minute: 250,000 tokens accordingly to official website
- Requests per day: about 250 accordingly to 3rd-party statistics
- When the Gemini free tier is exhausted, the API returns a 429 status. The application will retry with exponential backoff and, if unsuccessful, return a 503 Service Unavailable

### Latency

- Gemini API calls may take 1–5 seconds depending on prompt complexity and current service load.
- The service uses an in‑memory cache (configurable TTL via AI_CACHE_TTL_SEC) for summarization and translation to improve repeat-request performance.

### Regional Availability

- Gemini API is not available in all countries. If you are in a region where access is restricted (e.g., Russia), you may need a VPN or a proxy. Refer to the [habr article](https://habr.com/ru/articles/870494/) for detailed workarounds and community advice.

## How to run application

### Generate Prisma client

```bash
npx prisma generate
```

### Clean Docker

```bash
docker system prune -a --volumes
```

### Build and run application via docker 

> [!WARNING]
> The project includes a Qdrant vector database service defined in `docker-compose.yml`.  
> It is automatically started together with the application and PostgreSQL

```bash
docker compose up --build
```

### Apply database migrations

> [!WARNING]
> Wait before the previous step is fully completed and the app is successfully running
 
```bash
docker compose run --rm app npx prisma migrate deploy
```

### Run seed script so there is at least one admin user in database

```bash
npm run seed:docker
```

After running the script, the following users will exist:

- login: `admin` password: `password123`
- login: `editor` password: `password123`
- login: `viewer` password: `password123`

### Login via Swagger

- Open http://localhost:4000/doc

- Use login and password from previous step

- Add access token into Authorize section

### Add your own articles

There are several mock articles from seed step in database, but you can add your own articles via `/article` endpoint in swagger.

### Index Knowledge Hub articles

Use `/ai/rag/index` endpoint to index articles (you can choose mode and specify the list of articles)

### Delete article vectors

Use `/ai/rag/index/articles/:articleId` endpoint to delete vectors for specified article

### Use semantic search

Use `/ai/rag/search` endpoint to perform semantic search

### Use RAG chat

Use `/ai/rag/chat` endpoint for questions answering with source attribution

### See RAG chat history

Use `/ai/rag/chat/:conversationId/history` endpoint to get conversation history

### Use hybrid search

Use `/ai/rag/hybrid-search` endpoint for hybrid (semantic + lexical) search

## API Endpoints

### Users (`/user`)

| Method | Endpoint              | Success | Error Codes                           |
|--------|-----------------------|---------|---------------------------------------|
| GET    | `/user`               | 200     | 400, 401                              |
| GET    | `/user/:id`           | 200     | 400, 401, 404                         |
| POST   | `/user`               | 201     | 400, 401, 403                         |
| PUT    | `/user/:id`           | 200     | 400, 401, 403, 404                    |
| DELETE | `/user/:id`           | 204     | 400, 401, 403, 404                    |

### Articles (`/article`)

| Method | Endpoint              | Success | Error Codes                           |
|--------|-----------------------|---------|---------------------------------------|
| GET    | `/article`            | 200     | 400, 401,                             |
| GET    | `/article/:id`        | 200     | 400, 401, 404                         |
| POST   | `/article`            | 201     | 400, 401, 403                         |
| PUT    | `/article/:id`        | 200     | 400, 401, 403, 404                    |
| DELETE | `/article/:id`        | 204     | 400, 401, 403, 404                    |

### Categories (`/category`)

| Method | Endpoint              | Success | Error Codes                           |
|--------|-----------------------|---------|---------------------------------------|
| GET    | `/category`           | 200     | 400, 401                              |
| GET    | `/category/:id`       | 200     | 400, 401, 404                         |
| POST   | `/category`           | 201     | 400, 401, 403                         |
| PUT    | `/category/:id`       | 200     | 400, 401, 403, 403                    |
| DELETE | `/category/:id`       | 204     | 400, 401, 403, 404                    |

### Comments (`/comment`)

| Method | Endpoint                        | Success | Error Codes                |
|--------|---------------------------------|---------|----------------------------|
| GET    | `/comment?articleId={id}`       | 200     | 400, 401                   |
| GET    | `/comment/:id`                  | 200     | 400, 401, 404              |
| POST   | `/comment`                      | 201     | 400, 401, 403, 422         |
| DELETE | `/comment/:id`                  | 204     | 400, 401, 403, 404         |

### Auth (`/auth`)

| Method | Endpoint              | Success | Error Codes                           |
|--------|-----------------------|---------|---------------------------------------|
| POST   | `/auth/signup`        | 201     | 400, 429                              |
| POST   | `/auth/login`         | 200     | 400, 403, 429                         |
| POST   | `/auth/refresh`       | 200     | 401, 403                              |
| POST   | `/auth/logout `       | 200     | 401                                   |

### AI (`/ai`)

| Method | Endpoint                            | Success | Error Codes                           |
|--------|-------------------------------------|---------|---------------------------------------|
| POST   | `/ai/articles/:articleId/summarize` | 201     | 400, 401, 429                         |
| POST   | `/ai/articles/:articleId/translate` | 200     | 400, 401, 403, 429                    |
| POST   | `/ai/articles/:articleId/analyze`   | 200     | 401, 403                              |
| POST   | `/ai/usage`                         | 200     | 401                                   |
| POST   | `/ai/generate`                      | 200     | 401                                   |
| POST   | `/ai/diagnostics`                   | 200     | 401                                   |

### RAG (`/ai/rag`)

| Method | Endpoint                              | Success | Error Codes                           |
|--------|---------------------------------------|---------|---------------------------------------|
| POST   | `/ai/rag/index`                       | 200     | 400, 401, 503                         |
| POST   | `/ai/rag/search`                      | 200     | 400, 401, 503                         |
| POST   | `/ai/rag/chat`                        | 200     | 400, 401  503                         |
| DELETE | `/ai/rag/index/articles/:articleId`   | 204     | 400, 401, 404, 503                    |
| GET    | `/ai/rag/chat/:conversationId/history`| 200     | 400, 401, 503                         |
| POST   | `/ai/rag/hybrid-search`               | 200     | 400, 401, 503                         |



## Swagger (from the first part of the task)

After starting the app on port (4000 as default) you can open in your browser OpenAPI documentation by typing `http://localhost:4000/doc/`.
For more information about OpenAPI/Swagger please visit https://swagger.io/.

  > [!WARNING]
  > The pre-written tests expect a simple array in GET list endpoints. Therefore, a **ConditionalPaginationInterceptor** has been added that automatically converts the paginated response in case there ara no `limit` and `page` query parameters.   
  > `{ total, page, limit, data }` → `data` (array only).  
  > If you add `page` and `limit` query parameters for GET list endpoints, you will receive the **full paginated response**: `{ total, page, limit, data }`.

<img width="1440" height="900" alt="Screenshot 2026-04-19 at 23 44 41" src="https://github.com/user-attachments/assets/ed58cc6e-d260-447f-8e35-1692e43da086" />

> [!WARNING]
> Don't forget to enter **access token** in order to all endpoints work!

> [!WARNING]
> If you want to get **all items** via one of list endpoints make sure **you've cleared all the filters**!

