import React, { useState, useEffect } from 'react';
import TopNavbar from '../components/TopNavbar';
import Sidebar from '../components/Sidebar';
import GaugeChart from '../components/GaugeChart';
import DischargeChart from '../components/DischargeChart';
import RiskProgressionChart from '../components/RiskProgressionChart';
import { mockAuthorityData, fetchAuthorityData } from '../data/mockAuthorityData';
import '../styles/AuthorityDashboard.css';

const AuthorityDashboard = () => {
  // State management
  const [selectedUC, setSelectedUC] = useState('');
  const [forecastPeriod, setForecastPeriod] = useState('48');
  const [dashboardData, setDashboardData] = useState(mockAuthorityData);
  const [loading, setLoading] = useState(false);

  // TODO: Replace with actual API integration
  // This effect simulates data fetching when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // In production, this will call the actual API:
        // const data = await fetchAuthorityData(selectedUC, forecastPeriod, startDate, endDate);
        
        // For now, using mock data
        const data = await fetchAuthorityData(selectedUC, forecastPeriod, null, null);
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // TODO: Add error handling UI
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedUC, forecastPeriod]);

  // Export handlers
  // TODO: Implement actual PDF/CSV export functionality
  const handleExportPDF = () => {
    console.log('Exporting to PDF...', { selectedUC, forecastPeriod });
    alert('PDF Export functionality will be implemented with backend integration');
  };

  const handleExportCSV = () => {
    console.log('Exporting to CSV...', { selectedUC, forecastPeriod });
    alert('CSV Export functionality will be implemented with backend integration');
  };

  // Get selected UC name
  const getSelectedUCName = () => {
    if (!selectedUC) return 'Choose UC';
    const uc = dashboardData.unitCommands.find(u => u.id === parseInt(selectedUC));
    return uc ? uc.name : 'Unknown UC';
  };

  return (
    <div className="dashboard-container">
      <TopNavbar />
      
      <div className="dashboard-content">
        <Sidebar 
          unitCommands={dashboardData.unitCommands}
          selectedUC={selectedUC}
          onUCChange={setSelectedUC}
          forecastPeriod={forecastPeriod}
          onForecastPeriodChange={setForecastPeriod}
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
          ) : (
            <div className="charts-grid">
              <GaugeChart 
                data={dashboardData.gaugeLevelData}
                ucName={getSelectedUCName()}
              />
              
              <div className="charts-row">
                <DischargeChart 
                  data={dashboardData.dischargeData}
                  ucName={getSelectedUCName()}
                />
                
                <RiskProgressionChart 
                  data={dashboardData.riskProgressionData}
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
