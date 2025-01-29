# Natours Project

Welcome to the **Natours** project! This repository contains the backend server of a tourism platform. It provides a RESTful API that handles a variety of requests related to tour packages, user management, and bookings.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-application)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Tour Management](#tour-management)
  - [User Management](#user-management)

---

## Project Overview

The **Natours** project is a backend service designed to manage and serve various requests for a tourism platform. This includes managing **tour packages**, **user accounts**, and **bookings**. The API is built with **Node.js**, **Express.js**, and stores data in **MongoDB**. The application offers several features like user authentication via **JWT**, geographical tour search via **geo-spatial queries**, and more.

---

## Tech Stack

The project uses the following technologies:

- **Node.js** – JavaScript runtime environment for building the API.
- **Express.js** – Web application framework for Node.js.
- **MongoDB** – NoSQL database for storing tour and user data.
- **Mongoose** – ODM (Object Data Modeling) library for MongoDB.
- **JWT (JSON Web Token)** – For user authentication and authorization.
- **Postman** – For testing and documentation of the API.

---

## API Documentation

The full documentation of the **Natours API** can be found in the official **Postman** collection:

[**Natours API Documentation**](https://documenter.getpostman.com/view/27657634/2sAYQiBo5P)

The documentation includes details about all the available API routes, including:

- Request and response formats
- Example payloads
- Query and path parameters

---

## Getting Started

To run the **Natours** API locally, follow the steps below.

### Prerequisites

Make sure you have the following installed:

- **Node.js**: You can download and install Node.js from [here](https://nodejs.org/).
- **MongoDB**: Either install MongoDB locally or set up a cloud instance with [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### Installation

1. **Clone the repository**:

```bash
git clone https://github.com/baldzhiyski/NodeJS-Course.git

```

2 .**Navigate into the project directory:**:

```bash
cd /natours-project
```

2 .**Install dependencies:**:

```bash
npm i
```

### Running application

1. **Create a .env file in the root of the project and define the following env variables:**:

```bash
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT = 3000
DATABASE_PASSWORD =some_pass
DATABASE_URL = mongodb+srv://admin:<PASSWORD>@cluster0.v3qnd.mongodb.net/natours-project?retryWrites=true
JWT_EXPIRES_IN =4h
JWT_COOKIE_EXPIRES_IN = 4h;
EMAIL_USERNAME =some_username
EMAIL_PASSWORD = some_pass
EMAIL_HOST = sandbox.smtp.mailtrap.io
EMAIL_PORT = 2525
```

2. **To start the app locally , run :**:

```bash
npm run start
```

## API Endpoints

Here are some of the key API endpoints available in the **Natours** project:

### Authentication

- **POST** `/api/v1/users/signup`  
  Register a new user.

- **POST** `/api/v1/users/login`  
  Log in with user credentials and receive a JWT token.

- **POST** `/api/v1/users/logout`  
  Log out and invalidate the JWT.

### Tour Management

- **GET** `/api/v1/tours`  
  Retrieve a list of all available tours.

- **POST** `/api/v1/tours`  
  Create a new tour (admin only).

- **GET** `/api/v1/tours/:id`  
  Get a specific tour by its ID.

- **PATCH** `/api/v1/tours/:id`  
  Update a tour (admin only).

- **DELETE** `/api/v1/tours/:id`  
  Delete a tour (admin only).

### User Management

- **GET** `/api/v1/users/:id`  
  Get the user profile by ID.

- **PATCH** `/api/v1/users/:id`  
  Update user details.

- **GET** `/api/v1/users/me`  
  Get the logged-in user's profile.

## User Interface

In the **Natours** project, we use **EJS templates** for rendering dynamic HTML pages on the frontend. These templates allow us to create reusable and dynamic views. Data from the database is fetched using **Node.js** and is then passed to the templates to be rendered on the frontend.

### How it works:

1. **Node.js** is used as the server-side language to handle requests, interact with the database, and serve dynamic content to the user.
2. **EJS templates** are used to define the structure of the HTML pages, while placeholders within these templates are replaced with actual data retrieved from the database.

3. The backend fetches relevant data (such as tours, user profiles, etc.) from the MongoDB database using **Mongoose**.

4. The data is then passed to the EJS templates, where it is rendered and displayed in the browser.

This approach allows us to maintain a clean separation of concerns, where the server handles business logic and data processing, while the UI is dynamically generated using templates.
