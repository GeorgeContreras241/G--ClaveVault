// Refacor en proceso
'use client'
import { useState, use } from 'react'
import { useStoragePass } from '@/storage/useStoragePass'
import { Header_Gestor } from "@/features/manager/components/Header_Gestor"
import { copyToClipboard } from '@/lib/utils/Gestor/copyToClipboard'
import { AddPasswords } from '@/features/manager/components/AddPasswords'
import { EditPassword } from '@/features/manager/components/EditPassword'

import { Web } from '@/components/icons/Web'
import { App } from '@/components/icons/App'
import { Card } from '@/components/icons/Card'
import { Lock } from '@/components/icons/Lock'
import { LockEmpty } from '@/components/icons/LockEmpty'

import { PasswordCard } from './components/PasswordCard'

import type { PasswordEntry } from "@/types"

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
    <div className="min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-gray-900 ">
      <div className="max-w-6xl mx-auto flex flex-col gap-2">
        {/* Header */}
        <Header_Gestor selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory} setSearchTerm={setSearchTerm} searchTerm={searchTerm} />
        <section className='grid grid-cols-1 xl:grid-cols-[350px_1fr] gap-4 lg:gap-6 z-9999'>
          {/* Form add Password */}
          <section>
            {editingPassword ? (
              <EditPassword
                password={editingPassword}
                onClose={() => setEditingPassword(null)}
              />
            ) : (
              <AddPasswords />
            )}
          </section>

          {/* Password List */}
          <div className="w-full">
            <div className="space-y-1.5">
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
            {/* Empty State */}
            {filteredPasswords?.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-white/80 dark:bg-gray-800/80 rounded-lg">
                <div className="p-4 bg-blue-500/20 dark:bg-blue-400/20 rounded-full mb-4">
                  <LockEmpty />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No se encontraron contraseñas</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-sm">
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