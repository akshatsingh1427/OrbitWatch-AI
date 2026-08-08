from datetime import datetime

import pandas as pd
from sqlalchemy.orm import Session

from database import SessionLocal
from models import RiskPrediction
from predict import predict_dataframe


def save_predictions(db: Session, df: pd.DataFrame):

    db.query(RiskPrediction).delete()

    db.commit()

    for _, row in df.iterrows():

        prediction = RiskPrediction(
            norad_id=int(row["norad_id"]),
            object_name=row["object_name"],
            risk_label=int(row["risk_label"]),
            risk_probability=float(row["risk_probability"]),
            altitude_km=float(row["altitude_km"]),
            prediction_time=datetime.utcnow(),
        )

        db.add(prediction)

    db.commit()


def main():

    print("=" * 60)
    print("OrbitWatch AI Prediction Pipeline")
    print("=" * 60)

    df = pd.read_csv("data/features.csv")

    print(f"Loaded {len(df)} satellites")

    df = predict_dataframe(df)

    db = SessionLocal()

    try:

        save_predictions(db, df)

    finally:

        db.close()

    print(f"Saved {len(df)} predictions.")

    print("Prediction cache updated successfully.")


if __name__ == "__main__":
    main()