import React from 'react';
import { formatCurrency, formatFullDateTime } from '../utils/formatters';

export default function TransactionBubble({ transaction }) {
  const isGive = transaction.type === 'GIVE';

  return (
    <div className={`flex ${isGive ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-sm relative ${
          isGive ? 'bg-[#fed7aa] rounded-tr-sm' : 'bg-[#dcf8c6] rounded-tl-sm'
        }`}
      >
        {/* Items/Note */}
        {transaction.items ? (
          <p className="text-gray-700 text-sm mb-1 leading-snug">{transaction.items}</p>
        ) : (
          <p className="text-gray-400 text-sm mb-1 italic">
            {isGive ? 'Udhaar given' : 'Payment received'}
          </p>
        )}

        {/* Amount */}
        <div className="flex items-center justify-between gap-4">
          <span className={`text-base font-bold ${isGive ? 'text-red-600' : 'text-green-700'}`}>
            {isGive ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </span>
          <span
            className="text-[10px] text-gray-500 self-end leading-none"
            title={formatFullDateTime(transaction.date)}
          >
            {new Date(transaction.date).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Type tag */}
        <div
          className={`text-[10px] font-medium mt-0.5 ${isGive ? 'text-orange-500' : 'text-green-600'}`}
        >
          {isGive ? '📤 उधार / Gave' : '📥 जमा / Got'}
        </div>
      </div>
    </div>
  );
}
