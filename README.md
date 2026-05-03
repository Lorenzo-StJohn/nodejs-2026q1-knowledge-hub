# Knowledge Hub

## Description

This repository contains solution for [Assignment: Knowledge Hub AI Integration](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments-v2/09-ai-llm-integration/assignment.md). It has an implementation of a REST API for a Knowledge Hub platform using the Nest.js framework and Gemini API. The application is fully implemented according to the technical specification (**Basic + Advanced + Hacker Scope**).


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

### 3. Checkout to the ai-llm-integration branch

```bash
git checkout ai-llm-integration
```

### 4. Install dependencies

```bash
npm ci
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

### Build application via docker 

> [!WARNING]
> Before running this command make sure that in `.env` file DATABASE_URL is the following: `postgresql://postgres:supersecretpassword@db:5432/knowledgehub?schema=public`

```bash
docker compose build --no-cache
```

### Start local app + docker db

#### Start docker db:

```bash
docker compose up -d db
```

#### Apply database migrations


Change in `.env` file DATABASE_URL, for local app it should be the following: `postgresql://postgres:supersecretpassword@localhost:5432/knowledgehub?schema=public`

```bash
npx prisma migrate deploy
```

#### Start local app:

  - in development mode:

```bash
npm run start:dev
```

### Run seed script from local app

Make sure that in `.env` file DATABASE_URL is the following: `postgresql://postgres:supersecretpassword@localhost:5432/knowledgehub?schema=public`

```bash
npx prisma db seed
```

After running the script, the following users will exist:

- login: `admin` password: `password123`
- login: `editor` password: `password123`
- login: `viewer` password: `password123`

### Screenshots:

<img width="1552" height="982" alt="Screenshot 2026-05-03 at 23 54 53" src="https://github.com/user-attachments/assets/fc670ccd-cd92-46e3-89a9-3bf3bfeb306d" />
<img width="1552" height="982" alt="Screenshot 2026-05-03 at 23 55 27" src="https://github.com/user-attachments/assets/eca8b8dc-48c1-4344-8dfe-bfb1d117be18" />
<img width="1552" height="982" alt="Screenshot 2026-05-03 at 23 56 38" src="https://github.com/user-attachments/assets/08eab210-d2d6-49a0-8be0-cd5d899b2d0c" />
<img width="1552" height="982" alt="Screenshot 2026-05-03 at 23 57 32" src="https://github.com/user-attachments/assets/a0f160d4-7349-4bf3-b87d-0e9e42f8441b" />
<img width="1552" height="982" alt="Screenshot 2026-05-03 at 23 57 53" src="https://github.com/user-attachments/assets/84f59faa-62d0-4290-99a3-e95f356828d2" />
<img width="1552" height="982" alt="Screenshot 2026-05-03 at 23 59 08" src="https://github.com/user-attachments/assets/63d288f9-8db8-4979-a87d-ac121c763465" />
<img width="1552" height="982" alt="Screenshot 2026-05-03 at 23 59 28" src="https://github.com/user-attachments/assets/3f99117d-19b5-401f-a475-d9f17e48b9f6" />
<img width="1552" height="982" alt="Screenshot 2026-05-04 at 00 01 22" src="https://github.com/user-attachments/assets/43bd54b9-188a-43d9-82a9-cdbbfe11a8c0" />
<img width="1552" height="982" alt="Screenshot 2026-05-04 at 00 02 24" src="https://github.com/user-attachments/assets/d829ddb1-6aa4-47f9-b1ce-48fa3afa6fac" />
<img width="1552" height="982" alt="Screenshot 2026-05-04 at 00 04 39" src="https://github.com/user-attachments/assets/4eeda192-af7c-49a4-b37b-716a97377732" />
<img width="1552" height="982" alt="Screenshot 2026-05-04 at 00 10 50" src="https://github.com/user-attachments/assets/1f21bbd5-f5d2-4c32-b5f3-33df6c714ffa" />


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
| POST   | `/ai/articles/:articleId/summarize` | 201     | 400, 429                              |
| POST   | `/ai/articles/:articleId/translate` | 200     | 400, 403, 429                         |
| POST   | `/ai/articles/:articleId/analyze`   | 200     | 401, 403                              |
| POST   | `/ai/usage`                         | 200     | 401                                   |
| POST   | `/ai/generate`                      | 200     | 401                                   |
| POST   | `/ai/diagnostics`                   | 200     | 401                                   |


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

