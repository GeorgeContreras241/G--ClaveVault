'use client';
import { useState } from 'react';
import { MasterKeyForm } from './MasterKeyForm';
import { Manager } from '@/features/manager/Manager';

export const OnlineProvider = () => {
  const [look, setLook] = useState(false);
  return !look ? <MasterKeyForm setLook={setLook} /> : <Manager />;
};
