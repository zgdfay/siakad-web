'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface CheckoutData {
  semesterId: string;
  mataKuliah: Array<{
    id: string;
    kode: string;
    nama: string;
    sks: number;
    biaya: number;
  }>;
  totalBiaya: number;
}

export default function PembayaranPage() {
  const router = useRouter();
  const params = useParams();
  const semesterId = params.semesterId as string;
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ambil dari session storage
    const saved = sessionStorage.getItem('checkoutData');
    if (saved) {
      setCheckoutData(JSON.parse(saved));
    } else {
      toast.error('Data tidak ditemukan', {
        description: 'Silakan mulai dari awal',
      });
      router.push(`/mahasiswa/pendaftaran/${semesterId}/mata-kuliah`);
    }
  }, [semesterId, router]);

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error('Pilih metode pembayaran', {
        description: 'Silakan pilih metode pembayaran terlebih dahulu',
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Integrasi dengan payment gateway (Midtrans/Xendit)
      // Simulasi pembayaran
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.success('Pembayaran berhasil!', {
        description: 'Pendaftaran Anda sedang diproses',
      });
      
      // Simpan status pembayaran
      sessionStorage.setItem('paymentStatus', JSON.stringify({
        status: 'paid',
        paymentMethod,
        tanggal: new Date().toISOString(),
      }));
      
      // Redirect ke riwayat atau dashboard
      router.push('/mahasiswa/riwayat');
    } catch (error) {
      toast.error('Pembayaran gagal', {
        description: 'Terjadi kesalahan saat memproses pembayaran',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!checkoutData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Pembayaran
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Selesaikan pembayaran untuk menyelesaikan pendaftaran
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Method */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Metode Pembayaran</CardTitle>
                <CardDescription>
                  Pilih metode pembayaran yang Anda inginkan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="midtrans">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-credit-card"></i>
                        <span>Kartu Kredit/Debit (Midtrans)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="xendit">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-wallet"></i>
                        <span>E-Wallet (Xendit)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="bank_transfer">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-building-columns"></i>
                        <span>Transfer Bank</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {paymentMethod && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {paymentMethod === 'midtrans' && (
                        <>Pembayaran akan dilakukan melalui Midtrans. Anda akan diarahkan ke halaman pembayaran yang aman.</>
                      )}
                      {paymentMethod === 'xendit' && (
                        <>Pembayaran akan dilakukan melalui Xendit. Pilih e-wallet yang Anda inginkan.</>
                      )}
                      {paymentMethod === 'bank_transfer' && (
                        <>Transfer ke rekening yang tertera. Upload bukti transfer setelah pembayaran.</>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detail Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Mata Kuliah</span>
                  <span className="font-medium">{checkoutData.mataKuliah.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total SKS</span>
                  <span className="font-medium">
                    {checkoutData.mataKuliah.reduce((sum, mk) => sum + mk.sks, 0)} SKS
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Pembayaran</span>
                    <span className="text-xl font-bold text-primary">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      }).format(checkoutData.totalBiaya)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Lanjutkan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handlePayment}
                  disabled={loading || !paymentMethod}
                  className="w-full"
                  size="lg">
                  {loading ? 'Memproses...' : 'Bayar Sekarang'}
                </Button>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="w-full">
                  Kembali
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

