from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
import joblib
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

class HeartTreatmentPredictor:
    def __init__(self):
        self.scaler = None
        self.aspirin_model = None
        self.heparin_model = None
        self.feature_columns = [
            'age', 'anaemia', 'creatinine_phosphokinase', 'diabetes',
            'ejection_fraction', 'high_blood_pressure', 'platelets',
            'serum_creatinine', 'serum_sodium', 'sex', 'smoking', 'time'
        ]
        self.is_trained = False
        
    def load_data_and_train(self, csv_path):
        """Load data and train models"""
        try:
            # Load the dataset
            df = pd.read_csv(csv_path)
            logger.info(f"Loaded dataset with {len(df)} rows")
            
            # Prepare features and targets
            X = df.drop(columns=["DEATH_EVENT", "aspirin", "heparin"])
            y_aspirin = df["aspirin"]
            y_heparin = df["heparin"]
            
            # Split data
            from sklearn.model_selection import train_test_split
            X_train, X_test, y_aspirin_train, y_aspirin_test, y_heparin_train, y_heparin_test = train_test_split(
                X, y_aspirin, y_heparin, test_size=0.2, random_state=42
            )
            
            # Scale features
            self.scaler = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train SVM models (as used in your final implementation)
            self.aspirin_model = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True)
            self.heparin_model = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True)
            
            # Fit models
            self.aspirin_model.fit(X_train_scaled, y_aspirin_train)
            self.heparin_model.fit(X_train_scaled, y_heparin_train)
            
            # Evaluate models
            aspirin_accuracy = self.aspirin_model.score(X_test_scaled, y_aspirin_test)
            heparin_accuracy = self.heparin_model.score(X_test_scaled, y_heparin_test)
            
            logger.info(f"Aspirin model accuracy: {aspirin_accuracy:.3f}")
            logger.info(f"Heparin model accuracy: {heparin_accuracy:.3f}")
            
            self.is_trained = True
            
            # Save models
            self.save_models()
            
            return {
                'aspirin_accuracy': aspirin_accuracy,
                'heparin_accuracy': heparin_accuracy,
                'training_samples': len(X_train)
            }
            
        except Exception as e:
            logger.error(f"Error training models: {str(e)}")
            raise e
    
    def save_models(self):
        """Save trained models and scaler"""
        try:
            os.makedirs('models', exist_ok=True)
            joblib.dump(self.scaler, 'models/scaler.pkl')
            joblib.dump(self.aspirin_model, 'models/aspirin_model.pkl')
            joblib.dump(self.heparin_model, 'models/heparin_model.pkl')
            logger.info("Models saved successfully")
        except Exception as e:
            logger.error(f"Error saving models: {str(e)}")
    
    def load_models(self):
        """Load pre-trained models"""
        try:
            self.scaler = joblib.load('models/scaler.pkl')
            self.aspirin_model = joblib.load('models/aspirin_model.pkl')
            self.heparin_model = joblib.load('models/heparin_model.pkl')
            self.is_trained = True
            logger.info("Models loaded successfully")
            return True
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            return False
    
    def predict(self, patient_data):
        """Make predictions for a patient"""
        if not self.is_trained:
            raise ValueError("Models not trained or loaded")
        
        try:
            # Convert to DataFrame with correct column order
            df = pd.DataFrame([patient_data], columns=self.feature_columns)
            
            # Scale the features
            patient_scaled = self.scaler.transform(df)
            
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
predictor = HeartTreatmentPredictor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'models_loaded': predictor.is_trained
    })

@app.route('/train', methods=['POST'])
def train_models():
    """Train models with uploaded data"""
    try:
        # In production, you might want to secure this endpoint
        csv_path = request.json.get('csv_path', 'new heart clinical.csv')
        
        if not os.path.exists(csv_path):
            return jsonify({'error': 'CSV file not found'}), 400
        
        results = predictor.load_data_and_train(csv_path)
        
        return jsonify({
            'message': 'Models trained successfully',
            'results': results,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict_treatment():
    """Predict treatment recommendations for a patient"""
    try:
        # Get patient data from request
        patient_data = request.json
        
        # Validate required fields
        required_fields = [
            'age', 'anaemia', 'creatinine_phosphokinase', 'diabetes',
            'ejection_fraction', 'high_blood_pressure', 'platelets',
            'serum_creatinine', 'serum_sodium', 'sex', 'smoking', 'time'
        ]
        
        missing_fields = [field for field in required_fields if field not in patient_data]
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {missing_fields}'
            }), 400
        
        # Extract patient data in correct order
        patient_values = [patient_data[field] for field in required_fields]
        
        # Make prediction
        predictions = predictor.predict(patient_values)
        
        # Add metadata
        response = {
            'predictions': predictions,
            'patient_id': patient_data.get('patient_id', 'Unknown'),
            'timestamp': datetime.now().isoformat(),
            'model_version': '1.0'
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
    if not predictor.is_trained:
        return jsonify({'error': 'Models not loaded'}), 400
    
    return jsonify({
        'model_type': 'Support Vector Machine (SVM)',
        'features': predictor.feature_columns,
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
    # Try to load existing models, if not available, they need to be trained
    if not predictor.load_models():
        logger.warning("No pre-trained models found. Use /train endpoint to train models.")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
