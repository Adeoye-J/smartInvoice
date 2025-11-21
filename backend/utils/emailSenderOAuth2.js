// const nodemailer = require('nodemailer');
// const { createOAuth2Client } = require('./googleClient');

// async function sendMailUsingUserOAuth({ userEmail, refreshToken, to, subject, text, html, attachments = [] }) {
//   // create an OAuth2 client and set refresh token
//   const oauth2Client = createOAuth2Client();
//   oauth2Client.setCredentials({ refresh_token: refreshToken });

//   // get a fresh access token
//   const accessTokenObj = await oauth2Client.getAccessToken(); // returns { token } or string
//   const accessToken = accessTokenObj?.token || accessTokenObj;

//   // create nodemailer transporter with OAuth2
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       type: 'OAuth2',
//       user: userEmail,
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       refreshToken,
//       accessToken,
//     },
//   });

//   const info = await transporter.sendMail({
//     from: `${userEmail}`, // you can set nicer "Name <email>" if you have the name
//     to,
//     subject,
//     text,
//     html,
//     attachments,
//   });

//   return info;
// }

// module.exports = { sendMailUsingUserOAuth };

// server/utils/emailSenderOAuth2.js
const nodemailer = require('nodemailer');
const { createOAuth2Client } = require('./googleClient');

async function sendMailUsingUserOAuth({
  userEmail,
  userDisplayName, // optional, e.g. "Acme Ltd"
  refreshToken,
  to,
  subject,
  text,
  html,
  attachments = []
}) {
  if (!userEmail) throw new Error('userEmail is required');
  if (!refreshToken) throw new Error('refreshToken is required');

  // create OAuth2 client and set the refresh token
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  // get a fresh access token (may return string or object)
  const accessTokenResult = await oauth2Client.getAccessToken();
  const accessToken = (typeof accessTokenResult === 'string')
    ? accessTokenResult
    : (accessTokenResult && (accessTokenResult.token || accessTokenResult.access_token));

  if (!accessToken) {
    throw new Error('Could not obtain access token from Google OAuth2 client');
  }

  // create transporter using OAuth2
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: userEmail,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken,
      accessToken,
    },
  });

  // Build a friendly from header
  const from = userDisplayName ? `${userDisplayName} <${userEmail}>` : userEmail;

  // send the email
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      attachments,
    });
    return info;
  } catch (err) {
    // rethrow or wrap so callers can handle/log
    err.message = `Failed to send email via user OAuth2: ${err.message}`;
    throw err;
  }
}

module.exports = { sendMailUsingUserOAuth };
