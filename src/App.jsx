import { useState } from "react";
import Home from "./pages/Home";
import AuthorityLogin from "./pages/AuthorityLogin";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import FloodRiskPage from "./pages/FloodRiskPage";
import SheltersPage from "./pages/SheltersPage";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

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

  const handleCheckFloodRisk = () => {
    setCurrentPage("floodRisk");
  };

  const handleViewShelters = (location) => {
    setSelectedLocation(location || null);
    setCurrentPage("shelters");
  };

  // Render based on current page
  if (currentPage === "dashboard" && user) {
    return <AuthorityDashboard user={user} onLogout={handleLogout} />;
  }

  if (currentPage === "login") {
    return <AuthorityLogin onLogin={handleLogin} onBackToHome={handleBackToHome} />;
  }

  if (currentPage === "floodRisk") {
    return <FloodRiskPage onBackToHome={handleBackToHome} onViewShelters={handleViewShelters} />;
  }

  if (currentPage === "shelters") {
    return <SheltersPage onBack={handleCheckFloodRisk} selectedLocation={selectedLocation} />;
  }

  return <Home onAuthorityLogin={handleAuthorityLogin} onCheckFloodRisk={handleCheckFloodRisk} />;
}

export default App;
