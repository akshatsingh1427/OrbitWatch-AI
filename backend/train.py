import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import GradientBoostingClassifier

# -----------------------------
# Load feature dataset
# -----------------------------

df = pd.read_csv("data/features.csv")

# -----------------------------
# Temporary risk label
# (Replace later with SOCRATES labels)
# -----------------------------

df["risk_label"] = 0

df.loc[
    (df["drag_score"] > df["drag_score"].quantile(0.90))
    | (df["eccentricity"] > 0.01)
    | (df["altitude_km"] < 500),
    "risk_label",
] = 1

# -----------------------------
# Features
# -----------------------------

feature_columns = [
    "inclination_deg",
    "raan_deg",
    "eccentricity",
    "mean_motion",
    "drag_score",
    "orbital_period_min",
    "semi_major_axis_km",
    "altitude_km",
]

X = df[feature_columns]

y = df["risk_label"]

# -----------------------------
# Train/Test Split
# -----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)

# -----------------------------
# Models
# -----------------------------

models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Random Forest": RandomForestClassifier(
        n_estimators=100,
        random_state=42,
    ),
    "Gradient Boosting": GradientBoostingClassifier(
        random_state=42,
    ),
}

results = []

best_model = None
best_f1 = -1

for name, model in models.items():

    print(f"\nTraining {name}...")

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(y_test, predictions)
    recall = recall_score(y_test, predictions)
    f1 = f1_score(y_test, predictions)

    results.append(
        {
            "Model": name,
            "Accuracy": accuracy,
            "Precision": precision,
            "Recall": recall,
            "F1 Score": f1,
        }
    )

    print(f"Accuracy : {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1 Score : {f1:.4f}")

    print("\nConfusion Matrix")

    print(confusion_matrix(y_test, predictions))

    if f1 > best_f1:
        best_f1 = f1
        best_model = model

# -----------------------------
# Save comparison
# -----------------------------

comparison = pd.DataFrame(results)

comparison.to_csv(
    "data/model_comparison.csv",
    index=False,
)

print("\nModel comparison saved.")

# -----------------------------
# Feature Importance
# -----------------------------

if hasattr(best_model, "feature_importances_"):

    importance = pd.DataFrame(
        {
            "Feature": feature_columns,
            "Importance": best_model.feature_importances_,
        }
    )

    importance.sort_values(
        by="Importance",
        ascending=False,
        inplace=True,
    )

    importance.to_csv(
        "data/feature_importances.csv",
        index=False,
    )

# -----------------------------
# Save Model
# -----------------------------

joblib.dump(
    best_model,
    "models/risk_model.pkl",
)

print("\nModel saved.")