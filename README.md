# SmartCool

Hi, I am a beginner coder and this is my first big project. I made this app to learn Python and Next.js together. It is called SmartCool.

## What is this project?

SmartCool is a simulation app. It shows how smart air conditioners can save energy in university classrooms, labs, and offices in Bangladesh. It does not control real AC units. It is only for research and learning.

We imagine there are sensors in the room. The sensors tell the computer if people are inside or not. Based on that, the AC can turn on, turn down, or turn off. This saves electricity and money.

## How the sensor works (simple idea)

1. A sensor sees people enter the room.
2. The app changes state to OCCUPIED.
3. The AC runs at full cool.
4. When people leave, the sensor sees empty room.
5. The app waits a little bit (VACANCY_PENDING).
6. Then it turns AC to low (VACANT_SETBACK).
7. After more time, it turns AC off (VACANT_OFF).
8. If the sensor breaks, the app shows SENSOR_FAULT.
9. A person can also use MANUAL_OVERRIDE.

These states are inside `backend/app/simulator/states.py`. I copied the list from my plan file.

## Project scope (what I wanted to build)

- A backend with FastAPI (Python) for the simulation engine.
- A frontend with Next.js and TypeScript so people can see charts.
- A SQLite database to save results.
- Energy calculator to show how much money is saved.
- Pages for: Overview, Monitoring, Simulation Lab, Energy Analytics, Compare Experiments, Events, Reports, and Methodology.
- CSV export for reports.
- No fake login. Only a demo admin token for reset actions (in `.env`).

## Folder explanation (what is inside)

```
SmartCool/
  backend/        -> Python code (FastAPI, simulation, database)
  frontend/       -> Next.js website
  .env.example    -> copy this to .env and put your token
  README.md       -> this file
  .gitignore      -> files we do not upload to GitHub
```

Inside `backend/app/`:
- `simulator/` -> the state machine (OCCUPIED, VACANT, etc.)
- `energy/` -> calculator for electricity and emissions
- `api/` -> web routes that the frontend calls
- `db/` -> database models

Inside `frontend/src/app/`:
- `page.tsx` -> home page
- `lab/page.tsx` -> simulation lab
- `analytics/page.tsx` -> energy charts
- `compare/page.tsx` -> compare two experiments
- `reports/page.tsx` -> download CSV

## How to run it (for beginners)

You need Python 3 and Node.js installed.

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
2. Install Python packages:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Install frontend packages:
   ```bash
   npm install --prefix frontend
   ```
4. Start backend:
   ```bash
   python backend/main.py
   ```
5. Start frontend:
   ```bash
   npm run build --prefix frontend
   npm start --prefix frontend
   ```

The backend runs on port 8000. The frontend runs on port 3000.

## Important notes (from my plan)

- All data is synthetic. There are no real sensors or AC units.
- Energy savings are estimated from profiles, not real measurements.
- Emissions estimates only work if you set a factor in `.env`.
- SQLite is for local demo. For real production, change to PostgreSQL.
- There is no WebSocket or Redis. Everything is simple.
- The `.kilo/` folder and `docs/` folder are ignored by Git so they do not go to GitHub.

## What I learned

I learned how to connect Python backend to JavaScript frontend. I learned about state machines. I learned how to ignore files with `.gitignore`. This project helped me practice coding.

## Credits

This project was built as a learning exercise. All code is original work by a beginner.
