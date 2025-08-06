import React, { useState, useEffect } from 'react';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ServerStackIcon,
  CloudIcon,
  KeyIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { SettingsService, SystemSettings, NotificationSettings, SecuritySettings } from '../services/settingsService';
import GeneralSettings from '../components/Settings/GeneralSettings';
import NotificationSettingsComponent from '../components/Settings/NotificationSettings';
import SecuritySettingsComponent from '../components/Settings/SecuritySettings';
import SystemSettingsComponent from '../components/Settings/SystemSettings';
import BackupSettings from '../components/Settings/BackupSettings';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'system' | 'backup'>('general');
  const [loading, setLoading] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const { hasPermission } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [system, notifications, security] = await Promise.all([
        SettingsService.getSystemSettings(),
        SettingsService.getNotificationSettings(),
        SettingsService.getSecuritySettings()
      ]);
      
      setSystemSettings(system);
      setNotificationSettings(notifications);
      setSecuritySettings(security);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystemSettings = async (data: SystemSettings) => {
    try {
      setSaveStatus('saving');
      const updatedSettings = await SettingsService.updateSystemSettings(data);
      setSystemSettings(updatedSettings);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save system settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleSaveNotificationSettings = async (data: NotificationSettings) => {
    try {
      setSaveStatus('saving');
      const updatedSettings = await SettingsService.updateNotificationSettings(data);
      setNotificationSettings(updatedSettings);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleSaveSecuritySettings = async (data: SecuritySettings) => {
    try {
      setSaveStatus('saving');
      const updatedSettings = await SettingsService.updateSecuritySettings(data);
      setSecuritySettings(updatedSettings);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save security settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleBackupDatabase = async () => {
    try {
      setLoading(true);
      await SettingsService.createBackup();
      alert('Database backup created successfully!');
    } catch (error) {
      console.error('Failed to create backup:', error);
      alert('Failed to create backup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreDatabase = async (backupId: string) => {
    if (window.confirm('Are you sure you want to restore from this backup? This will overwrite current data.')) {
      try {
        setLoading(true);
        await SettingsService.restoreBackup(backupId);
        alert('Database restored successfully!');
        window.location.reload();
      } catch (error) {
        console.error('Failed to restore backup:', error);
        alert('Failed to restore backup. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: CogIcon, permission: 'settings' },
    { id: 'notifications', label: 'Notifications', icon: BellIcon, permission: 'settings' },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon, permission: 'security' },
    { id: 'system', label: 'System', icon: ServerStackIcon, permission: 'system' },
    { id: 'backup', label: 'Backup & Restore', icon: CloudIcon, permission: 'backup' }
  ];

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'saved':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Settings saved successfully';
      case 'error':
        return 'Failed to save settings';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage system configuration and preferences</p>
        </div>
        {saveStatus !== 'idle' && (
          <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
            {getSaveStatusIcon()}
            <span className={`text-sm font-medium ${
              saveStatus === 'saved' ? 'text-green-600' :
              saveStatus === 'error' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {getSaveStatusText()}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            hasPermission(tab.permission, 'read') && (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            )
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && systemSettings && (
        <GeneralSettings
          settings={systemSettings}
          onSave={handleSaveSystemSettings}
          loading={loading}
        />
      )}

      {activeTab === 'notifications' && notificationSettings && (
        <NotificationSettingsComponent
          settings={notificationSettings}
          onSave={handleSaveNotificationSettings}
          loading={loading}
        />
      )}

      {activeTab === 'security' && securitySettings && (
        <SecuritySettingsComponent
          settings={securitySettings}
          onSave={handleSaveSecuritySettings}
          loading={loading}
        />
      )}

      {activeTab === 'system' && systemSettings && (
        <SystemSettingsComponent
          settings={systemSettings}
          onSave={handleSaveSystemSettings}
          loading={loading}
        />
      )}

      {activeTab === 'backup' && (
        <BackupSettings
          onBackup={handleBackupDatabase}
          onRestore={handleRestoreDatabase}
          loading={loading}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Loading settings...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}