import React, { useState } from 'react';
import { Search, Plus, TrendingUp, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { useCustomers } from '../hooks/useCustomers';
import { formatCurrency, formatDate } from '../utils/formatters';
import Avatar from './Avatar';
import AddCustomerModal from './AddCustomerModal';

function BalanceBadge({ balance }) {
  if (balance > 0)
    return (
      <span className="text-xs font-semibold text-red-500 whitespace-nowrap">
        {formatCurrency(balance)} Due
      </span>
    );
  if (balance < 0)
    return (
      <span className="text-xs font-semibold text-green-600 whitespace-nowrap">
        {formatCurrency(balance)} Advance
      </span>
    );
  return <span className="text-xs font-medium text-gray-400">Settled</span>;
}

export default function CustomerList({
  onSelectCustomer,
  selectedCustomerId = null,
  refreshTrigger = 0,
}) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { customers, loading, error, refetch } = useCustomers(search, refreshTrigger);

  const totalOutstanding = customers.reduce(
    (sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0),
    0
  );

  const handleCustomerAdded = (newCustomer) => {
    refetch();
    if (newCustomer) {
      onSelectCustomer(newCustomer);
    }
  };

  return (
    <div className="relative flex flex-col h-full min-h-0 bg-white">
      {/* Header */}
      <div className="bg-[#075e54] text-white px-4 pb-3 safe-area-top flex-shrink-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <h1 className="text-lg font-semibold tracking-wide truncate">Khushi General Store</h1>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 flex-shrink-0">
            <TrendingUp size={13} className="text-red-300" />
            <span className="text-xs font-medium whitespace-nowrap">
              {totalOutstanding > 0 ? `${formatCurrency(totalOutstanding)} Due` : 'All Clear ✓'}
            </span>
          </div>
        </div>
        <p className="text-xs text-white/70">
          Khata Register • {customers.length} customer{customers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-[#075e54] px-3 pb-3 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name or phone..."
            className="w-full bg-white rounded-full pl-9 pr-4 py-2 text-base sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-20">
        {loading && (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
            <div className="w-6 h-6 border-2 border-[#075e54] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-500 px-6">
            <AlertCircle size={36} className="text-red-400" />
            <p className="text-sm text-center">{error}</p>
            <button
              onClick={refetch}
              className="flex items-center gap-1.5 text-sm text-[#075e54] font-medium"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {!loading && !error && customers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400 px-6">
            <Users size={48} className="text-gray-200" />
            <div className="text-center">
              <p className="font-medium text-gray-500">No customers yet</p>
              <p className="text-sm mt-1">
                {search
                  ? 'No results found for your search.'
                  : 'Tap the + button to add your first customer.'}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && customers.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {customers.map((customer) => {
              const isSelected = selectedCustomerId === customer._id;
              return (
                <li
                  key={customer._id}
                  onClick={() => onSelectCustomer(customer)}
                  className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#f0f2f5]' : ''
                  }`}
                >
                  <Avatar name={customer.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-900 truncate text-sm">
                        {customer.name}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatDate(customer.lastTransactionAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 truncate">
                        {customer.phone || 'No phone'}
                      </span>
                      <BalanceBadge balance={customer.currentBalance} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="absolute right-5 safe-fab-bottom w-14 h-14 bg-[#25D366] hover:bg-[#20b558] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-30"
        aria-label="Add Customer"
      >
        <Plus size={26} />
      </button>

      {showModal && (
        <AddCustomerModal onClose={() => setShowModal(false)} onAdded={handleCustomerAdded} />
      )}
    </div>
  );
}
