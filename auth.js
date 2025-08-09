document.addEventListener("DOMContentLoaded", () => {
  // Registration form handling
  const registrationForm = document.getElementById("registration-form")
  if (registrationForm) {
    registrationForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const formData = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        profession: document.getElementById("profession").value,
        institution: document.getElementById("institution").value,
        password: document.getElementById("password").value,
        confirmPassword: document.getElementById("confirmPassword").value,
      }

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!")
        return
      }

      // Validate password strength
      if (formData.password.length < 8) {
        alert("Password must be at least 8 characters long!")
        return
      }

      // Store user data (in a real app, this would be sent to a server)
      const users = JSON.parse(localStorage.getItem("users")) || []

      // Check if user already exists
      if (users.find((user) => user.email === formData.email)) {
        alert("User with this email already exists!")
        return
      }

      // Add new user
      const newUser = {
        id: Date.now(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        profession: formData.profession,
        institution: formData.institution,
        password: formData.password, // In a real app, this would be hashed
        registrationDate: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      alert("Registration successful! Please log in.")
      window.location.href = "login.html"
    })
  }

  // Login form handling
  const loginForm = document.getElementById("login-form")
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const email = document.getElementById("loginEmail").value
      const password = document.getElementById("loginPassword").value

      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("users")) || []

      // Find user
      const user = users.find((u) => u.email === email && u.password === password)

      if (user) {
        // Store current user session
        localStorage.setItem("currentUser", JSON.stringify(user))

        // Redirect to dashboard
        window.location.href = "dashboard.html"
      } else {
        alert("Invalid email or password!")
      }
    })
  }

  // Logout functionality
  const logoutBtn = document.getElementById("logout-btn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()
      localStorage.removeItem("currentUser")
      window.location.href = "login.html"
    })
  }

  // Check authentication on protected pages
  function checkAuth() {
    const currentUser = localStorage.getItem("currentUser")
    const protectedPages = ["dashboard.html", "inputs.html", "results.html"]
    const currentPage = window.location.pathname.split("/").pop()

    if (protectedPages.includes(currentPage) && !currentUser) {
      window.location.href = "login.html"
    }
  }

  // Initialize authentication check
  checkAuth()
})
