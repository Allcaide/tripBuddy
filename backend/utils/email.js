const nodemailer = require('nodemailer');
const { render } = require('@react-email/render');
const React = require('react');
const WelcomeEmail = require('./emails/WelcomeEmail.jsx');
const PasswordResetEmail = require('./emails/PasswordResetEmail.jsx');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Luís Alcaide <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      // SendGrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
      });
    }

    // Development - Mailtrap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
  }

  async send(Component, subject) {
    // 1) Render HTML do componente React
    const emailElement = React.createElement(Component, {
      firstName: this.firstName,
      url: this.url,
    });

    let html =await render(emailElement);

    //  Converte para string antes de usar replace
    const htmlString = typeof html === 'string' ? html : String(html);
    const textVersion = htmlString.replace(/<[^>]*>/g, '');

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: htmlString,
      text: textVersion,
    };

    // 3) Send email
    await this.createTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(WelcomeEmail, 'Bem-vindo à família MilFios! 🧵');
  }

  async sendPasswordReset() {
    await this.send(
      PasswordResetEmail,
      'Reset your password (valid for 10 minutes)',
    );
  }
};
