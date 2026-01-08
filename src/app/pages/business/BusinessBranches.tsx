import { useState, useEffect } from 'react';
import { Store, Plus, Edit2, Trash2, MapPin, Phone, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { branchesAPI } from '@/lib/api';
import { getCurrentBusinessUser } from '@/lib/store';
import type { CafeBranch } from '@/lib/types';

export function BusinessBranches() {
  const businessUser = getCurrentBusinessUser();
  const [branches, setBranches] = useState<CafeBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<CafeBranch | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const data = await branchesAPI.getAll();
      setBranches(data);
    } catch (error: any) {
      toast.error('Şubeler yüklenemedi', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name) {
      toast.error('Şube adı gereklidir');
      return;
    }

    try {
      await branchesAPI.create(formData);
      toast.success('Şube başarıyla eklendi');
      setShowAddModal(false);
      setFormData({ name: '', address: '', phone: '', latitude: undefined, longitude: undefined });
      loadBranches();
    } catch (error: any) {
      toast.error('Şube eklenemedi', {
        description: error.message,
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedBranch) return;

    try {
      await branchesAPI.update(selectedBranch.id, formData);
      toast.success('Şube başarıyla güncellendi');
      setShowEditModal(false);
      setSelectedBranch(null);
      loadBranches();
    } catch (error: any) {
      toast.error('Şube güncellenemedi', {
        description: error.message,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu şubeyi silmek istediğinize emin misiniz?')) return;

    try {
      await branchesAPI.delete(id);
      toast.success('Şube başarıyla silindi');
      loadBranches();
    } catch (error: any) {
      toast.error('Şube silinemedi', {
        description: error.message,
      });
    }
  };

  const openEditModal = (branch: CafeBranch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address || '',
      phone: branch.phone || '',
      latitude: branch.latitude,
      longitude: branch.longitude,
    });
    setShowEditModal(true);
  };

  const isOwner = businessUser?.role === 'OWNER';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Store className="w-8 h-8 text-primary" />
            Şube Yönetimi
          </h1>
          <p className="text-muted-foreground mt-2">
            {branches.length} şube
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Yeni Şube Ekle
          </button>
        )}
      </div>

      {/* Branches Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="bg-card border-2 border-border rounded-xl p-6 hover:border-primary/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">{branch.name}</h3>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  branch.openNow 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {branch.openNow ? 'Açık' : 'Kapalı'}
                </span>
              </div>
              
              {isOwner && (
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(branch)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Düzenle"
                  >
                    <Edit2 className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(branch.id)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm">
              {branch.address && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{branch.address}</span>
                </div>
              )}
              
              {branch.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <a href={`tel:${branch.phone}`} className="hover:text-primary">
                    {branch.phone}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>
                  Oluşturulma: {new Date(branch.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        ))}

        {branches.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Store className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Henüz şube eklenmemiş</p>
          </div>
        )}
      </div>

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 w-full max-w-md border-2 border-border">
            <h2 className="text-2xl font-bold mb-6">Yeni Şube Ekle</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Şube Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                  placeholder="Kadıköy Şubesi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Adres</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                  placeholder="Bağdat Cad. No:123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                  placeholder="+90 555 123 4567"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ name: '', address: '', phone: '', latitude: undefined, longitude: undefined });
                }}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-border hover:bg-muted transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {showEditModal && selectedBranch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 w-full max-w-md border-2 border-border">
            <h2 className="text-2xl font-bold mb-6">Şube Düzenle</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Şube Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Adres</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedBranch(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-border hover:bg-muted transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleEdit}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

