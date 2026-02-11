import React from 'react';
import '../styles/AuthorityDashboard.css';

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
          {unitCommands.map(uc => (
            <option key={uc.id} value={uc.id}>
              {uc.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sidebar-section">
        <label className="sidebar-label">Forecast Period</label>
        <div className="radio-group">
          <label className="radio-label">
            <input 
              type="radio" 
              name="forecast" 
              value="24"
              checked={forecastPeriod === '24'}
              onChange={(e) => onForecastPeriodChange(e.target.value)}
            />
            <span>24 Hours</span>
          </label>
          <label className="radio-label">
            <input 
              type="radio" 
              name="forecast" 
              value="48"
              checked={forecastPeriod === '48'}
              onChange={(e) => onForecastPeriodChange(e.target.value)}
            />
            <span>48 Hours</span>
          </label>
          <label className="radio-label">
            <input 
              type="radio" 
              name="forecast" 
              value="72"
              checked={forecastPeriod === '72'}
              onChange={(e) => onForecastPeriodChange(e.target.value)}
            />
            <span>72 Hours</span>
          </label>
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

export default Sidebar;
