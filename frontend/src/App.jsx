import React, { useState, useEffect, useRef } from 'react';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import PasswordGate from './components/PasswordGate';

const CHAT_HASH_PREFIX = '#customer-';
const SESSION_UNLOCK_KEY = 'khushi_store_unlocked';

function getBaseUrl() {
  return window.location.pathname + window.location.search;
}

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_UNLOCK_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const customerCacheRef = useRef(new Map());

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleUnlock = () => {
    try {
      sessionStorage.setItem(SESSION_UNLOCK_KEY, 'true');
    } catch {
      // Ignore storage errors in restricted browsing modes
    }
    setIsUnlocked(true);
  };

  useEffect(() => {
    // Clear stale chat state/hash after a full page reload so initial view matches history.
    if (window.history.state?.khushiChatOpen || window.location.hash.startsWith(CHAT_HASH_PREFIX)) {
      window.history.replaceState(null, '', getBaseUrl());
    }

    const handlePopState = (event) => {
      if (event.state?.khushiChatOpen) {
        const cached = customerCacheRef.current.get(event.state.customerId);
        if (cached) {
          setSelectedCustomer(cached);
          return;
        }
        window.history.replaceState(null, '', getBaseUrl());
      }
      setSelectedCustomer(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectCustomer = (customer) => {
    if (!customer?._id) return;
    customerCacheRef.current.set(customer._id, customer);

    const nextState = { khushiChatOpen: true, customerId: customer._id };
    const nextUrl = `${getBaseUrl()}${CHAT_HASH_PREFIX}${customer._id}`;

    if (window.history.state?.khushiChatOpen) {
      window.history.replaceState(nextState, '', nextUrl);
    } else {
      window.history.pushState(nextState, '', nextUrl);
    }
    setSelectedCustomer(customer);
  };

  const handleBack = () => {
    if (window.history.state?.khushiChatOpen) {
      window.history.back();
    } else {
      setSelectedCustomer(null);
    }
  };

  const handleTransactionRecorded = (updatedCustomer) => {
    if (updatedCustomer?._id) {
      customerCacheRef.current.set(updatedCustomer._id, updatedCustomer);
    }
    setSelectedCustomer(updatedCustomer);
    triggerRefresh();
  };

  const handleCustomerDeleted = () => {
    if (selectedCustomer?._id) {
      customerCacheRef.current.delete(selectedCustomer._id);
    }
    triggerRefresh();
    if (window.history.state?.khushiChatOpen) {
      window.history.back();
    } else {
      setSelectedCustomer(null);
    }
  };

  if (!isUnlocked) {
    return <PasswordGate onUnlock={handleUnlock} />;
  }

  return (
    <div className="h-app w-full bg-gray-100 flex items-stretch justify-center overflow-hidden">
      {/* Desktop: Side-by-side layout */}
      <div className="hidden lg:flex w-full max-w-5xl h-full bg-white shadow-2xl overflow-hidden min-h-0">
        {/* Left Panel — Customer List */}
        <div className="w-96 flex-shrink-0 border-r border-gray-200 flex flex-col overflow-hidden min-h-0">
          <CustomerList
            onSelectCustomer={handleSelectCustomer}
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
              onBack={handleBack}
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
            onBack={handleBack}
            onCustomerDeleted={handleCustomerDeleted}
            onTransactionRecorded={handleTransactionRecorded}
          />
        ) : (
          <CustomerList
            onSelectCustomer={handleSelectCustomer}
            selectedCustomerId={selectedCustomer?._id || null}
            refreshTrigger={refreshKey}
          />
        )}
      </div>
    </div>
  );
}
