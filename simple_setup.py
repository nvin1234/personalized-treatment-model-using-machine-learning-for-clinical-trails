import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import pickle
import os
import sys

def check_dependencies():
    """Check if all required packages are installed"""
    required_packages = ['pandas', 'numpy', 'sklearn']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✓ {package} is installed")
        except ImportError:
            missing_packages.append(package)
            print(f"✗ {package} is missing")
    
    if missing_packages:
        print(f"\nPlease install missing packages:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    return True

def setup_models():
    """Setup and train models from your dataset"""
    
    if not check_dependencies():
        return None
    
    # Check if dataset exists
    csv_file = "new heart clinical.csv"
    if not os.path.exists(csv_file):
        print(f"Error: {csv_file} not found in current directory")
        print("Please make sure the CSV file is in the same folder as this script")
        return None
    
    try:
        # Load your dataset
        print(f"\nLoading dataset from {csv_file}...")
        df = pd.read_csv(csv_file)
        print(f"Dataset loaded successfully: {len(df)} rows, {len(df.columns)} columns")
        
        # Display basic info about the dataset
        print(f"\nDataset columns: {list(df.columns)}")
        print(f"Dataset shape: {df.shape}")
        
        # Check for required columns
        required_columns = ["DEATH_EVENT", "aspirin", "heparin"]
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            print(f"Error: Missing required columns: {missing_columns}")
            return None
        
        # Prepare features and targets
        X = df.drop(columns=["DEATH_EVENT", "aspirin", "heparin"])
        y_aspirin = df["aspirin"]
        y_heparin = df["heparin"]
        
        print(f"\nFeatures: {list(X.columns)}")
        print(f"Number of features: {len(X.columns)}")
        print(f"Aspirin target distribution: {y_aspirin.value_counts().to_dict()}")
        print(f"Heparin target distribution: {y_heparin.value_counts().to_dict()}")
        
        # Split data
        print("\nSplitting data into train/test sets...")
        X_train, X_test, y_aspirin_train, y_aspirin_test, y_heparin_train, y_heparin_test = train_test_split(
            X, y_aspirin, y_heparin, test_size=0.2, random_state=42, stratify=y_aspirin
        )
        
        print(f"Training set size: {len(X_train)}")
        print(f"Test set size: {len(X_test)}")
        
        # Scale features
        print("\nScaling features...")
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train SVM models
        print("\nTraining aspirin recommendation model...")
        aspirin_model = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True, random_state=42)
        aspirin_model.fit(X_train_scaled, y_aspirin_train)
        
        print("Training heparin recommendation model...")
        heparin_model = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True, random_state=42)
        heparin_model.fit(X_train_scaled, y_heparin_train)
        
        # Evaluate models
        print("\nEvaluating models...")
        
        # Aspirin model evaluation
        y_pred_aspirin = aspirin_model.predict(X_test_scaled)
        aspirin_accuracy = accuracy_score(y_aspirin_test, y_pred_aspirin)
        
        # Heparin model evaluation
        y_pred_heparin = heparin_model.predict(X_test_scaled)
        heparin_accuracy = accuracy_score(y_heparin_test, y_pred_heparin)
        
        print(f"Aspirin model accuracy: {aspirin_accuracy:.3f}")
        print(f"Heparin model accuracy: {heparin_accuracy:.3f}")
        
        # Print detailed classification reports
        print("\n=== ASPIRIN MODEL PERFORMANCE ===")
        print(classification_report(y_aspirin_test, y_pred_aspirin))
        
        print("\n=== HEPARIN MODEL PERFORMANCE ===")
        print(classification_report(y_heparin_test, y_pred_heparin))
        
        # Save models
        print("\nSaving models...")
        os.makedirs('models', exist_ok=True)
        
        # Save using pickle for better compatibility
        with open('models/scaler.pkl', 'wb') as f:
            pickle.dump(scaler, f)
        
        with open('models/aspirin_model.pkl', 'wb') as f:
            pickle.dump(aspirin_model, f)
            
        with open('models/heparin_model.pkl', 'wb') as f:
            pickle.dump(heparin_model, f)
        
        # Save feature names for reference
        with open('models/feature_names.pkl', 'wb') as f:
            pickle.dump(list(X.columns), f)
        
        print("Models saved successfully in 'models' directory!")
        
        # Test a sample prediction
        print("\nTesting sample prediction...")
        sample_patient = X_test.iloc[0:1]
        sample_scaled = scaler.transform(sample_patient)
        
        aspirin_prob = aspirin_model.predict_proba(sample_scaled)[0][1]
        heparin_prob = heparin_model.predict_proba(sample_scaled)[0][1]
        
        print(f"Sample patient aspirin probability: {aspirin_prob:.3f}")
        print(f"Sample patient heparin probability: {heparin_prob:.3f}")
        
        return {
            'aspirin_accuracy': aspirin_accuracy,
            'heparin_accuracy': heparin_accuracy,
            'training_samples': len(X_train),
            'test_samples': len(X_test),
            'feature_count': len(X.columns),
            'feature_names': list(X.columns)
        }
        
    except Exception as e:
        print(f"Error during model training: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("Heart Treatment Model Setup")
    print("=" * 40)
    
    results = setup_models()
    
    if results:
        print("\n" + "=" * 40)
        print("SETUP COMPLETED SUCCESSFULLY!")
        print("=" * 40)
        print(f"Aspirin model accuracy: {results['aspirin_accuracy']:.3f}")
        print(f"Heparin model accuracy: {results['heparin_accuracy']:.3f}")
        print(f"Training samples: {results['training_samples']}")
        print(f"Test samples: {results['test_samples']}")
        print(f"Features used: {results['feature_count']}")
        print("\nYou can now run the Flask app with: python simple_app.py")
    else:
        print("\n" + "=" * 40)
        print("SETUP FAILED!")
        print("=" * 40)
        print("Please check the error messages above and try again.")
