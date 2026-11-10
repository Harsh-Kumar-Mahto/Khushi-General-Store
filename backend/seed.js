require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const Customer = require('./models/Customer');
const Transaction = require('./models/Transaction');

const seedData = async () => {
  await connectDB();
  console.log('Connected to MongoDB for seeding...');

  // Clear existing data
  await Customer.deleteMany({});
  await Transaction.deleteMany({});
  console.log('Cleared existing data.');

  const now = Date.now();
  const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000);

  const customers = await Customer.insertMany([
    { name: 'Ramesh Sharma', phone: '9876543210', currentBalance: 0, lastTransactionAt: hoursAgo(48) },
    { name: 'Sunil Verma', phone: '9988776655', currentBalance: 0, lastTransactionAt: hoursAgo(24) },
    { name: 'Anita Devi', phone: '9123456789', currentBalance: 0, lastTransactionAt: hoursAgo(12) },
    { name: 'Mukesh Patel', phone: '', currentBalance: 0, lastTransactionAt: hoursAgo(6) },
  ]);
  console.log(`Created ${customers.length} customers.`);

  const txData = [
    { customerId: customers[0]._id, type: 'GIVE', amount: 500, items: '5kg Atta, 1L Oil', date: hoursAgo(48) },
    { customerId: customers[0]._id, type: 'GIVE', amount: 200, items: '2kg Sugar, Soap', date: hoursAgo(30) },
    { customerId: customers[0]._id, type: 'RECEIVE', amount: 300, items: 'Partial payment', date: hoursAgo(10) },
    { customerId: customers[1]._id, type: 'GIVE', amount: 1500, items: 'Monthly groceries', date: hoursAgo(24) },
    { customerId: customers[1]._id, type: 'RECEIVE', amount: 1500, items: 'Full payment', date: hoursAgo(5) },
    { customerId: customers[2]._id, type: 'GIVE', amount: 800, items: 'Dal, Rice, Oil', date: hoursAgo(12) },
    { customerId: customers[2]._id, type: 'GIVE', amount: 150, items: 'Biscuits, Tea', date: hoursAgo(2) },
    { customerId: customers[3]._id, type: 'GIVE', amount: 2000, items: 'Large order', date: hoursAgo(6) },
    { customerId: customers[3]._id, type: 'RECEIVE', amount: 500, items: 'Part payment', date: hoursAgo(1) },
  ];

  for (const tx of txData) {
    const transaction = await Transaction.create(tx);
    const delta = tx.type === 'GIVE' ? tx.amount : -tx.amount;
    await Customer.findByIdAndUpdate(tx.customerId, {
      $inc: { currentBalance: delta },
      $set: { lastTransactionAt: transaction.date },
    });
  }
  console.log(`Created ${txData.length} transactions and updated balances.`);

  const updatedCustomers = await Customer.find().sort({ lastTransactionAt: -1 });
  updatedCustomers.forEach((c) => console.log(`  ${c.name}: ₹${c.currentBalance}`));

  await mongoose.disconnect();
  console.log('✅ Seed complete!');
};

seedData().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
