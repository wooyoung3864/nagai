# CSE 416
### Team NAGA — Jiwoo Kim, Joohyoung Jun, Wooyoung Jung

## Problem statement
### NAG-AI
While we have benefited a lot from the Internet, it is a double-edged sword, as the easy access to information has made it easier to become distracted. 
   
With our phones at our fingertips, we often find it difficult to stay focused when we have to. Even though we try to commit to a routine, we end up spending hours mindlessly scrolling on our phones. 
   
As busy university students, we thought of a tool that would help minimize wasted time. We envision an AI-based application that watches the user through their webcam, and warns them when they are distracted, such as when they are on their phones.
   
We present ‘NAG,’ short for ‘Never Abandon Goals.’ A convenient companion to help fight off distractions and achieve your creative and intellectual goals.


# Project structure
```
/
├── Documents
│   └── nagAI_DataDesign.pdf
├── README.md
├── backend
│   ├── auth
│   │   ├── oauth.py
│   │   └── supabase_client.py
│   ├── migrations
│   │   ├── versions
│   │   └── env.py
│   ├── models
│   │   ├── base.py
│   │   ├── distraction.py
│   │   ├── focus.py
│   │   ├── secret.py
│   │   ├── session.py
│   │   └── user.py
│   ├── routes
│   │   ├── auth.py
│   │   ├── distraction.py
│   │   ├── focus.py
│   │   ├── media.py
│   │   ├── secrets.py
│   │   ├── sessions.py
│   │   └── users.py
│   ├── schemas
│   │   ├── auth.py
│   │   ├── distraction.py
│   │   ├── focus_query.py
│   │   ├── focus.py
│   │   ├── secret.py
│   │   ├── session.py
│   │   └── user.py
│   ├── utils
│   │   ├── crypto.py
│   │   ├── init_env.py
│   │   ├── jwt_utils.py
│   │   └── push_secrets.py
│   ├── __init__.py
│   ├── config.py
│   ├── create_tables.py
│   ├── database.py
│   ├── main.py
│   ├── push_secrets.py
│   ├── run_backend.sh
│   ├── setup.sh
│   └── startup_env.py
├── frontend
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   └── ...
│   ├── src
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── assets
│   │   ├── components
│   │   ├── contexts
│   │   ├── hooks
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── pages
│   │   └── vite-env.d.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── nagai
│   ├── README.md
│   ├── initial_plan.md
│   └── tips_for_working_in_a_group.md
└── nagai.code-workspace

10 directories, 20 files
```

# Running the frontend
```
cd frontend
npm i --legacy-peer-deps
npm run dev
```

# Runing the backend
```
cd backend
./setup.sh (only for the first time)
conda activate nagai
./run_backend.sh
```

if [Errno 48] Address already in use error occurs: 
```
lsof -i :8000
kill -9 [PID]
./run_backend.sh
```