# SSW322-Milestone3-Group_2

## Demo Recording
https://stevens.zoom.us/rec/share/844a6MPUdjNsXTD297qeDZNlJNd4DeluBpXxmwSlPZ7k9kSSa6tk51wt4786lEuo.84rjMBOpdwHJ9DV4

## Project Description

Exchange4Students enables students to:
- Register an account and securely log in
- List items they want to sell and edit/delete listings
- Browse items posted by other students
- View item details
- Add items to cart
- Proceed through a checkout flow for virtual transactions
- Cancel Pending orders
- Message sellers and arrange pickup or delivery (TO BE IMPLEMENTED)

| Team Member      | Responsibilities |
|------------------|------------------|
| Edmund Yuen      | Backend architecture, Seller backend setup, HTTPS setup, user authentication (JWT), PostgreSQL integration, Implemented adding to cart and order placing functionality, Sellers receiving buy requests/Buyers getting request updates from sellers, Updated UI consistency across browsing items, checkout, and cart and Added conditional inputs for items |
| Jacob Gelman     | Update use case diagram, activity diagram, and documentation
| James Grant      | Frontend setup, .jsx Page Routing, Buyer Page Integration & Database connection, Implemented Keyword Search functionality, Implemented "Browse by" functionality, UI style updates, Implemented "Cancel Order" and "Clear Notification" functionality, Added "My Orders" page,
| Justin Phan      | Displaying items on buyer page, Class Diagram updates, Implemented function for sellers to mark items as “on hold,” “sold,” or “available”, Improved checkout and register/login page form validation, Added option to unhide passwords,

## Functions Implemented
- Users can log in to the system
- A user can register an account for the first time
- A seller can create a post to sell an item, which could be of any type, with the respective information of the item type collected
- A buyer can browse previously posted items
- A seller can edit or delete any of their posted items
- Buyers can browse items by category, keywords, dimensions, size, and color
- Sellers can mark items as "on hold,” “sold,” or “available”
- Buyers can view their accepted order history
- Buyers or Sellers can clear request notifications

## Technologies Used

- **Node.js** – Server-side framework
- **Express.js** – Web server framework
- **PostgreSQL** – Relational database
- **pg** – PostgreSQL client for Node.js
- **OpenSSL** – Local HTTPS certificate generation
- **React.js** - Frontend library to develop UI
- **Multer** - Middleware for Node to handle form data (File Upload)
- **CSS** - UI styling

## Installation
1. Open a terminal
2. Clone the repository using `git clone https://github.com/JGrant225/SSW322-Milestone3-Group_2.git`
3. Navigate to the project directory using `cd SSW322-Milestone3-Group_2`
4. Install dependencies using `npm install` 
5. Start the app using `npm start`
6. Open a browser and search `http://localhost:3000`

# Exchange4Students

This is the Node.js backend server for **Exchange4Students**, a web application built for Stevens students to post, browse, and exchange items.

## Introduction

This backend server provides RESTful API endpoints for basic functionality such as user registration, login, and item listing and browsing.

## Team Responsibilities

- **Edmund** – Set up backend architecture, implemented HTTPS server, User registration logic with PostgreSQL, JWT-based login flow, and environment configuration, started troubleshooting Global Access, Post Item Functionality, Edit/Delete Item Functionality
- **James** - Set up frontend web display with seperate pages, components, and assets integrated through Routing, Integrated the initial Buyer page and connected item display through PostgreSQL database, Keyword Search function, Browse by size, color, and dimensions, Updated UI for Login page and post-Login, Implemented "Cancel Order" and "Clear Notification" functionality, Added "My Orders" page,
- **Justin** - Displaying items on buyer page, Class Diagram updates, Implemented function for sellers to mark items as “on hold,” “sold,” or “available”, Improved checkout and register/login page form validation, Added option to unhide passwords,
- **Jacob** - Update use case diagram, activity diagram, and documentation

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
- Post items for sale (title, description, price, photo) via Multer
- Edit items (Includes editing image, and deleting)

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

    -- Items Table --
    CREATE TABLE items (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      price NUMERIC(10,2) NOT NULL,
      seller_username VARCHAR(255),
      image TEXT,
      category TEXT,
      dimensions TEXT,
      size TEXT,
      color TEXT,
      itemstatus VARCHAR(20) DEFAULT 'Available' CHECK (itemstatus IN ('Available', 'On Hold', 'Sold')),
      accepted_buyer TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Cart Items Table --
    CREATE TABLE cart_items (
      id SERIAL PRIMARY KEY,
      buyer_username TEXT NOT NULL,
      item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
      quantity INTEGER DEFAULT 1,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (buyer_username, item_id)
    );

    -- Orders Table --
    CREATE TABLE orders (
      id SERIAL PRIMARY KEY,
      buyer_username TEXT NOT NULL,
      total NUMERIC(10,2),
      placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Order Items Table --
    CREATE TABLE order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      item_id INTEGER REFERENCES items(id),
      quantity INTEGER,
      price NUMERIC(10,2)
    );

    -- Buy Requests Table --
    CREATE TABLE buy_requests (
      id SERIAL PRIMARY KEY,
      buyer_username TEXT NOT NULL,
      item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
      contact_email TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      message TEXT,
      request_status VARCHAR(20) DEFAULT 'Pending' CHECK (request_status IN ('Pending', 'Accepted', 'Rejected')),
      requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      cleared_by_buyer BOOLEAN DEFAULT FALSE,
      cleared_by_seller BOOLEAN DEFAULT FALSE,
    );
