import React from 'react';
import '../styles/AuthorityDashboard.css';

const TopNavbar = ({ onExportPDF, onExportCSV }) => {
  return (
    <nav className="top-navbar">
      <div className="navbar-brand">
        <div className="brand-logo">C-Guard</div>
        <div className="brand-subtitle">Authority Dashboard</div>
      </div>
      <div className="navbar-actions">
        <button className="export-btn export-pdf" onClick={onExportPDF}>
          Export PDF
        </button>
        <button className="export-btn export-csv" onClick={onExportCSV}>
          Export CSV
        </button>
      </div>
    </nav>
  );
};

export default TopNavbar;
