# Knowledge Hub

## Description

This repository contains solution for [Assignment: Nest.js Knowledge Hub API](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments-v2/05-kh-rest-api/assignment.md). It has an implementation of a REST API for a Knowledge Hub platform using the Nest.js framework. The application is fully implemented according to the technical specification (**Basic + Advanced + Hacker Scope**).

## Prerequisites

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.

## Implemented features:
- Full CRUD operations for `User`, `Article`, `Category`, and `Comment` entities
- In-memory data storage (designed to be easily replaced with a database in future tasks)
- Request validation using DTOs with Nest decorators + global `ValidationPipe`
- Article filtering by `status`, `categoryId`, and `tag` query parameters
- **Pagination** (`?page=1&limit=10`) and **sorting** (`?sortBy=createdAt&order=desc`) for all list endpoints
- Correct cascading delete behavior:
  - Deleting a User → `authorId` becomes `null` in Articles + all their Comments are removed
  - Deleting a Category → `categoryId` becomes `null` in Articles
  - Deleting an Article → all related Comments are removed
- OpenAPI/Swagger documentation
- Additional automated tests
- The application code for `Users`, `Articles`, `Categories`, and `Comments` is organized into Nest module/controller/service
- User's password is always excluded from server response

## How to install

### 1. Clone repository

```bash
git clone https://github.com/Lorenzo-StJohn/nodejs-2026q1-knowledge-hub
```

### 2. Go to the project folder

```bash
cd nodejs-2026q1-knowledge-hub
```

### 3. Checkout to the development branch

```bash
git checkout development
```

### 4. Install dependencies

```bash
npm ci
```

### 5. Create .env file

```bash
cp .env.example .env
```

## Running application

### Standard mode

```
npm start
```

### Development Mode

```
npm run start:dev
```

### Production Mode

```
npm run build
npm run start:prod
```

After starting the app on port (4000 as default) you can open
in your browser OpenAPI documentation by typing http://localhost:4000/doc/.
For more information about OpenAPI/Swagger please visit https://swagger.io/.

  > [!WARNING]
  > The pre-written tests expect a simple array in GET list endpoints. Therefore, a **ConditionalPaginationInterceptor** has been added that automatically converts the paginated response in case there ara no `limit` and `page` query parameters.   
  > `{ total, page, limit, data }` → `data` (array only).  
  > If you add `page` and `limit` query parameters for GET list endpoints, you will receive the **full paginated response**: `{ total, page, limit, data }`.

## Testing

1. In order to test the application you need to start it first (if you haven't done it before):

```
npm start
```

2. Then run one of the scripts:  
   -  To run all pre-written tests for this task:

   ```
   npm run test
   ```
   -  To run all additional tests for this task:

   ```
   npm run test:additional
   ```

## Running linter

```
npm run lint
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