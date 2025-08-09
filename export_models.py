import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
import json
import joblib
import os

def export_models_to_js():
    print("Exporting your ML models for browser use...")
    
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    # Load the dataset
    print("Loading dataset...")
    df = pd.read_csv("new heart clinical.csv")
    
    # Feature selection
    X = df.drop(columns=["DEATH_EVENT", "aspirin", "heparin"])
    y_aspirin = df["aspirin"]
    y_heparin = df["heparin"]
    
    # Get feature names for later use
    feature_names = list(X.columns)
    print(f"Features: {feature_names}")
    
    # Train-test split
    X_train, X_test, y_aspirin_train, y_aspirin_test, y_heparin_train, y_heparin_test = train_test_split(
        X, y_aspirin, y_heparin, test_size=0.2, random_state=42
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save scaler parameters
    scaler_params = {
        'mean': scaler.mean_.tolist(),
        'scale': scaler.scale_.tolist(),
        'feature_names': feature_names
    }
    
    # Train all models
    print("Training models...")
    
    # 1. Logistic Regression
    lr_aspirin = LogisticRegression(max_iter=1000)
    lr_heparin = LogisticRegression(max_iter=1000)
    lr_aspirin.fit(X_train_scaled, y_aspirin_train)
    lr_heparin.fit(X_train_scaled, y_heparin_train)
    
    # 2. Random Forest
    rf_aspirin = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_heparin = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_aspirin.fit(X_train_scaled, y_aspirin_train)
    rf_heparin.fit(X_train_scaled, y_heparin_train)
    
    # 3. SVM
    svm_aspirin = SVC(kernel='rbf', probability=True, random_state=42)
    svm_heparin = SVC(kernel='rbf', probability=True, random_state=42)
    svm_aspirin.fit(X_train_scaled, y_aspirin_train)
    svm_heparin.fit(X_train_scaled, y_heparin_train)
    
    # 4. XGBoost
    xgb_aspirin = XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
    xgb_heparin = XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
    xgb_aspirin.fit(X_train_scaled, y_aspirin_train)
    xgb_heparin.fit(X_train_scaled, y_heparin_train)
    
    # Extract model parameters
    print("Extracting model parameters...")
    
    # 1. Logistic Regression parameters
    lr_aspirin_params = {
        'coefficients': lr_aspirin.coef_[0].tolist(),
        'intercept': lr_aspirin.intercept_[0].tolist(),
        'classes': lr_aspirin.classes_.tolist()
    }
    
    lr_heparin_params = {
        'coefficients': lr_heparin.coef_[0].tolist(),
        'intercept': lr_heparin.intercept_[0].tolist(),
        'classes': lr_heparin.classes_.tolist()
    }
    
    # 2. SVM parameters (for RBF kernel)
    svm_aspirin_params = {
        'support_vectors': svm_aspirin.support_vectors_.tolist(),
        'dual_coef': svm_aspirin.dual_coef_[0].tolist(),
        'intercept': svm_aspirin.intercept_[0].tolist(),
        'gamma': float(svm_aspirin._gamma) if hasattr(svm_aspirin, '_gamma') else 'auto',
        'classes': svm_aspirin.classes_.tolist()
    }
    
    svm_heparin_params = {
        'support_vectors': svm_heparin.support_vectors_.tolist(),
        'dual_coef': svm_heparin.dual_coef_[0].tolist(),
        'intercept': svm_heparin.intercept_[0].tolist(),
        'gamma': float(svm_heparin._gamma) if hasattr(svm_heparin, '_gamma') else 'auto',
        'classes': svm_heparin.classes_.tolist()
    }
    
    # 3. Random Forest - extract decision trees (simplified)
    # For browser use, we'll use a simplified version with feature importances
    rf_aspirin_params = {
        'feature_importances': rf_aspirin.feature_importances_.tolist(),
        'n_estimators': rf_aspirin.n_estimators,
        'classes': rf_aspirin.classes_.tolist()
    }
    
    rf_heparin_params = {
        'feature_importances': rf_heparin.feature_importances_.tolist(),
        'n_estimators': rf_heparin.n_estimators,
        'classes': rf_heparin.classes_.tolist()
    }
    
    # 4. XGBoost - extract feature importances
    xgb_aspirin_params = {
        'feature_importances': xgb_aspirin.feature_importances_.tolist(),
        'classes': [int(c) for c in xgb_aspirin.classes_]
    }
    
    xgb_heparin_params = {
        'feature_importances': xgb_heparin.feature_importances_.tolist(),
        'classes': [int(c) for c in xgb_heparin.classes_]
    }
    
    # Create model export object
    model_export = {
        'scaler': scaler_params,
        'logistic_regression': {
            'aspirin': lr_aspirin_params,
            'heparin': lr_heparin_params
        },
        'svm': {
            'aspirin': svm_aspirin_params,
            'heparin': svm_heparin_params
        },
        'random_forest': {
            'aspirin': rf_aspirin_params,
            'heparin': rf_heparin_params
        },
        'xgboost': {
            'aspirin': xgb_aspirin_params,
            'heparin': xgb_heparin_params
        },
        'metadata': {
            'export_date': str(np.datetime64('now')),
            'feature_names': feature_names,
            'model_version': '1.0'
        }
    }
    
    # Save to JSON file
    with open('models/model_parameters.json', 'w') as f:
        json.dump(model_export, f)
    
    # Also save the full models using joblib for backup
    joblib.dump(scaler, 'models/scaler.pkl')
    joblib.dump(lr_aspirin, 'models/lr_aspirin.pkl')
    joblib.dump(lr_heparin, 'models/lr_heparin.pkl')
    joblib.dump(svm_aspirin, 'models/svm_aspirin.pkl')
    joblib.dump(svm_heparin, 'models/svm_heparin.pkl')
    
    # Test predictions on a sample
    sample_patient = X_test.iloc[0].values
    sample_scaled = scaler.transform([sample_patient])
    
    print("\nSample patient data:")
    for i, feature in enumerate(feature_names):
        print(f"{feature}: {sample_patient[i]}")
    
    print("\nModel predictions for sample patient:")
    print(f"Logistic Regression - Aspirin: {lr_aspirin.predict_proba(sample_scaled)[0][1]:.4f}")
    print(f"Logistic Regression - Heparin: {lr_heparin.predict_proba(sample_scaled)[0][1]:.4f}")
    print(f"SVM - Aspirin: {svm_aspirin.predict_proba(sample_scaled)[0][1]:.4f}")
    print(f"SVM - Heparin: {svm_heparin.predict_proba(sample_scaled)[0][1]:.4f}")
    print(f"Random Forest - Aspirin: {rf_aspirin.predict_proba(sample_scaled)[0][1]:.4f}")
    print(f"Random Forest - Heparin: {rf_heparin.predict_proba(sample_scaled)[0][1]:.4f}")
    print(f"XGBoost - Aspirin: {xgb_aspirin.predict_proba(sample_scaled)[0][1]:.4f}")
    print(f"XGBoost - Heparin: {xgb_heparin.predict_proba(sample_scaled)[0][1]:.4f}")
    
    print("\n✅ Models exported successfully to 'models/model_parameters.json'")
    print("You can now use these models in your web application!")

if __name__ == "__main__":
    export_models_to_js()
