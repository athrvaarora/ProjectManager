require('dotenv').config();
const axios = require('axios');

async function verifySendGridAPI() {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.error('SendGrid API key not found in environment variables');
    process.exit(1);
  }

  try {
    const response = await axios.get('https://api.sendgrid.com/v3/templates', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('SendGrid API Key is valid. Templates:', response.data);
  } catch (error) {
    console.error('Error verifying SendGrid API key:', error.response?.data || error.message);
    process.exit(1);
  }
}

verifySendGridAPI(); 