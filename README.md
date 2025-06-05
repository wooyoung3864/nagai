# nagAI: Never Abandon Goals

**A web-based focus-tracking assistant combining a Pomodoro timer with real-time AI-powered distraction detection.**

nagAI helps users maintain productivity by using their webcam to detect distractions during study sessions. It provides gentle alerts when users lose focus and logs distraction events and focus time for later review.

**Deployed Website:**  
- **Frontend (Vercel):** [https://nagai-pi.vercel.app](https://nagai-pi.vercel.app)  
- **Backend API Docs (Render):** [https://nagai.onrender.com/docs](https://nagai.onrender.com/docs)

**Core Features:**  
- **Real-time distraction detection:** Gemini 1.5 Flash Vision API  
- **Pomodoro timer:** 25-minute focus sessions and 5-minute breaks  
- **Data logging:** Session and distraction data stored via Supabase PostgreSQL  
- **Focus & Distraction Logs:** Calendar and detailed table views  
- **Desktop notifications:** Alerts for detected distractions  

**New Features:**  
- **Widescreen mode:** Hides interface elements to minimize distractions  
- **Gesture Help Overlay:** Guides new users through gesture-based interaction  
- **Loading Spinner:** Assists users with gesture timing

**Project Setup:**  
Frontend:
```bash
cd frontend
npm i --legacy-peer-deps
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173)

Backend (First-time setup):
```bash
cd backend
./setup.sh
conda activate nagai
./run_backend.sh
```

Backend (Subsequent runs):
```bash
cd backend
conda activate nagai
./run_backend.sh
```
Access [http://localhost:8000/docs](http://localhost:8000/docs)

**Supported OS:** Linux, macOS, Windows (Manually install Miniconda for others)

**User Feedback & Improvements:**  
- Widescreen mode for fewer distractions  
- Notifications on inactive tabs  
- Enhanced onboarding with gesture assistance

**Known Issues:**  
- Occasional false positives (e.g., user drinking water)  
- Backend latency (Render Free Tier)

**Future Plans:**  
- On-device AI model for lower latency  
- Adaptive breaks based on fatigue signals  
- Social leaderboard

**Contributions:**  
- **Wooyoung:** Backend endpoints, deployment, gesture help, storage setup  
- **Jiwoo:** OAuth setup, notifications, log pages  
- **Joohyoung:** Frontend core pages, widescreen mode, webcam integration

**Code Conventions:**  
- PascalCase for class names, camelCase for methods  
- Consistent naming and descriptive CSS classes  
- Modularized React components and clear distinction between pages/components
