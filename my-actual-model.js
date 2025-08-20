// JavaScript implementation of YOUR actual SVM models

class MyHeartTreatmentModel {
  constructor() {
    this.isLoaded = false
    this.aspirinModel = null
    this.heparinModel = null
    this.scaler = null
    this.featureNames = null
  }

  async loadModel() {
    try {
      console.log("Loading your actual ML models...")

      // Load the exported model parameters
      const response = await fetch("model_parameters.json")
      const modelData = await response.json()

      console.log("Model data loaded:", modelData.metadata)

      // Initialize scaler
      this.scaler = modelData.scaler
      this.featureNames = modelData.scaler.feature_names

      // Initialize SVM models
      this.aspirinModel = new SVMPredictor(modelData.aspirin_model)
      this.heparinModel = new SVMPredictor(modelData.heparin_model)

      this.isLoaded = true
      console.log("✅ Your actual models loaded successfully!")
      console.log("Features:", this.featureNames)

      return true
    } catch (error) {
      console.error("❌ Error loading your models:", error)
      return false
    }
  }

  scaleFeatures(patientData) {
    // Convert patient data to feature array in correct order
    const features = this.featureNames.map((name) => {
      if (!(name in patientData)) {
        throw new Error(`Missing feature: ${name}`)
      }
      return patientData[name]
    })

    // Apply the same scaling as your Python model
    const scaledFeatures = features.map((value, index) => {
      return (value - this.scaler.mean[index]) / this.scaler.scale[index]
    })

    return scaledFeatures
  }

  predict(patientData) {
    if (!this.isLoaded) {
      throw new Error("Models not loaded. Call loadModel() first.")
    }

    try {
      console.log("Making prediction with your actual models...")
      console.log("Input data:", patientData)

      // Scale the input features
      const scaledFeatures = this.scaleFeatures(patientData)
      console.log("Scaled features:", scaledFeatures)

      // Get predictions from both models
      const aspirinResult = this.aspirinModel.predict(scaledFeatures)
      const heparinResult = this.heparinModel.predict(scaledFeatures)

      console.log("Aspirin prediction:", aspirinResult)
      console.log("Heparin prediction:", heparinResult)

      return {
        aspirin: {
          probability: aspirinResult.probability,
          recommendation: aspirinResult.prediction === 1,
          confidence: aspirinResult.prediction === 1 ? aspirinResult.probability : 1 - aspirinResult.probability,
          decision_score: aspirinResult.decision_score,
        },
        heparin: {
          probability: heparinResult.probability,
          recommendation: heparinResult.prediction === 1,
          confidence: heparinResult.prediction === 1 ? heparinResult.probability : 1 - heparinResult.probability,
          decision_score: heparinResult.decision_score,
        },
        metadata: {
          model_used: "Your Actual SVM Models",
          timestamp: new Date().toISOString(),
          features_used: this.featureNames,
        },
      }
    } catch (error) {
      console.error("Error making prediction:", error)
      throw error
    }
  }
}

// SVM Predictor class that implements the RBF kernel SVM
class SVMPredictor {
  constructor(modelParams) {
    this.supportVectors = modelParams.support_vectors
    this.dualCoef = modelParams.dual_coef[0] // First class dual coefficients
    this.intercept = modelParams.intercept[0]
    this.gamma = modelParams.gamma === "scale" ? 1.0 / this.supportVectors[0].length : modelParams.gamma

    console.log(`SVM initialized with ${this.supportVectors.length} support vectors`)
    console.log(`Gamma: ${this.gamma}, Intercept: ${this.intercept}`)
  }

  // RBF kernel function - same as sklearn
  rbfKernel(x1, x2) {
    let squaredDistance = 0
    for (let i = 0; i < x1.length; i++) {
      const diff = x1[i] - x2[i]
      squaredDistance += diff * diff
    }
    return Math.exp(-this.gamma * squaredDistance)
  }

  // Decision function - same as sklearn SVM
  decisionFunction(features) {
    let decision = this.intercept

    // Sum over all support vectors
    for (let i = 0; i < this.supportVectors.length; i++) {
      const sv = this.supportVectors[i]
      const coef = this.dualCoef[i]
      const kernelValue = this.rbfKernel(features, sv)
      decision += coef * kernelValue
    }

    return decision
  }

  // Convert decision score to probability using Platt scaling approximation
  decisionToProbability(decision) {
    // This is a simplified approximation
    // Real sklearn uses more sophisticated Platt scaling
    return 1.0 / (1.0 + Math.exp(-decision))
  }

  predict(features) {
    const decisionScore = this.decisionFunction(features)
    const probability = this.decisionToProbability(decisionScore)
    const prediction = decisionScore > 0 ? 1 : 0

    return {
      prediction: prediction,
      probability: probability,
      decision_score: decisionScore,
    }
  }
}

// Global model instance
window.myActualModel = new MyHeartTreatmentModel()
