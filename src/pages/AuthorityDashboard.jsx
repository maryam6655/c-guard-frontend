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
  // TODO: Implement actual PDF/CSV export functionality
  const handleExportPDF = () => {
    console.log('Exporting to PDF...', { selectedUC, forecastPeriod, startDate, endDate });
    
    // Show loading state
    const ucName = dashboardData.ucName || getSelectedUCName();
    const dateRange = dashboardData.dateRange || (startDate && endDate ? `${startDate} to ${endDate}` : '');
    const dateInfo = dateRange ? `\nDate Range: ${dateRange}` : '';
    alert(`📄 Generating PDF Report\n\nUnion Council: ${ucName}\nForecast Period: ${forecastPeriod} hours${dateInfo}\n\nDownload will start shortly...`);
    
    // Simulate export processing
    setTimeout(() => {
      console.log('PDF export completed');
      // In production, this would trigger actual PDF download
    }, 1000);
  };

  const handleExportCSV = () => {
    console.log('Exporting to CSV...', { selectedUC, forecastPeriod, startDate, endDate });
    
    // Show loading state
    const ucName = dashboardData.ucName || getSelectedUCName();
    const dateRange = dashboardData.dateRange || (startDate && endDate ? `${startDate} to ${endDate}` : '');
    const dateInfo = dateRange ? `\nDate Range: ${dateRange}` : '';
    alert(`📊 Generating CSV Data\n\nUnion Council: ${ucName}\nForecast Period: ${forecastPeriod} hours${dateInfo}\n\nDownload will start shortly...`);
    
    // Simulate export processing
    setTimeout(() => {
      console.log('CSV export completed');
      // In production, this would trigger actual CSV download
    }, 1000);
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
