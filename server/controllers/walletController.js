const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { AppError } = require('../middleware/errorHandler');

// Get wallet balance
exports.getWallet = async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user._id });
    }
    res.json({ success: true, data: wallet });
  } catch (err) { next(err); }
};

// Get transaction history
exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('orderId', 'status')
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

// Simulate a deposit (demo — in production, use Stripe webhook)
exports.deposit = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 5) return next(new AppError('Minimum deposit is $5', 400));
    if (amount > 10000) return next(new AppError('Maximum single deposit is $10,000', 400));

    const [wallet, transaction] = await Promise.all([
      Wallet.findOneAndUpdate(
        { userId: req.user._id },
        { $inc: { balance: amount, totalSpent: amount } },
        { new: true, upsert: true }
      ),
      Transaction.create({
        userId: req.user._id,
        type: 'deposit',
        amount,
        status: 'completed',
        description: `Wallet deposit of $${amount}`,
      }),
    ]);

    res.json({ success: true, message: `$${amount} added to wallet`, data: { wallet, transaction } });
  } catch (err) { next(err); }
};

// Request a withdrawal
exports.withdraw = async (req, res, next) => {
  try {
    const { amount, bankDetails } = req.body;
    if (!amount || amount < 10) return next(new AppError('Minimum withdrawal is $10', 400));

    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet || wallet.balance < amount) return next(new AppError('Insufficient wallet balance', 400));

    const [updatedWallet, transaction] = await Promise.all([
      Wallet.findOneAndUpdate(
        { userId: req.user._id },
        { $inc: { balance: -amount, totalWithdrawn: amount } },
        { new: true }
      ),
      Transaction.create({
        userId: req.user._id,
        type: 'withdrawal',
        amount,
        status: 'pending',
        description: `Withdrawal request of $${amount}`,
        metadata: { bankDetails },
      }),
    ]);

    res.json({
      success: true,
      message: 'Withdrawal request submitted. Processing within 2-5 business days.',
      data: { wallet: updatedWallet, transaction },
    });
  } catch (err) { next(err); }
};
