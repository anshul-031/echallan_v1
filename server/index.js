const express = require('express');
const cors = require('cors');
require('dotenv').config();



const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Demo data
const demoData = {
  users: [
    { id: 1, email: 'admin@example.com', role: 'admin' },
    { id: 2, email: 'user@example.com', role: 'user' }
  ],
  vehicles: [
    {
      id: 1,
      vrn: 'RJ09GB9453',
      roadTaxExpiry: '2025-03-31',
      fitnessExpiry: '2024-11-24',
      insuranceValidity: '2024-10-16'
    },
    {
      id: 2,
      vrn: 'RJ09GB9450',
      roadTaxExpiry: '2025-05-12',
      fitnessExpiry: '2024-05-12',
      insuranceValidity: '2024-10-12'
    }
  ],
  challans: [
    {
      id: 1,
      vehicleId: 1,
      violationType: 'Speed Limit Violation',
      amount: 1000.00,
      location: 'Main Street'
    },
    {
      id: 2,
      vehicleId: 1,
      violationType: 'Parking Violation',
      amount: 500.00,
      location: 'City Center'
    }
  ]
};

// Vehicles endpoints
app.get('/api/vehicles', (req, res) => {
  res.json(demoData.vehicles);
});

// Challans endpoints
app.get('/api/challans', (req, res) => {
  res.json(demoData.challans);
});

// Users endpoints
app.get('/api/users', (req, res) => {
  res.json(demoData.users);
});

app.listen(port, () => {
  console.log(`Server running on port ${port} with demo data`);
});