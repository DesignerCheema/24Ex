import React from 'react';
import { useForm } from 'react-hook-form';
import { BellIcon, EnvelopeIcon, DevicePhoneMobileIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { NotificationSettings } from '../../services/settingsService';

interface NotificationSettingsProps {
  settings: NotificationSettings;
  onSave: (data: NotificationSettings) => void;
  loading: boolean;
}

export default function NotificationSettingsComponent({ settings, onSave, loading }: NotificationSettingsProps) {
  const {
    register,
    handleSubmit,
    watch,
  } = useForm<NotificationSettings>({
    defaultValues: settings,
  });

  const quietHoursEnabled = watch('quietHours.enabled');

  const handleFormSubmit = (data: NotificationSettings) => {
    onSave(data);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Email Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <EnvelopeIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                {...register('emailNotifications.orderCreated')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Order Created</div>
                <div className="text-sm text-gray-500">Notify when new orders are created</div>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                {...register('emailNotifications.orderStatusChanged')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Order Status Changes</div>
                <div className="text-sm text-gray-500">Notify when order status is updated</div>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                {...register('emailNotifications.deliveryCompleted')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Delivery Completed</div>
                <div className="text-sm text-gray-500">Notify when deliveries are completed</div>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                {...register('emailNotifications.paymentReceived')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Payment Received</div>
                <div className="text-sm text-gray-500">Notify when payments are received</div>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                {...register('emailNotifications.lowStock')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Low Stock Alerts</div>
                <div className="text-sm text-gray-500">Notify when inventory is running low</div>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                {...register('emailNotifications.systemAlerts')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">System Alerts</div>
                <div className="text-sm text-gray-500">Notify about system issues and maintenance</div>
              </div>
            </label>
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DevicePhoneMobileIcon className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">SMS Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                {...register('smsNotifications.orderCreated')}
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Order Created</div>
                <div className="text-sm text-gray-500">SMS when new orders are created</div>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                {...register('smsNotifications.deliveryUpdates')}
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Delivery Updates</div>
                <div className="text-sm text-gray-500">SMS for delivery status changes</div>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                {...register('smsNotifications.urgentAlerts')}
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Urgent Alerts</div>
                <div className="text-sm text-gray-500">SMS for urgent system alerts</div>
              </div>
            </label>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ComputerDesktopIcon className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                {...register('pushNotifications.realTimeUpdates')}
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Real-time Updates</div>
                <div className="text-sm text-gray-500">Instant notifications for important events</div>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                {...register('pushNotifications.dailySummary')}
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Daily Summary</div>
                <div className="text-sm text-gray-500">Daily summary of activities and metrics</div>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                {...register('pushNotifications.weeklyReports')}
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Weekly Reports</div>
                <div className="text-sm text-gray-500">Weekly performance and analytics reports</div>
              </div>
            </label>
          </div>
        </div>

        {/* Notification Frequency */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Frequency</h3>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                {...register('notificationFrequency')}
                type="radio"
                value="immediate"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Immediate</div>
                <div className="text-sm text-gray-500">Send notifications immediately</div>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                {...register('notificationFrequency')}
                type="radio"
                value="hourly"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Hourly</div>
                <div className="text-sm text-gray-500">Batch notifications every hour</div>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                {...register('notificationFrequency')}
                type="radio"
                value="daily"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Daily</div>
                <div className="text-sm text-gray-500">Send daily summary notifications</div>
              </div>
            </label>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiet Hours</h3>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                {...register('quietHours.enabled')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Enable Quiet Hours</div>
                <div className="text-sm text-gray-500">Suppress non-urgent notifications during specified hours</div>
              </div>
            </label>

            {quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4 ml-7">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    {...register('quietHours.start')}
                    type="time"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    {...register('quietHours.end')}
                    type="time"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}