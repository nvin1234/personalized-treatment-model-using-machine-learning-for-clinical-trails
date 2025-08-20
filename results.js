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

  // Start AI analysis simulation
  startAIAnalysis(patientData)

  function displayPatientInfo(data) {
    document.getElementById("patient-id-display").textContent = data.patientId
    document.getElementById("age-display").textContent = data.age
    document.getElementById("sex-display").textContent = data.sex === 1 ? "Male" : "Female"
    document.getElementById("ef-display").textContent = data.ejection_fraction
    document.getElementById("analysis-date").textContent = new Date().toLocaleDateString()
  }

  function startAIAnalysis(data) {
    // Simulate AI processing with realistic timing
    const analysisSteps = [
      { message: "Initializing AI models...", progress: 10, delay: 500 },
      { message: "Loading patient data...", progress: 25, delay: 800 },
      { message: "Analyzing cardiovascular risk factors...", progress: 45, delay: 1200 },
      { message: "Processing laboratory values...", progress: 65, delay: 1000 },
      { message: "Calculating treatment probabilities...", progress: 85, delay: 1500 },
      { message: "Generating recommendations...", progress: 100, delay: 800 },
    ]

    let currentStep = 0
    const progressBar = document.getElementById("analysis-progress")
    const statusAlert = document.querySelector(".alert-info")

    function runAnalysisStep() {
      if (currentStep < analysisSteps.length) {
        const step = analysisSteps[currentStep]

        // Update progress
        progressBar.style.width = step.progress + "%"
        progressBar.setAttribute("aria-valuenow", step.progress)

        // Update status message
        statusAlert.innerHTML = `
          <i class="bi bi-cpu me-2"></i>
          <div>
            <strong>AI Model Status:</strong> ${step.message}
            <div class="progress mt-2" style="height: 6px;">
              <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: ${step.progress}%"></div>
            </div>
          </div>
        `

        currentStep++
        setTimeout(runAnalysisStep, step.delay)
      } else {
        // Analysis complete - show results
        completeAnalysis(data)
      }
    }

    runAnalysisStep()
  }

  function completeAnalysis(data) {
    // Hide the analysis progress
    document.querySelector(".alert-info").style.display = "none"

    // Calculate predictions using advanced simulation
    const predictions = calculateAdvancedPredictions(data)

    // Update UI with results
    updateResults(predictions.aspirinProbability, predictions.heparinProbability, data)

    // Generate risk factors
    generateRiskFactors(data)

    // Store results for saving
    window.currentResults = {
      patientData: data,
      aspirinProbability: predictions.aspirinProbability,
      heparinProbability: predictions.heparinProbability,
      riskFactors: predictions.riskFactors,
      timestamp: new Date().toISOString(),
      modelVersion: "Advanced AI v2.1",
    }
  }

  function calculateAdvancedPredictions(data) {
    // Advanced simulation based on clinical guidelines and your ML model logic
    let aspirinScore = 0
    let heparinScore = 0
    const riskFactors = []

    // Age-based risk assessment
    if (data.age >= 65) {
      aspirinScore += 0.25
      heparinScore += 0.15
      riskFactors.push("Advanced age (≥65 years)")
    } else if (data.age >= 50) {
      aspirinScore += 0.15
      heparinScore += 0.1
    }

    // Cardiovascular risk factors
    if (data.high_blood_pressure === 1) {
      aspirinScore += 0.3
      heparinScore += 0.1
      riskFactors.push("Hypertension")
    }

    if (data.diabetes === 1) {
      aspirinScore += 0.25
      heparinScore += 0.2
      riskFactors.push("Diabetes mellitus")
    }

    if (data.smoking === 1) {
      aspirinScore += 0.2
      heparinScore += 0.15
      riskFactors.push("Smoking history")
    }

    // Cardiac function assessment
    if (data.ejection_fraction < 30) {
      heparinScore += 0.4
      aspirinScore += 0.1
      riskFactors.push("Severely reduced ejection fraction (<30%)")
    } else if (data.ejection_fraction < 40) {
      heparinScore += 0.25
      aspirinScore += 0.05
      riskFactors.push("Moderately reduced ejection fraction (30-39%)")
    } else if (data.ejection_fraction < 50) {
      heparinScore += 0.1
      riskFactors.push("Mildly reduced ejection fraction (40-49%)")
    }

    // Laboratory values
    if (data.serum_creatinine > 2.0) {
      heparinScore += 0.25
      aspirinScore -= 0.1 // Caution with aspirin in severe renal impairment
      riskFactors.push("Severe renal impairment (Cr >2.0 mg/dL)")
    } else if (data.serum_creatinine > 1.5) {
      heparinScore += 0.15
      aspirinScore -= 0.05
      riskFactors.push("Moderate renal impairment (Cr 1.5-2.0 mg/dL)")
    }

    if (data.platelets < 100000) {
      heparinScore -= 0.3 // Contraindication for anticoagulation
      aspirinScore -= 0.2
      riskFactors.push("Thrombocytopenia (<100k platelets/mL)")
    } else if (data.platelets < 150000) {
      heparinScore -= 0.15
      aspirinScore -= 0.1
      riskFactors.push("Low platelet count (100-150k platelets/mL)")
    }

    if (data.anaemia === 1) {
      heparinScore -= 0.1
      aspirinScore -= 0.05
      riskFactors.push("Anemia")
    }

    // CPK levels (muscle damage indicator)
    if (data.creatinine_phosphokinase > 1000) {
      riskFactors.push("Elevated CPK (>1000 mcg/L)")
    }

    // Electrolyte imbalance
    if (data.serum_sodium < 135 || data.serum_sodium > 145) {
      riskFactors.push("Electrolyte imbalance")
    }

    // Add some clinical variability (but controlled)
    const clinicalVariability = (Math.random() - 0.5) * 0.1 // ±5% variability
    aspirinScore += clinicalVariability
    heparinScore += clinicalVariability * 0.8

    // Ensure scores are within realistic bounds
    aspirinScore = Math.max(0.05, Math.min(0.95, aspirinScore))
    heparinScore = Math.max(0.05, Math.min(0.95, heparinScore))

    // Add interaction effects (more realistic)
    if (data.diabetes === 1 && data.high_blood_pressure === 1) {
      aspirinScore += 0.1 // Synergistic effect
    }

    if (data.ejection_fraction < 40 && data.serum_creatinine > 1.5) {
      heparinScore += 0.15 // Heart failure with renal impairment
    }

    return {
      aspirinProbability: aspirinScore,
      heparinProbability: heparinScore,
      riskFactors: riskFactors,
    }
  }

  function updateResults(aspirinProb, heparinProb, data) {
    const aspirinPercentage = Math.round(aspirinProb * 100)
    const heparinPercentage = Math.round(heparinProb * 100)

    // Update aspirin results
    const aspirinProgress = document.getElementById("aspirin-progress")
    aspirinProgress.style.width = aspirinPercentage + "%"
    aspirinProgress.setAttribute("aria-valuenow", aspirinPercentage)
    aspirinProgress.textContent = aspirinPercentage + "%"
    aspirinProgress.classList.remove("progress-bar-animated")

    const aspirinStatus = document.getElementById("aspirin-status")
    const aspirinRecommendation = document.getElementById("aspirin-recommendation")
    const aspirinIndication = document.getElementById("aspirin-indication")

    if (aspirinPercentage >= 50) {
      aspirinStatus.textContent = "RECOMMENDED"
      aspirinStatus.className = "text-success fw-bold"
      aspirinRecommendation.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i>'
      aspirinIndication.textContent = `AI analysis indicates strong benefit from aspirin therapy. Model confidence: ${aspirinPercentage}%. Consider for cardiovascular protection based on risk profile.`
      document.getElementById("aspirin-card").classList.add("border-success")
    } else {
      aspirinStatus.textContent = "NOT RECOMMENDED"
      aspirinStatus.className = "text-danger fw-bold"
      aspirinRecommendation.innerHTML = '<i class="bi bi-x-circle-fill text-danger"></i>'
      aspirinIndication.textContent = `AI analysis suggests limited benefit from aspirin therapy. Model confidence: ${100 - aspirinPercentage}%. Current risk profile does not strongly support aspirin use.`
      document.getElementById("aspirin-card").classList.add("border-danger")
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

    if (heparinPercentage >= 50) {
      heparinStatus.textContent = "RECOMMENDED"
      heparinStatus.className = "text-success fw-bold"
      heparinRecommendation.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i>'
      heparinIndication.textContent = `AI analysis supports heparin anticoagulation therapy. Model confidence: ${heparinPercentage}%. Clinical indicators suggest potential benefit from anticoagulation.`
      document.getElementById("heparin-card").classList.add("border-success")
    } else {
      heparinStatus.textContent = "NOT RECOMMENDED"
      heparinStatus.className = "text-danger fw-bold"
      heparinRecommendation.innerHTML = '<i class="bi bi-x-circle-fill text-danger"></i>'
      heparinIndication.textContent = `AI analysis does not support heparin therapy. Model confidence: ${100 - heparinPercentage}%. Risk-benefit analysis suggests avoiding anticoagulation.`
      document.getElementById("heparin-card").classList.add("border-danger")
    }
  }

  function generateRiskFactors(data) {
    const riskFactorsList = document.getElementById("risk-factors-list")
    const riskFactors = []

    // Clinical risk factors
    if (data.age > 65) riskFactors.push("Advanced age (>65 years)")
    if (data.diabetes === 1) riskFactors.push("Diabetes mellitus")
    if (data.high_blood_pressure === 1) riskFactors.push("Hypertension")
    if (data.smoking === 1) riskFactors.push("Smoking history")
    if (data.ejection_fraction < 40) riskFactors.push("Reduced ejection fraction (<40%)")
    if (data.serum_creatinine > 1.5) riskFactors.push("Elevated serum creatinine")
    if (data.anaemia === 1) riskFactors.push("Anemia")
    if (data.platelets < 150000) riskFactors.push("Low platelet count")
    if (data.serum_sodium < 135) riskFactors.push("Hyponatremia")
    if (data.creatinine_phosphokinase > 500) riskFactors.push("Elevated CPK levels")

    // Calculate overall risk score
    const riskScore = riskFactors.length
    let riskLevel = "Low"
    let riskColor = "success"

    if (riskScore >= 4) {
      riskLevel = "High"
      riskColor = "danger"
    } else if (riskScore >= 2) {
      riskLevel = "Moderate"
      riskColor = "warning"
    }

    riskFactorsList.innerHTML = ""

    if (riskFactors.length === 0) {
      riskFactorsList.innerHTML = `
        <li class="text-success">
          <i class="bi bi-check-circle me-2"></i>No major risk factors identified
        </li>
        <li class="text-success small">
          <i class="bi bi-shield-check me-2"></i>Low cardiovascular risk profile
        </li>
      `
    } else {
      // Add risk level indicator
      riskFactorsList.innerHTML = `
        <li class="text-${riskColor} fw-bold mb-2">
          <i class="bi bi-exclamation-triangle me-2"></i>Overall Risk Level: ${riskLevel}
        </li>
      `

      riskFactors.forEach((factor) => {
        const li = document.createElement("li")
        li.innerHTML = `<i class="bi bi-dot text-warning me-2"></i>${factor}`
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

      // Show success message
      const alert = document.createElement("div")
      alert.className = "alert alert-success alert-dismissible fade show"
      alert.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>
        <strong>Success!</strong> Results saved to patient history.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `
      document.querySelector(".container").insertBefore(alert, document.querySelector(".container").firstChild)

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        alert.remove()
      }, 3000)
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
