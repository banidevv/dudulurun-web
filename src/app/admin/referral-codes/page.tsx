'use client';

import { useState, useEffect } from 'react';

interface ReferralCode {
    id: number;
    code: string;
    name: string;
    description?: string;
    maxClaims: number;
    usedClaims: number;
    isActive: boolean;
    validFrom?: string;
    validUntil?: string;
    createdAt: string;
    updatedAt: string;
    _count: {
        registrations: number;
        usages: number;
    };
}

interface FormData {
    code: string;
    name: string;
    description: string;
    maxClaims: string;
    isActive: boolean;
    validFrom: string;
    validUntil: string;
}

const ReferralCodesPage = () => {
    const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<FormData>({
        code: '',
        name: '',
        description: '',
        maxClaims: '',
        isActive: true,
        validFrom: '',
        validUntil: '',
    });
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReferralCodes();
    }, [currentPage, search]);

    const fetchReferralCodes = async () => {
        try {
            const response = await fetch(`/api/admin/referral-codes?page=${currentPage}&search=${search}`);
            const data = await response.json();

            if (response.ok) {
                setReferralCodes(data.referralCodes);
                setTotalPages(data.pagination.totalPages);
            } else {
                alert(data.error || 'Failed to fetch referral codes');
            }
        } catch (error) {
            console.error('Error fetching referral codes:', error);
            alert('Terjadi kesalahan saat mengambil data');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            description: '',
            maxClaims: '',
            isActive: true,
            validFrom: '',
            validUntil: '',
        });
        setEditingId(null);
    };

    const openModal = (referralCode?: ReferralCode) => {
        if (referralCode) {
            setFormData({
                code: referralCode.code,
                name: referralCode.name,
                description: referralCode.description || '',
                maxClaims: referralCode.maxClaims.toString(),
                isActive: referralCode.isActive,
                validFrom: referralCode.validFrom ? referralCode.validFrom.split('T')[0] : '',
                validUntil: referralCode.validUntil ? referralCode.validUntil.split('T')[0] : '',
            });
            setEditingId(referralCode.id);
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = editingId
                ? `/api/admin/referral-codes/${editingId}`
                : '/api/admin/referral-codes';

            const method = editingId ? 'PUT' : 'POST';

            const payload = {
                code: formData.code,
                name: formData.name,
                description: formData.description || null,
                maxClaims: parseInt(formData.maxClaims),
                isActive: formData.isActive,
                validFrom: formData.validFrom || null,
                validUntil: formData.validUntil || null,
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                alert(editingId ? 'Kode referral berhasil diupdate' : 'Kode referral berhasil dibuat');
                closeModal();
                fetchReferralCodes();
            } else {
                alert(data.error || 'Terjadi kesalahan');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Terjadi kesalahan saat menyimpan data');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus kode referral ini?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/referral-codes/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                alert('Kode referral berhasil dihapus');
                fetchReferralCodes();
            } else {
                alert(data.error || 'Terjadi kesalahan saat menghapus');
            }
        } catch (error) {
            console.error('Error deleting referral code:', error);
            alert('Terjadi kesalahan saat menghapus');
        }
    };



    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Kode Referral Community</h1>
                <p className="text-gray-600">Kelola kode referral untuk akses harga community IDR 195,000 (Fun Run 5K)</p>

                {/* Info Box */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Sistem Harga Community</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Semua kode referral berlaku untuk semua kategori</strong></li>
                                    <li><strong>Fun Run 5K Community:</strong> IDR 195,000 (dengan kode referral valid)</li>
                                    <li><strong>Fun Run 5K General:</strong> IDR 225,000 (tanpa kode referral)</li>
                                    <li><strong>Family Run 2.5K:</strong> IDR 315,000 (dapat menggunakan kode referral)</li>
                                    <li><strong>Benefit utama:</strong> Hemat IDR 30,000 untuk Fun Run 5K</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Cari kode referral..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        onClick={() => fetchReferralCodes()}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                        Cari
                    </button>
                </div>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Tambah Kode Community
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kode
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nama
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Klaim
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Berlaku Sampai
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {referralCodes.map((code) => (
                            <tr key={code.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{code.code}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-900">{code.name}</div>
                                    {code.description && (
                                        <div className="text-sm text-gray-500">{code.description}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {code.usedClaims}/{code.maxClaims}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {Math.round((code.usedClaims / code.maxClaims) * 100)}% terpakai
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {code.validUntil ? (
                                        <div className="text-sm text-gray-900">
                                            {formatDate(code.validUntil)}
                                        </div>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Tidak Ada Batas
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${code.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {code.isActive ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => openModal(code)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(code.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {referralCodes.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-lg">Belum ada kode referral community</p>
                        <p className="text-gray-400 text-sm mt-2">Tambahkan kode pertama untuk memberikan akses harga community</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="flex space-x-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 rounded ${currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
                        <h2 className="text-xl font-bold mb-4">
                            {editingId ? 'Edit Kode Referral Community' : 'Tambah Kode Referral Community'}
                        </h2>

                        {/* Info dalam modal */}
                        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Catatan:</strong> Kode referral berlaku untuk semua kategori dan memberikan akses ke harga community IDR 195,000 untuk Fun Run 5K
                                (hemat IDR 30,000 dari harga general IDR 225,000).
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kode Referral *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        placeholder="KODE123"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        placeholder="Nama referral code"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Deskripsi kode referral"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Maksimal Klaim *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.maxClaims}
                                        onChange={(e) => setFormData(prev => ({ ...prev, maxClaims: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        min="1"
                                        placeholder="100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.isActive ? 'true' : 'false'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="true">Aktif</option>
                                        <option value="false">Nonaktif</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Berlaku Dari
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.validFrom}
                                        onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Berlaku Sampai
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.validUntil}
                                        onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Informasi Harga Community */}
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="text-sm font-medium text-green-800 mb-2">Benefit Harga Community</h4>
                                <div className="text-sm text-green-700 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Harga General Fun Run 5K:</span>
                                        <span className="font-medium">IDR 225,000</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Harga Community Fun Run 5K:</span>
                                        <span className="font-medium text-green-600">IDR 195,000</span>
                                    </div>
                                    <div className="flex justify-between border-t border-green-300 pt-1">
                                        <span>Penghematan:</span>
                                        <span className="font-bold text-green-600">IDR 30,000</span>
                                    </div>
                                </div>
                            </div>

                            {/* Informasi Universal */}
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-800 mb-2">Berlaku untuk Semua Kategori</h4>
                                <div className="text-sm text-blue-700 space-y-1">
                                    <div className="flex items-center">
                                        <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span><strong>Fun Run 5K:</strong> Akses harga community IDR 195,000</span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span><strong>Family Run 2.5K:</strong> Tetap IDR 315,000 (dapat menggunakan kode)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={submitting}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Menyimpan...' : (editingId ? 'Update' : 'Simpan')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferralCodesPage;
