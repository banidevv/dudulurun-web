'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface Settings {
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  registrationOpen: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    contactEmail: '',
    contactPhone: '',
    whatsappNumber: '',
    registrationOpen: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      const data = await response.json();
      setSettings({
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        whatsappNumber: data.whatsappNumber || '',
        registrationOpen: data.registrationOpen === 'true',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('Failed to fetch settings');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      alert('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (isFetching) {
    return (
      <div className="p-8">
        <div className="text-center">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dudulurun-teal">Settings</h1>
        <p className="text-dudulurun-blue">Manage your application settings</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-dudulurun-blue">
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-dudulurun-teal focus:outline-none focus:ring-1 focus:ring-dudulurun-teal"
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-dudulurun-blue">
                Contact Phone
              </label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={settings.contactPhone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-dudulurun-teal focus:outline-none focus:ring-1 focus:ring-dudulurun-teal"
                placeholder="+62xxx"
              />
            </div>

            <div>
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-dudulurun-blue">
                WhatsApp Number
              </label>
              <input
                type="tel"
                id="whatsappNumber"
                name="whatsappNumber"
                value={settings.whatsappNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-dudulurun-teal focus:outline-none focus:ring-1 focus:ring-dudulurun-teal"
                placeholder="+62xxx"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="registrationOpen"
                name="registrationOpen"
                checked={settings.registrationOpen}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-dudulurun-teal focus:ring-dudulurun-teal"
              />
              <label htmlFor="registrationOpen" className="ml-2 block text-sm text-dudulurun-blue">
                Registration Open
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-dudulurun-teal px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-dudulurun-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dudulurun-teal disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
} 