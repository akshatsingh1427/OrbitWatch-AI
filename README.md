<div align="center">

# 🛰️ OrbitWatch AI

### AI-Powered Orbital Mission Control & Satellite Collision Risk Intelligence Platform

<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white">
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white">
<img src="https://img.shields.io/badge/Machine%20Learning-Gradient%20Boosting-orange?style=for-the-badge">
<img src="https://img.shields.io/badge/Status-Working%20Prototype-brightgreen?style=for-the-badge">

> OrbitWatch AI is a full-stack satellite monitoring and machine-learning platform designed to analyze orbital data, identify potentially high-risk satellites, and provide an interactive 3D mission-control interface.

The platform combines 3D satellite visualization, orbital mechanics data, CelesTrak data, SOCRATES conjunction records, machine learning, FastAPI, SQLite, and React into a single application for exploring satellite orbital characteristics and AI-generated risk predictions.

</div>

---

## Table of Contents

- [Project Status](#-project-status)
- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [SOCRATES Dataset](#-socrates-dataset)
- [SOCRATES-Based Label Generation](#️-socrates-based-label-generation)
- [Feature Engineering](#-feature-engineering)
- [Machine Learning Pipeline](#-machine-learning-pipeline)
- [Train / Validation / Test Split](#-train--validation--test-split)
- [Model Comparison](#-model-comparison)
- [Feature Importance](#-feature-importance)
- [Prediction Pipeline](#-prediction-pipeline)
- [Highest Predicted Risks](#-highest-predicted-risks)
- [Database](#️-database)
- [Backend](#️-backend)
- [REST API](#-rest-api)
- [Frontend](#️-frontend)
- [Architecture at a Glance](#️-architecture-at-a-glance)
- [System Architecture](#️-system-architecture)
- [Project Structure](#-project-structure)
- [Technology Stack](#️-technology-stack)
- [Local Installation](#-local-installation)
- [Reproducing the ML Pipeline](#-reproducing-the-ml-pipeline)
- [Model Evaluation](#-model-evaluation)
- [Important ML Limitation](#️-important-ml-limitation)
- [Security & Deployment Considerations](#-security--deployment-considerations)
- [Future Improvements](#️-future-improvements)
- [Project Highlights](#-project-highlights)
- [Use Case](#-use-case)
- [Disclaimer](#-disclaimer)
- [Author](#-author)

---

## 📌 Project Status

| | |
|---|---|
| **Status** | Working Prototype / Completed Core System |
| **Deployment** | Local deployment currently; cloud deployment planned |
| **ML Model** | Gradient Boosting Classifier |
| **Training Records** | 16,099 satellites |
| **Prediction Records** | 16,099 |

---

## 🌌 Overview

Thousands of active and inactive objects orbit Earth, creating an increasingly complex orbital environment. Satellite operators need tools that can help analyze orbital parameters and identify objects associated with potentially concerning conjunction characteristics.

OrbitWatch AI addresses this by combining:

- 🛰️ Satellite orbital data
- 🔭 CelesTrak satellite information
- ⚠️ SOCRATES conjunction data
- 🤖 Machine-learning-based risk classification
- 📊 Statistical and orbital feature analysis
- 🧠 AI risk scoring
- 🌍 Interactive 3D visualization
- 🚀 FastAPI backend
- 🗄️ SQLite prediction database
- ⚛️ React + TypeScript frontend

The result is an interactive mission-control-style dashboard where users can explore satellites and investigate their predicted risk.

---

## 🎯 Problem Statement

The increasing number of satellites and orbital objects makes monitoring orbital environments increasingly challenging. Raw orbital data contains many parameters — inclination, RAAN, eccentricity, mean motion, B* drag term, orbital period, semi-major axis, altitude — that are difficult to interpret at scale.

OrbitWatch AI attempts to transform these orbital characteristics and conjunction information into an interpretable AI-based risk classification system.

> The goal is not to replace professional conjunction assessment systems, but to demonstrate how machine learning can be applied to orbital-risk analysis and decision support.

---

## 🚀 Key Features

### 🛰️ 1. 3D Orbital Mission Control

The frontend provides an interactive 3D environment for exploring satellites and orbital information:

- 3D satellite visualization
- Interactive satellite selection
- Orbital visualization
- Satellite information panels
- Risk-aware visual indicators
- Mission-control-style interface
- Interactive dashboards

**Technology:** React, TypeScript, React Three Fiber, Three.js, Tailwind CSS, Vite

### 🤖 2. AI Risk Prediction

OrbitWatch uses machine learning to classify satellites into binary risk categories. The final selected model is a **Gradient Boosting Classifier**, using orbital and derived features to produce a risk label and risk probability.

The deployed prediction pipeline uses an optimized classification threshold of **0.23**.

### ⚠️ 3. Risk Classification

The SOCRATES data was processed into satellite-level risk information, represented as **Low / Medium / High**. For machine-learning classification, the system uses a binary target: `0` → low/non-positive risk, `1` → positive risk.

**Final labeling run:**

| Metric | Value |
|---|---|
| Total labeled satellites | 16,099 |
| Risk Label 0 | 12,181 |
| Risk Label 1 | 3,918 |
| Positive rate | 24.34% |

**Risk-level distribution:**

| Level | Count |
|---|---|
| Low | 12,181 |
| Medium | 3,259 |
| High | 659 |

---

## 🔭 SOCRATES Dataset

OrbitWatch uses conjunction information obtained from the CelesTrak SOCRATES dataset.

| Metric | Value |
|---|---|
| SOCRATES records | 148,630 |
| Unique conjunction satellites | 23,990 |
| Feature satellites | 16,099 |
| Labeled satellites | 16,099 |

**Important SOCRATES fields:** `MAX_PROB`, `TCA_RANGE`, `NORAD_CAT_ID_1`, `NORAD_CAT_ID_2`

| Field | Min | Median | Max |
|---|---|---|---|
| MAX_PROB | 1.851e-08 | 5.201e-06 | 1.0 |
| TCA_RANGE | 0.011 km | 3.543 km | 5.0 km |

---

## 🏷️ SOCRATES-Based Label Generation

The project includes a dedicated label-generation process. SOCRATES conjunction records are converted into satellite-level information by aggregating conjunctions associated with individual NORAD IDs, producing: `norad_id`, `object_name`, `max_conjunction_probability`, `min_conjunction_range_km`, `conjunction_count`, `risk_level`, `risk_label`.

**Examples of high-risk objects identified by the dataset:**

| NORAD ID | Object | Max Probability | Min Range (km) | Conjunction Count | Risk |
|---|---|---|---|---|---|
| 58099 | STARLINK-30607 | 1.00000 | 0.011 | 9 | High |
| 68633 | MISR-C-2 | 1.00000 | 0.011 | 96 | High |
| 39451 | SWARM B | 0.18750 | 0.018 | 246 | High |
| 59856 | STARLINK-31691 | 0.18750 | 0.018 | 12 | High |
| 68007 | STARLINK-36592 | 0.13390 | 0.047 | 32 | High |
| 56410 | STARLINK-6281 | 0.13390 | 0.047 | 70 | High |

---

## 🧮 Feature Engineering

The final ML feature set combines orbital information with derived orbital features:

| Feature | Description |
|---|---|
| `inclination_deg` | Orbital inclination in degrees |
| `raan_deg` | Right Ascension of the Ascending Node |
| `eccentricity` | Orbital eccentricity |
| `mean_motion` | Number of orbital revolutions per day |
| `drag_score` | Derived atmospheric-drag-related feature |
| `orbital_period_min` | Estimated orbital period in minutes |
| `semi_major_axis_km` | Semi-major axis in kilometers |
| `altitude_km` | Approximate orbital altitude |

---

## 🧠 Machine Learning Pipeline

```
CelesTrak / Orbital Data
          │
          ▼
     Feature Extraction
          │
          ▼
    SOCRATES Data
          │
          ▼
    Label Generation
          │
          ▼
     Feature Dataset
          │
          ▼
Train / Validation / Test Split
          │
          ▼
Multiple ML Models
          │
          ├── Logistic Regression
          ├── Random Forest
          ├── Extra Trees
          └── Gradient Boosting
          │
          ▼
Threshold Optimization
          │
          ▼
Best Model Selection
          │
          ▼
risk_model.pkl
          │
          ▼
16,099 Predictions
          │
          ▼
SQLite Database
          │
          ▼
FastAPI
          │
          ▼
React 3D Dashboard
```

---

## 🧪 Train / Validation / Test Split

The final improved training pipeline used a stratified split to preserve class distribution:

| Split | Samples |
|---|---|
| Total | 16,099 |
| Training | 11,269 |
| Validation | 2,415 |
| Test | 2,415 |

---

## 📊 Model Comparison

Several machine-learning algorithms were evaluated:

| Model | Threshold | Accuracy | Precision | Recall | F1 | ROC-AUC | PR-AUC |
|---|---|---|---|---|---|---|---|
| Logistic Regression | 0.46 | 0.4364 | 0.2982 | 0.9711 | 0.4563 | 0.6228 | 0.2909 |
| Random Forest | 0.16 | 0.4907 | 0.3132 | 0.9150 | 0.4666 | 0.6863 | 0.4172 |
| Extra Trees | 0.30 | 0.4882 | 0.3180 | 0.9626 | 0.4780 | 0.7000 | 0.4232 |
| **Gradient Boosting ⭐** | **0.23** | **0.5329** | **0.3327** | **0.9165** | **0.4882** | **0.7124** | **0.4359** |

**Confusion matrix (Gradient Boosting):**

|  | Predicted 0 | Predicted 1 |
|---|---|---|
| **Actual 0** | 749 | 1079 |
| **Actual 1** | 49 | 538 |

**Why Gradient Boosting?** It achieved the strongest overall combination among the tested models, particularly in F1 Score, ROC-AUC, Recall, and PR-AUC.

- **Best Model:** Gradient Boosting
- **Best Threshold:** 0.23
- **Saved as:** `backend/models/risk_model.pkl`

---

## 📈 Feature Importance

| Rank | Feature | Importance |
|---|---|---|
| 1 | Altitude | 0.1412 |
| 2 | Orbital Period | 0.1394 |
| 3 | Eccentricity | 0.1283 |
| 4 | RAAN | 0.1256 |
| 5 | Drag Score | 0.1232 |
| 6 | Semi-Major Axis | 0.1158 |
| 7 | Inclination | 0.1143 |
| 8 | Mean Motion | 0.1122 |

The most influential feature in the trained tree-based analysis was **Altitude**, followed closely by **Orbital Period** and **Eccentricity**.

---

## 🔮 Prediction Pipeline

The trained model is loaded using Joblib:

```python
MODEL = joblib.load("models/risk_model.pkl")
```

For each satellite, the prediction pipeline extracts the eight required features and generates a `risk_label` and `risk_probability`.

| Metric | Value |
|---|---|
| Total predictions | 16,099 satellites |
| High / Positive | 10,882 |
| Low / Negative | 5,217 |
| Average risk probability | 0.2419206501 |

---

## 🚨 Highest Predicted Risks

| NORAD ID | Object | Risk Probability | Altitude |
|---|---|---|---|
| 58301 | LEO EXPRESS 1 | 0.9375 | 456.63 km |
| 63230 | ION SCV-017 | 0.9218 | 481.26 km |
| 55051 | ION SCV-008 | 0.9215 | 478.40 km |
| 69505 | HORN-L | 0.9164 | 481.49 km |
| 57186 | CSTP 1.2 | 0.9160 | 476.83 km |
| 43799 | HAWK-C | 0.9160 | 479.25 km |
| 61242 | 2024-174E | 0.9147 | 481.47 km |
| 67261 | 2025-313P | 0.9136 | 481.91 km |
| 64092 | 2025-108F | 0.9136 | 477.81 km |
| 43804 | SUOMI-100 | 0.9136 | 477.14 km |

> These values represent model-generated risk scores, not certified physical collision probabilities.

---

## 🗄️ Database

OrbitWatch uses **SQLite** with **SQLAlchemy**, stored at `backend/data/satellite.db`, with two primary tables:

**`risk_predictions`** — stores ML prediction results (`id`, `norad_id`, `object_name`, `risk_label`, `risk_probability`, `altitude_km`, `prediction_time`) — currently **16,099** records.

**`satellite_snapshots`** — stores orbital satellite snapshots (`id`, `norad_id`, `object_name`, `epoch`, `inclination`, `raan`, `eccentricity`, `arg_perigee`, `mean_anomaly`, `mean_motion`, `bstar`, `snapshot_time`).

---

## ⚙️ Backend

OrbitWatch uses **FastAPI** as its backend framework. Backend responsibilities include serving ML predictions, satellite statistics, satellite search, high-risk alerts, individual satellite details, export functionality, and connecting the frontend to SQLite. The backend has been locally tested successfully.

**Health response:**

```json
{
  "status": "healthy",
  "database": "connected",
  "predictions": 16099
}
```

---

## 🔌 REST API

Base URL during local development: **`http://127.0.0.1:8000`**

| Endpoint | Method | Description |
|---|---|---|
| `/health` | `GET` | Server and database health check |
| `/statistics` | `GET` | Total satellites, high/low risk counts, average probability |
| `/risk/top?limit=10` | `GET` | Satellites ordered by model risk probability |
| `/risk/{norad_id}` | `GET` | Individual satellite info + ML risk prediction + orbital parameters |
| `/alerts?limit=25` | `GET` | High-risk predictions ordered by probability |
| `/search?q=STARLINK` | `GET` | Search satellites by object name |
| `/export/json` | `GET` | Export prediction information as JSON |
| `/export/csv` | `GET` | Export predictions as `risk_predictions.csv` |

**Example — `GET /statistics`:**

```json
{
  "total_satellites": 16099,
  "high_risk": 10882,
  "low_risk": 5217,
  "average_probability": 0.2419206501
}
```

**Example — `GET /risk/top?limit=10`:**

```json
{
  "norad_id": 58301,
  "object_name": "LEO EXPRESS 1",
  "risk_label": 1,
  "risk_probability": 0.937524,
  "altitude_km": 456.625
}
```

---

## ⚛️ Frontend

The frontend is built using React, TypeScript, Vite, Tailwind CSS, Three.js, React Three Fiber, and React Query, communicating with FastAPI through a typed API client.

### 🔗 Frontend API Architecture

The frontend API base URL is configurable via `VITE_API_BASE_URL` (default local value: `http://127.0.0.1:8000`).

The API client provides: `getHome()`, `getHealth()`, `getStatistics()`, `getTopRisk()`, `getSatellite()`, `getAlerts()`, `searchSatellites()`, `getExportJsonUrl()`, `getExportCsvUrl()`. React Query hooks provide data fetching and refresh behavior.

### 🔄 Frontend Refresh Strategy

| Data | Refresh Interval |
|---|---|
| Statistics | Every 30 seconds |
| Alerts | Every 15 seconds |
| Backend Health | Every 60 seconds |
| Top Risk | Cached; large catalog requests avoid unnecessary re-downloads |

### 🧩 Frontend → Backend Flow

```
React UI → React Query Hooks → Typed API Client → FastAPI REST API
→ SQLAlchemy → SQLite → 16,099 ML Predictions
```

### 🌍 3D Mission Control Flow

```
User selects satellite → Frontend obtains NORAD ID → GET /risk/{norad_id}
→ FastAPI → [ML Prediction + Orbital Snapshot] → Satellite Details Panel
```

This allows the 3D interface to be connected to real backend satellite information rather than relying exclusively on static UI data.

---

## 🏗️ Architecture at a Glance

```
CelesTrak orbital data              SOCRATES conjunction data
(TLEs / satellite catalog)          (148,630 records)
        │                                    │
        ▼                                    ▼
features.py                          create_labels.py
extractOrbitalFeatures()             aggregateByNoradId()
inclination, RAAN, eccentricity,           │
mean_motion, drag_score,                   ▼
orbital_period, semi_major_axis,     Per-satellite risk info
altitude                             (max_prob, min_range,
        │                             conjunction_count)
        │                                    │
        └──────────────┬─────────────────────┘
                        ▼
              Satellite matched to labels?
                    /          \
                 yes            no
                  │              │
                  ▼              ▼
          Feature + label     Excluded from
          row retained        training set
                  │
                  ▼
        16,099 labeled satellites
        (features.csv + labels.csv)
                  │
                  ▼
train.py — stratified split
Train 11,269 / Val 2,415 / Test 2,415
                  │
                  ▼
        Train 4 candidate models
                  │
      ┌───────────┼───────────┬─────────────┐
      ▼           ▼           ▼             ▼
Logistic Reg   Random Forest  Extra Trees   Gradient Boosting
ROC-AUC 0.62   ROC-AUC 0.69   ROC-AUC 0.70   ROC-AUC 0.71 ⭐
      │           │           │             │
      └───────────┴───────────┴─────────────┘
                        ▼
        selectBestModel() — by F1 / ROC-AUC / PR-AUC
                        ▼
        Gradient Boosting @ threshold 0.23
                        ▼
        joblib.dump() → backend/models/risk_model.pkl
                        │
                        ▼
predict_all.py
MODEL = joblib.load("risk_model.pkl")
extract 8 features per satellite → predict risk_label + risk_probability
                        ▼
        16,099 predictions
                        ▼
database.py — SQLAlchemy
INSERT INTO risk_predictions / satellite_snapshots
                        ▼
        satellite.db (SQLite)
                        │
                        ▼
api.py — FastAPI
GET /health · /statistics · /risk/top · /risk/{norad_id}
GET /alerts · /search · /export/json · /export/csv
                        │
                        ▼
Typed API client (React Query hooks)
refresh: statistics 30s · alerts 15s · health 60s
                        │
                        ▼
React + TypeScript + React Three Fiber
3D Mission Control — components read only from the
API client, never touch the model or database directly
```

The pipeline has one branch point worth calling out: not every satellite in the CelesTrak catalog has a matching SOCRATES conjunction record. Only satellites with a resolvable label (23,990 unique conjunction satellites narrowed to 16,099 with usable features) enter the training set — the rest are excluded rather than guessed at, which is why the training/prediction counts match exactly (16,099 in, 16,099 out).

---

```
                         ORBITWATCH AI
                              │
              ┌───────────────┴───────────────┐
              │                               │
         FRONTEND                         BACKEND
              │                               │
       React + TypeScript                 FastAPI
              │                               │
     React Three Fiber                   REST API
              │                               │
          Three.js                       SQLAlchemy
              │                               │
       Tailwind CSS                       SQLite
              │                               │
              │                    ┌──────────┴──────────┐
              │                    │                     │
              │               Predictions          Snapshots
              │                    │
              │                    ▼
              │              ML Model
              │                    │
              │          Gradient Boosting
              │                    │
              │                    ▼
              │              Risk Scores
              │
              └──────────── HTTPS/API ────────────────┘
```

---

## 📁 Project Structure

```
OrbitWatch-AI/
│
├── backend/
│   ├── api.py
│   ├── database.py
│   ├── models.py
│   ├── predict.py
│   ├── predict_all.py
│   ├── train.py
│   ├── create_labels.py
│   ├── features.py
│   ├── requirements.txt
│   ├── data/
│   │   ├── satellite.db
│   │   ├── features.csv
│   │   ├── labels.csv
│   │   ├── socrates.csv
│   │   ├── feature_importances.csv
│   │   ├── model_comparison.csv
│   │   └── risk_predictions.csv
│   └── models/
│       └── risk_model.pkl
│
├── src/
│   ├── api/
│   ├── hooks/
│   ├── components/
│   ├── pages/
│   └── ...
│
├── public/
├── assets/
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── postcss.config.js
├── .env.example
├── .gitignore
└── README.md
```

---

## 🛠️ Technology Stack

<div align="center">

<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white">
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white">
<img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white">
<img src="https://img.shields.io/badge/Scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white">

</div>

**Frontend**

| Technology | Purpose |
|---|---|
| React | UI framework |
| TypeScript | Type-safe development |
| Vite | Frontend build tooling |
| Tailwind CSS | UI styling |
| Three.js | 3D graphics |
| React Three Fiber | React-based Three.js rendering |
| React Query | API state/data fetching |

**Backend**

| Technology | Purpose |
|---|---|
| Python | Backend + ML |
| FastAPI | REST API |
| Uvicorn | ASGI server |
| SQLAlchemy | Database ORM |
| SQLite | Local prediction database |
| Pandas | Data processing |
| NumPy | Numerical processing |
| Joblib | ML model serialization |

**Machine Learning**

| Technology | Purpose |
|---|---|
| Scikit-learn | ML algorithms |
| Gradient Boosting | Final classifier |
| Random Forest | Model comparison |
| Extra Trees | Model comparison |
| Logistic Regression | Baseline model |

**Data**

| Source | Purpose |
|---|---|
| CelesTrak | Satellite/orbital data |
| SOCRATES | Conjunction analysis |
| NORAD IDs | Satellite identification |

---

## 🚀 Local Installation

### 1. Clone the Repository

```bash
git clone https://github.com/akshatsingh1427/OrbitWatch-AI.git
cd OrbitWatch-AI
```

### 🐍 Backend Setup

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
uvicorn api:app --reload
```

- Backend: **http://127.0.0.1:8000**
- API documentation: **http://127.0.0.1:8000/docs**

### 💻 Frontend Setup

From the project root:

```bash
npm install
```

Create `.env`:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

```bash
npm run dev
```

Frontend: **http://localhost:5173**

### 🔍 Verify Backend

```bash
curl http://127.0.0.1:8000/health
```

Expected:

```json
{
  "status": "healthy",
  "database": "connected",
  "predictions": 16099
}
```

```bash
curl http://127.0.0.1:8000/statistics
curl "http://127.0.0.1:8000/risk/top?limit=10"
```

---

## 📦 Model Files

The trained model is stored at `backend/models/risk_model.pkl` and loaded by the prediction system using Joblib. The model does not need to be retrained every time the API starts.

```
Train model → Save risk_model.pkl → API loads model/predictions → Serve predictions
```

---

## 🔬 Reproducing the ML Pipeline

```
1. Obtain orbital data
        ↓
2. Process features
        ↓
3. Process SOCRATES data
        ↓
4. Generate labels
        ↓
5. Train models
        ↓
6. Compare models
        ↓
7. Select best model
        ↓
8. Generate predictions
        ↓
9. Store predictions in SQLite
```

```bash
# Generate labels
python create_labels.py

# Train models
python train.py

# Generate predictions
python predict_all.py
```

**Generated ML artifacts:** `data/labels.csv`, `data/model_comparison.csv`, `data/feature_importances.csv`, `models/risk_model.pkl`

**Prediction generation updates:** `data/risk_predictions.csv` and the SQLite database.

---

## 🧪 Model Evaluation

The project does not rely only on accuracy. The following metrics are evaluated: **Accuracy, Precision, Recall, F1 Score, ROC-AUC, PR-AUC, Confusion Matrix.**

This is important because risk classification is not necessarily a balanced classification problem, and accuracy alone can hide poor positive-class detection.

---

## ⚠️ Important ML Limitation

OrbitWatch AI is a research/educational machine-learning prototype. The model's output (`risk_probability`) should be interpreted as a **model risk score/probability**, not as an official physical probability of collision.

Professional satellite collision assessment involves additional factors and operational processes that are outside the scope of this project. The model was trained using SOCRATES-derived labels and orbital features available in the project dataset.

**Therefore, the system should not be used as the sole basis for real-world satellite maneuver decisions.**

---

## 🔐 Security & Deployment Considerations

The application currently supports local development. Planned production architecture:

```
React/Vite → Vercel → (HTTPS) → FastAPI → Render → [SQLite + ML Model]
```

Production deployment will require: persistent database storage, production environment variables, HTTPS, production CORS configuration, secure API configuration, backend health monitoring, and appropriate persistent storage.

---

## 🛣️ Future Improvements

**Machine Learning**
- [ ] Larger historical datasets
- [ ] More orbital features
- [ ] Better class balancing
- [ ] Calibration of predicted probabilities
- [ ] Hyperparameter optimization
- [ ] Temporal validation
- [ ] More robust model evaluation
- [ ] Explainable AI with SHAP
- [ ] Conjunction-level rather than only satellite-level modeling

**Orbital Intelligence**
- [ ] Real-time orbital updates
- [ ] Historical risk tracking
- [ ] TLE propagation
- [ ] Satellite trajectory visualization
- [ ] Time-to-conjunction analysis
- [ ] Closest-approach visualization

**Platform**
- [ ] User authentication
- [ ] Satellite watchlists
- [ ] Automated alerts
- [ ] Email/notification integration
- [ ] Historical dashboards
- [ ] Advanced filtering
- [ ] Multi-satellite comparison

**Deployment**
- [ ] Cloud-hosted FastAPI
- [ ] Persistent production database
- [ ] Automated CI/CD
- [ ] Monitoring, logging, production observability

---

## 🏆 Project Highlights

<div align="center">

| | | |
|---|---|---|
| **148,630** SOCRATES conjunction records | **23,990** Unique conjunction satellites | **16,099** Feature-matched satellites |
| **16,099** ML predictions | **8** ML features | **4** Models compared |
| **0.7124** Best ROC-AUC | **0.4882** Best F1 Score | **0.23** Optimized classification threshold |

</div>

---

## 🎓 Use Case

OrbitWatch AI demonstrates how machine learning can be applied to space situational awareness, orbital data analysis, satellite risk screening, predictive analytics, decision-support systems, and 3D scientific visualization.

It combines machine learning engineering, data engineering, backend development, frontend engineering, and 3D visualization into one integrated system.

---

## 📜 Disclaimer

OrbitWatch AI is an educational and research-oriented project. The AI-generated risk scores are not official collision probabilities and should not be used for operational satellite maneuver decisions.

The project demonstrates the application of machine learning and software engineering techniques to orbital-risk analysis using available satellite and conjunction datasets.

---

## 👨‍💻 Author

<div align="center">

**Akshat Singh**
Computer Science Engineering

<a href="https://github.com/akshatsingh1427">
  <img src="https://img.shields.io/badge/GitHub-000000?style=for-the-badge&logo=github&logoColor=white">
</a>
<a href="https://www.linkedin.com/in/akshat-singh-ba248b394/">
  <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white">
</a>

</div>

---

<div align="center">

## ⭐ Final Summary

OrbitWatch AI transforms satellite and conjunction data into an interactive AI-powered orbital intelligence platform.

```
Satellite Data + SOCRATES Conjunction Data
      ↓
Feature Engineering → Risk Label Generation → Machine Learning
      ↓
Gradient Boosting → Risk Predictions → SQLite Database
      ↓
FastAPI → React + 3D Mission Control
      ↓
Interactive Orbital Risk Intelligence
```

**Turning orbital data into intelligent satellite risk insights.**

</div>
