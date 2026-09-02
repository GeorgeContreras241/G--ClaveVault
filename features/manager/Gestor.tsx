// Refacor en proceso
'use client'
import { useState} from 'react'
import { useStoragePass } from '@/storage/useStoragePass'
import { Header_Gestor } from "@/features/manager/components/Header_Gestor"
import { copyToClipboard } from '@/lib/utils/Gestor/copyToClipboard'
import { AddPassword } from '@/features/manager/components/AddPassword'
import { EditPassword } from '@/features/manager/components/EditPassword'

import { Web } from '@/components/icons/Web'
import { App } from '@/components/icons/App'
import { Card } from '@/components/icons/Card'
import { Lock } from '@/components/icons/Lock'
import { LockEmpty } from '@/components/icons/LockEmpty'

import { PasswordCard } from './components/PasswordCard'

import type { PasswordEntry } from "@/types"
import { Footer } from '@/components/layout/Footer'

export const Gestor = () => {
  const dataPassword = useStoragePass((state) => state.dataPassword)
  const setDataPasswordDelate = useStoragePass((state) => state.setDataPasswordDelate)
  const setDataPasswordFavorite = useStoragePass((state) => state.setDataPasswordFavorite)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null)



  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'web':
        return <Web />
      case 'app':
        return <App />
      case 'card':
        return <Card />
      default:
        return <Lock />
    }
  }


  const filteredPasswords = dataPassword.filter((password) => {
    const matchesSearch = password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (password.url && password.url.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' ||
      (selectedCategory === 'favorites' ? password.favorite : password.category === selectedCategory)
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-[90dvh] h-full">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 pt-10">
        <Header_Gestor selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory} setSearchTerm={setSearchTerm} searchTerm={searchTerm} />
        <section className='grid grid-cols-1 xl:grid-cols-[350px_1fr] gap-4 lg:gap-6'>
          <section>
            {editingPassword ? (
              <EditPassword
                password={editingPassword}
                onClose={() => setEditingPassword(null)}
              />
            ) : (
              <AddPassword />
            )}
          </section>

          <div className="w-full">
            <div className="space-y-2">
              {
                 filteredPasswords.map((password) => (
                  <PasswordCard
                    key={password.id}
                    password={password}
                    showPasswords={showPasswords}
                    onTogglePasswordVisibility={togglePasswordVisibility}
                    onCopyToClipboard={copyToClipboard}
                    onEditPassword={setEditingPassword}
                    onDeletePassword={setDataPasswordDelate}
                    onToggleFavorite={setDataPasswordFavorite}
                    getCategoryIcon={getCategoryIcon}
                  />
                ))}
            </div>
            {filteredPasswords?.length === 0 && (
              <div className="vault-panel rounded-xl flex flex-col items-center justify-center p-10 text-center">
                <div className="vault-icon-frame w-12 h-12 mb-4">
                  <LockEmpty />
                </div>
                <h3 className="font-sora text-lg font-semibold mb-2">No se encontraron contraseñas</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {searchTerm ? 'Intenta con otra búsqueda' : 'Agrega tu primera contraseña para comenzar'}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

    </div>
  )
}