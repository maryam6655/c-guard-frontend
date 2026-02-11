// Mock data for C-Guard Authority Dashboard
// TODO: Replace with actual API calls when backend is ready

export const mockAuthorityData = {
  // List of Unit Commands for dropdown
  unitCommands: [
    { id: 1, name: "UC-North Region" },
    { id: 2, name: "UC-South Region" },
    { id: 3, name: "UC-East Region" },
    { id: 4, name: "UC-West Region" },
    { id: 5, name: "UC-Central Region" }
  ],

  // Gauge Level Analysis Data (for line chart)
  // Format: { timestamp, level, threshold }
  gaugeLevelData: [
    { timestamp: "00:00", level: 2.5, threshold: 4.0 },
    { timestamp: "03:00", level: 2.7, threshold: 4.0 },
    { timestamp: "06:00", level: 3.1, threshold: 4.0 },
    { timestamp: "09:00", level: 3.4, threshold: 4.0 },
    { timestamp: "12:00", level: 3.8, threshold: 4.0 },
    { timestamp: "15:00", level: 4.2, threshold: 4.0 },
    { timestamp: "18:00", level: 4.5, threshold: 4.0 },
    { timestamp: "21:00", level: 4.3, threshold: 4.0 },
    { timestamp: "24:00", level: 4.0, threshold: 4.0 },
    { timestamp: "27:00", level: 3.7, threshold: 4.0 },
    { timestamp: "30:00", level: 3.5, threshold: 4.0 },
    { timestamp: "33:00", level: 3.2, threshold: 4.0 },
    { timestamp: "36:00", level: 3.0, threshold: 4.0 },
    { timestamp: "39:00", level: 2.8, threshold: 4.0 },
    { timestamp: "42:00", level: 2.6, threshold: 4.0 },
    { timestamp: "45:00", level: 2.5, threshold: 4.0 },
    { timestamp: "48:00", level: 2.4, threshold: 4.0 }
  ],

  // River Discharge (Q) Analysis Data (for line chart)
  // Format: { timestamp, discharge, capacity }
  dischargeData: [
    { timestamp: "00:00", discharge: 150, capacity: 300 },
    { timestamp: "03:00", discharge: 165, capacity: 300 },
    { timestamp: "06:00", discharge: 185, capacity: 300 },
    { timestamp: "09:00", discharge: 210, capacity: 300 },
    { timestamp: "12:00", discharge: 245, capacity: 300 },
    { timestamp: "15:00", discharge: 280, capacity: 300 },
    { timestamp: "18:00", discharge: 310, capacity: 300 },
    { timestamp: "21:00", discharge: 295, capacity: 300 },
    { timestamp: "24:00", discharge: 270, capacity: 300 },
    { timestamp: "27:00", discharge: 240, capacity: 300 },
    { timestamp: "30:00", discharge: 220, capacity: 300 },
    { timestamp: "33:00", discharge: 195, capacity: 300 },
    { timestamp: "36:00", discharge: 175, capacity: 300 },
    { timestamp: "39:00", discharge: 160, capacity: 300 },
    { timestamp: "42:00", discharge: 150, capacity: 300 },
    { timestamp: "45:00", discharge: 145, capacity: 300 },
    { timestamp: "48:00", discharge: 140, capacity: 300 }
  ],

  // Flood Risk Level Progression Data (for stacked area chart)
  // Format: { timestamp, low, moderate, high, critical }
  riskProgressionData: [
    { timestamp: "00:00", low: 80, moderate: 15, high: 5, critical: 0 },
    { timestamp: "03:00", low: 75, moderate: 18, high: 7, critical: 0 },
    { timestamp: "06:00", low: 70, moderate: 20, high: 8, critical: 2 },
    { timestamp: "09:00", low: 65, moderate: 22, high: 10, critical: 3 },
    { timestamp: "12:00", low: 55, moderate: 25, high: 15, critical: 5 },
    { timestamp: "15:00", low: 45, moderate: 28, high: 20, critical: 7 },
    { timestamp: "18:00", low: 40, moderate: 25, high: 25, critical: 10 },
    { timestamp: "21:00", low: 45, moderate: 27, high: 20, critical: 8 },
    { timestamp: "24:00", low: 50, moderate: 28, high: 17, critical: 5 },
    { timestamp: "27:00", low: 58, moderate: 25, high: 14, critical: 3 },
    { timestamp: "30:00", low: 65, moderate: 23, high: 10, critical: 2 },
    { timestamp: "33:00", low: 70, moderate: 20, high: 8, critical: 2 },
    { timestamp: "36:00", low: 75, moderate: 18, high: 6, critical: 1 },
    { timestamp: "39:00", low: 78, moderate: 16, high: 5, critical: 1 },
    { timestamp: "42:00", low: 80, moderate: 15, high: 5, critical: 0 },
    { timestamp: "45:00", low: 82, moderate: 13, high: 5, critical: 0 },
    { timestamp: "48:00", low: 85, moderate: 12, high: 3, critical: 0 }
  ]
};

// Simulate API fetch function
// TODO: Replace with actual API endpoint
export const fetchAuthorityData = async (ucId, forecastPeriod, startDate, endDate) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In production, this would be:
  // const response = await fetch(`/api/authority-dashboard?ucId=${ucId}&period=${forecastPeriod}&start=${startDate}&end=${endDate}`);
  // return response.json();
  
  return mockAuthorityData;
};
