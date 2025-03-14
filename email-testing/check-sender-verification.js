require('dotenv').config();
const axios = require('axios');

async function checkSenderVerification() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.error('SendGrid API key not found in environment variables');
    process.exit(1);
  }

  try {
    const response = await axios.get('https://api.sendgrid.com/v3/verified_senders', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Verified Senders:', response.data);
  } catch (error) {
    console.error('Error checking sender verification:', error.response?.data || error.message);
    process.exit(1);
  }
}

checkSenderVerification(); 