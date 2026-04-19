# Knowledge Hub

## Description

This repository contains solution for [Assignment: Nest.js Knowledge Hub API](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments-v2/06b-database-prisma/assignment.md). It has an implementation of a REST API for a Knowledge Hub platform using the Nest.js framework. The application is fully implemented according to the technical specification (**Basic + Advanced + Hacker Scope**).

## Docker Hub Image (from 6a task)

Docker Hub image link: https://hub.docker.com/r/lorenzostjohn/nodejs-2026q1-knowledge-hub-app

```bash
docker pull lorenzostjohn/nodejs-2026q1-knowledge-hub-app
```

## Docker assignment

To check 6a task "Containerization & Docker (Foundation)" use `docker` branch, [6a PR Link](https://github.com/Lorenzo-StJohn/nodejs-2026q1-knowledge-hub/pull/2), [6a Readme link](https://github.com/Lorenzo-StJohn/nodejs-2026q1-knowledge-hub/tree/docker?tab=readme-ov-file#knowledge-hub)

## Database & Prisma ORM assignment

To check 6b task "Database & Prisma ORM" use `database-prisma` branch, [6b PR Link](https://github.com/Lorenzo-StJohn/nodejs-2026q1-knowledge-hub/pull/3) and continue to read this instruction.

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

### 3. Checkout to the database-prisma branch

```bash
git checkout database-prisma
```

### 4. Install dependencies

```bash
npm ci
```

### 5. Create .env file

```bash
cp .env.example .env
```

## How to run application

### Generate Prisma client

```bash
npx prisma generate
```

### Build application via docker 

> [!WARNING]
> Even if you have docker container from the previous task you still need to follow this step in order to apply prisma configuration

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

```bash
npm run start:dev
```

### Run seed script from local app

Make sure that in `.env` file DATABASE_URL is the following: `postgresql://postgres:supersecretpassword@localhost:5432/knowledgehub?schema=public`

```bash
npx prisma db seed
```

### Start docker app + docker db

#### Start docker db

Make sure that in `.env` file DATABASE_URL is the following: `postgresql://postgres:supersecretpassword@db:5432/knowledgehub?schema=public`


```bash
docker compose up -d db
```

#### Apply database migrations from docker

Please, wait a few seconds after starting the db before running migrations to ensure PostgreSQL is ready.

```bash
docker compose run --rm app npx prisma migrate deploy
```

#### Start docker app

```bash
docker compose up -d
```

### Run seed script from docker app

Make sure that in `.env` file DATABASE_URL is the following: `postgresql://postgres:supersecretpassword@db:5432/knowledgehub?schema=public`

```bash
npm run seed:docker
```

P.S. It will run `npx prisma db seed` under the hood: `docker compose run --rm app npx prisma db seed`

## How to stop application 

```bash
docker compose down
```

## How to run application with in-memory database from the first part of the task 

```bash
npm run start:in-memory
```

## API Endpoints

### Users (`/user`)

| Method | Endpoint              | Success | Error Codes                           |
|--------|-----------------------|---------|---------------------------------------|
| GET    | `/user`               | 200     | 400 (wrong query params, hacker scope)|
| GET    | `/user/:id`           | 200     | 400, 404                              |
| POST   | `/user`               | 201     | 400                                   |
| PUT    | `/user/:id`           | 200     | 400, 403, 404                         |
| DELETE | `/user/:id`           | 204     | 400, 404                              |

### Articles (`/article`)

| Method | Endpoint              | Success | Error Codes                           |
|--------|-----------------------|---------|---------------------------------------|
| GET    | `/article`            | 200     | 400 (wrong query params, hacker scope)|
| GET    | `/article/:id`        | 200     | 400, 404                              |
| POST   | `/article`            | 201     | 400                                   |
| PUT    | `/article/:id`        | 200     | 400, 404                              |
| DELETE | `/article/:id`        | 204     | 400, 404                              |

### Categories (`/category`)

| Method | Endpoint              | Success | Error Codes                           |
|--------|-----------------------|---------|---------------------------------------|
| GET    | `/category`           | 200     | 400 (wrong query params, hacker scope)|
| GET    | `/category/:id`       | 200     | 400, 404                              |
| POST   | `/category`           | 201     | 400                                   |
| PUT    | `/category/:id`       | 200     | 400, 404                              |
| DELETE | `/category/:id`       | 204     | 400, 404                              |

### Comments (`/comment`)

| Method | Endpoint                        | Success | Error Codes             |
|--------|---------------------------------|---------|-------------------------|
| GET    | `/comment?articleId={id}`       | 200     | 400                     |
| GET    | `/comment/:id`                  | 200     | 400, 404                |
| POST   | `/comment`                      | 201     | 400, 422                |
| DELETE | `/comment/:id`                  | 204     | 400, 404                |

## Swagger (from the first part of the task)

After starting the app on port (4000 as default) you can open in your browser OpenAPI documentation by typing `http://localhost:4000/doc/`.
For more information about OpenAPI/Swagger please visit https://swagger.io/.

  > [!WARNING]
  > The pre-written tests expect a simple array in GET list endpoints. Therefore, a **ConditionalPaginationInterceptor** has been added that automatically converts the paginated response in case there ara no `limit` and `page` query parameters.   
  > `{ total, page, limit, data }` → `data` (array only).  
  > If you add `page` and `limit` query parameters for GET list endpoints, you will receive the **full paginated response**: `{ total, page, limit, data }`.

<img width="1440" height="900" alt="Screenshot 2026-04-05 at 04 12 44" src="https://github.com/user-attachments/assets/b69b9caf-21da-4cd3-92b5-3d84707239d2" />

<img width="1380" height="600" alt="Screenshot 2026-04-05 at 23 24 52" src="https://github.com/user-attachments/assets/aa65a5aa-11b4-4828-98d2-709a60714826" />

<img width="1381" height="519" alt="Screenshot 2026-04-05 at 23 25 07" src="https://github.com/user-attachments/assets/ee014cc7-ee88-4686-8b7f-c338ee42abcd" />


  > [!WARNING]
  > If you want to get **all items** via one of list endpoints make sure **you've cleared all the filters**!

  ## Prisma Studio

  1. Make sure that docker db is running.

  2. Before running this command make sure that in `.env` file DATABASE_URL is the following: `postgresql://postgres:supersecretpassword@localhost:5432/knowledgehub?schema=public`

  ```bash
  npx prisma studio
  ```

  <img width="1440" height="900" alt="Screenshot 2026-04-12 at 10 07 25" src="https://github.com/user-attachments/assets/09a6e1bf-fdae-4960-8fe4-fb0d998f0b5a" />
