# 📘 FastAPI Backend Documentation — `nagAI`

## 🛠️ Stack

- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL (Supabase hosted)
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Auth**: Supabase Auth (OAuth / JWT)
- **Environment**: Conda (env: `nagai`)

---

## 📂 Project Structure

```
backend/
├── alembic/                # DB migration scripts
├── models/                 # SQLAlchemy models
├── schemas/                # Pydantic schemas
├── routers/                # API endpoints
├── database.py             # DB session and engine
├── main.py                 # Entry point
├── config.py               # Environment + secrets
└── .env                    # Secrets (excluded from Git)
```

---

## 🚀 Getting Started

### 1. Clone and Setup Environment

```bash
git clone <your_repo_url>
cd backend
conda create -n nagai python=3.10 -y
conda activate nagai
pip install -r requirements.txt
```

### 2. Environment Variables (`.env`)

```env
DATABASE_URL=postgresql+psycopg2://user:password@host/db
SUPABASE_PROJECT_URL=https://<your_project>.supabase.co
SUPABASE_API_KEY=your_supabase_key
```

---

## 🧭 Running the Server

```bash
uvicorn main:app --reload
```

The server will run on:  
📡 `http://127.0.0.1:8000`

Interactive Docs:  
🧪 Swagger UI → [`/docs`](http://127.0.0.1:8000/docs)  
🧬 ReDoc → [`/redoc`](http://127.0.0.1:8000/redoc)

---

## 🧱 Database Migrations

Initialize Alembic (only once):

```bash
alembic init alembic
```

Edit `alembic.ini` and `env.py` to connect to `DATABASE_URL`.

Create and apply migration:

```bash
alembic revision --autogenerate -m "Create tables"
alembic upgrade head
```

---

## 🔐 Auth (Supabase)

Auth is managed externally via Supabase OAuth and JWT.  
Include `Authorization: Bearer <access_token>` in your requests.

To decode JWT in routes:

```python
from supabase_py import create_client
from fastapi import Depends
from utils.auth import get_current_user
```

---

## 📫 API Routes

### `POST /users/`
Create a user.

### `GET /users/me`
Fetch current user info (requires Auth header).

### `POST /sessions/`
Record a new session.

### `POST /distractions/`
Upload distraction event.

More routes are available under `/docs`.

---

## 🧪 Testing

Use [httpie](https://httpie.io/) or similar tools:

```bash
http GET http://127.0.0.1:8000/users/me "Authorization: Bearer <token>"
```

---

## 🧼 Linting & Formatting

```bash
black .
flake8 .
```

---

## 📦 Deployment

- Frontend: [Vercel](https://vercel.com/)
- Backend: [Railway](https://railway.app/), [Render](https://render.com/), or [Fly.io](https://fly.io/)
- Use `uvicorn main:app --host 0.0.0.0 --port 8000` in prod

---

## 👨‍💻 Maintainers

- @yourname — backend & DB
- @teammate — frontend & design
- @another — AI / detection

---
```
