import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Power, PowerOff, Key, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { staffAPI, branchesAPI } from '@/lib/api';
import { getCurrentBusinessUser } from '@/lib/store';
import type { StaffMember, BusinessRole, CafeBranch } from '@/lib/types';

export function BusinessStaff() {
  const businessUser = getCurrentBusinessUser();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<CafeBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'STAFF' as BusinessRole,
    branchId: '',
  });

  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadStaff();
    loadBranches();
  }, []);

  const loadStaff = async () => {
    try {
      const data = await staffAPI.getAll();
      setStaff(data);
    } catch (error: any) {
      toast.error('Personel listesi yüklenemedi', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const data = await branchesAPI.getAll();
      setBranches(data);
    } catch (error: any) {
      console.error('Failed to load branches:', error);
    }
  };

  const handleAdd = async () => {
    if (!formData.email || !formData.name || !formData.password) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    // For OWNER, branchId is required
    if (businessUser?.role === 'OWNER' && !formData.branchId) {
      toast.error('Lütfen bir şube seçin');
      return;
    }

    try {
      // For BRANCH_MANAGER, use their own branchId
      const dataToSend = {
        ...formData,
        branchId: businessUser?.role === 'BRANCH_MANAGER' 
          ? businessUser.branchId 
          : formData.branchId
      };

      await staffAPI.create(dataToSend);
      toast.success('Personel başarıyla eklendi');
      setShowAddModal(false);
      setFormData({ email: '', name: '', password: '', role: 'STAFF', branchId: '' });
      loadStaff();
    } catch (error: any) {
      toast.error('Personel eklenemedi', {
        description: error.message,
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedStaff) return;

    try {
      await staffAPI.update(selectedStaff.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });
      toast.success('Personel başarıyla güncellendi');
      setShowEditModal(false);
      setSelectedStaff(null);
      loadStaff();
    } catch (error: any) {
      toast.error('Personel güncellenemedi', {
        description: error.message,
      });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await staffAPI.delete(id);
        toast.success('Personel devre dışı bırakıldı');
      } else {
        await staffAPI.activate(id);
        toast.success('Personel aktifleştirildi');
      }
      loadStaff();
    } catch (error: any) {
      toast.error('İşlem başarısız', {
        description: error.message,
      });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedStaff || !newPassword || newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      await staffAPI.resetPassword(selectedStaff.id, newPassword);
      toast.success('Şifre başarıyla sıfırlandı');
      setShowPasswordModal(false);
      setNewPassword('');
      setSelectedStaff(null);
    } catch (error: any) {
      toast.error('Şifre sıfırlanamadı', {
        description: error.message,
      });
    }
  };

  const openEditModal = (member: StaffMember) => {
    setSelectedStaff(member);
    setFormData({
      email: member.email,
      name: member.name,
      password: '',
      role: member.role,
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (member: StaffMember) => {
    setSelectedStaff(member);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const getRoleText = (role: BusinessRole) => {
    switch (role) {
      case 'OWNER': return 'Ana Yönetici';
      case 'BRANCH_MANAGER': return 'Şube Yöneticisi';
      case 'STAFF': return 'Personel';
    }
  };

  const getRoleBadgeColor = (role: BusinessRole) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'BRANCH_MANAGER': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'STAFF': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canManageStaff = businessUser?.role === 'OWNER' || businessUser?.role === 'BRANCH_MANAGER';

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
            <Users className="w-8 h-8 text-primary" />
            Personel Yönetimi
          </h1>
          <p className="text-muted-foreground mt-2">
            {staff.length} personel üyesi
          </p>
        </div>

        {canManageStaff && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Personel Ekle
          </button>
        )}
      </div>

      {/* Staff List */}
      <div className="grid gap-4">
        {staff.map((member) => (
          <div
            key={member.id}
            className="bg-card border-2 border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                    {getRoleText(member.role)}
                  </span>
                  {!member.isActive && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Devre Dışı
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground text-sm mb-1">{member.email}</p>
                {member.branch && (
                  <p className="text-muted-foreground text-sm mb-3 font-medium">
                    📍 {member.branch.name}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {member.lastLoginAt 
                      ? `Son giriş: ${formatDate(member.lastLoginAt)}`
                      : 'Henüz giriş yapmadı'
                    }
                  </div>
                  <div>
                    Oluşturuldu: {formatDate(member.createdAt)}
                  </div>
                </div>
              </div>

              {canManageStaff && member.id !== businessUser?.id && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Düzenle"
                  >
                    <Edit2 className="w-5 h-5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => openPasswordModal(member)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Şifre Sıfırla"
                  >
                    <Key className="w-5 h-5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => handleToggleActive(member.id, member.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      member.isActive 
                        ? 'hover:bg-red-100 dark:hover:bg-red-900' 
                        : 'hover:bg-green-100 dark:hover:bg-green-900'
                    }`}
                    title={member.isActive ? 'Devre Dışı Bırak' : 'Aktifleştir'}
                  >
                    {member.isActive ? (
                      <PowerOff className="w-5 h-5 text-red-600" />
                    ) : (
                      <Power className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {staff.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Henüz personel eklenmemiş</p>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 w-full max-w-md border-2 border-border">
            <h2 className="text-2xl font-bold mb-6">Yeni Personel Ekle</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                  placeholder="Ahmet Yılmaz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">E-posta</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                  placeholder="ahmet@ornek.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Şifre</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                  placeholder="En az 6 karakter"
                />
              </div>

              {businessUser?.role === 'OWNER' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Rol</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as BusinessRole })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                  >
                    <option value="STAFF">Personel</option>
                    <option value="BRANCH_MANAGER">Şube Yöneticisi</option>
                    <option value="OWNER">Ana Yönetici</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Şube <span className="text-red-500">*</span>
                </label>
                {businessUser?.role === 'OWNER' ? (
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                  >
                    <option value="">Şube seçin...</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={businessUser?.branch?.name || 'Şube bilgisi yok'}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border-2 border-border bg-muted text-muted-foreground outline-none cursor-not-allowed"
                  />
                )}
                {businessUser?.role === 'BRANCH_MANAGER' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Personel kendi şubenize eklenecek
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ email: '', name: '', password: '', role: 'STAFF', branchId: '' });
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

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 w-full max-w-md border-2 border-border">
            <h2 className="text-2xl font-bold mb-6">Personel Düzenle</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">E-posta</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                />
              </div>

              {businessUser?.role === 'OWNER' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Rol</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as BusinessRole })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                  >
                    <option value="STAFF">Personel</option>
                    <option value="BRANCH_MANAGER">Şube Yöneticisi</option>
                    <option value="OWNER">Ana Yönetici</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStaff(null);
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

      {/* Reset Password Modal */}
      {showPasswordModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 w-full max-w-md border-2 border-border">
            <h2 className="text-2xl font-bold mb-2">Şifre Sıfırla</h2>
            <p className="text-muted-foreground mb-6">{selectedStaff.name}</p>

            <div>
              <label className="block text-sm font-medium mb-2">Yeni Şifre</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                placeholder="En az 6 karakter"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedStaff(null);
                  setNewPassword('');
                }}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-border hover:bg-muted transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleResetPassword}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

