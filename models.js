/**
 * Heart Treatment ML Models - JavaScript Implementation
 * This file contains JavaScript implementations of the ML models
 * exported from Python for heart treatment recommendations.
 */

class HeartTreatmentModels {
  constructor() {
    this.isLoaded = false
    this.scaler = null
    this.featureNames = null
    this.models = {
      logisticRegression: { aspirin: null, heparin: null },
      svm: { aspirin: null, heparin: null },
      randomForest: { aspirin: null, heparin: null },
      xgboost: { aspirin: null, heparin: null },
    }
    this.activeModel = "logisticRegression" // Default model
  }

  /**
   * Load model parameters from JSON file
   */
  async loadModels() {
    try {
      console.log("Loading heart treatment models...")
      const response = await fetch("models/model_parameters.json")

      if (!response.ok) {
        throw new Error(`Failed to load models: ${response.status} ${response.statusText}`)
      }

      const modelData = await response.json()

      // Initialize scaler
      this.scaler = {
        mean: modelData.scaler.mean,
        scale: modelData.scaler.scale,
      }

      this.featureNames = modelData.scaler.feature_names
      console.log("Feature names:", this.featureNames)

      // Initialize Logistic Regression models
      this.models.logisticRegression.aspirin = new LogisticRegressionModel(
        modelData.logistic_regression.aspirin.coefficients,
        modelData.logistic_regression.aspirin.intercept,
      )

      this.models.logisticRegression.heparin = new LogisticRegressionModel(
        modelData.logistic_regression.heparin.coefficients,
        modelData.logistic_regression.heparin.intercept,
      )

      // Initialize SVM models
      this.models.svm.aspirin = new SVMModel(
        modelData.svm.aspirin.support_vectors,
        modelData.svm.aspirin.dual_coef,
        modelData.svm.aspirin.intercept,
        modelData.svm.aspirin.gamma,
      )

      this.models.svm.heparin = new SVMModel(
        modelData.svm.heparin.support_vectors,
        modelData.svm.heparin.dual_coef,
        modelData.svm.heparin.intercept,
        modelData.svm.heparin.gamma,
      )

      // Initialize Random Forest models (simplified)
      this.models.randomForest.aspirin = new RandomForestModel(modelData.random_forest.aspirin.feature_importances)

      this.models.randomForest.heparin = new RandomForestModel(modelData.random_forest.heparin.feature_importances)

      // Initialize XGBoost models (simplified)
      this.models.xgboost.aspirin = new XGBoostModel(modelData.xgboost.aspirin.feature_importances)

      this.models.xgboost.heparin = new XGBoostModel(modelData.xgboost.heparin.feature_importances)

      this.isLoaded = true
      console.log("✅ Models loaded successfully!")

      return true
    } catch (error) {
      console.error("Error loading models:", error)
      return false
    }
  }

  /**
   * Set the active model type
   * @param {string} modelType - Model type (logisticRegression, svm, randomForest, xgboost)
   */
  setActiveModel(modelType) {
    if (this.models[modelType]) {
      this.activeModel = modelType
      console.log(`Active model set to: ${modelType}`)
      return true
    } else {
      console.error(`Invalid model type: ${modelType}`)
      return false
    }
  }

  /**
   * Scale features using the same method as in Python
   * @param {Array} features - Array of feature values
   * @returns {Array} - Scaled features
   */
  scaleFeatures(features) {
    return features.map((value, index) => (value - this.scaler.mean[index]) / this.scaler.scale[index])
  }

  /**
   * Extract features from patient data in the correct order
   * @param {Object} patientData - Patient data object
   * @returns {Array} - Features array
   */
  extractFeatures(patientData) {
    return this.featureNames.map((name) => {
      // Convert to number to ensure proper data type
      const value = Number(patientData[name])
      if (isNaN(value)) {
        throw new Error(`Invalid value for feature ${name}: ${patientData[name]}`)
      }
      return value
    })
  }

  /**
   * Make predictions for a patient using the active model
   * @param {Object} patientData - Patient data object
   * @returns {Object} - Prediction results
   */
  predict(patientData) {
    if (!this.isLoaded) {
      throw new Error("Models not loaded. Call loadModels() first.")
    }

    try {
      console.log(`Making prediction with ${this.activeModel} model...`)

      // Extract features in the correct order
      const features = this.extractFeatures(patientData)
      console.log("Raw features:", features)

      // Scale features
      const scaledFeatures = this.scaleFeatures(features)
      console.log("Scaled features:", scaledFeatures)

      // Get the active model
      const activeModelSet = this.models[this.activeModel]

      // Make predictions
      const aspirinProb = activeModelSet.aspirin.predict(scaledFeatures)
      const heparinProb = activeModelSet.heparin.predict(scaledFeatures)

      console.log(`Aspirin probability: ${aspirinProb}`)
      console.log(`Heparin probability: ${heparinProb}`)

      return {
        aspirin: {
          probability: aspirinProb,
          recommendation: aspirinProb > 0.5,
        },
        heparin: {
          probability: heparinProb,
          recommendation: heparinProb > 0.5,
        },
        modelUsed: this.activeModel,
      }
    } catch (error) {
      console.error("Error making prediction:", error)
      throw error
    }
  }
}

/**
 * Logistic Regression Model Implementation
 */
class LogisticRegressionModel {
  constructor(coefficients, intercept) {
    this.coefficients = coefficients
    this.intercept = intercept
  }

  /**
   * Sigmoid function for logistic regression
   * @param {number} z - Input value
   * @returns {number} - Sigmoid output (0-1)
   */
  sigmoid(z) {
    return 1 / (1 + Math.exp(-z))
  }

  /**
   * Make prediction for scaled features
   * @param {Array} scaledFeatures - Scaled feature values
   * @returns {number} - Probability (0-1)
   */
  predict(scaledFeatures) {
    // Calculate decision function (dot product + intercept)
    let decision = this.intercept

    for (let i = 0; i < this.coefficients.length; i++) {
      decision += scaledFeatures[i] * this.coefficients[i]
    }

    // Apply sigmoid to get probability
    return this.sigmoid(decision)
  }
}

/**
 * SVM Model Implementation (RBF Kernel)
 */
class SVMModel {
  constructor(supportVectors, dualCoef, intercept, gamma) {
    this.supportVectors = supportVectors
    this.dualCoef = dualCoef
    this.intercept = intercept
    this.gamma = gamma === "auto" ? 1.0 / supportVectors[0].length : gamma
  }

  /**
   * RBF kernel function
   * @param {Array} x1 - First vector
   * @param {Array} x2 - Second vector
   * @returns {number} - Kernel value
   */
  rbfKernel(x1, x2) {
    let squaredDistance = 0
    for (let i = 0; i < x1.length; i++) {
      const diff = x1[i] - x2[i]
      squaredDistance += diff * diff
    }
    return Math.exp(-this.gamma * squaredDistance)
  }

  /**
   * Make prediction for scaled features
   * @param {Array} scaledFeatures - Scaled feature values
   * @returns {number} - Probability (0-1)
   */
  predict(scaledFeatures) {
    // Calculate decision function
    let decision = this.intercept

    for (let i = 0; i < this.supportVectors.length; i++) {
      const sv = this.supportVectors[i]
      const coef = this.dualCoef[i]
      decision += coef * this.rbfKernel(scaledFeatures, sv)
    }

    // Convert to probability using sigmoid (approximation)
    return 1 / (1 + Math.exp(-decision))
  }
}

/**
 * Random Forest Model Implementation (Simplified)
 */
class RandomForestModel {
  constructor(featureImportances) {
    this.featureImportances = featureImportances
  }

  /**
   * Make prediction for scaled features
   * This is a simplified implementation that uses feature importances
   * to approximate the model's behavior
   * @param {Array} scaledFeatures - Scaled feature values
   * @returns {number} - Probability (0-1)
   */
  predict(scaledFeatures) {
    // Calculate weighted sum based on feature importances
    let weightedSum = 0
    let totalImportance = 0

    for (let i = 0; i < this.featureImportances.length; i++) {
      const importance = this.featureImportances[i]
      const feature = scaledFeatures[i]

      // Positive features contribute positively, negative features negatively
      weightedSum += importance * feature
      totalImportance += Math.abs(importance)
    }

    // Normalize and convert to probability
    const normalized = (weightedSum / totalImportance + 1) / 2
    return Math.max(0, Math.min(1, normalized))
  }
}

/**
 * XGBoost Model Implementation (Simplified)
 */
class XGBoostModel {
  constructor(featureImportances) {
    this.featureImportances = featureImportances
  }

  /**
   * Make prediction for scaled features
   * This is a simplified implementation that uses feature importances
   * to approximate the model's behavior
   * @param {Array} scaledFeatures - Scaled feature values
   * @returns {number} - Probability (0-1)
   */
  predict(scaledFeatures) {
    // Similar to Random Forest but with different weighting
    let weightedSum = 0
    let totalImportance = 0

    for (let i = 0; i < this.featureImportances.length; i++) {
      const importance = this.featureImportances[i]
      const feature = scaledFeatures[i]

      weightedSum += importance * feature
      totalImportance += Math.abs(importance)
    }

    // XGBoost uses logistic function for binary classification
    const normalized = weightedSum / totalImportance
    return 1 / (1 + Math.exp(-normalized * 4)) // Scale factor for better spread
  }
}

// Create global instance
window.heartModels = new HeartTreatmentModels()
