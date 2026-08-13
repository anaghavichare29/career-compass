import { useState } from "react";
import api from "../src/axious";
import "./register.css";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [message, setMessage] = useState("");

  const handleConfirmPassword = (value) => {
    setConfirmPassword(value);
    setMessage("");

    if (value !== password) {
      setPasswordError("Passwords do not match.");
    } else {
      setPasswordError("");
    }
  };

  const handleRegister = async () => {
    setMessage("");
    setPasswordError("");

    // Validate full name
    if (!fullName.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    // Validate email
    if (!email.trim()) {
      setMessage("Please enter your email.");
      return;
    }

    // Validate password
    if (!password) {
      setPasswordError("Please enter a password.");
      return;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setPasswordError("Please confirm your password.");
      return;
    }

    // Check passwords
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      /*
       * Split full name into first and last name
       */
      const nameParts = fullName.trim().split(" ");

      const firstName = nameParts[0];

      const lastName = nameParts.slice(1).join(" ");

      /*
       * Send registration data to Django
       */
      const response = await api.post("auth/register/", {
        first_name: firstName,
        last_name: lastName,
        email: email.trim(),
        password: password,
        role: role,
      });

      console.log("Registration response:", response.data);

      setMessage("Registration successful! You can now login.");

      // Clear form
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("STUDENT");
    } catch (error) {
      console.error("Registration error:", error.response?.data);

      if (error.response?.data?.email) {
        setMessage(error.response.data.email[0]);
      } else {
        setMessage("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <h1>CareerCompass</h1>
          <p>Your Career. Your Future.</p>
        </div>

        {/* Form */}
        <div className="register-form">
          <h2>Create Your Account</h2>

          <p className="register-subtitle">
            Start your personalized career journey with CareerCompass.
          </p>

          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>

            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setMessage("");
              }}
            />
          </div>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setMessage("");
            }}
          />
          <div className="form-group">
            <label htmlFor="role">Register As</label>

            <select
              id="role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setMessage("");
              }}
            >
              <option value="STUDENT">Student</option>

              <option value="MENTOR">Mentor</option>

              <option value="PROFESSIONAL">Professional</option>
            </select>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>

            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => {
                  const value = e.target.value;

                  setPassword(value);
                  setMessage("");

                  if (confirmPassword && value !== confirmPassword) {
                    setPasswordError("Passwords do not match.");
                  } else {
                    setPasswordError("");
                  }
                }}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>

            <div className="password-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPassword(e.target.value)}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            {passwordError && <p className="password-error">{passwordError}</p>}

            {confirmPassword && password === confirmPassword && (
              <p className="password-success">✓ Passwords match</p>
            )}
          </div>

          {/* Terms */}
          <div className="terms-container">
            <input type="checkbox" id="terms" />

            <label htmlFor="terms">
              I agree to the Terms & Conditions and Privacy Policy.
            </label>
          </div>

          {/* Register Button */}
          <button
            type="button"
            className="register-button"
            onClick={handleRegister}
          >
            Create Account
          </button>

          {message && <p className="register-success">{message}</p>}

          {/* Login */}
          <p className="login-text">
            Already have an account? <a href="/industry-experts">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
