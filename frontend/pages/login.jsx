import { useState } from "react";
import api from "../src/axious";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    try {
      const response = await api.post("auth/login/", {
        email: email.trim(),
        password: password,
      });

      console.log("Login response:", response.data);

      const user = response.data.user;

      localStorage.setItem("user", JSON.stringify(user));

      console.log("Logged in user:", user);
      console.log("User role:", user.role);

      if (user.role === "PROFESSIONAL") {
        window.location.href = "/industry-experts";
      } else if (user.role === "STUDENT") {
        window.location.href = "/student/dashboard";
      } else if (user.role === "MENTOR") {
        window.location.href = "/mentor/dashboard";
      }
    } catch (error) {
      console.error("Login error:", error.response?.data);

      setError("Invalid email or password.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>CareerCompass</h1>
          <p>Your Career. Your Future.</p>
        </div>

        <div className="login-form">
          <h2>Welcome Back!</h2>

          <p className="login-subtitle">
            Sign in to continue your career journey.
          </p>

          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setMessage("");
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
                setMessage("");
              }}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          {message && <p className="login-success">{message}</p>}

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#">Forgot Password?</a>
          </div>

          <button type="button" className="login-button" onClick={handleLogin}>
            Login
          </button>

          <p className="register-text">
            Don't have an account? <a href="/register">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
