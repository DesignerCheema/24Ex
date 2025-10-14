import React, { useState } from 'react';
import { PhoneIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { WhatsAppService } from '../../services/whatsappService';

interface WhatsAppTrackingWidgetProps {
  orderId: string;
  orderNumber: string;
  isEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

export default function WhatsAppTrackingWidget({ 
  orderId, 
  orderNumber, 
  isEnabled = false, 
  onToggle 
}: WhatsAppTrackingWidgetProps) {
  const [showForm, setShowForm] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappNumber.trim()) return;

    setLoading(true);
    try {
      await WhatsAppService.enableTracking(orderId, whatsappNumber);
      onToggle?.(true);
      setShowForm(false);
      setWhatsappNumber('');
      alert('WhatsApp tracking enabled successfully!');
    } catch (error) {
      alert('Failed to enable WhatsApp tracking. Please check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (window.confirm('Are you sure you want to disable WhatsApp tracking?')) {
      try {
        await WhatsAppService.disableTracking(orderId);
        onToggle?.(false);
      } catch (error) {
        alert('Failed to disable WhatsApp tracking.');
      }
    }
  };

  if (isEnabled) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <PhoneIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-green-900">WhatsApp Tracking Active</h4>
              <p className="text-sm text-green-700">You'll receive updates on WhatsApp</p>
            </div>
          </div>
          <button
            onClick={handleDisable}
            className="text-green-600 hover:text-green-800 p-1"
            title="Disable WhatsApp tracking"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {!showForm ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <PhoneIcon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">WhatsApp Tracking</h4>
              <p className="text-sm text-gray-600">Get updates on WhatsApp</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Enable
          </button>
        </div>
      ) : (
        <form onSubmit={handleEnable} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Include country code (e.g., +1 for US)
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Enabling...' : 'Enable'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}