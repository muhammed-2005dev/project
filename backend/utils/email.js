const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'AutoLogic <noreply@autologic.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

// Send welcome email
const sendWelcomeEmail = async (user, token) => {
  const subject = 'Welcome to AutoLogic - Verify Your Email';
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Welcome to AutoLogic!</h2>
      <p>Dear ${user.firstName},</p>
      <p>Thank you for registering with AutoLogic. We're excited to have you on board!</p>
      <p>To complete your registration, please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>The AutoLogic Team</p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject,
    html
  });
};

// Send password reset email
const sendPasswordResetEmail = async (user, token) => {
  const subject = 'AutoLogic - Password Reset Request';
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Password Reset Request</h2>
      <p>Dear ${user.firstName},</p>
      <p>We received a request to reset your password for your AutoLogic account.</p>
      <p>To reset your password, please click the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p><strong>Important:</strong> This link will expire in 10 minutes for security reasons.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br>The AutoLogic Team</p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject,
    html
  });
};

// Send appointment confirmation email
const sendAppointmentConfirmationEmail = async (booking) => {
  const subject = 'AutoLogic - Appointment Confirmed';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Appointment Confirmed</h2>
      <p>Dear ${booking.customer.firstName},</p>
      <p>Your appointment has been confirmed. Here are the details:</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Appointment Details</h3>
        <p><strong>Service:</strong> ${booking.service.name}</p>
        <p><strong>Date:</strong> ${new Date(booking.appointmentDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.appointmentTime}</p>
        <p><strong>Car:</strong> ${booking.car.year} ${booking.car.make} ${booking.car.model}</p>
        <p><strong>Estimated Cost:</strong> $${booking.estimatedCost || 'TBD'}</p>
      </div>
      <p>We look forward to serving you!</p>
      <p>Best regards,<br>The AutoLogic Team</p>
    </div>
  `;

  await sendEmail({
    email: booking.customer.email,
    subject,
    html
  });
};

// Send contact form notification email
const sendContactNotificationEmail = async (contact) => {
  const subject = 'New Contact Form Submission - AutoLogic';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">New Contact Form Submission</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Phone:</strong> ${contact.phone}</p>
        <p><strong>Subject:</strong> ${contact.subject}</p>
        <p><strong>Type:</strong> ${contact.type}</p>
        <p><strong>Priority:</strong> ${contact.priority}</p>
        <p><strong>Message:</strong></p>
        <p style="background-color: white; padding: 15px; border-radius: 3px;">${contact.message}</p>
      </div>
      <p>Submitted on: ${new Date(contact.createdAt).toLocaleString()}</p>
    </div>
  `;

  await sendEmail({
    email: process.env.ADMIN_EMAIL || 'admin@autologic.com',
    subject,
    html
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAppointmentConfirmationEmail,
  sendContactNotificationEmail
};
