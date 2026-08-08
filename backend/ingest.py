import os
import requests
from sgp4.api import Satrec

from database import SessionLocal
from models import SatelliteSnapshot

CELESTRAK_URL = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle"

CACHE_FILE = "data/active.tle"

HEADERS = {
    "User-Agent": "OrbitWatch-AI/1.0 (Academic Project)"
}


def fetch_tle():
    os.makedirs("data", exist_ok=True)

    print("Checking CelesTrak...")

    response = requests.get(
        CELESTRAK_URL,
        headers=HEADERS,
        timeout=30
    )

    if response.status_code == 200:

        text = response.text

        if "GP data has not updated" in text:

            print("No new update available.")

            if os.path.exists(CACHE_FILE):

                print("Using cached dataset.")

                with open(CACHE_FILE, "r", encoding="utf-8") as f:
                    return f.read().splitlines()

            raise Exception(
                "No cached file exists.\nWait until the next CelesTrak update."
            )

        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            f.write(text)

        print(f"Saved latest dataset to {CACHE_FILE}")
        print(f"Downloaded {len(text.splitlines()) // 3} satellites")

        return text.splitlines()

    if response.status_code == 403:

        print("Server reports no new data.")

        if os.path.exists(CACHE_FILE):

            print("Loading cached dataset.")

            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return f.read().splitlines()

        raise Exception(
            "No cached file exists.\nWait until CelesTrak updates."
        )

    response.raise_for_status()


def parse_tle(lines):

    satellites = []

    for i in range(0, len(lines), 3):

        try:

            name = lines[i].strip()
            line1 = lines[i + 1].strip()
            line2 = lines[i + 2].strip()

            sat = Satrec.twoline2rv(line1, line2)

            satellites.append(
                SatelliteSnapshot(
                    norad_id=sat.satnum,
                    object_name=name,
                    epoch=line1[18:32].strip(),
                    inclination=sat.inclo,
                    raan=sat.nodeo,
                    eccentricity=sat.ecco,
                    arg_perigee=sat.argpo,
                    mean_anomaly=sat.mo,
                    mean_motion=sat.no_kozai,
                    bstar=sat.bstar,
                )
            )

        except Exception:
            continue

    return satellites


def save_to_database(satellites):

    db = SessionLocal()

    try:

        db.add_all(satellites)

        db.commit()

        print(f"Saved {len(satellites)} satellites.")

    except Exception as e:

        db.rollback()

        raise e

    finally:

        db.close()


def main():

    try:

        print("=" * 60)
        print("OrbitWatch AI - Satellite Ingestion")
        print("=" * 60)

        lines = fetch_tle()

        satellites = parse_tle(lines)

        print(f"Parsed {len(satellites)} satellites.")

        save_to_database(satellites)

        print("Database updated successfully.")

    except Exception as e:

        print("\nERROR")
        print("-" * 60)
        print(e)
        print("-" * 60)


if __name__ == "__main__":
    main()