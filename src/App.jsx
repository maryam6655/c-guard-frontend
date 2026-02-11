import { useState } from "react";
import Home from "./pages/Home";
import AuthorityLogin from "./pages/AuthorityLogin";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("home");
  };

  const handleAuthorityLogin = () => {
    setCurrentPage("login");
  };

  const handleBackToHome = () => {
    setCurrentPage("home");
  };

  // Render based on current page
  if (currentPage === "dashboard" && user) {
    return <AuthorityDashboard user={user} onLogout={handleLogout} />;
  }

  if (currentPage === "login") {
    return <AuthorityLogin onLogin={handleLogin} onBackToHome={handleBackToHome} />;
  }

  return <Home onAuthorityLogin={handleAuthorityLogin} />;
}

export default App;
