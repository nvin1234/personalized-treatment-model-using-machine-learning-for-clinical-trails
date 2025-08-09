from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

class SimpleHeartPredictor:
    def __init__(self):
        self.scaler = None
        self.aspirin_model = None
        self.heparin_model = None
        self.feature_names = None
        self.is_loaded = False
        
    def load_models(self):
        """Load pre-trained models"""
        try:
            models_dir = 'models'
            
            # Check if models directory exists
            if not os.path.exists(models_dir):
                logger.error("Models directory not found. Please run simple_setup.py first.")
                return False
            
            # Load models using pickle
            with open(os.path.join(models_dir, 'scaler.pkl'), 'rb') as f:
                self.scaler = pickle.load(f)
            
            with open(os.path.join(models_dir, 'aspirin_model.pkl'), 'rb') as f:
                self.aspirin_model = pickle.load(f)
                
            with open(os.path.join(models_dir, 'heparin_model.pkl'), 'rb') as f:
                self.heparin_model = pickle.load(f)
            
            with open(os.path.join(models_dir, 'feature_names.pkl'), 'rb') as f:
                self.feature_names = pickle.load(f)
            
            self.is_loaded = True
            logger.info("Models loaded successfully")
            logger.info(f"Feature names: {self.feature_names}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            return False
    
    def predict(self, patient_data):
        """Make predictions for a patient"""
        if not self.is_loaded:
            raise ValueError("Models not loaded")
        
        try:
            # Convert patient data to the correct format
            # Ensure we have all required features in the correct order
            patient_values = []
            for feature in self.feature_names:
                if feature in patient_data:
                    patient_values.append(patient_data[feature])
                else:
                    raise ValueError(f"Missing feature: {feature}")
            
            # Convert to numpy array and reshape
            patient_array = np.array(patient_values).reshape(1, -1)
            
            # Scale the features
            patient_scaled = self.scaler.transform(patient_array)
            
            # Get predictions and probabilities
            aspirin_prob = self.aspirin_model.predict_proba(patient_scaled)[0][1]
            heparin_prob = self.heparin_model.predict_proba(patient_scaled)[0][1]
            
            aspirin_prediction = self.aspirin_model.predict(patient_scaled)[0]
            heparin_prediction = self.heparin_model.predict(patient_scaled)[0]
            
            return {
                'aspirin': {
                    'probability': float(aspirin_prob),
                    'recommendation': bool(aspirin_prediction),
                    'confidence': float(aspirin_prob) if aspirin_prediction else float(1 - aspirin_prob)
                },
                'heparin': {
                    'probability': float(heparin_prob),
                    'recommendation': bool(heparin_prediction),
                    'confidence': float(heparin_prob) if heparin_prediction else float(1 - heparin_prob)
                }
            }
            
        except Exception as e:
            logger.error(f"Error making prediction: {str(e)}")
            raise e

# Initialize predictor
predictor = SimpleHeartPredictor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'models_loaded': predictor.is_loaded,
        'features': predictor.feature_names if predictor.is_loaded else None
    })

@app.route('/predict', methods=['POST'])
def predict_treatment():
    """Predict treatment recommendations for a patient"""
    try:
        # Get patient data from request
        patient_data = request.json
        
        if not patient_data:
            return jsonify({'error': 'No patient data provided'}), 400
        
        # Check if models are loaded
        if not predictor.is_loaded:
            return jsonify({'error': 'Models not loaded. Please contact administrator.'}), 500
        
        # Validate required fields
        missing_fields = []
        for feature in predictor.feature_names:
            if feature not in patient_data:
                missing_fields.append(feature)
        
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {missing_fields}',
                'required_fields': predictor.feature_names
            }), 400
        
        # Make prediction
        predictions = predictor.predict(patient_data)
        
        # Add metadata
        response = {
            'predictions': predictions,
            'patient_id': patient_data.get('patient_id', 'Unknown'),
            'timestamp': datetime.now().isoformat(),
            'model_version': '1.0',
            'features_used': predictor.feature_names
        }
        
        return jsonify(response)
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the loaded models"""
    if not predictor.is_loaded:
        return jsonify({'error': 'Models not loaded'}), 400
    
    return jsonify({
        'model_type': 'Support Vector Machine (SVM)',
        'features': predictor.feature_names,
        'feature_count': len(predictor.feature_names),
        'targets': ['aspirin', 'heparin'],
        'kernel': 'rbf',
        'status': 'ready',
        'timestamp': datetime.now().isoformat()
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("Starting Heart Treatment Prediction API...")
    print("=" * 50)
    
    # Try to load models
    if predictor.load_models():
        print("✓ Models loaded successfully")
        print(f"✓ Features: {predictor.feature_names}")
        print("✓ Ready to serve predictions")
    else:
        print("✗ Failed to load models")
        print("Please run 'python simple_setup.py' first to train and save models")
    
    print("=" * 50)
    print("API will be available at: http://localhost:5000")
    print("Health check: http://localhost:5000/health")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
