import React from 'react';
import '../styles/SheltersPage.css';

// Dummy shelter data
const dummyShelters = [
  {
    id: 1,
    name: 'Government High School Shelter',
    address: 'Jhang District',
    capacity: 300,
    facilities: ['Drinking Water', 'Medical Aid', 'Electricity'],
    contact: '+92 300 1234567',
    status: 'Available'
  },
  {
    id: 2,
    name: 'Community Center Relief Point',
    address: 'Chiniot',
    capacity: 180,
    facilities: ['Drinking Water', 'Medical Aid', 'Electricity'],
    contact: '+92 300 2345678',
    status: 'Available'
  },
  {
    id: 3,
    name: 'District Sports Complex',
    address: 'Faisalabad',
    capacity: 350,
    facilities: ['Drinking Water', 'Medical Aid', 'Electricity'],
    contact: '+92 300 3456789',
    status: 'Full'
  },
  {
    id: 4,
    name: 'Municipal Hall Shelter',
    address: 'Gujrat',
    capacity: 280,
    facilities: ['Drinking Water', 'Medical Aid', 'Electricity'],
    contact: '+92 300 4567890',
    status: 'Available'
  }
];

// Emergency contacts
const emergencyContacts = [
  { title: 'PDMA Punjab Helpline', number: '1129' },
  { title: 'Rescue 1122', number: '1122' },
  { title: 'Police Emergency', number: '15' },
  { title: 'Punjab Flood Control Room', number: '(042) 99203005' },
  { title: 'District Administration', number: '1043' }
];

const SheltersPage = ({ onBack }) => {
  const getStatusColor = (status) => {
    if (status === 'Available') return '#22c55e';
    if (status === 'Full') return '#dc2626';
    return '#facc15';
  };

  return (
    <div className="shelters-page">
      {/* Header */}
      <div className="shelters-header">
        <button className="back-btn-shelters" onClick={onBack}>
          ← Back
        </button>
        <div className="header-info">
          <h1 className="shelters-main-title">Emergency Information</h1>
          <p className="shelters-subtitle">Flood Response Support for Chenab River</p>
        </div>
      </div>

      <div className="shelters-content">
        <div className="two-column-layout">
          {/* Left Column - Emergency Helpline Numbers */}
          <div className="helpline-section">
            <h2 className="column-title">Emergency Helpline Numbers</h2>
            
            <div className="helpline-list">
              {emergencyContacts.map((contact, index) => (
                <a 
                  key={index} 
                  href={`tel:${contact.number}`}
                  className="helpline-card"
                >
                  <div className="phone-icon-circle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div className="helpline-info">
                    <p className="helpline-title">{contact.title}</p>
                    <p className="helpline-number">{contact.number}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right Column - Flood Shelters */}
          <div className="shelters-section">
            <h2 className="column-title">Flood Shelters</h2>
            
            <div className="shelters-grid">
              {dummyShelters.map((shelter) => (
                <div key={shelter.id} className="shelter-card-compact">
                  <div className="shelter-card-header">
                    <h3 className="shelter-name-compact">{shelter.name}</h3>
                    <span 
                      className="status-badge-compact"
                      style={{ 
                        backgroundColor: shelter.status === 'Available' ? '#d1fae5' : '#fee2e2',
                        color: getStatusColor(shelter.status)
                      }}
                    >
                      {shelter.status}
                    </span>
                  </div>
                  
                  <div className="shelter-info-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="shelter-detail-text">{shelter.address}</span>
                  </div>
                  
                  <div className="shelter-info-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span className="shelter-detail-text">{shelter.capacity} persons</span>
                  </div>
                  
                  <div className="facilities-row">
                    <div className="facility-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                      </svg>
                      <span>Drinking Water</span>
                    </div>
                    <div className="facility-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                      </svg>
                      <span>Medical Aid</span>
                    </div>
                    <div className="facility-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      <span>Electricity</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SheltersPage;
