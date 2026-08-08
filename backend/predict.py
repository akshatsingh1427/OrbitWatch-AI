import joblib
import pandas as pd

MODEL = joblib.load("models/risk_model.pkl")

FEATURE_COLUMNS = [
    "inclination_deg",
    "raan_deg",
    "eccentricity",
    "mean_motion",
    "drag_score",
    "orbital_period_min",
    "semi_major_axis_km",
    "altitude_km",
]


def predict_dataframe(df: pd.DataFrame):

    X = df[FEATURE_COLUMNS]

    predictions = MODEL.predict(X)

    probabilities = MODEL.predict_proba(X)

    df = df.copy()

    df["risk_label"] = predictions

    df["risk_probability"] = probabilities[:, 1]

    return df