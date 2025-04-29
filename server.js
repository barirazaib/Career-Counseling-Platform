const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yourgmail@gmail.com', // apni email daalo
    pass: 'yourapppassword'      // Gmail app password
  }
});

app.post('/send-verification', (req, res) => {
  const { to, subject, text } = req.body;

  const mailOptions = {
    from: 'yourgmail@gmail.com',
    to,
    subject,
    text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Email sending failed' });
    }
    res.json({ message: 'Email sent successfully' });
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
