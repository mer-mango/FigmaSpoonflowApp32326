import React from 'react';
import { DollarSign, CreditCard, TrendingUp } from 'lucide-react';

const MutedPaymentsPage: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-emerald-100/40 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600/80" />
            </div>
            <div>
              <h1 className="text-gray-900">Payments</h1>
              <p className="text-gray-500">Track invoices, payments, and revenue</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <TrendingUp className="w-4 h-4 text-emerald-500/70" />
            </div>
            <p className="text-gray-900 font-semibold">$0.00</p>
            <p className="text-xs text-gray-400 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Outstanding</p>
              <CreditCard className="w-4 h-4 text-orange-500/70" />
            </div>
            <p className="text-gray-900 font-semibold">$0.00</p>
            <p className="text-xs text-gray-400 mt-1">Pending payment</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">This Month</p>
              <DollarSign className="w-4 h-4 text-blue-500/70" />
            </div>
            <p className="text-gray-900 font-semibold">$0.00</p>
            <p className="text-xs text-gray-400 mt-1">December 2024</p>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl border border-gray-200 p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">No payments yet</h3>
            <p className="text-gray-500 text-sm mb-6">
              Payments will appear here once you start collecting from clients. Create engagement flows to automatically generate Stripe payment links.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MutedPaymentsPage;
