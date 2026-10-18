'use client';
import { useCallback, useMemo, useState } from 'react';
import { sileo } from 'sileo';
import { useStoragePass } from '@/commons/storage/useStoragePass';
import { VaultHeader } from '@/features/vault-management/components/VaultHeader';
import { copyToClipboard } from '@/commons/lib/password/copyToClipboard';
import { AddPassword } from '@/features/vault-management/components/AddPassword';
import { EditPassword } from '@/features/vault-management/components/EditPassword';
import { Web } from '@/features/vault-management/components/icons/Web';
import { App } from '@/features/vault-management/components/icons/App';
import { Card } from '@/features/vault-management/components/icons/Card';
import { Lock } from '@/features/vault-management/components/icons/Lock';
import { LockEmpty } from '@/features/vault-management/components/icons/LockEmpty';

import { PasswordCard } from './components/PasswordCard';

import type { PasswordEntry, ShowPasswords } from '@/features/vault-management';
import { useMode } from '@/features/vault-management/hooks/useMode';
import { commitVaultOnline } from '@/commons/lib/vault/commitVault';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'web':
      return <Web />;
    case 'app':
      return <App />;
    case 'card':
      return <Card />;
    default:
      return <Lock />;
  }
};

export const Manager = () => {
  const mode = useMode();
  const dataPassword = useStoragePass((state) => state.dataPassword);
  const setDataPasswordInit = useStoragePass(
    (state) => state.setDataPasswordInit
  );
  const setDataPasswordDelete = useStoragePass(
    (state) => state.setDataPasswordDelete
  );
  const derivedKey = useStoragePass((state) => state.derivedKey);
  const salt = useStoragePass((state) => state.salt);
  const setVersion = useStoragePass((state) => state.setVersion);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const togglePasswordVisibility = useCallback((id: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const commitEntries = useCallback(
    async (entries: PasswordEntry[]): Promise<boolean> => {
      if (mode !== 'online' || !derivedKey || !salt) {
        return true;
      }
      const result = await commitVaultOnline({ derivedKey, salt, entries });
      if (!result.ok) {
        sileo.error({
          title: 'No se pudo guardar en el servidor',
          description: result.error,
          duration: 5000,
        });
        return false;
      }
      setVersion(result.version);
      return true;
    },
    [mode, derivedKey, salt, setVersion]
  );

  const handleDeletePassword = useCallback(
    async (id: string) => {
      if (deletingId) {
        return;
      }
      setDeletingId(id);
      try {
        const previous = dataPassword;
        const next = previous.filter((p) => p.id !== id);
        const saved = await commitEntries(next);
        if (!saved) {
          return;
        }
        setDataPasswordDelete(id);
        sileo.success({
          title: 'Contraseña eliminada.',
          duration: 1000,
        });
      } finally {
        setDeletingId(null);
      }
    },
    [dataPassword, commitEntries, setDataPasswordDelete, deletingId]
  );

  const handleRequestDelete = useCallback(
    (id: string) => {
      const entry = dataPassword.find((p) => p.id === id);
      sileo.warning({
        title: 'Eliminar contraseña',
        description: entry
          ? `Se eliminará "${entry.title}". Esta acción no se puede deshacer.`
          : 'Esta acción no se puede deshacer.',
        duration: 8000,
        button: {
          title: 'Eliminar',
          onClick: () => {
            void handleDeletePassword(id);
          },
        },
      });
    },
    [dataPassword, handleDeletePassword]
  );

  const handleToggleFavorite = useCallback(
    async (id: string) => {
      const previous = dataPassword;
      const entry = previous.find((p) => p.id === id);
      if (!entry) {
        return;
      }
      const next = previous.map((p) =>
        p.id === id ? { ...p, favorite: !p.favorite } : p
      );
      // Optimista local + rollback si el servidor rechaza (online).
      setDataPasswordInit(next);
      const saved = await commitEntries(next);
      if (!saved) {
        setDataPasswordInit(previous);
      }
    },
    [dataPassword, commitEntries, setDataPasswordInit]
  );

  const filteredPasswords = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return dataPassword.filter((password) => {
      const title = (password.title ?? '').toLowerCase();
      const username = (password.username ?? '').toLowerCase();
      const url = (password.url ?? '').toLowerCase();
      const matchesSearch =
        title.includes(term) || username.includes(term) || url.includes(term);
      const matchesCategory =
        selectedCategory === 'all' ||
        (selectedCategory === 'favorites'
          ? password.favorite
          : password.category === selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [dataPassword, searchTerm, selectedCategory]);

  return (
    <div className="w-full flex-1">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 pt-10">
        <VaultHeader
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          setSearchTerm={setSearchTerm}
          searchTerm={searchTerm}
        />
        <section className="grid grid-cols-1 xl:grid-cols-[350px_1fr] gap-4 lg:gap-6">
          <section>
            {editingPassword ? (
              <EditPassword
                key={editingPassword.id}
                password={editingPassword}
                onClose={() => setEditingPassword(null)}
              />
            ) : (
              <AddPassword />
            )}
          </section>

          <div className="w-full">
            <div className="space-y-2">
              {filteredPasswords.map((password) => (
                <PasswordCard
                  key={password.id}
                  password={password}
                  showPasswords={showPasswords}
                  onTogglePasswordVisibility={togglePasswordVisibility}
                  onCopyToClipboard={copyToClipboard}
                  onEditPassword={setEditingPassword}
                  onDeletePassword={handleRequestDelete}
                  onToggleFavorite={handleToggleFavorite}
                  getCategoryIcon={getCategoryIcon}
                />
              ))}
            </div>
            {filteredPasswords?.length === 0 && (
              <div className="vault-panel rounded-xl flex flex-col items-center justify-center p-10 text-center">
                <div className="vault-icon-frame w-12 h-12 mb-4">
                  <LockEmpty />
                </div>
                <h3 className="font-sora text-lg font-semibold mb-2">
                  No se encontraron contraseñas
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {searchTerm
                    ? 'Intenta con otra búsqueda'
                    : 'Agrega tu primera contraseña para comenzar'}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
