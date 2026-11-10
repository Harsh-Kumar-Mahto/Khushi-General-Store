const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/customers — list all, with optional ?search=
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    const trimmed = typeof search === 'string' ? search.trim() : '';
    const filter = trimmed
      ? {
          $or: [
            { name: { $regex: escapeRegex(trimmed), $options: 'i' } },
            { phone: { $regex: escapeRegex(trimmed), $options: 'i' } },
          ],
        }
      : {};
    const customers = await Customer.find(filter).sort({ lastTransactionAt: -1 });
    res.json(customers);
  } catch (err) {
    next(err);
  }
});

// POST /api/customers — create new customer
router.post('/', async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Customer name is required' });
    }
    const customer = await Customer.create({
      name: String(name).trim(),
      phone: phone ? String(phone).trim() : '',
    });
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/:id — single customer
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/:id/transactions — all transactions for customer
router.get('/:id/transactions', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }
    const transactions = await Transaction.find({ customerId: req.params.id }).sort({
      date: 1,
      createdAt: 1,
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/customers/:id — delete customer and their transactions
router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    await Transaction.deleteMany({ customerId: req.params.id });
    res.json({ message: 'Customer and transactions deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
