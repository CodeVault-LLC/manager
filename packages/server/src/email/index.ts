import nodemailer from 'nodemailer';

export class Mail {
  static instance: Mail;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Singleton instance of the Mail class.
   * @returns The singleton instance of the Mail class.
   */
  static getInstance() {
    if (!Mail.instance) {
      Mail.instance = new Mail();
    }

    return Mail.instance;
  }

  sendMail(to: string, subject: string, text: string) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    };

    return this.transporter.sendMail(mailOptions);
  }

  private defaultHTML = (title: string, body: string) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          padding: 20px;
        }

        .container {
          background-color: #fff;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
          </style>
    </head>
    <body>
      <div class="container">
        <h1>${title}</h1>
        <p>${body}</p>

        <hr />

        This administrative email is being sent to you from CodeVault LLC.

© ${new Date().getFullYear()} CodeVault LLC. All Rights Reserved.
      </div>
    </body>
    </html>
    `;
  };

  /**
   * Send a verification email for verifying the users email. (Done after registering)
   * @param to The email address to send the verification email to.
   * @param token The token to be sent in the email.
   */
  public async sendVerificationEmail(to: string, token: string) {
    const subject = 'Your Manager verification code';
    const body = this.defaultHTML(
      'Email Verification Code',
      `<p>Enter this code on the identity verification screen:</p><span style="font-weight: bold;font-size: 32px;">${token}</span><p>This code will expire shortly. If you can’t find the identity verification screen, try logging in again.</p><p>If you did not request this email, we recommend that you reset your password.</p>`,
    );

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: body,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully');

      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);

      return false;
    }
  }

  /**
   * Send a password reset email.
   * @param to The email address to send the password reset email to.
   * @param token The token to be sent in the email.
   */
  public async sendPasswordResetEmail(to: string, token: string) {
    const subject = 'Your Manager password reset code';
    const body = this.defaultHTML(
      'Password Reset Code',
      `<p>Enter this code on the password reset screen:</p><span style="font-weight: bold;font-size: 32px;">${token}</span><p>This code will expire shortly. If you can’t find the password reset screen, try logging in again.</p><p>If you did not request this email, we recommend that you reset your password.</p>`,
    );

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: body,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully');

      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);

      return false;
    }
  }
}
