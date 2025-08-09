document.addEventListener("DOMContentLoaded", async () => {
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

  // Load models and make predictions
  await loadModelsAndPredict(patientData)

  function displayPatientInfo(data) {
    document.getElementById("patient-id-display").textContent = data.patientId
    document.getElementById("age-display").textContent = data.age
    document.getElementById("sex-display").textContent = data.sex === 1 ? "Male" : "Female"
    document.getElementById("analysis-date").textContent = new Date().toLocaleDateString()

    // Display model used
    const modelNames = {
      logisticRegression: "Logistic Regression",
      svm: "Support Vector Machine",
      randomForest: "Random Forest",
      xgboost: "XGBoost",
    }
    document.getElementById("model-used").textContent = modelNames[data.modelType] || data.modelType
  }

  async function loadModelsAndPredict(data) {
    try {
      // Show loading state
      showLoadingState("Loading ML models...")

      // Load models
      const modelsLoaded = await window.heartModels.loadModels()

      if (!modelsLoaded) {
        throw new Error("Failed to load ML models")
      }

      showLoadingState("Making predictions with your trained models...")

      // Set the active model
      window.heartModels.setActiveModel(data.modelType)

      // Make prediction with the selected model
      const prediction = window.heartModels.predict(data)
      console.log("Prediction result:", prediction)

      // Update UI with results
      updateResults(prediction, data)

      // Generate comparison with all models
      await generateModelComparison(data)

      showSuccessMessage(`✅ Analysis completed using ${prediction.modelUsed} model!`)

      // Store results for saving
      window.currentResults = {
        patientData: data,
        prediction: prediction,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error in prediction:", error)
      showErrorMessage(`❌ Error: ${error.message}`)
    }
  }

  function showLoadingState(message) {
    const statusAlert = document.getElementById("model-status")
    if (statusAlert) {
      statusAlert.className = "alert alert-info d-flex align-items-center"
      statusAlert.innerHTML = `
                <i class="bi bi-cpu me-2"></i>
                <span>${message}</span>
            `
    }
  }

  function showSuccessMessage(message) {
    const statusAlert = document.getElementById("model-status")
    if (statusAlert) {
      statusAlert.className = "alert alert-success d-flex align-items-center"
      statusAlert.innerHTML = `
                <i class="bi bi-check-circle me-2"></i>
                <span>${message}</span>
            `
    }
  }

  function showErrorMessage(message) {
    const statusAlert = document.getElementById("model-status")
    if (statusAlert) {
      statusAlert.className = "alert alert-danger d-flex align-items-center"
      statusAlert.innerHTML = `
                <i class="bi bi-exclamation-triangle me-2"></i>
                <span>${message}</span>
            `
    }
  }

  function updateResults(prediction, data) {
    const aspirinPercentage = Math.round(prediction.aspirin.probability * 100)
    const heparinPercentage = Math.round(prediction.heparin.probability * 100)

    // Update aspirin results
    updateTreatmentCard("aspirin", aspirinPercentage, prediction.aspirin.recommendation, prediction.modelUsed)

    // Update heparin results
    updateTreatmentCard("heparin", heparinPercentage, prediction.heparin.recommendation, prediction.modelUsed)
  }

  function updateTreatmentCard(treatment, percentage, recommendation, modelName) {
    const progress = document.getElementById(`${treatment}-progress`)
    const status = document.getElementById(`${treatment}-status`)
    const recommendationIcon = document.getElementById(`${treatment}-recommendation`)
    const indication = document.getElementById(`${treatment}-indication`)
    const card = document.getElementById(`${treatment}-card`)

    // Update progress bar
    progress.style.width = percentage + "%"
    progress.setAttribute("aria-valuenow", percentage)
    progress.textContent = percentage + "%"
    progress.classList.remove("progress-bar-animated")

    // Update recommendation
    if (recommendation) {
      status.textContent = "RECOMMENDED"
      status.className = "text-success fw-bold"
      recommendationIcon.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i>'
      indication.textContent = `${modelName} model recommends ${treatment} therapy. Confidence: ${percentage}%. Your trained model indicates potential benefit.`
      card.classList.add("border-success")
    } else {
      status.textContent = "NOT RECOMMENDED"
      status.className = "text-danger fw-bold"
      recommendationIcon.innerHTML = '<i class="bi bi-x-circle-fill text-danger"></i>'
      indication.textContent = `${modelName} model does not recommend ${treatment} therapy. Confidence: ${100 - percentage}%. Your trained model suggests limited benefit.`
      card.classList.add("border-danger")
    }
  }

  async function generateModelComparison(data) {
    const comparisonTable = document.getElementById("model-comparison")
    const models = ["logisticRegression", "svm", "randomForest", "xgboost"]
    const modelNames = {
      logisticRegression: "Logistic Regression",
      svm: "Support Vector Machine",
      randomForest: "Random Forest",
      xgboost: "XGBoost",
    }

    comparisonTable.innerHTML = ""

    for (const model of models) {
      try {
        window.heartModels.setActiveModel(model)
        const prediction = window.heartModels.predict(data)

        const row = document.createElement("tr")
        if (model === data.modelType) {
          row.classList.add("table-primary")
        }

        const aspirinProb = (prediction.aspirin.probability * 100).toFixed(1)
        const heparinProb = (prediction.heparin.probability * 100).toFixed(1)

        row.innerHTML = `
                    <td>
                        ${modelNames[model]}
                        ${model === data.modelType ? '<span class="badge bg-primary ms-2">Selected</span>' : ""}
                    </td>
                    <td>${aspirinProb}%</td>
                    <td>${heparinProb}%</td>
                    <td>
                        <span class="badge ${prediction.aspirin.recommendation ? "bg-success" : "bg-danger"}">
                            ${prediction.aspirin.recommendation ? "Yes" : "No"}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${prediction.heparin.recommendation ? "bg-success" : "bg-danger"}">
                            ${prediction.heparin.recommendation ? "Yes" : "No"}
                        </span>
                    </td>
                `

        comparisonTable.appendChild(row)
      } catch (error) {
        console.error(`Error with ${model} model:`, error)
      }
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
