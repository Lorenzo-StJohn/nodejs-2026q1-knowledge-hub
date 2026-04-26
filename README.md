# Knowledge Hub

## Description

This repository contains solution for [Assignment: Logging & Error Handling](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments-v2/08b-logging-errors/assignment.md). It has an implementation of a REST API for a Knowledge Hub platform using the Nest.js framework. The application is fully implemented according to the technical specification (**Basic + Advanced Scope**).


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

### 3. Checkout to the auth-jwt branch

```bash
git checkout logging-and-error-handling
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

After running the script, the following users will exist:

- login: `admin` password: `password123`
- login: `editor` password: `password123`
- login: `viewer` password: `password123`

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

After running the script, the following users will exist:

- login: `admin` password: `password123`
- login: `editor` password: `password123`
- login: `viewer` password: `password123`

## Log file example

<img width="1440" height="900" alt="Screenshot 2026-04-26 at 21 44 25" src="https://github.com/user-attachments/assets/60f7877b-5b0b-4445-89c8-2c3cd6c45f63" />

## Testing

### Run all tests

> [!WARNING]
> In order to run all tests you need to start the application first 

> [!WARNING]
> There is a rate limiting for auth endpoints, please wait a full minute before running different test sets.

> [!WARNING]
> For testing DATABASE_URL in .env file should be the following: `postgresql://postgres:supersecretpassword@localhost:5432/knowledgehub?schema=public`

```bash
npm run test
```

<img width="1440" height="900" alt="Screenshot 2026-04-26 at 21 23 53" src="https://github.com/user-attachments/assets/036c3ab6-e48d-4e49-81b5-41924becbd2f" />
<img width="1440" height="900" alt="Screenshot 2026-04-26 at 21 24 05" src="https://github.com/user-attachments/assets/c416b67e-9791-41b8-9f80-c8b88c38c370" />

### Run unit tests

For unit tests it does not matter if the application is running or not. 

```bash
npm run test:unit
```
<img width="1440" height="900" alt="Screenshot 2026-04-26 at 21 27 33" src="https://github.com/user-attachments/assets/57374292-c84c-49da-9a10-b919ca827af0" />


### Run all tests with coverage report (for vitest tests)

> [!WARNING]
> In order to run all tests you need to start the application first 

> [!WARNING]
> There is a rate limiting for auth endpoints, please wait a full minute before running different test sets.

> [!WARNING]
> For testing DATABASE_URL in .env file should be the following: `postgresql://postgres:supersecretpassword@localhost:5432/knowledgehub?schema=public`

```bash
npm run test:coverage
```
<img width="1440" height="900" alt="Screenshot 2026-04-26 at 21 29 48" src="https://github.com/user-attachments/assets/8e039b5e-025b-4b94-a0ad-43f19843ef24" />
<img width="1440" height="900" alt="Screenshot 2026-04-26 at 21 30 10" src="https://github.com/user-attachments/assets/58cabe39-2b3b-424b-b24f-e637ddbe601b" />

### Run old jest tests

> [!WARNING]
> In order to run jest tests you need to start the application first 

> [!WARNING]
> There is a rate limiting for auth endpoints, please wait a full minute before running different test sets.

> [!WARNING]
> For testing DATABASE_URL in .env file should be the following: `postgresql://postgres:supersecretpassword@localhost:5432/knowledgehub?schema=public`

```bash
npm run test:jest
```

<img width="1440" height="900" alt="Screenshot 2026-04-26 at 20 10 35" src="https://github.com/user-attachments/assets/e7ec0976-dda1-45f4-a80d-76c6d3c21775" />


### Run unit tests with coverage report

For unit tests it does not matter if the application is running or not. 

```bash
npm run test:cov:unit
```

<img width="1440" height="900" alt="Screenshot 2026-04-26 at 21 31 52" src="https://github.com/user-attachments/assets/d767c36e-4e5a-4965-aa39-3512eb42a307" />
<img width="1440" height="900" alt="Screenshot 2026-04-26 at 21 32 08" src="https://github.com/user-attachments/assets/e3d9d9e8-b653-47cc-98b8-c589a468c7c8" />


## How to stop application 

```bash
docker compose down
```

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

