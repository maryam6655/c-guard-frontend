import React, { useState } from "react";
import "../styles/AuthorityLogin.css";

const AuthorityLogin = ({ onLogin, onBackToHome }) => {
  const [activeTab, setActiveTab] = useState("Login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (activeTab === "Login") {
        // Simulate login validation
        if (formData.email && formData.password) {
          // Basic validation for demo - in production, this would be API call
          if (formData.email.includes("@") && formData.password.length >= 6) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Create user object
            const userData = {
              email: formData.email,
              name: formData.email.split("@")[0],
              role: "Authority",
              loginTime: new Date().toISOString()
            };
            
            // Call parent function to navigate to dashboard
            onLogin(userData);
          } else {
            alert("Please enter a valid email and password (min 6 characters)");
          }
        } else {
          alert("Please fill in all fields");
        }
      } else {
        // Sign up logic
        if (formData.email && formData.password && formData.confirmPassword) {
          if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
          }
          
          if (formData.password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
          }
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Create user object
          const userData = {
            email: formData.email,
            name: formData.email.split("@")[0],
            role: "Authority",
            loginTime: new Date().toISOString()
          };
          
          // Call parent function to navigate to dashboard
          onLogin(userData);
        } else {
          alert("Please fill in all fields");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const switchToTab = (tab) => {
    setActiveTab(tab);
    // Clear form when switching tabs
    setFormData({
      email: "",
      password: "",
      confirmPassword: ""
    });
  };

  return (
    <div className="login-page">
      {/* Back Button */}
      {onBackToHome && (
        <button className="back-to-home-btn" onClick={onBackToHome}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </button>
      )}

      {/* Left Side - Background Image with Branding */}
      <div className="login-left">
        <div className="login-left-overlay">
          <div className="brand-title">C Guard</div>
          <div className="brand-subtitle">Chenab River Basin Flood Forecasting System</div>
          <div className="brand-line"></div>
          <div className="brand-footer">Authorized Access - Chenab River Flood Monitoring System</div>
        </div>
      </div>

      {/* Right Side - Login/Signup Form */}
      <div className="login-right">
        <div className="login-card">
          <h2>Authority Login</h2>
          <p className="login-desc">For authorized government officials only</p>
          
          {/* Tabs */}
          <div className="tab-row">
            <div 
              className={`tab ${activeTab === "Login" ? "active" : ""}`}
              onClick={() => switchToTab("Login")}
            >
              Login
            </div>
            <div 
              className={`tab ${activeTab === "Sign Up" ? "active" : ""}`}
              onClick={() => switchToTab("Sign Up")}
            >
              Sign Up
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your official email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  style={{ paddingRight: "40px", width: "100%" }}
                />
                <div 
                  onClick={togglePasswordVisibility}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#6b859f",
                    fontSize: "18px",
                    userSelect: "none",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    {showPassword ? (
                      // Eye slash (hidden)
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </>
                    ) : (
                      // Eye open (visible)
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </>
                    )}
                  </svg>
                </div>
              </div>
            </div>

            {activeTab === "Sign Up" && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            {activeTab === "Login" && (
              <div className="forgot">Forgot Password?</div>
            )}

            <button type="submit" className="login-btn" disabled={isSubmitting}>
              {isSubmitting ? 
                (activeTab === "Login" ? "Logging in..." : "Creating Account...") : 
                (activeTab === "Login" ? "Login" : "Sign Up")
              }
            </button>
          </form>

          <div className="switch-text">
            {activeTab === "Login" ? (
              <>Don't have access? <span onClick={() => switchToTab("Sign Up")}>Switch to Sign Up</span></>
            ) : (
              <>Already have an account? <span onClick={() => switchToTab("Login")}>Switch to Login</span></>
            )}
          </div>

          <div className="footer-text">
            C Guard | Final Year Project 2026
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityLogin;
