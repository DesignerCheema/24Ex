import React, { useState } from 'react';
import { MagnifyingGlassIcon, TruckIcon, MapPinIcon, ClockIcon, CheckCircleIcon, XCircleIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { OrderService } from '../services/orderService';
import { Order } from '../types';

export default function PublicTracking() {
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);

  // Check URL parameters for tracking ID
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trackingParam = urlParams.get('id');
    if (trackingParam) {
      setTrackingId(trackingParam);
      // Auto-track if tracking ID is in URL
      handleTrackOrderById(trackingParam);
    }
  }, []);

  const handleTrackOrderById = async (trackingNumber: string) => {
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const foundOrder = await OrderService.getOrderByTrackingNumber(trackingNumber);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError('Order not found. Please check your tracking number and try again.');
      }
    } catch (err) {
      setError('Unable to fetch order details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleTrackOrderById(trackingId.trim());
  };

  const handleWhatsAppTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappNumber.trim() || !order) return;

    try {
      await OrderService.enableWhatsAppTracking(order.id, whatsappNumber);
      alert('WhatsApp tracking enabled! You will receive updates on your WhatsApp.');
      setShowWhatsAppForm(false);
      setWhatsappNumber('');
    } catch (err) {
      alert('Failed to enable WhatsApp tracking. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'shipped':
        return <TruckIcon className="h-6 w-6 text-blue-600" />;
      case 'processing':
        return <ClockIcon className="h-6 w-6 text-yellow-600" />;
      case 'cancelled':
        return <XCircleIcon className="h-6 w-6 text-red-600" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrackingSteps = (order: Order) => {
    const steps = [
      {
        id: 'pending',
        title: 'Order Placed',
        description: 'Your order has been received and is being processed',
        completed: true,
        date: order.createdAt
      },
      {
        id: 'processing',
        title: 'Processing',
        description: 'Your order is being prepared for shipment',
        completed: ['processing', 'shipped', 'delivered'].includes(order.status),
        date: order.status === 'processing' ? order.updatedAt : undefined
      },
      {
        id: 'shipped',
        title: 'Shipped',
        description: 'Your order is on the way',
        completed: ['shipped', 'delivered'].includes(order.status),
        date: order.status === 'shipped' ? order.updatedAt : undefined
      },
      {
        id: 'delivered',
        title: 'Delivered',
        description: 'Your order has been delivered',
        completed: order.status === 'delivered',
        date: order.status === 'delivered' ? order.actualDeliveryTime || order.updatedAt : undefined
      }
    ];

    return steps;
  };

  const shareOnWhatsApp = () => {
    if (!order) return;
    
    const message = `🚚 Order Update - ${order.orderNumber}

📦 Status: ${order.status.toUpperCase()}
🔍 Tracking: ${order.trackingNumber}
📅 Order Date: ${format(order.createdAt, 'MMM dd, yyyy')}
${order.deliveryDate ? `🚛 Expected Delivery: ${format(order.deliveryDate, 'MMM dd, yyyy')}` : ''}

Track your order: ${window.location.href}

24EX Delivery Services`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <TruckIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">24EX Delivery</h1>
                <p className="text-sm text-gray-500">Track Your Order</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Need help? Call +1 (555) 123-4567
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tracking Form */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h2>
            <p className="text-gray-600">Enter your tracking number to get real-time updates</p>
          </div>

          <form onSubmit={handleTrackOrder} className="max-w-md mx-auto">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter tracking number (e.g., TR-001-2024)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !trackingId.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Tracking...' : 'Track'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 max-w-md mx-auto bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h3>
                  <p className="text-gray-600">Tracking: {order.trackingNumber}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                  <button
                    onClick={() => setShowWhatsAppForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    <span>WhatsApp Updates</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Order Information</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div>Order Date: {format(order.createdAt, 'MMM dd, yyyy')}</div>
                    <div>Priority: {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}</div>
                    <div>Payment: {order.paymentMethod.toUpperCase()}</div>
                    <div>Total: ${order.totalAmount.toFixed(2)}</div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Customer Details</h4>
                  <div className="space-y-1 text-sm text-green-800">
                    <div>{order.customer.name}</div>
                    <div>{order.customer.email}</div>
                    <div>{order.customer.phone}</div>
                    {order.customer.company && <div>{order.customer.company}</div>}
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Delivery Address</h4>
                  <div className="space-y-1 text-sm text-purple-800">
                    <div>{order.deliveryAddress.street}</div>
                    <div>{order.deliveryAddress.city}, {order.deliveryAddress.state}</div>
                    <div>{order.deliveryAddress.zipCode}</div>
                    <div>{order.deliveryAddress.country}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Tracking Timeline</h3>
              <div className="space-y-6">
                {getTrackingSteps(order).map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-100 border-2 border-green-500' 
                          : 'bg-gray-100 border-2 border-gray-300'
                      }`}>
                        {step.completed ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        ) : (
                          <div className="w-3 h-3 bg-gray-400 rounded-full" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-lg font-medium ${
                          step.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </h4>
                        {step.date && (
                          <span className="text-sm text-gray-500">
                            {format(step.date, 'MMM dd, yyyy HH:mm')}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${
                        step.completed ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      {item.description && (
                        <p className="text-sm text-gray-500">{item.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">Qty: {item.quantity}</div>
                      <div className="text-sm text-gray-600">{item.weight}kg</div>
                      <div className="text-sm text-gray-600">${item.value.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            {order.deliveryDate && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Delivery Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <ClockIcon className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900">Expected Delivery</h4>
                    </div>
                    <p className="text-blue-800">{format(order.deliveryDate, 'EEEE, MMM dd, yyyy')}</p>
                    <p className="text-sm text-blue-700">{format(order.deliveryDate, 'HH:mm')}</p>
                  </div>
                  
                  {order.specialInstructions && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPinIcon className="h-5 w-5 text-yellow-600" />
                        <h4 className="font-medium text-yellow-900">Special Instructions</h4>
                      </div>
                      <p className="text-yellow-800 text-sm">{order.specialInstructions}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Share Options */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Share Tracking</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={shareOnWhatsApp}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <PhoneIcon className="h-5 w-5" />
                  <span>Share on WhatsApp</span>
                </button>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Tracking link copied to clipboard!');
                  }}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Copy Tracking Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Form Modal */}
        {showWhatsAppForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Enable WhatsApp Tracking</h3>
                <p className="text-sm text-gray-600 mt-1">Get order updates directly on WhatsApp</p>
              </div>
              
              <form onSubmit={handleWhatsAppTracking} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number *
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
                    Include country code (e.g., +1 for US, +44 for UK)
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">You'll receive updates for:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Order status changes</li>
                    <li>• Delivery confirmations</li>
                    <li>• Estimated delivery times</li>
                    <li>• Any delivery issues</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowWhatsAppForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Enable Updates
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Demo Section */}
        {!order && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <TruckIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Try Demo Tracking</h3>
            <p className="text-gray-600 mb-6">
              Use one of these demo tracking numbers to see how tracking works:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['TR-001-2024', 'TR-002-2024', 'TR-003-2024'].map((demoId) => (
                <button
                  key={demoId}
                  onClick={() => setTrackingId(demoId)}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="font-medium text-blue-900">{demoId}</div>
                  <div className="text-sm text-blue-700">Demo Order</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Why Choose 24EX Delivery?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Fast Delivery</h4>
              <p className="text-sm text-gray-600">Same-day and next-day delivery options available</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Real-time Tracking</h4>
              <p className="text-sm text-gray-600">Track your package every step of the way</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">WhatsApp Updates</h4>
              <p className="text-sm text-gray-600">Get instant notifications on WhatsApp</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Customer Support</h4>
              <p className="text-gray-600">Phone: +1 (555) 123-4567</p>
              <p className="text-gray-600">Email: support@24ex.com</p>
              <p className="text-gray-600">Hours: Mon-Fri 8AM-6PM EST</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">WhatsApp Support</h4>
              <p className="text-gray-600">WhatsApp: +1 (555) 123-4567</p>
              <p className="text-gray-600">Quick responses for urgent issues</p>
              <button
                onClick={() => window.open('https://wa.me/15551234567', '_blank')}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Chat on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}