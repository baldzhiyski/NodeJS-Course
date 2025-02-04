const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.url = url;
    this.from = `Hristo Baldzhiyski <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // In order in gmail to work , we need to activate 'less secure app' option
    });
  }

  async send(template, subject) {
    // 1) Render the HTML based on a pug template
    const currentHTML = pug.renderFile(
      `${__dirname}/../views/email/${template}.pug`,
      {
        firstName: this.firstName,
        lastName: this.lastName,
        user: this.url,
        subject,
      }
    );

    // 2) Define email options
    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: currentHTML,
      text: convert(currentHTML),
    };

    // 3) Create a transport and send an email

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family !');
  }
};
