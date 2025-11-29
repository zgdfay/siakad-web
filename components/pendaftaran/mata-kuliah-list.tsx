'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface MataKuliah {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  kelas: string;
  jadwal: string;
  dosen: string;
  kuota: number;
  terisi: number;
  biaya: number;
  prasyarat?: string[];
}

interface MataKuliahListProps {
  mataKuliah: MataKuliah[];
  selectedMataKuliah: string[];
  onSelectionChange: (selected: string[]) => void;
  onNext: () => void;
}

export function MataKuliahList({
  mataKuliah,
  selectedMataKuliah,
  onSelectionChange,
  onNext,
}: MataKuliahListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMataKuliah = mataKuliah.filter(
    (mk) =>
      mk.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mk.kode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleMataKuliah = (mkId: string) => {
    if (selectedMataKuliah.includes(mkId)) {
      onSelectionChange(selectedMataKuliah.filter((id) => id !== mkId));
    } else {
      // Validasi: maksimal 24 SKS
      const selectedMK = mataKuliah.filter((mk) =>
        selectedMataKuliah.includes(mk.id)
      );
      const totalSKS = selectedMK.reduce((sum, mk) => sum + mk.sks, 0);
      const newMK = mataKuliah.find((mk) => mk.id === mkId);

      if (newMK && totalSKS + newMK.sks > 24) {
        return; // Tidak bisa memilih lebih dari 24 SKS
      }

      onSelectionChange([...selectedMataKuliah, mkId]);
    }
  };

  const selectedMK = mataKuliah.filter((mk) =>
    selectedMataKuliah.includes(mk.id)
  );
  const totalSKS = selectedMK.reduce((sum, mk) => sum + mk.sks, 0);
  const totalBiaya = selectedMK.reduce((sum, mk) => sum + mk.biaya, 0);
  const isKuotaPenuh = (mk: MataKuliah) => mk.terisi >= mk.kuota;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Cari Mata Kuliah</Label>
        <Input
          id="search"
          placeholder="Cari berdasarkan nama atau kode mata kuliah..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Mata Kuliah List */}
      <div className="space-y-4">
        {filteredMataKuliah.map((mk) => {
          const isSelected = selectedMataKuliah.includes(mk.id);
          const isFull = isKuotaPenuh(mk);
          const available = mk.kuota - mk.terisi;

          return (
            <Card
              key={mk.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary' : ''
              } ${isFull ? 'opacity-60' : ''}`}
              onClick={() => !isFull && handleToggleMataKuliah(mk.id)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{mk.nama}</CardTitle>
                      {isSelected && <Badge>Dipilih</Badge>}
                      {isFull && (
                        <Badge variant="destructive">Kuota Penuh</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {mk.kode} - {mk.sks} SKS - Kelas {mk.kelas}
                    </CardDescription>
                  </div>
                  <Checkbox
                    checked={isSelected}
                    disabled={isFull}
                    onCheckedChange={() => handleToggleMataKuliah(mk.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Jadwal:</span>
                    <p className="font-medium">{mk.jadwal}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dosen:</span>
                    <p className="font-medium">{mk.dosen}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kuota:</span>
                    <p className="font-medium">
                      {isFull ? (
                        <span className="text-destructive">
                          {mk.terisi} / {mk.kuota} (Penuh)
                        </span>
                      ) : (
                        <span>
                          {mk.terisi} / {mk.kuota} ({available} tersedia)
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Biaya:</span>
                    <p className="font-medium">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      }).format(mk.biaya)}
                    </p>
                  </div>
                </div>
                {mk.prasyarat && mk.prasyarat.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Prasyarat:{' '}
                    </span>
                    <span className="text-xs">{mk.prasyarat.join(', ')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary & Next Button */}
      {selectedMataKuliah.length > 0 && (
        <Card className="sticky bottom-0 bg-white border-t-2">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {selectedMataKuliah.length} Mata Kuliah - {totalSKS} SKS
                </p>
                <p className="text-lg font-bold">
                  Total:{' '}
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(totalBiaya)}
                </p>
              </div>
              <Button onClick={onNext} size="lg" disabled={totalSKS > 24}>
                Lanjutkan ({selectedMataKuliah.length})
              </Button>
            </div>
            {totalSKS > 24 && (
              <p className="text-sm text-destructive mt-2">
                Maksimal 24 SKS per semester antara
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
