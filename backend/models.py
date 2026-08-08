from datetime import datetime

from sqlalchemy import Column, Integer, Float, String, Text, DateTime

from database import Base


class SatelliteSnapshot(Base):
    __tablename__ = "satellite_snapshots"

    id = Column(Integer, primary_key=True, index=True)

    norad_id = Column(Integer, index=True)

    object_name = Column(Text)

    epoch = Column(Text)

    inclination = Column(Float)

    raan = Column(Float)

    eccentricity = Column(Float)

    arg_perigee = Column(Float)

    mean_anomaly = Column(Float)

    mean_motion = Column(Float)

    bstar = Column(Float)

    snapshot_time = Column(
        DateTime,
        default=datetime.utcnow,
    )


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)

    norad_id = Column(Integer, unique=True, index=True)

    object_name = Column(Text, nullable=False)

    risk_label = Column(Integer, nullable=False)

    risk_probability = Column(Float, nullable=False)

    altitude_km = Column(Float)

    prediction_time = Column(
        DateTime,
        default=datetime.utcnow,
    )