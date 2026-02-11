import React, { useEffect, useState } from "react";
/*import "../styles/AuthorityDashboard.css";*/

import GaugeChart from "../components/GaugeChart";
import DischargeChart from "../components/DischargeChart";
import RiskProgressionChart from "../components/RiskProgressionChart";
import { mockAuthorityData, fetchAuthorityData } from "../data/mockAuthorityData";

/* ---------- SIDEBAR COMPONENT ---------- */
const Sidebar = ({
  unitCommands,
  selectedUC,
  onUCChange,
  forecastPeriod,
  onForecastPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <label className="sidebar-label">Unit Command</label>
        <select
          className="sidebar-select"
          value={selectedUC}
          onChange={(e) => onUCChange(e.target.value)}
        >
          {unitCommands.map((uc) => (
            <option key={uc.id} value={uc.id}>
              {uc.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sidebar-section">
        <label className="sidebar-label">Forecast Period</label>
        <div className="radio-group">
          {["24", "48", "72"].map((p) => (
            <label key={p} className="radio-label">
              <input
                type="radio"
                name="forecast"
                value={p}
                checked={forecastPeriod === p}
                onChange={(e) => onForecastPeriodChange(e.target.value)}
              />
              <span>{p} Hours</span>
            </label>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <label className="sidebar-label">Date Range</label>
        <div className="date-inputs">
          <input
            type="date"
            className="date-input"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
          <span className="date-separator">to</span>
          <input
            type="date"
            className="date-input"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
      </div>
    </aside>
  );
};

/* ---------- MAIN DASHBOARD ---------- */
const AuthorityDashboard = () => {
  const [data, setData] = useState(mockAuthorityData);
  const [selectedUC, setSelectedUC] = useState(
    mockAuthorityData.unitCommands[0]?.id ?? ""
  );
  const [forecastPeriod, setForecastPeriod] = useState("24");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchAuthorityData(selectedUC, forecastPeriod, startDate, endDate)
      .then(setData);
  }, [selectedUC, forecastPeriod, startDate, endDate]);

  return (
    <div className="dashboard-container">
      <div className="top-navbar">
        <div className="navbar-brand">
          <div className="brand-logo">C-Guard</div>
          <div className="brand-subtitle">Authority Dashboard</div>
        </div>
        <div className="navbar-actions">
          <button className="export-btn export-pdf">Export PDF</button>
          <button className="export-btn export-csv">Export CSV</button>
        </div>
      </div>

      <div className="dashboard-content">
        <Sidebar
          unitCommands={data.unitCommands || []}
          selectedUC={selectedUC}
          onUCChange={setSelectedUC}
          forecastPeriod={forecastPeriod}
          onForecastPeriodChange={setForecastPeriod}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <main className="main-area">
          <div className="charts-grid">
            <GaugeChart data={data.gaugeLevelData || []} />
            <DischargeChart data={data.dischargeData || []} />
            <RiskProgressionChart data={data.riskProgressionData || []} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
