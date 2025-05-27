# CSE 416
### Team NAGA — Jiwoo Kim, Joohyoung Jun, Wooyoung Jung

## Problem statement
### NAG-AI
While we have benefited a lot from the Internet, it is a double-edged sword, as the easy access to information has made it easier to become distracted. 
   
With our phones at our fingertips, we often find it difficult to stay focused when we have to. Even though we try to commit to a routine, we end up spending hours mindlessly scrolling on our phones. 
   
As busy university students, we thought of a tool that would help minimize wasted time. We envision an AI-based application that watches the user through their webcam, and warns them when they are distracted, such as when they are on their phones.
   
We present ‘NAG,’ short for ‘Never Abandon Goals.’ A convenient companion to help fight off distractions and achieve your creative and intellectual goals.


## Deployed website
https://nagai-pi.vercel.app/


## Project structure
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
│___└── vite.config.ts

10 directories, 20 files
```

# Running the frontend
```
cd frontend
npm i --legacy-peer-deps
npm run dev
```

check out: http://localhost:5173 to see your frontend running from your localhost.

# Runing the backend
running and setting up the backend for the first time:
```
cd backend
./setup.sh 
conda activate nagai
./run_backend.sh
```

running backend for the 2nd time or more:
```
cd backend
conda activate nagai
./run_backend.sh
```

if [Errno 48] Address already in use error occurs: 
```
lsof -i :8000
kill -9 [PID]
./run_backend.sh
```

check out http://localhost:8000 to see if the backend is running.

http://localhost:8000/docs will let you know the backend APIs used.

# Supported OS
- Linux
- Darwin (MacOS)
- Windows

If none from above, please install Miniconda manually