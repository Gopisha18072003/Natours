const nodemailer = require('nodemailer');
const pug = require('pug');
const {htmlToText} = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Natours <${process.env.USER_EMAIL}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        secure: false,
        port: 587,
        auth: {
          user: process.env.USER_EMAIL,
          pass: process.env.USER_PASSWORD
        }
      });
    }

    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user:  process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD
      }
    });
  }

  // Send the actual email
  async send(template, subject, myTour) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
      myTour
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html)
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }
  async sendInvoice(tour) {
    await this.send('invoice', 'Your Booing has successfull', tour);
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Reset your password'
    );
  }
};
