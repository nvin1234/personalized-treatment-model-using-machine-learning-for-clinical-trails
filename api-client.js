// API Configuration
const API_BASE_URL = "http://localhost:5000"

class HeartTreatmentAPI {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      return await response.json()
    } catch (error) {
      console.error("Health check failed:", error)
      throw error
    }
  }

  async predictTreatment(patientData) {
    try {
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Prediction failed")
      }

      return await response.json()
    } catch (error) {
      console.error("Prediction failed:", error)
      throw error
    }
  }

  async getModelInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/model-info`)
      return await response.json()
    } catch (error) {
      console.error("Failed to get model info:", error)
      throw error
    }
  }

  async trainModels(csvPath) {
    try {
      const response = await fetch(`${this.baseUrl}/train`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csv_path: csvPath }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Training failed")
      }

      return await response.json()
    } catch (error) {
      console.error("Training failed:", error)
      throw error
    }
  }
}

// Create global API instance
window.heartAPI = new HeartTreatmentAPI()
