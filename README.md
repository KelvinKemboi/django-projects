# Habit Tracker

This repository contains a full-stack habit tracker built with a Django REST API and a React + Vite frontend.

## Project Structure

- `backend/`: Django project and REST API
- `habit-tracker/`: React frontend
- `db.sqlite3`: project database at the repo root

## Stack

- Backend: Django, Django REST Framework, SimpleJWT
- Frontend: React, Vite, React Router, Tailwind CSS

## Features

- User registration and login with JWT authentication
- Habit creation, editing, deletion, and completion tracking
- Goal management tied to habits
- Protected frontend routes for authenticated pages

## Run The Project

### 1. Backend setup

From the repo root:

```powershell
cd backend
..\.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The Django API runs at `http://127.0.0.1:8000`.

### 2. Frontend setup

Open a second terminal:

```powershell
cd habit-tracker
npm install
npm run dev
```

The Vite dev server proxies `/api/*` requests to Django on port `8000`.

## Authentication Flow

The frontend stores JWT tokens in `localStorage` after login or registration.

Main auth endpoints:

- `POST /register/`: create a new user
- `POST /login/`: get `access` and `refresh` tokens
- `POST /token/refresh/`: refresh the access token

Protected backend endpoints use the Bearer token sent from the frontend.

## Main API Areas

- `/habits/`
- `/goals/`
- `/reminders/`
- `/user/`

## Notes

- The frontend app lives in `habit-tracker/README.md` for Vite-specific details.
- If PowerShell blocks `npm`, run it through `cmd /c npm ...` or adjust your execution policy.
