/**
 * Simple CORS Proxy Server for SendGrid API
 * 
 * This proxy allows you to bypass CORS restrictions when testing SendGrid email sending
 * from a browser environment. It should only be used for development/testing purposes.
 * 
 * To use:
 * 1. Install dependencies: npm install express cors axios
 * 2. Run this server: node cors-proxy-server.js
 * 3. Update your emailService.ts to use this proxy
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001; // You can change this port if needed

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json());

// Proxy endpoint for SendGrid API
app.post('/sendgrid-proxy', async (req, res) => {
  try {
    console.log('Received request to send email via SendGrid');
    
    const apiKey = req.headers['sendgrid-api-key'];
    if (!apiKey) {
      return res.status(400).json({ error: 'SendGrid API key is required in the headers' });
    }
    
    // Forward the request to SendGrid API
    const response = await axios.post('https://api.sendgrid.com/v3/mail/send', req.body, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Email sent successfully via SendGrid');
    res.status(response.status).json({ success: true });
  } catch (error) {
    console.error('Error sending email via SendGrid:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to send email',
      details: error.response?.data || error.message
    });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'CORS Proxy Server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`CORS Proxy Server running on http://localhost:${PORT}`);
  console.log(`Use http://localhost:${PORT}/sendgrid-proxy to proxy SendGrid API requests`);
}); 