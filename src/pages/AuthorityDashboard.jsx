import React, { useState, useEffect } from 'react';
import TopNavbar from '../components/TopNavbar';
import Sidebar from '../components/Sidebar';
import GaugeChart from '../components/GaugeChart';
import DischargeChart from '../components/DischargeChart';
import RiskProgressionChart from '../components/RiskProgressionChart';
import { mockAuthorityData, fetchAuthorityData } from '../data/mockAuthorityData';
import '../styles/AuthorityDashboard.css';

const AuthorityDashboard = ({ user, onLogout }) => {
  // State management
  const [selectedUC, setSelectedUC] = useState('');
  const [forecastPeriod, setForecastPeriod] = useState('48');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dashboardData, setDashboardData] = useState(mockAuthorityData);
  const [loading, setLoading] = useState(false);

  // TODO: Replace with actual API integration
  // This effect simulates data fetching when filters change
  useEffect(() => {
    const loadData = async () => {
      if (!selectedUC) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // In production, this will call the actual API:
        // const data = await fetchAuthorityData(selectedUC, forecastPeriod, startDate, endDate);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // For now, using mock data
        const data = await fetchAuthorityData(selectedUC, forecastPeriod, startDate, endDate);
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // TODO: Add error handling UI
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedUC, forecastPeriod, startDate, endDate]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  // Export handlers
  const handleExportPDF = () => {
    const ucName = dashboardData.ucName || getSelectedUCName();
    const dateRange = dashboardData.dateRange || (startDate && endDate ? `${startDate} to ${endDate}` : '');
    
    // Create printable content
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Flood Risk Report - ${ucName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #173b5f; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #173b5f; color: white; }
          .info { margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>C Guard - Flood Risk Report</h1>
        <div class="info"><strong>Union Council:</strong> ${ucName}</div>
        <div class="info"><strong>Forecast Period:</strong> ${forecastPeriod} hours</div>
        ${dateRange ? `<div class="info"><strong>Date Range:</strong> ${dateRange}</div>` : ''}
        <div class="info"><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
        
        <h2>Gauge Levels</h2>
        <table>
          <tr><th>Time (hrs)</th><th>Level (m)</th></tr>
          ${dashboardData.gaugeLevels?.map(g => `<tr><td>${g.time}</td><td>${g.level}</td></tr>`).join('') || '<tr><td colspan="2">No data available</td></tr>'}
        </table>
        
        <h2>Discharge Data</h2>
        <table>
          <tr><th>Time (hrs)</th><th>Discharge (m³/s)</th></tr>
          ${dashboardData.discharge?.map(d => `<tr><td>${d.time}</td><td>${d.value}</td></tr>`).join('') || '<tr><td colspan="2">No data available</td></tr>'}
        </table>
        
        <h2>Risk Progression</h2>
        <table>
          <tr><th>Period</th><th>Danger (%)</th><th>High (%)</th><th>Critical (%)</th></tr>
          ${dashboardData.riskProgression?.map(r => `<tr><td>${r.hour}</td><td>${r.danger}</td><td>${r.high}</td><td>${r.critical}</td></tr>`).join('') || '<tr><td colspan="4">No data available</td></tr>'}
        </table>
        
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 1000);
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleExportCSV = () => {
    const ucName = dashboardData.ucName || getSelectedUCName();
    const dateRange = dashboardData.dateRange || (startDate && endDate ? `${startDate} to ${endDate}` : '');
    
    // Create CSV content
    let csvContent = `C Guard - Flood Risk Data Export\n`;
    csvContent += `Union Council,${ucName}\n`;
    csvContent += `Forecast Period,${forecastPeriod} hours\n`;
    if (dateRange) csvContent += `Date Range,${dateRange}\n`;
    csvContent += `Generated,${new Date().toLocaleString()}\n\n`;
    
    // Gauge Levels
    csvContent += `Gauge Levels\n`;
    csvContent += `Time (hrs),Level (m)\n`;
    if (dashboardData.gaugeLevels) {
      dashboardData.gaugeLevels.forEach(g => {
        csvContent += `${g.time},${g.level}\n`;
      });
    }
    csvContent += `\n`;
    
    // Discharge Data
    csvContent += `Discharge Data\n`;
    csvContent += `Time (hrs),Discharge (m³/s)\n`;
    if (dashboardData.discharge) {
      dashboardData.discharge.forEach(d => {
        csvContent += `${d.time},${d.value}\n`;
      });
    }
    csvContent += `\n`;
    
    // Risk Progression
    csvContent += `Risk Progression\n`;
    csvContent += `Period,Danger (%),High (%),Critical (%)\n`;
    if (dashboardData.riskProgression) {
      dashboardData.riskProgression.forEach(r => {
        csvContent += `${r.hour},${r.danger},${r.high},${r.critical}\n`;
      });
    }
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `CGuard_FloodRisk_${ucName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get selected UC name
  const getSelectedUCName = () => {
    if (!selectedUC) return 'No UC Selected';
    const uc = dashboardData.unitCommands.find(u => u.id === parseInt(selectedUC));
    return uc ? uc.name : 'Unknown UC';
  };

  // Check if UC is selected to show reports
  const isUCSelected = selectedUC !== '';

  return (
    <div className="dashboard-container">
      <TopNavbar 
        user={user}
        onExportPDF={handleExportPDF}
        onExportCSV={handleExportCSV}
        onLogout={handleLogout}
      />
      
      <div className="dashboard-content">
        <Sidebar 
          unitCommands={dashboardData.unitCommands}
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
          <div className="main-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 className="main-title">Analytics Dashboard</h1>
                <p className="main-subtitle">Chenab River Flood Monitoring & Forecast Analysis</p>
              </div>
              <div className="export-buttons">
                <button className="export-btn" onClick={handleExportPDF}>
                  <svg className="export-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Export PDF
                </button>
                <button className="export-btn" onClick={handleExportCSV}>
                  <svg className="export-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
              Loading dashboard data...
            </div>
          ) : !isUCSelected ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 40px', 
              color: '#94A3B8',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              margin: '20px'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', opacity: 0.5 }}>
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                Select a Union Council
              </h3>
              <p style={{ fontSize: '14px' }}>
                Please select a Union Council from the sidebar to view flood monitoring reports and analytics.
              </p>
            </div>
          ) : (
            <div className="charts-grid">
              <GaugeChart 
                data={dashboardData.gaugeLevelData}
                ucName={dashboardData.ucName}
                dateRange={dashboardData.dateRange}
              />
              
              <div className="charts-row">
                <DischargeChart 
                  data={dashboardData.dischargeData}
                  ucName={dashboardData.ucName}
                  dateRange={dashboardData.dateRange}
                />
                
                <RiskProgressionChart 
                  data={dashboardData.riskProgressionData}
                  ucName={dashboardData.ucName}
                  dateRange={dashboardData.dateRange}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
