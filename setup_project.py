import os
import json

def create_directory_structure():
    """Create the necessary directory structure"""
    directories = [
        "css",
        "js", 
        "models"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Created directory: {directory}")

def create_sample_model_data():
    """Create sample model data for testing"""
    sample_data = {
        "scaler": {
            "mean": [60.0, 0.3, 500.0, 0.4, 40.0, 0.5, 250000.0, 1.2, 140.0, 0.6, 0.3, 100.0],
            "scale": [15.0, 0.5, 300.0, 0.5, 15.0, 0.5, 100000.0, 0.5, 10.0, 0.5, 0.5, 50.0],
            "feature_names": [
                "age", "anaemia", "creatinine_phosphokinase", "diabetes",
                "ejection_fraction", "high_blood_pressure", "platelets",
                "serum_creatinine", "serum_sodium", "sex", "smoking", "time"
            ]
        },
        "logistic_regression": {
            "aspirin": {
                "coefficients": [0.1, -0.2, 0.05, 0.3, -0.15, 0.25, 0.0, 0.1, 0.05, 0.1, 0.2, 0.0],
                "intercept": -0.5
            },
            "heparin": {
                "coefficients": [0.05, -0.1, 0.02, 0.15, -0.4, 0.1, 0.0, 0.2, 0.0, 0.05, 0.1, 0.0],
                "intercept": -1.0
            }
        },
        "svm": {
            "aspirin": {
                "support_vectors": [[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2]],
                "dual_coef": [1.0],
                "intercept": 0.0,
                "gamma": "auto"
            },
            "heparin": {
                "support_vectors": [[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2]],
                "dual_coef": [1.0],
                "intercept": 0.0,
                "gamma": "auto"
            }
        },
        "random_forest": {
            "aspirin": {
                "feature_importances": [0.1, 0.05, 0.08, 0.15, 0.2, 0.12, 0.03, 0.1, 0.05, 0.07, 0.1, 0.05]
            },
            "heparin": {
                "feature_importances": [0.08, 0.04, 0.06, 0.12, 0.25, 0.1, 0.02, 0.15, 0.04, 0.06, 0.08, 0.04]
            }
        },
        "xgboost": {
            "aspirin": {
                "feature_importances": [0.12, 0.06, 0.09, 0.18, 0.22, 0.14, 0.04, 0.11, 0.06, 0.08, 0.12, 0.06]
            },
            "heparin": {
                "feature_importances": [0.09, 0.05, 0.07, 0.14, 0.28, 0.12, 0.03, 0.17, 0.05, 0.07, 0.09, 0.05]
            }
        },
        "metadata": {
            "export_date": "2024-01-01T00:00:00",
            "feature_names": [
                "age", "anaemia", "creatinine_phosphokinase", "diabetes",
                "ejection_fraction", "high_blood_pressure", "platelets",
                "serum_creatinine", "serum_sodium", "sex", "smoking", "time"
            ],
            "model_version": "1.0"
        }
    }
    
    with open("models/model_parameters.json", "w") as f:
        json.dump(sample_data, f, indent=2)
    
    print("✓ Created sample model data file")

def main():
    print("Heart Treatment System - Project Setup")
    print("=" * 50)
    
    # Create directory structure
    create_directory_structure()
    
    # Create sample model data
    create_sample_model_data()
    
    print("\n" + "=" * 50)
    print("SETUP COMPLETE!")
    print("=" * 50)
    print("\nNext steps:")
    print("1. Run 'python export_models.py' to export your actual models")
    print("2. Open the project in VS Code")
    print("3. Install Live Server extension")
    print("4. Right-click on index.html and select 'Open with Live Server'")
    print("5. Navigate to the website and test the functionality")
    print("\nFiles created:")
    print("- HTML files: index.html, login.html, registration.html, dashboard.html, inputs.html, results.html")
    print("- CSS: css/styles.css")
    print("- JavaScript: js/models.js, js/auth.js, js/inputs.js, js/results.js, js/dashboard.js")
    print("- Python: export_models.py")
    print("- Sample model data: models/model_parameters.json")

if __name__ == "__main__":
    main()
