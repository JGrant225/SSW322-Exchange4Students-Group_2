<<<<<<< HEAD
# SSW322-Milestone3-Group_2

## Project Description

Exchange4Students enables students to:
- Register an account and securely log in
- List items they want to sell
- Browse items posted by other students
- View item details and add items to a cart
- Message sellers and arrange pickup or delivery
- Proceed through a checkout flow for virtual transactions

| Team Member      | Responsibilities |
|------------------|------------------|
| Edmund Yuen      | Backend architecture, HTTPS setup, user authentication (JWT), PostgreSQL integration |
| Jacob Gelman     | 
| James Grant      | 
| Justin Phan      | 

## Functions Implemented
- Users can log in to the system
- A user can register an account for the first time
- A seller can create a post to sell an item, which could be of any type, with the respective information of the item type collected
- A buyer can browse previously posted items and select an item to view details

## Technologies Used

- **Node.js** – Server-side framework
- **Express.js** – Web server framework
- **PostgreSQL** – Relational database
- **pg** – PostgreSQL client for Node.js
- **OpenSSL** – Local HTTPS certificate generation
- **React.js** - Frontend library to develop UI

## Installation
1. Open a terminal
2. Clone the repository using `git clone https://github.com/JGrant225/SSW322-Milestone3-Group_2.git`
3. Navigate to the project directory using `cd SSW322-Milestone3-Group_2`
4. Install dependencies using `npm install` 
5. Start the app using `npm start`
6. Open a browser and search `http://localhost:3000`
=======
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
  - Server - - Install `Node`, then run `npm install` then `npm start` under `SSW 322`
  - Frontend - Run `npm install` then `npm start` under `SSW 322/exchange4students-frontend`, `npm start -- --host 0.0.0.0`
  - Database - Install `PostgreSQL` then run `psql postgres`
    
    -- Create Database --
    CREATE DATABASE exchange4students;
    \c exchange4students

    -- Create Users Table --
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    -- Items table --
    CREATE TABLE items (
      id SERIAL PRIMARY KEY,
      title TEXT,
      description TEXT,
      price NUMERIC,
      seller_username TEXT,
      image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

>>>>>>> e73b807ca097353a8d24e7e2bde95b6d327b0f4a
