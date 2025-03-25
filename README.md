# Exchange4Students

This is the Node.js backend server for **Exchange4Students**, a web application built for Stevens students to post, browse, and exchange items.

## Introduction

This backend server provides RESTful API endpoints for basic functionality such as user registration, login, and item listing and browsing.

## Team Responsibilities

- **Edmund** – Set up backend architecture, implemented HTTPS server, User registration logic with PostgreSQL, JWT-based login flow, and environment configuration, started troubleshooting Global Access, Post Item Functionality
- **James** - 
- **Justin** - 
- **Jacob** - 

## Features Implemented

### BACKEND
- Basic Node.js + Express server setup
- REST API endpoints for:
  - `POST /auth/register` – User registration with password hashing
  - `POST /auth/login` – User login with password verification and JWT issuance
- Error handling with `try/catch` and server-side logging for authentication routes
- Connected to PostgreSQL database using `pg`
- Started deployment to `Render`
- Identify sellers by JWT-authenticated username
- Post items for sale (title, description, price, photo)

### FRONTEND
- Register
- Login/Logout
- Post item form

## Login Documentation (Postgresql)

| Parameter       | Value              |
|-----------------|--------------------|
| Username        | `postgres`         |
| Password        | `password`         |
| Database Name   | `exchange4students`|

## Notes
- Out of Network Connection
  - NGROK - Ran into compatability issues, need to test again
  - Render - Pushed successfully, however does not start Server and Database in the same port (Website launches however fails to communicate with Server/Database)
- Startup
  - Server - Run `npm install` then `npm start` under `SSW 322`
  - Frontend - Run `npm install` then `npm start` under `SSW 322/exchange4students-frontend`, `npm start -- --host 0.0.0.0`
