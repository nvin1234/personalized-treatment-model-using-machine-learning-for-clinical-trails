import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
import joblib
import os

def setup_models():
    """Setup and train models from your dataset"""
    
    # Load your dataset
    print("Loading dataset...")
    df = pd.read_csv("new heart clinical.csv")
    print(f"Dataset loaded: {len(df)} rows, {len(df.columns)} columns")
    
    # Prepare features and targets (same as your code)
    X = df.drop(columns=["DEATH_EVENT", "aspirin", "heparin"])
    y_aspirin = df["aspirin"]
    y_heparin = df["heparin"]
    
    print("Features:", list(X.columns))
    
    # Split data
    X_train, X_test, y_aspirin_train, y_aspirin_test, y_heparin_train, y_heparin_test = train_test_split(
        X, y_aspirin, y_heparin, test_size=0.2, random_state=42
    )
    
    # Scale features
    print("Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train SVM models
    print("Training aspirin model...")
    aspirin_model = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True)
    aspirin_model.fit(X_train_scaled, y_aspirin_train)
    
    print("Training heparin model...")
    heparin_model = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True)
    heparin_model.fit(X_train_scaled, y_heparin_train)
    
    # Evaluate models
    aspirin_accuracy = aspirin_model.score(X_test_scaled, y_aspirin_test)
    heparin_accuracy = heparin_model.score(X_test_scaled, y_heparin_test)
    
    print(f"Aspirin model accuracy: {aspirin_accuracy:.3f}")
    print(f"Heparin model accuracy: {heparin_accuracy:.3f}")
    
    # Save models
    print("Saving models...")
    os.makedirs('models', exist_ok=True)
    joblib.dump(scaler, 'models/scaler.pkl')
    joblib.dump(aspirin_model, 'models/aspirin_model.pkl')
    joblib.dump(heparin_model, 'models/heparin_model.pkl')
    
    print("Setup complete!")
    
    return {
        'aspirin_accuracy': aspirin_accuracy,
        'heparin_accuracy': heparin_accuracy,
        'training_samples': len(X_train),
        'test_samples': len(X_test)
    }

if __name__ == "__main__":
    results = setup_models()
    print("\nModel Performance:")
    for key, value in results.items():
        print(f"{key}: {value}")
