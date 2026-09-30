# LocalPro – AI-Powered Local Services & Small Business Platform

A full-stack web platform connecting customers with trusted local service providers, powered by an AI problem classifier.

---

## Project Structure

```
project/
├── frontend/          React + Vite + Tailwind CSS
├── backend/           Python FastAPI
└── database/          SQLite (app.db) + seed script
```

---

## Quick Start

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database
python ../database/seed.py

# Start the API server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs: http://localhost:8000/docs

---

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Demo Credentials

| Role     | Email                 | Password    |
|----------|-----------------------|-------------|
| Admin    | admin@localpro.com    | admin123    |
| Customer | customer1@demo.com    | customer123 |
| Provider | provider1@demo.com    | provider123 |

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS      |
| Backend    | Python 3.11+, FastAPI, Pydantic   |
| Database   | SQLite via SQLAlchemy             |
| Auth       | JWT (python-jose) + bcrypt        |
| AI         | Rule-based classifier (no API key)|

---

## Key URLs

| URL                              | Description              |
|----------------------------------|--------------------------|
| http://localhost:5173            | React Frontend           |
| http://localhost:8000            | FastAPI Backend          |
| http://localhost:8000/docs       | Swagger API Docs         |
| http://localhost:8000/api/health | Health Check             |

---

## User Roles

- **Customer** — Describe problem → AI finds service → Book provider → Pay → Review
- **Provider** — Accept bookings → Update job status → View earnings
- **Admin** — Manage users, verify providers, view analytics
