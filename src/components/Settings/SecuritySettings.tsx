import React from 'react';
import { useForm } from 'react-hook-form';
import { ShieldCheckIcon, KeyIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { SecuritySettings } from '../../services/settingsService';

interface SecuritySettingsProps {
  settings: SecuritySettings;
  onSave: (data: SecuritySettings) => void;
  loading: boolean;
}

export default function SecuritySettingsComponent({ settings, onSave, loading }: SecuritySettingsProps) {
  const {
    register,
    handleSubmit,
    watch,
  } = useForm<SecuritySettings>({
    defaultValues: settings,
  });

  const twoFactorEnabled = watch('twoFactorAuth.enabled');
  const ipWhitelistEnabled = watch('ipWhitelist.enabled');

  const handleFormSubmit = (data: SecuritySettings) => {
    onSave(data);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Password Policy */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <KeyIcon className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Password Policy</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Length</label>
              <input
                {...register('passwordPolicy.minLength', {
                  min: { value: 6, message: 'Minimum length must be at least 6' },
                  max: { value: 50, message: 'Maximum length is 50' },
                })}
                type="number"
                min="6"
                max="50"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password Expiration (days)</label>
              <input
                {...register('passwordPolicy.expirationDays', {
                  min: { value: 30, message: 'Minimum is 30 days' },
                  max: { value: 365, message: 'Maximum is 365 days' },
                })}
                type="number"
                min="30"
                max="365"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex items-center space-x-3">
              <input
                {...register('passwordPolicy.requireUppercase')}
                type="checkbox"
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-900">Require uppercase letters</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                {...register('passwordPolicy.requireLowercase')}
                type="checkbox"
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-900">Require lowercase letters</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                {...register('passwordPolicy.requireNumbers')}
                type="checkbox"
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-900">Require numbers</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                {...register('passwordPolicy.requireSpecialChars')}
                type="checkbox"
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-900">Require special characters</span>
            </label>
          </div>
        </div>

        {/* Session Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ClockIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Session Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
              <input
                {...register('sessionSettings.sessionTimeout', {
                  min: { value: 15, message: 'Minimum is 15 minutes' },
                  max: { value: 1440, message: 'Maximum is 24 hours' },
                })}
                type="number"
                min="15"
                max="1440"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Max Concurrent Sessions</label>
              <input
                {...register('sessionSettings.maxConcurrentSessions', {
                  min: { value: 1, message: 'Minimum is 1 session' },
                  max: { value: 10, message: 'Maximum is 10 sessions' },
                })}
                type="number"
                min="1"
                max="10"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center space-x-3">
              <input
                {...register('sessionSettings.requireReauth')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Require Re-authentication</div>
                <div className="text-sm text-gray-500">Require password for sensitive operations</div>
              </div>
            </label>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ShieldCheckIcon className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                {...register('twoFactorAuth.enabled')}
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Enable Two-Factor Authentication</div>
                <div className="text-sm text-gray-500">Add an extra layer of security to user accounts</div>
              </div>
            </label>

            {twoFactorEnabled && (
              <>
                <label className="flex items-center space-x-3 ml-7">
                  <input
                    {...register('twoFactorAuth.required')}
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-900">Require for all users</span>
                </label>

                <div className="ml-7">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Methods</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        {...register('twoFactorAuth.methods')}
                        type="checkbox"
                        value="email"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">Email</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        {...register('twoFactorAuth.methods')}
                        type="checkbox"
                        value="sms"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">SMS</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        {...register('twoFactorAuth.methods')}
                        type="checkbox"
                        value="app"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">Authenticator App</span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DocumentTextIcon className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Audit Log</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                {...register('auditLog.enabled')}
                type="checkbox"
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Enable Audit Logging</div>
                <div className="text-sm text-gray-500">Track user actions and system events</div>
              </div>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Retention Period (days)</label>
                <input
                  {...register('auditLog.retentionDays', {
                    min: { value: 30, message: 'Minimum is 30 days' },
                    max: { value: 2555, message: 'Maximum is 7 years' },
                  })}
                  type="number"
                  min="30"
                  max="2555"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Log Level</label>
                <select
                  {...register('auditLog.logLevel')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="detailed">Detailed</option>
                  <option value="verbose">Verbose</option>
                </select>
              </div>
            </div>
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