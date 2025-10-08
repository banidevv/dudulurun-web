'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as XLSX from 'xlsx';
import { encrypt } from '@/lib/encryption';

interface  Registration {
  id: number;
  name: string;
  email: string;
  phone: string;
  category: string;
  packageType: string | null;
  shirtSize: string | null;
  ticketUsed: boolean;
  createdAt: string;
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
    createdAt: string;
    updatedAt: string;
  } | null;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function RegistrationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
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
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

  // CRUD states
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRegistration, setDeletingRegistration] = useState<Registration | null>(null);
  const [selectedRegistrations, setSelectedRegistrations] = useState<number[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(category && { category }),
        ...(status && { status }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/registrations?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }

      const data = await response.json();
      setRegistrations(data.registrations);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [pagination.page, search, category, status, sortBy, sortOrder]);

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

  const generateETicketUrl = (registrationId: number) => {
    const encryptedId = encrypt(registrationId.toString());
    return `${process.env.NEXT_PUBLIC_BASE_URL}/qr-code/${encodeURIComponent(encryptedId)}`;
  };

  const copyETicketLink = async (registrationId: number) => {
    console.log('Copying e-ticket link for registration:', registrationId);
    try {
      const url = generateETicketUrl(registrationId);
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
      alert('E-ticket link copied to clipboard!');
    } catch (err) {
      console.log('Failed to copy e-ticket link:', err);
      alert('Failed to copy e-ticket link');
    }
  };

  // CRUD Functions
  const handleEdit = (registration: Registration) => {
    setEditingRegistration(registration);
    setShowEditModal(true);
  };

  const handleDelete = (registration: Registration) => {
    setDeletingRegistration(registration);
    setShowDeleteModal(true);
  };

  const handleUpdateRegistration = async (updatedData: Partial<Registration>) => {
    if (!editingRegistration) return;

    try {
      const response = await fetch('/api/admin/registrations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingRegistration.id,
          ...updatedData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update registration');
      }

      await fetchRegistrations();
      setShowEditModal(false);
      setEditingRegistration(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update registration');
    }
  };

  const handleDeleteRegistration = async () => {
    if (!deletingRegistration) return;

    try {
      const response = await fetch(`/api/admin/registrations?id=${deletingRegistration.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete registration');
      }

      await fetchRegistrations();
      setShowDeleteModal(false);
      setDeletingRegistration(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete registration');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRegistrations.length === 0) return;

    try {
      for (const id of selectedRegistrations) {
        const response = await fetch(`/api/admin/registrations?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete registration ${id}`);
        }
      }

      await fetchRegistrations();
      setSelectedRegistrations([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete registrations');
    }
  };

  const handleSelectAll = () => {
    if (selectedRegistrations.length === registrations.length) {
      setSelectedRegistrations([]);
    } else {
      setSelectedRegistrations(registrations.map(reg => reg.id));
    }
  };

  const handleSelectRegistration = (id: number) => {
    setSelectedRegistrations(prev =>
      prev.includes(id)
        ? prev.filter(regId => regId !== id)
        : [...prev, id]
    );
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      setExportLoading(true);
      const queryParams = new URLSearchParams({
        format,
        ...(search && { search }),
        ...(category && { category }),
        ...(status && { status }),
      });

      if (format === 'csv') {
        const response = await fetch(`/api/admin/registrations/export?${queryParams}`);
        if (!response.ok) throw new Error('Failed to export data');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const response = await fetch(`/api/admin/registrations/export?${queryParams}`);
        if (!response.ok) throw new Error('Failed to export data');

        const data = await response.json();
        const ws = XLSX.utils.json_to_sheet(data.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
        XLSX.writeFile(wb, data.filename);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dudulurun-teal">Registrations</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={exportLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {exportLoading ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={exportLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {exportLoading ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dudulurun-blue text-dudulurun-teal"
            >
              <option value="">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="expired">Expired</option>
              <option value="failed">Failed</option>
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
      {selectedRegistrations.length > 0 && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-yellow-800">
              {selectedRegistrations.length} registration(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedRegistrations([])}
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
                    checked={selectedRegistrations.length === registrations.length && registrations.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-dudulurun-blue focus:ring-dudulurun-blue"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dudulurun-blue uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dudulurun-blue uppercase tracking-wider">
                  Contact
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
                  E-ticket Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dudulurun-blue uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dudulurun-blue uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dudulurun-blue uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    No registrations found
                  </td>
                </tr>
              ) : (
                registrations.map((registration) => (
                  <tr key={registration.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRegistrations.includes(registration.id)}
                        onChange={() => handleSelectRegistration(registration.id)}
                        className="rounded border-gray-300 text-dudulurun-blue focus:ring-dudulurun-blue"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-dudulurun-teal">
                        {registration.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dudulurun-teal">{registration.email}</div>
                      <div className="text-sm text-dudulurun-blue">{registration.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dudulurun-teal">{registration.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {registration.category === 'family' && registration.familyPackageData ? (
                        <div className="text-sm text-dudulurun-teal">
                          <div className="font-medium">Family Package</div>
                          <div className="text-xs text-dudulurun-blue mt-1">
                            <div>Parent: {registration.familyPackageData.parentPackageType}
                              {registration.familyPackageData.parentShirtSizes &&
                                ` (${registration.familyPackageData.parentShirtSizes})`}
                            </div>
                            <div>Child: {registration.familyPackageData.childPackageType}
                              {registration.familyPackageData.childShirtSizes &&
                                ` (${registration.familyPackageData.childShirtSizes})`}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm text-dudulurun-teal">{registration.packageType || '-'}</div>
                          {registration.shirtSize && (
                            <div className="text-sm text-dudulurun-blue">Size: {registration.shirtSize}</div>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${registration.payment?.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : registration.payment?.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {registration.payment?.status || 'No Payment'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {registration.payment?.status === 'paid' ? (
                        <button
                          onClick={() => copyETicketLink(registration.id)}
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                          title="Copy E-ticket Link"
                        >
                          Copy E-ticket
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dudulurun-teal">
                        {registration.payment
                          ? formatCurrency(registration.payment.amount)
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dudulurun-teal">
                        {formatDate(registration.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(registration)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(registration)}
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
        {!loading && !error && registrations.length > 0 && (
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
      {showEditModal && editingRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-dudulurun-teal mb-4">Edit Registration</h2>
            <EditRegistrationForm
              registration={editingRegistration}
              onSave={handleUpdateRegistration}
              onCancel={() => {
                setShowEditModal(false);
                setEditingRegistration(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Delete Registration</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the registration for <strong>{deletingRegistration.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingRegistration(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRegistration}
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

// Edit Registration Form Component
function EditRegistrationForm({
  registration,
  onSave,
  onCancel
}: {
  registration: Registration;
  onSave: (data: Partial<Registration>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: registration.name,
    email: registration.email,
    phone: registration.phone,
    category: registration.category,
    packageType: registration.packageType || '',
    shirtSize: registration.shirtSize || '',
    parentShirtSizes: registration.familyPackageData?.parentShirtSizes || '',
    childShirtSizes: registration.familyPackageData?.childShirtSizes || '',
  });

  // Clear packageType when category changes away from fun-run
  useEffect(() => {
    if (formData.category !== 'fun-run') {
      setFormData(prev => ({ ...prev, packageType: '' }));
    }
  }, [formData.category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare the data to save
    const dataToSave: any = { ...formData };

    // If it's a family category, we need to handle family package data
    if (formData.category === 'family') {
      // Create or update family package data
      const familyPackageData = {
        parentPackageType: registration.familyPackageData?.parentPackageType || '',
        childPackageType: registration.familyPackageData?.childPackageType || '',
        parentCount: registration.familyPackageData?.parentCount || 0,
        childCount: registration.familyPackageData?.childCount || 0,
        parentShirtSizes: formData.parentShirtSizes,
        childShirtSizes: formData.childShirtSizes,
      };

      // Add family package data to the save data
      dataToSave.familyPackageData = familyPackageData;

      // Remove individual shirt size fields for family category
      delete dataToSave.shirtSize;
    } else {
      // For non-family categories, remove family-specific fields
      delete dataToSave.parentShirtSizes;
      delete dataToSave.childShirtSizes;
      delete dataToSave.familyPackageData;
    }

    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dudulurun-blue"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dudulurun-blue"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dudulurun-blue"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dudulurun-blue"
          required
        >
          <option value="fun-run">Fun Run</option>
          <option value="family">Family Run</option>
        </select>
      </div>

      {formData.category === 'fun-run' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Package Type</label>
          <select
            value={formData.packageType}
            onChange={(e) => setFormData(prev => ({ ...prev, packageType: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dudulurun-blue"
          >
            <option value="">Select Package Type</option>
            <option value="community">Community</option>
            <option value="umum">Umum</option>
          </select>
        </div>
      )}

      {formData.category === 'family' ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Shirt Sizes</label>
            <input
              type="text"
              value={formData.parentShirtSizes}
              onChange={(e) => setFormData(prev => ({ ...prev, parentShirtSizes: e.target.value }))}
              placeholder="e.g., L, XL, M"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dudulurun-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Child Shirt Sizes</label>
            <input
              type="text"
              value={formData.childShirtSizes}
              onChange={(e) => setFormData(prev => ({ ...prev, childShirtSizes: e.target.value }))}
              placeholder="e.g., S, M, L"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dudulurun-blue"
            />
          </div>
        </>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shirt Size</label>
          <input
            type="text"
            value={formData.shirtSize}
            onChange={(e) => setFormData(prev => ({ ...prev, shirtSize: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dudulurun-blue"
          />
        </div>
      )}

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