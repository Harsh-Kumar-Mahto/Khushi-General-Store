import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  MessageCircle,
  Trash2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  IndianRupee,
} from 'lucide-react';
import { useCustomerDetail } from '../hooks/useCustomerDetail';
import { formatCurrency } from '../utils/formatters';
import Avatar from './Avatar';
import TransactionBubble from './TransactionBubble';
import api from '../api/axios';

function DateDivider({ date }) {
  const d = new Date(date);
  const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  return (
    <div className="flex items-center gap-2 my-3">
      <div className="flex-1 h-px bg-gray-300/50" />
      <span className="text-xs text-gray-500 bg-[#efeae2] px-2 font-medium">{label}</span>
      <div className="flex-1 h-px bg-gray-300/50" />
    </div>
  );
}

function groupByDate(transactions) {
  const groups = {};
  transactions.forEach((tx) => {
    const key = new Date(tx.date).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });
  return groups;
}

export default function CustomerDetail({
  customer: initialCustomer,
  onBack,
  onCustomerDeleted,
  onTransactionRecorded,
}) {
  const { customer, transactions, loading, error, refetch, updateCustomer, addTransaction } =
    useCustomerDetail(initialCustomer._id);

  const [items, setItems] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [txError, setTxError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const feedRef = useRef(null);

  const displayCustomer = customer || initialCustomer;

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' });
  }, [transactions]);

  const handleTransaction = async (type) => {
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setTxError('Please enter a valid amount greater than 0');
      return;
    }
    setTxError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/transactions', {
        customerId: displayCustomer._id,
        type,
        amount: parsedAmount,
        items: items.trim(),
      });
      addTransaction(data.transaction);
      updateCustomer(data.updatedCustomer);
      onTransactionRecorded?.(data.updatedCustomer);
      setItems('');
      setAmount('');
    } catch (err) {
      setTxError(err.response?.data?.message || 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await api.delete(`/customers/${displayCustomer._id}`);
      onCustomerDeleted();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete customer');
      setDeleting(false);
    }
  };

  const handleWhatsApp = () => {
    const rawDigits = displayCustomer.phone?.replace(/\D/g, '') || '';
    if (!rawDigits) {
      setTxError('No phone number available for this customer');
      return;
    }
    const phone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;
    const balance = displayCustomer.currentBalance;
    let text = '';
    if (balance > 0) {
      text = `Namaste ${displayCustomer.name} ji,\n\nKhushi General Store mein aapka ${formatCurrency(balance)} udhaar baaki hai. Kripya jaldi payment kar dijiye.\n\nDhanyawad! 🙏`;
    } else if (balance < 0) {
      text = `Namaste ${displayCustomer.name} ji,\n\nKhushi General Store mein aapka ${formatCurrency(balance)} advance jama hai.\n\nDhanyawad! 🙏`;
    } else {
      text = `Namaste ${displayCustomer.name} ji,\n\nKhushi General Store mein aapka hisab bilkul saaf hai! Dhanyawad! 🙏`;
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const dateGroups = groupByDate(transactions);

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* Header */}
      <div className="bg-[#075e54] text-white px-3 pb-2.5 sm:pb-3 safe-area-top flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="lg:hidden p-1.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Back to customers"
          >
            <ArrowLeft size={22} />
          </button>
          <Avatar name={displayCustomer.name} size="sm" />
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm leading-tight truncate">{displayCustomer.name}</h2>
            <p className="text-xs text-white/60 truncate">{displayCustomer.phone || 'No phone'}</p>
          </div>

          {/* Balance pill */}
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
              displayCustomer.currentBalance > 0
                ? 'bg-red-100 text-red-600'
                : displayCustomer.currentBalance < 0
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {displayCustomer.currentBalance > 0
              ? `${formatCurrency(displayCustomer.currentBalance)} Due`
              : displayCustomer.currentBalance < 0
              ? `${formatCurrency(displayCustomer.currentBalance)} Adv`
              : 'Settled'}
          </div>

          {/* WhatsApp button */}
          <button
            onClick={handleWhatsApp}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#25D366] transition-colors flex-shrink-0"
            title="Send WhatsApp reminder"
            aria-label="Send WhatsApp reminder"
          >
            <MessageCircle size={20} />
          </button>

          {/* Delete button */}
          <button
            onClick={() => {
              setDeleteError('');
              setShowDeleteConfirm(true);
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-red-300 transition-colors flex-shrink-0"
            title="Delete customer"
            aria-label="Delete customer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Transactions Feed */}
      <div ref={feedRef} className="flex-1 min-h-0 overflow-y-auto chat-bg px-3 py-2 scrollbar-hide">
        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="w-5 h-5 border-2 border-[#075e54] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-500">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-sm">{error}</p>
            <button onClick={refetch} className="text-sm text-[#075e54] flex items-center gap-1">
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {!loading && !error && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
            <ShoppingBag size={40} className="text-gray-200" />
            <div className="text-center">
              <p className="font-medium text-gray-500 text-sm">No transactions yet</p>
              <p className="text-xs mt-1">Use the buttons below to record udhaar or payment</p>
            </div>
          </div>
        )}

        {!loading &&
          Object.entries(dateGroups).map(([dateKey, txs]) => (
            <div key={dateKey}>
              <DateDivider date={txs[0].date} />
              {txs.map((tx) => (
                <TransactionBubble key={tx._id} transaction={tx} />
              ))}
            </div>
          ))}
      </div>

      {/* Bottom Input Dock */}
      <div className="bg-white border-t border-gray-200 px-3 pt-2 sm:pt-2.5 flex-shrink-0 safe-area-bottom">
        {txError && (
          <p className="text-red-500 text-xs mb-1.5 px-2 bg-red-50 py-1 rounded-lg text-center">
            {txError}
          </p>
        )}
        <div className="flex gap-2 mb-2">
          <div className="flex-1 min-w-0 relative">
            <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="Items / Note (optional)"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#075e54]/30 focus:border-[#075e54]"
            />
          </div>
          <div className="w-28 sm:w-32 flex-shrink-0 relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (txError) setTxError('');
              }}
              placeholder="Amount"
              min="0.01"
              step="0.01"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-2.5 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#075e54]/30 focus:border-[#075e54]"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleTransaction('GIVE')}
            disabled={submitting}
            className="flex-1 py-2.5 px-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors active:scale-95"
          >
            📤 You Gave (उधार) +
          </button>
          <button
            type="button"
            onClick={() => handleTransaction('RECEIVE')}
            disabled={submitting}
            className="flex-1 py-2.5 px-2 bg-[#25D366] hover:bg-[#20b558] disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors active:scale-95"
          >
            📥 You Got (जमा) -
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <Trash2 className="text-red-500 mb-3" size={32} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Customer?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete <strong>{displayCustomer.name}</strong> and all their
              transactions. This action cannot be undone.
            </p>
            {deleteError && (
              <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg mb-4">
                {deleteError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-xl text-white text-sm font-semibold"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
