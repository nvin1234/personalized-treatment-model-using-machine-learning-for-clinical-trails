document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  // Get patient data
  const patientData = JSON.parse(localStorage.getItem("currentPatientData"))
  if (!patientData) {
    window.location.href = "inputs.html"
    return
  }

  // Display patient information
  displayPatientInfo(patientData)

  // Check API health and make real prediction
  checkAPIAndPredict(patientData)

  function displayPatientInfo(data) {
    document.getElementById("patient-id-display").textContent = data.patientId
    document.getElementById("age-display").textContent = data.age
    document.getElementById("sex-display").textContent = data.sex === 1 ? "Male" : "Female"
    document.getElementById("ef-display").textContent = data.ejection_fraction
    document.getElementById("analysis-date").textContent = new Date().toLocaleDateString()
  }

  async function checkAPIAndPredict(data) {
    try {
      // Show loading state
      showLoadingState()

      // Check if API is available
      const healthCheck = await window.heartAPI.healthCheck()
      console.log("API Health:", healthCheck)

      if (!healthCheck.models_loaded) {
        throw new Error("Models not loaded on server. Please contact administrator.")
      }

      // Prepare data for API (remove frontend-specific fields)
      const apiData = {
        patient_id: data.patientId,
        age: data.age,
        anaemia: data.anaemia,
        creatinine_phosphokinase: data.creatinine_phosphokinase,
        diabetes: data.diabetes,
        ejection_fraction: data.ejection_fraction,
        high_blood_pressure: data.high_blood_pressure,
        platelets: data.platelets,
        serum_creatinine: data.serum_creatinine,
        serum_sodium: data.serum_sodium,
        sex: data.sex,
        smoking: data.smoking,
        time: data.time,
      }

      // Make prediction
      const prediction = await window.heartAPI.predictTreatment(apiData)
      console.log("Prediction result:", prediction)

      // Update UI with real results
      updateResultsFromAPI(prediction, data)

      // Generate risk factors
      generateRiskFactors(data)
    } catch (error) {
      console.error("API Error:", error)
      handleAPIError(error, data)
    }
  }

  function showLoadingState() {
    // Update aspirin card
    document.getElementById("aspirin-status").textContent = "Analyzing..."
    document.getElementById("aspirin-recommendation").innerHTML = '<i class="bi bi-hourglass-split"></i>'
    document.getElementById("aspirin-indication").textContent = "Connecting to AI model..."

    // Update heparin card
    document.getElementById("heparin-status").textContent = "Analyzing..."
    document.getElementById("heparin-recommendation").innerHTML = '<i class="bi bi-hourglass-split"></i>'
    document.getElementById("heparin-indication").textContent = "Connecting to AI model..."

    // Keep progress bars animated
    document.getElementById("aspirin-progress").classList.add("progress-bar-animated")
    document.getElementById("heparin-progress").classList.add("progress-bar-animated")
  }

  function updateResultsFromAPI(apiResponse, patientData) {
    const { predictions } = apiResponse
    const aspirinResult = predictions.aspirin
    const heparinResult = predictions.heparin

    // Convert probabilities to percentages
    const aspirinPercentage = Math.round(aspirinResult.probability * 100)
    const heparinPercentage = Math.round(heparinResult.probability * 100)

    // Update aspirin results
    const aspirinProgress = document.getElementById("aspirin-progress")
    aspirinProgress.style.width = aspirinPercentage + "%"
    aspirinProgress.setAttribute("aria-valuenow", aspirinPercentage)
    aspirinProgress.textContent = aspirinPercentage + "%"
    aspirinProgress.classList.remove("progress-bar-animated")

    const aspirinStatus = document.getElementById("aspirin-status")
    const aspirinRecommendation = document.getElementById("aspirin-recommendation")
    const aspirinIndication = document.getElementById("aspirin-indication")

    if (aspirinResult.recommendation) {
      aspirinStatus.textContent = "RECOMMENDED"
      aspirinStatus.className = "text-success"
      aspirinRecommendation.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i>'
      aspirinIndication.textContent = `AI model recommends aspirin therapy with ${aspirinPercentage}% confidence based on patient risk profile.`
    } else {
      aspirinStatus.textContent = "NOT RECOMMENDED"
      aspirinStatus.className = "text-danger"
      aspirinRecommendation.innerHTML = '<i class="bi bi-x-circle-fill text-danger"></i>'
      aspirinIndication.textContent = `AI model does not recommend aspirin therapy. Confidence: ${100 - aspirinPercentage}%.`
    }

    // Update heparin results
    const heparinProgress = document.getElementById("heparin-progress")
    heparinProgress.style.width = heparinPercentage + "%"
    heparinProgress.setAttribute("aria-valuenow", heparinPercentage)
    heparinProgress.textContent = heparinPercentage + "%"
    heparinProgress.classList.remove("progress-bar-animated")

    const heparinStatus = document.getElementById("heparin-status")
    const heparinRecommendation = document.getElementById("heparin-recommendation")
    const heparinIndication = document.getElementById("heparin-indication")

    if (heparinResult.recommendation) {
      heparinStatus.textContent = "RECOMMENDED"
      heparinStatus.className = "text-success"
      heparinRecommendation.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i>'
      heparinIndication.textContent = `AI model recommends heparin therapy with ${heparinPercentage}% confidence based on clinical indicators.`
    } else {
      heparinStatus.textContent = "NOT RECOMMENDED"
      heparinStatus.className = "text-danger"
      heparinRecommendation.innerHTML = '<i class="bi bi-x-circle-fill text-danger"></i>'
      heparinIndication.textContent = `AI model does not recommend heparin therapy. Confidence: ${100 - heparinPercentage}%.`
    }

    // Store results for saving
    window.currentResults = {
      patientData: patientData,
      aspirinProbability: aspirinResult.probability,
      heparinProbability: heparinResult.probability,
      apiResponse: apiResponse,
      timestamp: new Date().toISOString(),
    }
  }

  function handleAPIError(error, patientData) {
    console.error("Falling back to simulation due to API error:", error)

    // Show error message
    const errorAlert = document.createElement("div")
    errorAlert.className = "alert alert-warning alert-dismissible fade show"
    errorAlert.innerHTML = `
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>API Connection Failed:</strong> ${error.message}. Using simulation mode.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `

    // Insert error message at the top of the container
    const container = document.querySelector(".container")
    container.insertBefore(errorAlert, container.firstChild)

    // Fall back to simulation
    setTimeout(() => {
      simulateAnalysis(patientData)
    }, 1000)
  }

  function simulateAnalysis(data) {
    // Fallback simulation logic (same as before)
    let aspirinProbability = 0
    let heparinProbability = 0

    // Age factor
    if (data.age > 60) {
      aspirinProbability += 0.3
      heparinProbability += 0.2
    }

    // Blood pressure factor
    if (data.high_blood_pressure === 1) {
      aspirinProbability += 0.25
    }

    // Diabetes factor
    if (data.diabetes === 1) {
      aspirinProbability += 0.2
      heparinProbability += 0.15
    }

    // Ejection fraction factor
    if (data.ejection_fraction < 40) {
      heparinProbability += 0.35
    }

    // Smoking factor
    if (data.smoking === 1) {
      aspirinProbability += 0.15
    }

    // Creatinine factor
    if (data.serum_creatinine > 1.5) {
      heparinProbability += 0.2
    }

    // Add some controlled randomness
    aspirinProbability += Math.random() * 0.15
    heparinProbability += Math.random() * 0.15

    // Ensure probabilities are between 0 and 1
    aspirinProbability = Math.min(Math.max(aspirinProbability, 0.1), 0.95)
    heparinProbability = Math.min(Math.max(heparinProbability, 0.1), 0.95)

    // Create simulation response
    const simulationResponse = {
      predictions: {
        aspirin: {
          probability: aspirinProbability,
          recommendation: aspirinProbability >= 0.5,
          confidence: aspirinProbability >= 0.5 ? aspirinProbability : 1 - aspirinProbability,
        },
        heparin: {
          probability: heparinProbability,
          recommendation: heparinProbability >= 0.5,
          confidence: heparinProbability >= 0.5 ? heparinProbability : 1 - heparinProbability,
        },
      },
      patient_id: data.patientId,
      timestamp: new Date().toISOString(),
      model_version: "simulation",
    }

    updateResultsFromAPI(simulationResponse, data)
  }

  function generateRiskFactors(data) {
    const riskFactorsList = document.getElementById("risk-factors-list")
    const riskFactors = []

    if (data.age > 65) riskFactors.push("Advanced age (>65 years)")
    if (data.diabetes === 1) riskFactors.push("Diabetes mellitus")
    if (data.high_blood_pressure === 1) riskFactors.push("Hypertension")
    if (data.smoking === 1) riskFactors.push("Smoking history")
    if (data.ejection_fraction < 40) riskFactors.push("Reduced ejection fraction (<40%)")
    if (data.serum_creatinine > 1.5) riskFactors.push("Elevated serum creatinine")
    if (data.anaemia === 1) riskFactors.push("Anemia")
    if (data.platelets < 150000) riskFactors.push("Low platelet count")

    riskFactorsList.innerHTML = ""
    if (riskFactors.length === 0) {
      riskFactorsList.innerHTML =
        '<li class="text-success"><i class="bi bi-check-circle me-2"></i>No major risk factors identified</li>'
    } else {
      riskFactors.forEach((factor) => {
        const li = document.createElement("li")
        li.innerHTML = `<i class="bi bi-exclamation-circle text-warning me-2"></i>${factor}`
        li.className = "mb-1"
        riskFactorsList.appendChild(li)
      })
    }
  }

  // Save results functionality
  document.getElementById("save-results").addEventListener("click", () => {
    if (window.currentResults) {
      const patientHistory = JSON.parse(localStorage.getItem("patientHistory")) || []
      patientHistory.push(window.currentResults)
      localStorage.setItem("patientHistory", JSON.stringify(patientHistory))

      alert("Results saved to patient history successfully!")
    }
  })

  // Print results functionality
  document.getElementById("print-results").addEventListener("click", () => {
    window.print()
  })

  // Logout functionality
  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault()
    localStorage.removeItem("currentUser")
    window.location.href = "login.html"
  })
})
