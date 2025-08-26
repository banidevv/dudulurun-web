'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Scanner from '@/components/Scanner/Scanner';

export default function ScannerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/scanner/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ secretCode }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Authentication failed');
      }

      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dudulurun-cream to-dudulurun-cream/50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <h1 className="text-2xl font-bold text-dudulurun-teal text-center mb-6">
                Scanner Authentication
              </h1>

              <form onSubmit={handleAuthentication} className="space-y-4">
                <div>
                  <label htmlFor="secretCode" className="block text-sm font-medium text-dudulurun-blue mb-2">
                    Secret Code
                  </label>
                  <input
                    type="password"
                    id="secretCode"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    className="w-full px-4 py-2 border border-dudulurun-teal/20 rounded-lg focus:ring-2 focus:ring-dudulurun-teal focus:border-transparent"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-dudulurun-teal text-white py-2 px-4 rounded-lg hover:bg-dudulurun-teal/90 transition-colors"
                >
                  Access Scanner
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Scanner />;
} 