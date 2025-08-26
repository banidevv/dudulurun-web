'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface WhatsAppSession {
    id: number;
    name: string;
    sessionId: string;
    phoneNumber: string;
    isActive: boolean;
    isDefault: boolean;
    description?: string;
    createdAt: string;
    updatedAt: string;
    connected?: boolean;
}

interface SessionFormData {
    name: string;
    sessionId: string;
    phoneNumber: string;
    isActive: boolean;
    isDefault: boolean;
    description: string;
}

export default function WhatsAppSessionsPage() {
    const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingSession, setEditingSession] = useState<WhatsAppSession | null>(null);
    const [showQRCode, setShowQRCode] = useState<string | null>(null);
    const [qrCodeData, setQRCodeData] = useState<{ qrCode: string; sessionId: string } | null>(null);
    const [isLoadingQR, setIsLoadingQR] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [formData, setFormData] = useState<SessionFormData>({
        name: '',
        sessionId: '',
        phoneNumber: '',
        isActive: true,
        isDefault: false,
        description: '',
    });

    // useEffect(() => {
    //     fetchSessions();

    //     // Auto-refresh sessions every 10 seconds to update connection status
    //     const interval = setInterval(fetchSessions, 10000);

    //     return () => clearInterval(interval);
    // }, []);

    const fetchSessions = async () => {
        try {
            const response = await fetch('/api/admin/whatsapp-sessions');
            if (!response.ok) {
                throw new Error('Failed to fetch sessions');
            }
            const data = await response.json();
            setSessions(data.sessions);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching sessions:', error);
            alert('Failed to fetch WhatsApp sessions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = '/api/admin/whatsapp-sessions';
            const method = editingSession ? 'PUT' : 'POST';
            // Always set isDefault to true since we only allow one session
            const body = editingSession
                ? { ...formData, id: editingSession.id, isDefault: true }
                : { ...formData, isDefault: true };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save session');
            }

            if (editingSession) {
                alert('Session updated successfully');
            } else {
                alert('Session created successfully');
                // For new sessions, automatically show QR code if not connected
                const newSessionData = await response.json();
                if (newSessionData.session && !newSessionData.session.connected) {
                    setTimeout(() => {
                        handleGetQRCode(formData.sessionId);
                    }, 1000);
                }
            }
            resetForm();
            fetchSessions();
        } catch (error: any) {
            console.error('Error saving session:', error);
            alert(error.message || 'Failed to save session');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (session: WhatsAppSession) => {
        setEditingSession(session);
        setFormData({
            name: session.name,
            sessionId: session.sessionId,
            phoneNumber: session.phoneNumber,
            isActive: session.isActive,
            isDefault: session.isDefault,
            description: session.description || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (sessionId: number) => {
        if (!confirm('Are you sure you want to delete this session?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/whatsapp-sessions?id=${sessionId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete session');
            }

            alert('Session deleted successfully');
            fetchSessions();
        } catch (error: any) {
            console.error('Error deleting session:', error);
            alert(error.message || 'Failed to delete session');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            sessionId: '',
            phoneNumber: '',
            isActive: true,
            isDefault: false,
            description: '',
        });
        setEditingSession(null);
        setShowForm(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleGetQRCode = async (sessionId: string) => {
        setIsLoadingQR(true);
        try {
            const response = await fetch(`/api/admin/whatsapp-sessions?sessionId=${sessionId}&qrcode=true`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get QR code');
            }
            const data = await response.json();
            console.log("whatsapp-sessions", data);

            if (data.connected) {
                alert(data.message || 'Session sudah terhubung. QR code tidak diperlukan.');
                // Refresh sessions to update UI
                fetchSessions();
            } else if (data.qrCode) {
                setQRCodeData({ qrCode: data.qrCode, sessionId });
                setShowQRCode(sessionId);
            } else {
                // Provide more helpful error message
                const message = data.message || 'QR code tidak dapat dibuat. Ini mungkin karena:\n\n' +
                    '• Session WhatsApp sedang dalam proses inisialisasi\n' +
                    '• Koneksi ke WhatsApp server bermasalah\n' +
                    '• Session sudah aktif di perangkat lain\n\n' +
                    'Silakan tunggu beberapa detik dan coba lagi.';
                alert(message);
            }
        } catch (error: any) {
            console.error('Error getting QR code:', error);
            alert(error.message || 'Gagal mendapatkan QR code');
        } finally {
            setIsLoadingQR(false);
        }
    };

    const closeQRCodeModal = () => {
        setShowQRCode(null);
        setQRCodeData(null);
        // Refresh sessions to update connection status
        fetchSessions();
    };

    // Auto-check connection status when QR modal is open
    useEffect(() => {
        if (!showQRCode || !qrCodeData) return;

        const checkConnection = async () => {
            try {
                const response = await fetch(`/api/admin/whatsapp-sessions?sessionId=${qrCodeData.sessionId}&qrcode=true`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.connected) {
                        alert('WhatsApp berhasil terhubung!');
                        closeQRCodeModal();
                    }
                }
            } catch (error) {
                console.error('Error checking connection:', error);
            }
        };

        // Check connection every 3 seconds while QR modal is open
        const interval = setInterval(checkConnection, 3000);

        return () => clearInterval(interval);
    }, [showQRCode, qrCodeData]);

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading WhatsApp sessions...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-dudulurun-blue">WhatsApp Sessions Management</h1>
                    <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-600">Hanya 1 WhatsApp session yang dapat aktif dalam sistem</p>
                        {lastUpdate && (
                            <span className="text-xs text-gray-500">
                                Terakhir update: {lastUpdate.toLocaleTimeString('id-ID')}
                            </span>
                        )}
                    </div>
                </div>
                {sessions.length === 0 && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-dudulurun-teal text-white px-4 py-2 rounded-md hover:bg-dudulurun-blue transition-colors"
                    >
                        Add WhatsApp Session
                    </button>
                )}
            </div>

            {/* Session Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-dudulurun-blue">
                            {editingSession ? 'Edit WhatsApp Session' : 'Tambah WhatsApp Session'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-dudulurun-blue">
                                    Nama Session *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-dudulurun-teal focus:outline-none focus:ring-1 focus:ring-dudulurun-teal"
                                    placeholder="contoh: DUDULURUN WhatsApp"
                                />
                            </div>

                            <div>
                                <label htmlFor="sessionId" className="block text-sm font-medium text-dudulurun-blue">
                                    Session ID *
                                </label>
                                <input
                                    type="text"
                                    id="sessionId"
                                    name="sessionId"
                                    value={formData.sessionId}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-dudulurun-teal focus:outline-none focus:ring-1 focus:ring-dudulurun-teal"
                                    placeholder="e.g., customer_support, marketing"
                                    pattern="[a-z0-9_]+"
                                    title="Session ID should contain only lowercase letters, numbers, and underscores"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Use lowercase letters, numbers, and underscores only. This will be used to identify the WhatsApp session.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-dudulurun-blue">
                                    Nomor WhatsApp *
                                </label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-dudulurun-teal focus:outline-none focus:ring-1 focus:ring-dudulurun-teal"
                                    placeholder="628123456789"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Masukkan nomor WhatsApp dengan format 628xxxxxxxxx (tanpa tanda +)
                                </p>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-dudulurun-blue">
                                    Deskripsi
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-dudulurun-teal focus:outline-none focus:ring-1 focus:ring-dudulurun-teal"
                                    placeholder="Deskripsi opsional untuk session ini"
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-dudulurun-teal focus:ring-dudulurun-teal"
                                    />
                                    <label htmlFor="isActive" className="ml-2 block text-sm text-dudulurun-blue">
                                        Aktif
                                    </label>
                                </div>
                            </div>

                            {/* Hidden field to always set as default since we only allow one session */}
                            <input type="hidden" name="isDefault" value="true" />

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-dudulurun-teal rounded-md hover:bg-dudulurun-blue transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : editingSession ? 'Update' : 'Buat Session'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {showQRCode && qrCodeData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-dudulurun-blue text-center">
                            Hubungkan WhatsApp
                        </h2>
                        <div className="flex flex-col items-center space-y-4">
                            <div className="bg-white p-4 rounded-lg border-2 border-dudulurun-teal/20">
                                <img
                                    src={`data:image/png;base64,${qrCodeData.qrCode}`}
                                    alt="WhatsApp QR Code"
                                    className="w-64 h-64"
                                />
                            </div>

                            {/* Status indicator */}
                            <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span>Menunggu scan QR code...</span>
                            </div>

                            <div className="text-sm text-gray-600 text-center space-y-2">
                                <div className="font-medium text-dudulurun-blue mb-2">Cara menghubungkan:</div>
                                <div className="text-left space-y-1">
                                    <p>1. Buka WhatsApp di ponsel Anda</p>
                                    <p>2. Pilih Menu → Linked Devices</p>
                                    <p>3. Tap "Link a Device"</p>
                                    <p>4. Scan QR code di atas</p>
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4 w-full">
                                <button
                                    onClick={closeQRCodeModal}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={() => handleGetQRCode(qrCodeData.sessionId)}
                                    disabled={isLoadingQR}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-dudulurun-teal rounded-md hover:bg-dudulurun-blue transition-colors disabled:opacity-50"
                                >
                                    {isLoadingQR ? 'Memuat...' : 'QR Baru'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sessions List */}
            <div className="grid gap-4">
                {sessions.length === 0 ? (
                    <Card className="p-6 text-center">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-dudulurun-teal/10 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-dudulurun-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-dudulurun-blue mb-2">Belum ada WhatsApp Session</h3>
                                <p className="text-gray-500">Buat WhatsApp session pertama untuk mulai mengirim pesan otomatis kepada peserta.</p>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {/* Single Session Card */}
                        {sessions.map((session) => (
                            <Card key={session.id} className="p-6 border-2 border-dudulurun-teal/20">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <h3 className="text-xl font-bold text-dudulurun-blue">{session.name}</h3>
                                            <span className="px-3 py-1 text-xs bg-dudulurun-teal text-white rounded-full font-medium">
                                                Primary Session
                                            </span>
                                            {session.connected !== undefined && (
                                                <span className={`px-3 py-1 text-xs text-white rounded-full font-medium ${session.connected ? 'bg-green-500' : 'bg-red-500'
                                                    }`}>
                                                    {session.connected ? '✓ Terhubung' : '✗ Terputus'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Session ID</p>
                                                <p className="font-medium text-dudulurun-blue">{session.sessionId}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Nomor WhatsApp</p>
                                                <p className="font-medium text-dudulurun-blue">{session.phoneNumber}</p>
                                            </div>
                                            {session.description && (
                                                <div className="col-span-2">
                                                    <p className="text-gray-500">Deskripsi</p>
                                                    <p className="font-medium text-dudulurun-blue">{session.description}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-gray-500">Dibuat</p>
                                                <p className="font-medium text-dudulurun-blue">{new Date(session.createdAt).toLocaleDateString('id-ID')}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Status</p>
                                                <p className={`font-medium ${session.isActive ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {session.isActive ? 'Aktif' : 'Nonaktif'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-3 ml-6">
                                        <button
                                            onClick={() => handleEdit(session)}
                                            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
                                        >
                                            Edit Session
                                        </button>
                                        {session.isActive && !session.connected && (
                                            <button
                                                onClick={() => handleGetQRCode(session.sessionId)}
                                                disabled={isLoadingQR}
                                                className="px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 font-medium"
                                            >
                                                {isLoadingQR ? 'Memuat...' : 'Hubungkan WhatsApp'}
                                            </button>
                                        )}
                                        {session.connected && (
                                            <div className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-md text-center font-medium">
                                                WhatsApp Siap
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleDelete(session.id)}
                                            className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
                                        >
                                            Hapus Session
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        {/* Info Card */}
                        <Card className="p-4 bg-blue-50 border-blue-200">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium text-blue-800 mb-1">Informasi Penting</p>
                                    <p className="text-blue-700">
                                        Sistem hanya mendukung 1 WhatsApp session aktif. Jika ingin menggunakan nomor WhatsApp yang berbeda,
                                        hapus session yang ada dan buat session baru.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
