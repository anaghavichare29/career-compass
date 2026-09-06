import { useState } from "react";
import api from "../../services/api";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      setLoading(true);

      const response = await api.post("auth/login/", {
        email: email.trim(),
        password: password,
      });

      console.log("Login response:", response.data);

      const user = response.data.user;

      console.log("Logged in user:", user);
      console.log("User role:", user.role);

      localStorage.setItem("user", JSON.stringify(user));

      setMessage("Login successful!");

      if (user.role === "STUDENT") {
        window.location.href = "/student/dashboard";
      } else if (user.role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else if (user.role === "PROFESSIONAL") {
        window.location.href = "/industry-experts/dashboard";
      } else {
        setError("Invalid user role.");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);

      if (error.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("Unable to connect to the server. Please try again.");
      }
    } finally {
      setLoading(false);
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

          <button
            type="button"
            className="login-button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
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
