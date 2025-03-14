require('dotenv').config();
const sgMail = require('@sendgrid/mail');

async function testSendGridTemplate() {
  const apiKey = process.env.SENDGRID_API_KEY;
  const templateId = process.env.SENDGRID_TEMPLATE_ID;
  const senderEmail = process.env.SENDGRID_SENDER_EMAIL;
  const testRecipient = process.env.TEST_RECIPIENT_EMAIL;

  if (!apiKey || !templateId || !senderEmail || !testRecipient) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  sgMail.setApiKey(apiKey);

  const testData = {
    inviteCode: 'TEST123',
    organizationName: 'Test Organization',
    organizationCode: 'testorg'
  };

  const msg = {
    to: testRecipient,
    from: senderEmail,
    templateId: templateId,
    dynamicTemplateData: testData
  };

  try {
    const response = await sgMail.send(msg);
    console.log('Test email sent successfully:', response);
  } catch (error) {
    console.error('Error sending test email:', error.response?.body || error.message);
    process.exit(1);
  }
}

testSendGridTemplate(); 