'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Payment {
  id: string;
  registrationId: string;
  reference: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  registration: {
    name: string;
    email: string;
    category: string;
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/admin/payments');
        if (!response.ok) throw new Error('Failed to fetch payments');
        const data = await response.json();
        setPayments(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'unpaid':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-dudulurun-blue">Payment Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-dudulurun-blue">Date</TableHead>
                <TableHead className="font-semibold text-dudulurun-blue">Reference</TableHead>
                <TableHead className="font-semibold text-dudulurun-blue">Name</TableHead>
                <TableHead className="font-semibold text-dudulurun-blue">Category</TableHead>
                <TableHead className="font-semibold text-dudulurun-blue">Method</TableHead>
                <TableHead className="font-semibold text-dudulurun-blue">Amount</TableHead>
                <TableHead className="font-semibold text-dudulurun-blue">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-dudulurun-blue/60">
                    Belum ada data pembayaran yang tersedia
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-gray-50">
                    <TableCell className="text-foreground">
                      {new Date(payment.createdAt).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-foreground">{payment.reference}</TableCell>
                    <TableCell className="text-foreground font-medium">{payment.registration.name}</TableCell>
                    <TableCell className="text-foreground">{payment.registration.category}</TableCell>
                    <TableCell className="text-foreground">{payment.method}</TableCell>
                    <TableCell className="text-foreground font-medium">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 