const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');

// POST /api/transactions — record a transaction
router.post('/', async (req, res, next) => {
  try {
    const { customerId, type, amount, items } = req.body;

    if (!customerId || !type || amount === undefined || amount === null) {
      return res.status(400).json({ message: 'customerId, type, and amount are required' });
    }
    if (!mongoose.isValidObjectId(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }
    if (!['GIVE', 'RECEIVE'].includes(type)) {
      return res.status(400).json({ message: 'type must be GIVE or RECEIVE' });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'amount must be greater than 0' });
    }

    const existingCustomer = await Customer.findById(customerId);
    if (!existingCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const now = new Date();
    const transaction = await Transaction.create({
      customerId,
      type,
      amount: numericAmount,
      items: items ? String(items).trim() : '',
      date: now,
    });

    const balanceDelta = type === 'GIVE' ? numericAmount : -numericAmount;
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      {
        $inc: { currentBalance: balanceDelta },
        $set: { lastTransactionAt: now },
      },
      { new: true }
    );

    res.status(201).json({ transaction, updatedCustomer });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
