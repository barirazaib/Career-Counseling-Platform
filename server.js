const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'braira.zaib@gmail.com', // updated sender email
    pass: 'yourapppassword'        // Gmail app password
  }
});

app.post('/send-verification', (req, res) => {
  const mailOptions = {
    from: 'braira.zaib@gmail.com',
    to: 'hanan.farooq@cfd.nu.edu.pk',
    subject: 'Verification Email',
    text: '22f-3316'
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
