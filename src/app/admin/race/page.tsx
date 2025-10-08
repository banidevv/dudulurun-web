'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Race {
    id: number;
    racePackPhotoUrl: string;
    checkedIn: boolean;
    createdAt: string;
    updatedAt: string;
    registration: {
        id: number;
        name: string;
        email: string;
        phone: string;
        category: string;
        packageType: string | null;
        shirtSize: string | null;
        familyPackageData: {
            parentPackageType: string;
            childPackageType: string;
            parentCount: number;
            childCount: number;
            parentShirtSizes?: string;
            childShirtSizes?: string;
        } | null;
        payment: {
            status: string;
            amount: number;
            merchantRef: string;
        } | null;
    };
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function RacePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [races, setRaces] = useState<Race[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [checkedInFilter, setCheckedInFilter] = useState(searchParams.get('checkedIn') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
    const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

    // CRUD states
    const [editingRace, setEditingRace] = useState<Race | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingRace, setDeletingRace] = useState<Race | null>(null);
    const [selectedRaces, setSelectedRaces] = useState<number[]>([]);

    const fetchRaces = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(search && { search }),
                ...(category && { category }),
                ...(checkedInFilter && { checkedIn: checkedInFilter }),
                sortBy,
                sortOrder,
            });

            const response = await fetch(`/api/admin/race?${queryParams}`);
            if (!response.ok) {
                throw new Error('Failed to fetch race data');
            }

            const data = await response.json();
            setRaces(data.races);
            setPagination(data.pagination);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch race data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRaces();
    }, [pagination.page, search, category, checkedInFilter, sortBy, sortOrder]);

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // CRUD Functions
    const handleEdit = (race: Race) => {
        setEditingRace(race);
        setShowEditModal(true);
    };

    const handleDelete = (race: Race) => {
        setDeletingRace(race);
        setShowDeleteModal(true);
    };

    const handleUpdateRace = async (updatedData: Partial<Race>) => {
        if (!editingRace) return;

        try {
            const response = await fetch('/api/admin/race', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editingRace.id,
                    ...updatedData,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update race data');
            }

            await fetchRaces();
            setShowEditModal(false);
            setEditingRace(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update race data');
        }
    };

    const handleDeleteRace = async () => {
        if (!deletingRace) return;

        try {
            const response = await fetch(`/api/admin/race?id=${deletingRace.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete race data');
            }

            await fetchRaces();
            setShowDeleteModal(false);
            setDeletingRace(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete race data');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRaces.length === 0) return;

        try {
            for (const id of selectedRaces) {
                const response = await fetch(`/api/admin/race?id=${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`Failed to delete race ${id}`);
                }
            }

            await fetchRaces();
            setSelectedRaces([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete race data');
        }
    };

    const handleSelectAll = () => {
        if (selectedRaces.length === races.length) {
            setSelectedRaces([]);
        } else {
            setSelectedRaces(races.map(race => race.id));
        }
    };

    const handleSelectRace = (id: number) => {
        setSelectedRaces(prev =>
            prev.includes(id)
                ? prev.filter(raceId => raceId !== id)
                : [...prev, id]
        );
    };

    const handleToggleCheckIn = async (raceId: number, checkedIn: boolean) => {
        try {
            const response = await fetch('/api/admin/race', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: raceId,
                    checkedIn: !checkedIn,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update check-in status');
            }

            await fetchRaces();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update check-in status');
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-dudulurun-teal">Race Management</h1>
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white rounded-lg shadow p-4">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Search name, email, or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dudulurun-blue text-dudulurun-teal"
                        />
                    </div>
                    <div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dudulurun-blue text-dudulurun-teal"
                        >
                            <option value="">All Categories</option>
                            <option value="fun-run">Fun Run</option>
                            <option value="fun-run-medali">Fun Run + Medali</option>
                            <option value="family-challenge">Family Challenge</option>
                            <option value="family-challenge-plus">Family Challenge Plus</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={checkedInFilter}
                            onChange={(e) => setCheckedInFilter(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dudulurun-blue text-dudulurun-teal"
                        >
                            <option value="">All Check-in Status</option>
                            <option value="true">Checked In</option>
                            <option value="false">Not Checked In</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('-');
                                setSortBy(field);
                                setSortOrder(order);
                            }}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dudulurun-blue text-dudulurun-teal"
                        >
                            <option value="createdAt-desc">Newest First</option>
                            <option value="createdAt-asc">Oldest First</option>
                            <option value="registration.name-asc">Name A-Z</option>
                            <option value="registration.name-desc">Name Z-A</option>
                        </select>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-dudulurun-blue text-white rounded-lg hover:bg-dudulurun-blue-dark"
                        >
                            Apply Filters
                        </button>
                    </div>
                </form>
            </div>

            {/* Bulk Actions */}
            {selectedRaces.length > 0 && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-yellow-800">
                            {selectedRaces.length} race entry(s) selected
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={handleBulkDelete}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                                Delete Selected
                            </button>
                            <button
                                onClick={() => setSelectedRaces([])}
                                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-dudulurun-blue uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={selectedRaces.length === races.length && races.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-dudulurun-blue focus:ring-dudulurun-blue"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-dudulurun-blue uppercase tracking-wider">
                                    Race Pack Photo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-dudulurun-blue uppercase tracking-wider">
                                    Participant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-dudulurun-blue uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-dudulurun-blue uppercase tracking-wider">
                                    Package
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-dudulurun-blue uppercase tracking-wider">
                                    Payment Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-dudulurun-blue uppercase tracking-wider">
                                    Check-in Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-dudulurun-blue uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-dudulurun-blue uppercase tracking-wider">
                                    Created Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-dudulurun-blue uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-4 text-center">
                                        Loading...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-4 text-center text-red-500">
                                        {error}
                                    </td>
                                </tr>
                            ) : races.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-4 text-center">
                                        No race entries found
                                    </td>
                                </tr>
                            ) : (
                                races.map((race) => (
                                    <tr key={race.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedRaces.includes(race.id)}
                                                onChange={() => handleSelectRace(race.id)}
                                                className="rounded border-gray-300 text-dudulurun-blue focus:ring-dudulurun-blue"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {race.racePackPhotoUrl ? (
                                                <img
                                                    src={race.racePackPhotoUrl}
                                                    alt="Race Pack Photo"
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">No Photo</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-dudulurun-teal">
                                                {race.registration.name}
                                            </div>
                                            <div className="text-sm text-dudulurun-blue">{race.registration.email}</div>
                                            <div className="text-sm text-dudulurun-blue">{race.registration.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-dudulurun-teal">{race.registration.category}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {race.registration.category === 'family' && race.registration.familyPackageData ? (
                                                <div className="text-sm text-dudulurun-teal">
                                                    <div className="font-medium">Family Package</div>
                                                    <div className="text-xs text-dudulurun-blue mt-1">
                                                        <div>Parent: {race.registration.familyPackageData.parentPackageType}
                                                            {race.registration.familyPackageData.parentShirtSizes &&
                                                                ` (${race.registration.familyPackageData.parentShirtSizes})`}
                                                        </div>
                                                        <div>Child: {race.registration.familyPackageData.childPackageType}
                                                            {race.registration.familyPackageData.childShirtSizes &&
                                                                ` (${race.registration.familyPackageData.childShirtSizes})`}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-sm text-dudulurun-teal">{race.registration.packageType || '-'}</div>
                                                    {race.registration.shirtSize && (
                                                        <div className="text-sm text-dudulurun-blue">Size: {race.registration.shirtSize}</div>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${race.registration.payment?.status === 'paid'
                                                ? 'bg-green-100 text-green-800'
                                                : race.registration.payment?.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {race.registration.payment?.status || 'No Payment'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleCheckIn(race.id, race.checkedIn)}
                                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${race.checkedIn
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {race.checkedIn ? 'Checked In' : 'Not Checked In'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-dudulurun-teal">
                                                {race.registration.payment
                                                    ? formatCurrency(race.registration.payment.amount)
                                                    : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-dudulurun-teal">
                                                {formatDate(race.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(race)}
                                                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(race)}
                                                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && !error && races.length > 0 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                        <div className="flex-1 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-dudulurun-blue">
                                    Showing{' '}
                                    <span className="font-medium text-dudulurun-teal">
                                        {(pagination.page - 1) * pagination.limit + 1}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium text-dudulurun-teal">
                                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium text-dudulurun-teal">{pagination.total}</span>{' '}
                                    results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-dudulurun-blue hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-dudulurun-blue hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && editingRace && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-dudulurun-teal mb-4">Edit Race Entry</h2>
                        <EditRaceForm
                            race={editingRace}
                            onSave={handleUpdateRace}
                            onCancel={() => {
                                setShowEditModal(false);
                                setEditingRace(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && deletingRace && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-red-600 mb-4">Delete Race Entry</h2>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete the race entry for <strong>{deletingRace.registration.name}</strong>?
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletingRace(null);
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteRace}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Edit Race Form Component
function EditRaceForm({
    race,
    onSave,
    onCancel
}: {
    race: Race;
    onSave: (data: Partial<Race>) => void;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState({
        racePackPhotoUrl: race.racePackPhotoUrl,
        checkedIn: race.checkedIn,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Race Pack Photo URL</label>
                <input
                    type="url"
                    value={formData.racePackPhotoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, racePackPhotoUrl: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dudulurun-blue"
                    placeholder="https://example.com/photo.jpg"
                />
            </div>

            <div>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={formData.checkedIn}
                        onChange={(e) => setFormData(prev => ({ ...prev, checkedIn: e.target.checked }))}
                        className="rounded border-gray-300 text-dudulurun-blue focus:ring-dudulurun-blue"
                    />
                    <span className="ml-2 text-sm text-gray-700">Checked In</span>
                </label>
            </div>

            <div className="flex gap-3 justify-end pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-dudulurun-blue text-white rounded hover:bg-dudulurun-blue-dark"
                >
                    Save Changes
                </button>
            </div>
        </form>
    );
}
