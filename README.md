# Support Desk System

A full-stack support ticket management application built with React, Node.js, Express.js, and MongoDB. It helps support teams create and manage customer tickets, track progress, communicate through replies and internal notes, and monitor ticket activity.

## Features

### Ticket Management
- Create tickets with subject, customer details, and description.
- Set ticket status and priority.
- Assign tickets to support agents.
- View ticket details and update ticket information.

### Search, Filtering, and Sorting
- Search by ticket subject, customer name, or email.
- Filter by status, priority, and assignee.
- Sort by last updated time or priority.
- Combine multiple filters.

### Communication
- Add public replies to tickets.
- Add internal notes for support agents.
- View messages in chronological order.

### Activity History
- Record ticket creation.
- Track status, priority, and assignment changes.
- Record public replies and internal notes.

### Dashboard
Displays six statistics:
- Total tickets
- Open tickets
- In-progress tickets
- Resolved tickets
- Urgent tickets
- Overdue tickets

A ticket is overdue when it has remained unresolved for more than 24 hours after creation.

## Technology Stack

**Frontend**
- React
- JavaScript
- Tailwind CSS
- Axios
- React Router

**Backend**
- Node.js
- Express.js
- JavaScript
- MongoDB
- Mongoose

## Project Structure

```text
support-desk/
├── frontend-new/
│   └── src/
│       ├── components/
│       │   ├── dashboard/
│       │   ├── layout/
│       │   └── tickets/
│       ├── lib/
│       │   └── api.js
│       └── App.jsx
│
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── app.js
│       └── ...
│
└── README.md
```

Adjust this structure to match the actual files in your repository.

## Prerequisites

- Node.js and npm
- MongoDB instance or MongoDB Atlas database
- A modern web browser

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/NikkySoam/Support-desk
cd support-desk
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
```

Replace the database connection string with your own value. Never commit real credentials.

### 4. Start the backend

Use the development command configured in `backend/package.json`, for example:

```bash
npm run dev
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd frontend-new
npm install
```

### 6. Configure frontend environment variables

Create a `.env` file inside the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 7. Start the frontend

```bash
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/tickets` | Create a ticket |
| GET | `/tickets` | List, search, filter, and sort tickets |
| GET | `/tickets/:id` | Retrieve ticket details |
| PATCH | `/tickets/:id` | Update ticket information |
| GET | `/tickets/:id/messages` | Retrieve ticket messages |
| POST | `/tickets/:id/messages` | Add a public reply or internal note |
| GET | `/tickets/:id/activities` | Retrieve activity history |
| GET | `/dashboard/stats` | Retrieve dashboard statistics |

## Data Persistence

MongoDB stores ticket records, messages, and activity history. Mongoose schemas define the data structure and validation rules.

## Design Decisions

- The frontend communicates with the backend through REST APIs.
- Express routes delegate business logic to controller functions.
- Mongoose models define the database schemas.
- Separate message types distinguish public replies from internal notes.
- Activity records provide a history of changes to tickets.
- Dashboard statistics are calculated from stored ticket records.





