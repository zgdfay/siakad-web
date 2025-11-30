'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type UserRole = 'mahasiswa' | 'dosen' | 'admin';
export type UserStatus = 'aktif' | 'nonaktif';

export interface UserFormValues {
  id?: string;
  nimOrNip: string;
  name: string;
  email?: string; // Optional - akan diisi saat self-register
  role: UserRole;
  status: UserStatus;
}

interface UserFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: UserFormValues | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UserFormValues) => void;
}

export function UserFormDialog({
  open,
  mode,
  initialData,
  onOpenChange,
  onSubmit,
}: UserFormDialogProps) {
  const [formValues, setFormValues] = useState<UserFormValues>({
    id: undefined,
    nimOrNip: '',
    name: '',
    email: '',
    role: 'mahasiswa',
    status: 'aktif',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormValues(initialData);
    } else if (mode === 'create') {
      setFormValues({
        id: undefined,
        nimOrNip: '',
        name: '',
        email: '',
        role: 'mahasiswa',
        status: 'aktif',
      });
    }
  }, [mode, initialData, open]);

  const handleChange = (field: keyof UserFormValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formValues.nimOrNip || !formValues.name) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(formValues);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormIncomplete =
    !formValues.nimOrNip.trim() ||
    !formValues.name.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tambah User Baru' : 'Edit Data User'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Isi data user dengan lengkap untuk menambahkan akun baru.'
              : 'Perbarui informasi user sesuai kebutuhan.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nimOrNip">NIM / NIP</Label>
              <Input
                id="nimOrNip"
                value={formValues.nimOrNip}
                onChange={(e) => handleChange('nimOrNip', e.target.value)}
                placeholder="Masukkan NIM atau NIP"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formValues.role}
                onValueChange={(value: UserRole) =>
                  handleChange('role', value)
                }>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                  <SelectItem value="dosen">Dosen</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              value={formValues.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-muted-foreground text-xs">(Opsional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formValues.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="nama@domain.ac.id (akan diisi saat self-register)"
            />
            <p className="text-xs text-muted-foreground">
              Email dapat dikosongkan. Mahasiswa akan mengisi email saat melakukan self-register.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formValues.status}
              onValueChange={(value: UserStatus) =>
                handleChange('status', value)
              }>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isFormIncomplete || isSubmitting}>
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                Menyimpan...
              </>
            ) : mode === 'create' ? (
              'Simpan User'
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
