'use client';
import { useCallback, useState } from 'react';
import { MasterKeyForm } from './MasterKeyForm';
import { Manager } from '@/features/vault-management/Manager';
import { useAutoLock } from '@/features/vault-management/hooks/useAutoLock';

export const OnlineFlow = () => {
  const [look, setLook] = useState(false);
  const handleLock = useCallback(() => setLook(false), []);
  useAutoLock(handleLock, look);

  return !look ? <MasterKeyForm setLook={setLook} /> : <Manager />;
};
