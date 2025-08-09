document.addEventListener("DOMContentLoaded", async () => {
  // Check authentication
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  // Display user name
  document.getElementById("user-name").textContent = `Dr. ${currentUser.firstName} ${currentUser.lastName}`

  // Load ML models
  console.log("Loading ML models...")
  const modelsLoaded = await window.heartModels.loadModels()

  if (!modelsLoaded) {
    alert("Error loading ML models. Please check that the model files are available.")
    return
  }

  // Generate patient ID
  function generatePatientId() {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0")
    return "PT" + timestamp + random
  }

  // Set initial patient ID
  document.getElementById("patientId").value = generatePatientId()

  // Form handling
  const patientForm = document.getElementById("patient-form")
  const clearFormBtn = document.getElementById("clear-form")

  // Add real-time validation
  addFormValidation()

  patientForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Show loading state
    const submitBtn = patientForm.querySelector('button[type="submit"]')
    const originalText = submitBtn.innerHTML
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Processing...'
    submitBtn.disabled = true

    try {
      // Get selected model type
      const selectedModel = document.querySelector('input[name="modelType"]:checked').value
      console.log("Selected model:", selectedModel)

      // Set the active model
      window.heartModels.setActiveModel(selectedModel)

      // Collect form data
      const patientData = {
        patientId: document.getElementById("patientId").value,
        age: Number.parseInt(document.getElementById("age").value),
        sex: Number.parseInt(document.getElementById("sex").value),
        anaemia: Number.parseInt(document.getElementById("anaemia").value),
        creatinine_phosphokinase: Number.parseInt(document.getElementById("creatinine_phosphokinase").value),
        diabetes: Number.parseInt(document.getElementById("diabetes").value),
        ejection_fraction: Number.parseInt(document.getElementById("ejection_fraction").value),
        high_blood_pressure: Number.parseInt(document.getElementById("high_blood_pressure").value),
        platelets: Number.parseInt(document.getElementById("platelets").value),
        serum_creatinine: Number.parseFloat(document.getElementById("serum_creatinine").value),
        serum_sodium: Number.parseInt(document.getElementById("serum_sodium").value),
        smoking: Number.parseInt(document.getElementById("smoking").value),
        time: Number.parseInt(document.getElementById("time").value),
        timestamp: new Date().toISOString(),
        analyzedBy: currentUser.id,
        modelType: selectedModel,
      }

      // Validate data
      const validation = validatePatientData(patientData)
      if (!validation.isValid) {
        alert("Validation Error: " + validation.errors.join(", "))
        submitBtn.innerHTML = originalText
        submitBtn.disabled = false
        return
      }

      console.log("Patient data:", patientData)

      // Store patient data for results page
      localStorage.setItem("currentPatientData", JSON.stringify(patientData))

      // Simulate processing delay
      setTimeout(() => {
        // Redirect to results page
        window.location.href = "results.html"
      }, 1500)
    } catch (error) {
      console.error("Error processing patient data:", error)
      alert("Error processing patient data: " + error.message)
      submitBtn.innerHTML = originalText
      submitBtn.disabled = false
    }
  })

  clearFormBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all form data?")) {
      patientForm.reset()
      document.getElementById("patientId").value = generatePatientId()

      // Reset validation states
      const inputs = patientForm.querySelectorAll(".form-control, .form-select")
      inputs.forEach((input) => {
        input.classList.remove("is-valid", "is-invalid")
      })

      // Reset model selection to default
      document.getElementById("modelLogistic").checked = true
    }
  })

  function validatePatientData(data) {
    const errors = []

    // Age validation
    if (data.age < 18 || data.age > 120) {
      errors.push("Age must be between 18 and 120 years")
    }

    // Ejection fraction validation
    if (data.ejection_fraction < 10 || data.ejection_fraction > 80) {
      errors.push("Ejection fraction must be between 10% and 80%")
    }

    // Laboratory value validations
    if (data.creatinine_phosphokinase < 0 || data.creatinine_phosphokinase > 10000) {
      errors.push("CPK value seems unrealistic")
    }

    if (data.platelets < 10000 || data.platelets > 2000000) {
      errors.push("Platelet count seems unrealistic")
    }

    if (data.serum_creatinine < 0.1 || data.serum_creatinine > 15) {
      errors.push("Serum creatinine value seems unrealistic")
    }

    if (data.serum_sodium < 100 || data.serum_sodium > 180) {
      errors.push("Serum sodium value seems unrealistic")
    }

    if (data.time < 1 || data.time > 1000) {
      errors.push("Follow-up time must be between 1 and 1000 days")
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    }
  }

  function addFormValidation() {
    // Add real-time validation to form fields
    const validationRules = {
      age: { min: 18, max: 120, type: "number" },
      ejection_fraction: { min: 10, max: 80, type: "number" },
      creatinine_phosphokinase: { min: 0, max: 10000, type: "number" },
      platelets: { min: 10000, max: 2000000, type: "number" },
      serum_creatinine: { min: 0.1, max: 15, type: "number" },
      serum_sodium: { min: 100, max: 180, type: "number" },
      time: { min: 1, max: 1000, type: "number" },
    }

    Object.keys(validationRules).forEach((fieldId) => {
      const field = document.getElementById(fieldId)
      if (field) {
        field.addEventListener("blur", () => validateField(field, validationRules[fieldId]))
        field.addEventListener("input", () => {
          // Clear validation state on input
          field.classList.remove("is-valid", "is-invalid")
        })
      }
    })
  }

  function validateField(field, rules) {
    const value = Number.parseFloat(field.value)
    const isValid = value >= rules.min && value <= rules.max

    if (field.value && !isNaN(value)) {
      if (isValid) {
        field.classList.remove("is-invalid")
        field.classList.add("is-valid")
      } else {
        field.classList.remove("is-valid")
        field.classList.add("is-invalid")
      }
    }
  }

  // Logout functionality
  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault()
    localStorage.removeItem("currentUser")
    window.location.href = "login.html"
  })
})
