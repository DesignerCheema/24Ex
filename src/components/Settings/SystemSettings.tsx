import React, { useState, useEffect } from 'react';
import { ServerStackIcon, ServerIcon, CpuChipIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { SettingsService } from '../../services/settingsService';

interface SystemSettingsProps {
  settings: any;
  onSave: (data: any) => void;
  loading: boolean;
}

export default function SystemSettingsComponent({ settings, onSave, loading }: SystemSettingsProps) {
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  useEffect(() => {
    loadSystemHealth();
  }, []);

  const loadSystemHealth = async () => {
    try {
      setHealthLoading(true);
      const health = await SettingsService.getSystemHealth();
      setSystemHealth(health);
    } catch (error) {
      console.error('Failed to load system health:', error);
    } finally {
      setHealthLoading(false);
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <ServerIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <button
            onClick={loadSystemHealth}
            disabled={healthLoading}
            className="ml-auto px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {healthLoading ? 'Checking...' : 'Refresh'}
          </button>
        </div>

        {systemHealth ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${getHealthColor(systemHealth.database)}`}>
              <div className="flex items-center space-x-2 mb-2">
                {getHealthIcon(systemHealth.database)}
                <span className="font-medium text-gray-900">Database</span>
              </div>
              <div className="text-sm text-gray-600 capitalize">{systemHealth.database}</div>
            </div>

            <div className={`p-4 rounded-lg border ${getHealthColor(systemHealth.storage)}`}>
              <div className="flex items-center space-x-2 mb-2">
                {getHealthIcon(systemHealth.storage)}
                <span className="font-medium text-gray-900">Storage</span>
              </div>
              <div className="text-sm text-gray-600 capitalize">{systemHealth.storage}</div>
            </div>

            <div className={`p-4 rounded-lg border ${getHealthColor(systemHealth.api)}`}>
              <div className="flex items-center space-x-2 mb-2">
                {getHealthIcon(systemHealth.api)}
                <span className="font-medium text-gray-900">API</span>
              </div>
              <div className="text-sm text-gray-600 capitalize">{systemHealth.api}</div>
            </div>

            <div className={`p-4 rounded-lg border ${getHealthColor(systemHealth.backup)}`}>
              <div className="flex items-center space-x-2 mb-2">
                {getHealthIcon(systemHealth.backup)}
                <span className="font-medium text-gray-900">Backup</span>
              </div>
              <div className="text-sm text-gray-600 capitalize">{systemHealth.backup}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading system health...</span>
          </div>
        )}
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <CpuChipIcon className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
        </div>

        {systemHealth && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700">System Version</div>
              <div className="text-lg font-semibold text-gray-900">{systemHealth.version}</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Uptime</div>
              <div className="text-lg font-semibold text-gray-900">{systemHealth.uptime}</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Environment</div>
              <div className="text-lg font-semibold text-gray-900">Production</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Database</div>
              <div className="text-lg font-semibold text-gray-900">PostgreSQL</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Storage</div>
              <div className="text-lg font-semibold text-gray-900">Supabase</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Last Backup</div>
              <div className="text-lg font-semibold text-gray-900">2 hours ago</div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <ServerStackIcon className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-blue-700">Response Time</div>
            <div className="text-2xl font-bold text-blue-600">245ms</div>
            <div className="text-sm text-blue-600">Average API response</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-green-700">Throughput</div>
            <div className="text-2xl font-bold text-green-600">1,247</div>
            <div className="text-sm text-green-600">Requests per minute</div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-yellow-700">Error Rate</div>
            <div className="text-2xl font-bold text-yellow-600">0.02%</div>
            <div className="text-sm text-yellow-600">Last 24 hours</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-purple-700">Active Users</div>
            <div className="text-2xl font-bold text-purple-600">24</div>
            <div className="text-sm text-purple-600">Currently online</div>
          </div>
        </div>
      </div>

      {/* System Maintenance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Maintenance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium text-gray-900">Clear Cache</div>
            <div className="text-sm text-gray-500">Clear system cache to improve performance</div>
          </button>

          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium text-gray-900">Optimize Database</div>
            <div className="text-sm text-gray-500">Optimize database for better performance</div>
          </button>

          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium text-gray-900">Update System</div>
            <div className="text-sm text-gray-500">Check for and install system updates</div>
          </button>

          <button className="p-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-left">
            <div className="font-medium text-red-900">Restart System</div>
            <div className="text-sm text-red-600">Restart the application server</div>
          </button>
        </div>
      </div>
    </div>
  );
}