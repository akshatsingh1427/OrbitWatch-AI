import pandas as pd
import numpy as np

from database import SessionLocal
from models import SatelliteSnapshot


def load_data():
    db = SessionLocal()

    satellites = db.query(SatelliteSnapshot).all()

    db.close()

    data = []

    for sat in satellites:
        data.append(
            {
                "norad_id": sat.norad_id,
                "object_name": sat.object_name,
                "epoch": sat.epoch,
                "inclination": sat.inclination,
                "raan": sat.raan,
                "eccentricity": sat.eccentricity,
                "arg_perigee": sat.arg_perigee,
                "mean_anomaly": sat.mean_anomaly,
                "mean_motion": sat.mean_motion,
                "bstar": sat.bstar,
            }
        )

    return pd.DataFrame(data)


def engineer_features(df):

    # Convert radians to degrees
    df["inclination_deg"] = np.degrees(df["inclination"])
    df["raan_deg"] = np.degrees(df["raan"])
    df["arg_perigee_deg"] = np.degrees(df["arg_perigee"])
    df["mean_anomaly_deg"] = np.degrees(df["mean_anomaly"])

    # Revolutions per day
    rev_per_day = df["mean_motion"] * 1440 / (2 * np.pi)
    df["rev_per_day"] = rev_per_day

    # Orbital period (minutes)
    df["orbital_period_min"] = 1440 / rev_per_day

    # Circularity
    df["circularity"] = 1 - df["eccentricity"]

    # Absolute drag value
    df["drag_score"] = df["bstar"].abs()

    # Semi-major axis (km)
    MU = 398600.4418

    mean_motion_rad_sec = rev_per_day * 2 * np.pi / 86400

    df["semi_major_axis_km"] = (
        MU / (mean_motion_rad_sec ** 2)
    ) ** (1 / 3)

    # Estimated altitude (km)
    EARTH_RADIUS = 6378.137

    df["altitude_km"] = (
        df["semi_major_axis_km"] - EARTH_RADIUS
    )

    return df


def main():

    print("Loading satellites...")

    df = load_data()

    print(f"Loaded {len(df)} satellites")

    print("Engineering features...")

    df = engineer_features(df)

    df.to_csv("data/features.csv", index=False)

    print("\nSaved feature dataset.")

    print(df.head())

    print("\nRows:", len(df))


if __name__ == "__main__":
    main()