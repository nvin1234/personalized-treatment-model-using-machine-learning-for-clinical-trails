import pickle
import json
import numpy as np

def export_svm_model():
    """Export your trained SVM models to JavaScript format"""
    try:
        # Load your trained models
        print("Loading your trained models...")
        
        with open('models/scaler.pkl', 'rb') as f:
            scaler = pickle.load(f)
        
        with open('models/aspirin_model.pkl', 'rb') as f:
            aspirin_model = pickle.load(f)
            
        with open('models/heparin_model.pkl', 'rb') as f:
            heparin_model = pickle.load(f)
            
        with open('models/feature_names.pkl', 'rb') as f:
            feature_names = pickle.load(f)
        
        print("Models loaded successfully!")
        
        # For SVM models, we need to extract the decision function parameters
        # This is more complex for RBF kernel SVMs
        
        def extract_svm_params(model, model_name):
            params = {
                'model_type': 'SVM',
                'kernel': 'rbf',  # Assuming RBF kernel
                'n_support': model.n_support_.tolist() if hasattr(model, 'n_support_') else [],
                'support_vectors': model.support_vectors_.tolist() if hasattr(model, 'support_vectors_') else [],
                'dual_coef': model.dual_coef_.tolist() if hasattr(model, 'dual_coef_') else [],
                'intercept': model.intercept_.tolist() if hasattr(model, 'intercept_') else [],
                'gamma': float(model.gamma) if hasattr(model, 'gamma') else 'scale',
                'classes': model.classes_.tolist() if hasattr(model, 'classes_') else [0, 1]
            }
            
            print(f"{model_name} model parameters extracted:")
            print(f"  - Support vectors: {len(params['support_vectors'])}")
            print(f"  - Gamma: {params['gamma']}")
            print(f"  - Intercept: {params['intercept']}")
            
            return params
        
        # Extract parameters for both models
        aspirin_params = extract_svm_params(aspirin_model, "Aspirin")
        heparin_params = extract_svm_params(heparin_model, "Heparin")
        
        # Extract scaler parameters
        scaler_params = {
            'mean': scaler.mean_.tolist(),
            'scale': scaler.scale_.tolist(),
            'feature_names': feature_names
        }
        
        print(f"Scaler parameters extracted:")
        print(f"  - Features: {len(feature_names)}")
        print(f"  - Feature names: {feature_names}")
        
        # Combine all parameters
        model_export = {
            'aspirin_model': aspirin_params,
            'heparin_model': heparin_params,
            'scaler': scaler_params,
            'metadata': {
                'export_date': str(np.datetime64('now')),
                'model_version': '1.0',
                'description': 'Exported SVM models for heart treatment prediction'
            }
        }
        
        # Save to JSON file
        with open('model_parameters.json', 'w') as f:
            json.dump(model_export, f, indent=2)
        
        print("\n✅ SUCCESS!")
        print("Model parameters exported to 'model_parameters.json'")
        print("You can now use this file with your JavaScript website!")
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Heart Treatment Model Exporter")
    print("=" * 40)
    export_svm_model()
