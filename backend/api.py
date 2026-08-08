from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

import pandas as pd
from sqlalchemy import func

from database import SessionLocal
from models import RiskPrediction, SatelliteSnapshot

app = FastAPI(
    title="OrbitWatch AI API",
    version="2.0.0",
    description="Satellite Collision Risk Prediction API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "OrbitWatch AI Backend Running"
    }


@app.get("/health")
def health():

    db = SessionLocal()

    try:

        total = db.query(RiskPrediction).count()

        return {
            "status": "healthy",
            "database": "connected",
            "predictions": total,
        }

    finally:

        db.close()


@app.get("/statistics")
def statistics():

    db = SessionLocal()

    try:

        total = db.query(RiskPrediction).count()

        high = (
            db.query(RiskPrediction)
            .filter(RiskPrediction.risk_label == 1)
            .count()
        )

        low = (
            db.query(RiskPrediction)
            .filter(RiskPrediction.risk_label == 0)
            .count()
        )

        average = (
            db.query(func.avg(RiskPrediction.risk_probability))
            .scalar()
        )

        return {
            "total_satellites": total,
            "high_risk": high,
            "low_risk": low,
            "average_probability": float(average),
        }

    finally:

        db.close()


@app.get("/risk/top")
def top_risk(limit: int = 20):

    db = SessionLocal()

    try:

        rows = (
            db.query(RiskPrediction)
            .order_by(RiskPrediction.risk_probability.desc())
            .limit(limit)
            .all()
        )

        return [
            {
                "norad_id": r.norad_id,
                "object_name": r.object_name,
                "risk_label": r.risk_label,
                "risk_probability": r.risk_probability,
                "altitude_km": r.altitude_km,
            }
            for r in rows
        ]

    finally:

        db.close()


@app.get("/risk/{norad_id}")
def satellite(norad_id: int):

    db = SessionLocal()

    try:

        prediction = (
            db.query(RiskPrediction)
            .filter(RiskPrediction.norad_id == norad_id)
            .first()
        )

        if prediction is None:

            raise HTTPException(
                status_code=404,
                detail="Satellite not found",
            )

        satellite = (
            db.query(SatelliteSnapshot)
            .filter(SatelliteSnapshot.norad_id == norad_id)
            .order_by(SatelliteSnapshot.snapshot_time.desc())
            .first()
        )

        return {
            "norad_id": prediction.norad_id,
            "object_name": prediction.object_name,
            "risk_label": prediction.risk_label,
            "risk_probability": prediction.risk_probability,
            "altitude_km": prediction.altitude_km,
            "inclination": satellite.inclination if satellite else None,
            "raan": satellite.raan if satellite else None,
            "eccentricity": satellite.eccentricity if satellite else None,
            "mean_motion": satellite.mean_motion if satellite else None,
            "bstar": satellite.bstar if satellite else None,
        }

    finally:

        db.close()


@app.get("/alerts")
def alerts(limit: int = 25):

    db = SessionLocal()

    try:

        rows = (
            db.query(RiskPrediction)
            .filter(RiskPrediction.risk_label == 1)
            .order_by(RiskPrediction.risk_probability.desc())
            .limit(limit)
            .all()
        )

        return rows

    finally:

        db.close()


@app.get("/search")
def search(q: str):

    db = SessionLocal()

    try:

        rows = (
            db.query(RiskPrediction)
            .filter(RiskPrediction.object_name.ilike(f"%{q}%"))
            .limit(50)
            .all()
        )

        return rows

    finally:

        db.close()


@app.get("/export/json")
def export_json():

    db = SessionLocal()

    try:

        rows = db.query(RiskPrediction).all()

        return [
            {
                "norad_id": r.norad_id,
                "object_name": r.object_name,
                "risk_label": r.risk_label,
                "risk_probability": r.risk_probability,
                "altitude_km": r.altitude_km,
            }
            for r in rows
        ]

    finally:

        db.close()


@app.get("/export/csv")
def export_csv():

    db = SessionLocal()

    try:

        rows = db.query(RiskPrediction).all()

        df = pd.DataFrame(
            [
                {
                    "norad_id": r.norad_id,
                    "object_name": r.object_name,
                    "risk_label": r.risk_label,
                    "risk_probability": r.risk_probability,
                    "altitude_km": r.altitude_km,
                }
                for r in rows
            ]
        )

        output = "data/risk_predictions.csv"

        df.to_csv(output, index=False)

        return FileResponse(
            output,
            filename="risk_predictions.csv",
            media_type="text/csv",
        )

    finally:

        db.close()