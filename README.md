# Exchange4Students Backend

This is the Node.js backend server for **Exchange4Students**, a web application built for Stevens students to post, browse, and exchange items on campus.

## Introduction

This backend server provides RESTful API endpoints for basic functionality such as user registration, login, and (eventually) item listing and browsing.

## Team Responsibilities

- **Edmund** – Set up backend architecture, basic authentication routes, HTTPS support

## Features Implemented

- Basic Node.js + Express server setup
- Environment variable support using `dotenv`
- CORS enabled for frontend integration
- HTTPS with self-signed certificate for local testing
- REST API endpoints for:
  - `POST /auth/register` – User registration with password hashing
  - `POST /auth/login` – User login with password verification and JWT issuance
- In-memory user storage (for Milestone 3 functionality; to be replaced with PostgreSQL in future)
- Error handling with `try/catch` and server-side logging for authentication routes