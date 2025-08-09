document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  // Display user name
  document.getElementById("user-name").textContent = `Dr. ${currentUser.firstName} ${currentUser.lastName}`

  // Load dashboard data
  loadDashboardData()

  function loadDashboardData() {
    const patientHistory = JSON.parse(localStorage.getItem("patientHistory")) || []

    // Calculate statistics
    const totalAnalyses = patientHistory.length
    const aspirinRecommended = patientHistory.filter((p) => p.aspirinProbability >= 0.5).length
    const heparinRecommended = patientHistory.filter((p) => p.heparinProbability >= 0.5).length
    const highRiskPatients = patientHistory.filter(
      (p) => p.patientData.age > 65 || p.patientData.diabetes === 1 || p.patientData.ejection_fraction < 40,
    ).length

    // Update statistics cards
    document.getElementById("total-analyses").textContent = totalAnalyses
    document.getElementById("aspirin-recommended").textContent = aspirinRecommended
    document.getElementById("heparin-recommended").textContent = heparinRecommended
    document.getElementById("high-risk-patients").textContent = highRiskPatients

    // Load recent analyses
    loadRecentAnalyses(patientHistory)
  }

  function loadRecentAnalyses(history) {
    const tableBody = document.getElementById("recent-analyses")
    tableBody.innerHTML = ""

    // Sort by timestamp (most recent first) and take last 10
    const recentHistory = history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10)

    if (recentHistory.length === 0) {
      const row = document.createElement("tr")
      row.innerHTML =
        '<td colspan="7" class="text-center text-muted">No analyses found. <a href="inputs.html">Start your first analysis</a></td>'
      tableBody.appendChild(row)
      return
    }

    recentHistory.forEach((patient) => {
      const row = document.createElement("tr")

      const aspirinStatus =
        patient.aspirinProbability >= 0.5
          ? '<span class="badge bg-success">Recommended</span>'
          : '<span class="badge bg-danger">Not Recommended</span>'

      const heparinStatus =
        patient.heparinProbability >= 0.5
          ? '<span class="badge bg-success">Recommended</span>'
          : '<span class="badge bg-danger">Not Recommended</span>'

      row.innerHTML = `
                <td>${patient.patientData.patientId}</td>
                <td>${new Date(patient.timestamp).toLocaleDateString()}</td>
                <td>${patient.patientData.age}</td>
                <td>${patient.patientData.sex === 1 ? "Male" : "Female"}</td>
                <td>${aspirinStatus}</td>
                <td>${heparinStatus}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="viewPatient('${patient.patientData.patientId}')">
                        <i class="bi bi-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deletePatient('${patient.patientData.patientId}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            `

      tableBody.appendChild(row)
    })
  }

  // Global functions for patient actions
  window.viewPatient = (patientId) => {
    const patientHistory = JSON.parse(localStorage.getItem("patientHistory")) || []
    const patient = patientHistory.find((p) => p.patientData.patientId === patientId)

    if (patient) {
      localStorage.setItem("currentPatientData", JSON.stringify(patient.patientData))
      window.location.href = "results.html"
    }
  }

  window.deletePatient = (patientId) => {
    if (confirm("Are you sure you want to delete this patient analysis?")) {
      let patientHistory = JSON.parse(localStorage.getItem("patientHistory")) || []
      patientHistory = patientHistory.filter((p) => p.patientData.patientId !== patientId)
      localStorage.setItem("patientHistory", JSON.stringify(patientHistory))
      loadDashboardData() // Reload the dashboard
    }
  }

  // Logout functionality
  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault()
    localStorage.removeItem("currentUser")
    window.location.href = "login.html"
  })
})
