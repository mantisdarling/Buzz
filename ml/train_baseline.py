import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from data_loader import get_combined_data

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

def train_baseline_model(sample_size=None):
    """
    Trains a Logistic Regression model on TF-IDF features.
    Saves the pipeline (vectorizer + model) to models/baseline_model.joblib.
    """
    print("Fetching dataset for baseline model...")
    # Load dataset. Limit sample size if specified for fast CPU training.
    df = get_combined_data(max_samples_per_dataset=sample_size)
    
    if len(df) == 0:
        print("No data available for training. Exiting.")
        return
        
    print(f"Dataset loaded. Total samples: {len(df)}")
    
    X = df["text"]
    y = df["label"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("Fitting TF-IDF Vectorizer and Logistic Regression...")
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=10000, ngram_range=(1, 2), stop_words='english')),
        ('clf', LogisticRegression(max_iter=1000, C=1.0, random_state=42))
    ])
    
    pipeline.fit(X_train, y_train)
    
    # Evaluate
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n--- Baseline Model Evaluation ---")
    print(f"Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Fake", "Real"]))
    
    # Ensure directory exists and save pipeline
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_DIR, "baseline_model.joblib")
    joblib.dump(pipeline, model_path)
    print(f"Baseline model pipeline saved to {model_path}")
    
    return pipeline

if __name__ == "__main__":
    # Train on 10,000 samples per dataset for a solid but fast baseline
    train_baseline_model(sample_size=10000)
