const SupportTicket = require('../models/SupportTicket');
const { sendSupportTicketConfirmation, sendSupportTicketReply } = require('../utils/email');
const AppError = require('../utils/AppError');

// ─── @POST /api/support ────────────────────────────────────────────────────────
// Submit a support ticket (Public)
exports.createTicket = async (req, res, next) => {
  try {
    const { name, email, subject, category, message } = req.body;

    if (!name || !email || !subject || !message) {
      return next(new AppError('Please fill in all required fields.', 400));
    }

    const ticket = await SupportTicket.create({
      name,
      email,
      subject,
      category,
      message,
    });

    // Send confirmation email asynchronously (do not block client response)
    sendSupportTicketConfirmation(ticket).catch((err) =>
      console.error('Failed to send support ticket confirmation email:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully.',
      ticket,
    });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/support ─────────────────────────────────────────────────────────
// Get all support tickets (Admin only)
exports.getAllTickets = async (req, res, next) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
      SupportTicket.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      tickets,
    });
  } catch (err) {
    next(err);
  }
};

// ─── @PUT /api/support/:id/reply ───────────────────────────────────────────────
// Reply to a support ticket (Admin only)
exports.replyToTicket = async (req, res, next) => {
  try {
    const { replyMessage } = req.body;
    if (!replyMessage) return next(new AppError('Reply message is required.', 400));

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return next(new AppError('Support ticket not found.', 404));

    ticket.replyMessage = replyMessage;
    ticket.status = 'resolved';
    ticket.repliedAt = new Date();
    await ticket.save();

    // Send reply email to user via Nodemailer
    await sendSupportTicketReply(ticket, replyMessage);

    res.status(200).json({
      success: true,
      message: 'Reply sent and ticket resolved.',
      ticket,
    });
  } catch (err) {
    next(err);
  }
};

// ─── @DELETE /api/support/:id ──────────────────────────────────────────────────
// Delete a support ticket (Admin only)
exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!ticket) return next(new AppError('Ticket not found.', 404));

    res.status(200).json({
      success: true,
      message: 'Support ticket deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
