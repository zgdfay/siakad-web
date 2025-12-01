'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CheckoutData {
  pendaftaranId?: string;
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
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Ambil dari session storage
    const saved = sessionStorage.getItem('checkoutData');
    const pendaftaranId = sessionStorage.getItem('pendaftaranId');
    if (saved) {
      const data = JSON.parse(saved);
      if (pendaftaranId) {
        data.pendaftaranId = pendaftaranId;
      }
      setCheckoutData(data);
    } else {
      toast.error('Data tidak ditemukan', {
        description: 'Silakan mulai dari awal',
      });
      router.push('/mahasiswa/pendaftaran');
    }
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format file tidak didukung', {
        description: 'Gunakan JPG, PNG, atau PDF (maksimal 5MB)',
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Ukuran file terlalu besar', {
        description: 'Maksimal 5MB',
      });
      return;
    }

    setPaymentFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error('Pilih metode pembayaran', {
        description: 'Silakan pilih metode pembayaran terlebih dahulu',
      });
      return;
    }

    // For bank_transfer, file is required
    if (paymentMethod === 'bank_transfer' && !paymentFile) {
      toast.error('Upload bukti pembayaran', {
        description: 'Silakan upload bukti transfer terlebih dahulu',
      });
      return;
    }

    if (!checkoutData?.pendaftaranId) {
      toast.error('Data pendaftaran tidak ditemukan', {
        description: 'Silakan mulai dari awal',
      });
      router.push('/mahasiswa/pendaftaran');
      return;
    }

    setLoading(true);
    try {
      if (paymentMethod === 'bank_transfer' && paymentFile) {
        // Upload bukti pembayaran
        const formData = new FormData();
        formData.append('pendaftaranId', checkoutData.pendaftaranId);
        formData.append('metodePembayaran', paymentMethod);
        formData.append('file', paymentFile);

        const response = await fetch('/api/payment/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal mengupload bukti pembayaran');
        }

        toast.success('Bukti pembayaran berhasil diupload', {
          description: 'Menunggu verifikasi dari admin',
        });
      } else {
        // For other payment methods (midtrans/xendit), you can integrate payment gateway here
        toast.info('Fitur pembayaran online sedang dalam pengembangan', {
          description: 'Silakan gunakan transfer bank untuk saat ini',
        });
        return;
      }

      // Get pendaftaranId from session or response
      const pendaftaranId = sessionStorage.getItem('pendaftaranId');

      // Clear session storage
      sessionStorage.removeItem('checkoutData');
      sessionStorage.removeItem('pendaftaranId');

      // Redirect ke success page
      if (pendaftaranId) {
        router.push(
          `/mahasiswa/pendaftaran/${semesterId}/pembayaran/success?pendaftaranId=${pendaftaranId}`
        );
      } else {
        router.push('/mahasiswa/riwayat');
      }
    } catch (error: any) {
      toast.error('Pembayaran gagal', {
        description:
          error.message || 'Terjadi kesalahan saat memproses pembayaran',
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
                  <SelectTrigger className="w-full">
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

                {paymentMethod === 'bank_transfer' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg border border-primary/20">
                      <p className="text-sm font-medium mb-3 text-foreground">
                        Transfer ke rekening berikut:
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bank:</span>
                          <span className="font-medium text-foreground">
                            Bank BCA
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            No. Rekening:
                          </span>
                          <span className="font-medium text-foreground font-mono">
                            1234567890
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Atas Nama:
                          </span>
                          <span className="font-medium text-foreground">
                            ITB YADIKA PASURUAN
                          </span>
                        </div>
                        <div className="pt-2 mt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            <i className="fa-solid fa-info-circle mr-1"></i>
                            Pastikan nominal transfer sesuai dengan total
                            pembayaran
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentFile">
                        Upload Bukti Pembayaran{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="paymentFile"
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Format: JPG, PNG, atau PDF (maksimal 5MB)
                      </p>
                      {previewUrl && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Preview:</p>
                          <div className="relative w-full max-w-xs border rounded-lg overflow-hidden">
                            <img
                              src={previewUrl}
                              alt="Preview bukti pembayaran"
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                      )}
                      {paymentFile && !previewUrl && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <i className="fa-solid fa-file-pdf text-destructive"></i>
                            <span className="text-sm font-medium">
                              {paymentFile.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {paymentMethod && paymentMethod !== 'bank_transfer' && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {paymentMethod === 'midtrans' && (
                        <>
                          Pembayaran akan dilakukan melalui Midtrans. Anda akan
                          diarahkan ke halaman pembayaran yang aman.
                        </>
                      )}
                      {paymentMethod === 'xendit' && (
                        <>
                          Pembayaran akan dilakukan melalui Xendit. Pilih
                          e-wallet yang Anda inginkan.
                        </>
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
                  <span className="text-muted-foreground">
                    Total Mata Kuliah
                  </span>
                  <span className="font-medium">
                    {checkoutData.mataKuliah.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total SKS</span>
                  <span className="font-medium">
                    {checkoutData.mataKuliah.reduce(
                      (sum, mk) => sum + mk.sks,
                      0
                    )}{' '}
                    SKS
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
                <CardTitle>Lanjutkan Pembayaran</CardTitle>
                <CardDescription className="text-xs">
                  Pastikan semua data sudah benar sebelum melanjutkan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handlePayment}
                  disabled={
                    loading ||
                    !paymentMethod ||
                    (paymentMethod === 'bank_transfer' && !paymentFile)
                  }
                  className="w-full min-h-[44px]"
                  size="lg">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2 min-w-0">
                      <span className="truncate">Memproses Pembayaran...</span>
                    </span>
                  ) : paymentMethod === 'bank_transfer' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span>Upload Bukti Pembayaran</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>Lanjutkan Pembayaran</span>
                    </span>
                  )}
                </Button>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  disabled={loading}
                  className="w-full"
                  size="lg">
                  <i className="fa-solid fa-arrow-left mr-2"></i>
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
