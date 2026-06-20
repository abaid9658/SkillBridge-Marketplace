const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

// ─── Email Templates ──────────────────────────────────────────────────────────
exports.sendWelcomeEmail = (user) =>
  sendEmail({
    to: user.email,
    subject: 'Welcome to TEYZIX Marketplace! 🚀',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #6366f1; font-size: 28px;">Welcome to TEYZIX! 🎉</h1>
        <p style="font-size: 16px; line-height: 1.6;">Hi <strong>${user.name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6;">Your account has been created successfully as a <strong>${user.role}</strong>.</p>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:20px;">
          Explore Marketplace →
        </a>
        <p style="margin-top: 30px; font-size: 14px; color: #64748b;">TEYZIX Marketplace Team</p>
      </div>
    `,
  });

exports.sendRequestNotification = (provider, request) =>
  sendEmail({
    to: provider.email,
    subject: `New Service Request — ${request.service?.title || 'Service'}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <h2 style="color: #6366f1;">New Service Request! 📥</h2>
        <p>Hi <strong>${provider.name}</strong>, you have a new service request.</p>
        <div style="background:#1e293b;padding:20px;border-radius:12px;margin:20px 0;">
          <p><strong>Budget:</strong> $${request.budget}</p>
          <p><strong>Deadline:</strong> ${new Date(request.deadline).toLocaleDateString()}</p>
          <p><strong>Requirements:</strong> ${request.requirements?.substring(0, 200)}...</p>
        </div>
        <a href="${process.env.CLIENT_URL}/dashboard/provider" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
          View Request →
        </a>
      </div>
    `,
  });

exports.sendStatusUpdateEmail = (user, request, newStatus) =>
  sendEmail({
    to: user.email,
    subject: `Project Status Updated: ${newStatus.toUpperCase()}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <h2 style="color: #10b981;">Status Update 🔔</h2>
        <p>Your project status has been updated to: <strong style="color:#6366f1;">${newStatus}</strong></p>
        <a href="${process.env.CLIENT_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:20px;">
          View Dashboard →
        </a>
      </div>
    `,
  });

exports.sendSupportTicketConfirmation = (ticket) =>
  sendEmail({
    to: ticket.email,
    subject: `Support Ticket Created: #${ticket._id.toString().slice(-6).toUpperCase()}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <h2 style="color: #6366f1;">Ticket Confirmation 🎫</h2>
        <p>Hi <strong>${ticket.name}</strong>,</p>
        <p>We have successfully received your support ticket regarding: <strong>${ticket.subject}</strong>.</p>
        <p>Our team will review the ticket and respond within 2 hours. Check your inbox for updates!</p>
        <div style="background:#1e293b;padding:20px;border-radius:12px;margin:20px 0;">
          <p><strong>Category:</strong> ${ticket.category}</p>
          <p><strong>Message:</strong> ${ticket.message}</p>
        </div>
      </div>
    `,
  });

exports.sendSupportTicketReply = (ticket, replyText) =>
  sendEmail({
    to: ticket.email,
    subject: `Support Ticket Update: ${ticket.subject}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 16px; border: 1px solid #1e293b;">
        <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 20px;">Support Ticket Response</h1>
        <p style="font-size: 15px; line-height: 1.6;">Hi <strong>${ticket.name}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6;">Thank you for contacting support regarding: <em>"${ticket.subject}"</em>.</p>
        <p style="font-size: 15px; line-height: 1.6;">Our support representative has replied to your message:</p>
        
        <div style="background: #1e293b; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 20px 0; color: #f1f5f9; font-size: 15px; line-height: 1.6; white-space: pre-line;">
          ${replyText}
        </div>
        
        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">TEYZIX Support Center Team</p>
      </div>
    `,
  });
