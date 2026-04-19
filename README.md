# Knowledge Hub

## Description

This repository contains solution for [Assignment: Nest.js Knowledge Hub API](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments-v2/06a-docker/assignment.md). It has an implementation of a REST API for a Knowledge Hub platform using the Nest.js framework. The application is fully implemented according to the technical specification (**Basic + Advanced + Hacker Scope**).

## Docker Hub Image

Docker Hub image link: https://hub.docker.com/r/lorenzostjohn/nodejs-2026q1-knowledge-hub-app

```bash
docker pull lorenzostjohn/nodejs-2026q1-knowledge-hub-app
```

## Docker Hub Image

Docker Hub image link: https://hub.docker.com/r/lorenzostjohn/nodejs-2026q1-knowledge-hub-app

```bash
docker pull lorenzostjohn/nodejs-2026q1-knowledge-hub-app
```


## Prerequisites

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.

## How to install

### 1. Clone repository

```bash
git clone https://github.com/Lorenzo-StJohn/nodejs-2026q1-knowledge-hub
```

### 2. Go to the project folder

```bash
cd nodejs-2026q1-knowledge-hub
```

### 3. Checkout to the docker branch

```bash
git checkout docker
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

### Application startup

```
docker-compose up --build
```

## Security scanning

```bash
docker scout cves nodejs-2026q1-knowledge-hub-app:latest
```


| Severity       | Count | Status                  |
|----------------|-------|-------------------------|
| **Critical**   | 0     | ✅ No critical issues   |
| **High**       | 36    | ⚠️ High severity        |
| **Medium**     | 14    | ⚡ Medium severity      |
| **Low**        | 4     | ℹ️ Low severity         |
| **Unspecified**| 2     | ❓ Unspecified          |
| **Total**      | **56**    | **24 packages affected** |

Scanning Summary: 24 packages checked, **no critical vulnerabilities**


## Image size 

```bash
docker images nodejs-2026q1-knowledge-hub-app:latest 
```

| ID                                | Image                                      | Disk Usage | Content Size | Extra |
|-----------------------------------|-------------------------------------------------------|------------|--------------|-------|
| `5d89d77b1452`                    | `nodejs-2026q1-knowledge-hub-app:latest`              | **273MB**  | **62.9MB**   | U     |


<img width="960" height="260" alt="Screenshot 2026-04-12 at 06 46 59" src="https://github.com/user-attachments/assets/f45aa544-0b16-4c46-b8da-84e54b6d155a" />

## Adminer service 

```bash
docker compose --profile debug up -d adminer
```

<img width="1440" height="900" alt="Screenshot 2026-04-12 at 06 44 21" src="https://github.com/user-attachments/assets/ad6bc968-19af-4c6a-a18b-a1caa56c8b0d" />

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