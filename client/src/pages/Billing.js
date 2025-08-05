import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';

const Billing = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <DollarSign className="text-primary-600" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-600">Manage patient billing and insurance claims</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="text-gray-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Billing Management</h3>
        <p className="text-gray-600">Handle patient billing, insurance claims, and payment processing.</p>
      </div>
    </motion.div>
  );
};

export default Billing;