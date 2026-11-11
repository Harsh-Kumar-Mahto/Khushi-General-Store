import React, { useState } from 'react';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';

export default function App() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleTransactionRecorded = (updatedCustomer) => {
    setSelectedCustomer(updatedCustomer);
    triggerRefresh();
  };

  const handleCustomerDeleted = () => {
    setSelectedCustomer(null);
    triggerRefresh();
  };

  return (
    <div className="h-app w-full bg-gray-100 flex items-stretch justify-center overflow-hidden">
      {/* Desktop: Side-by-side layout */}
      <div className="hidden lg:flex w-full max-w-5xl h-full bg-white shadow-2xl overflow-hidden min-h-0">
        {/* Left Panel — Customer List */}
        <div className="w-96 flex-shrink-0 border-r border-gray-200 flex flex-col overflow-hidden min-h-0">
          <CustomerList
            onSelectCustomer={setSelectedCustomer}
            selectedCustomerId={selectedCustomer?._id || null}
            refreshTrigger={refreshKey}
          />
        </div>

        {/* Right Panel — Customer Detail or Placeholder */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {selectedCustomer ? (
            <CustomerDetail
              key={selectedCustomer._id}
              customer={selectedCustomer}
              onBack={() => setSelectedCustomer(null)}
              onCustomerDeleted={handleCustomerDeleted}
              onTransactionRecorded={handleTransactionRecorded}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-[#f0f2f5] text-gray-400 gap-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-4xl">📒</span>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-gray-600">Khushi General Store</p>
                <p className="text-sm mt-2 max-w-xs text-center">
                  Select a customer from the list to view their ledger and record transactions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Full-screen toggle */}
      <div className="lg:hidden w-full max-w-md flex flex-col overflow-hidden h-full min-h-0">
        {selectedCustomer ? (
          <CustomerDetail
            key={selectedCustomer._id}
            customer={selectedCustomer}
            onBack={() => setSelectedCustomer(null)}
            onCustomerDeleted={handleCustomerDeleted}
            onTransactionRecorded={handleTransactionRecorded}
          />
        ) : (
          <CustomerList
            onSelectCustomer={setSelectedCustomer}
            selectedCustomerId={selectedCustomer?._id || null}
            refreshTrigger={refreshKey}
          />
        )}
      </div>
    </div>
  );
}
