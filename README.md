# Exchange4Students Backend

This is the Node.js backend server for **Exchange4Students**, a web application built for Stevens students to post, browse, and exchange items on campus.

## Introduction

This backend server provides RESTful API endpoints for basic functionality such as user registration, login, and (eventually) item listing and browsing.

## Team Responsibilities

- **Edmund** – Set up backend architecture, implemented HTTPS server, designed and coded user authentication logic with PostgreSQL, JWT-based login flow, and environment configuration, started troubleshooting Global Access
- **James** - 
- **Justin** - 
- **Jacob** - 

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
- Connected to PostgreSQL database using `pg`
- Started deployment to `Render`

## Login Documentation

| Parameter       | Value              |
|----------------|--------------------|
| Username        | `postgres`         |
| Password        | `password`         |
| Database Name   | `exchange4students`|

## Notes
- Out of Network Connection
  - NGROK - Ran into compatability issues, need to test again
  - Render - Pushed successfully, however does not start Server and Database in the same port (Website launches however fails to communicate with Server/Database)
- Startup
  - Server - Run `npm start` under `SSW 322`
  - Frontend - Run `npm start -- --host 0.0.0.0` under `SSW 322/exchange4students-frontend`