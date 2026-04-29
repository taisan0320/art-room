'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { supabase, Room } from '@/lib/supabase'
import Link from 'next/link'

function formatRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return '期限切れ'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `あと${h}時間${m}分`
  return `あと${m}分`
}

export default function AdminPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { cleanAndFetchRooms() }, [])

  async function cleanAndFetchRooms() {
    await supabase.from('rooms').delete().lt('expires_at', new Date().toISOString())
    const { data } = await supabase.from('rooms').select('*').order('created_at', { ascending: false })
    if (data) setRooms(data)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!imageFile || !title) return
    setLoading(true)
    setError(null)

    const ext = imageFile.name.split('.').pop() ?? 'jpg'
    const fileName = `${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('artwork')
      .upload(fileName, imageFile, { upsert: true })

    if (uploadError) {
      setError(`画像のアップロードに失敗しました: ${uploadError.message}`)
      setLoading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('artwork').getPublicUrl(fileName)
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()

    const { error: insertError } = await supabase.from('rooms').insert({
      title, description, image_url: urlData.publicUrl, status: 'active', expires_at: expiresAt,
    })

    if (insertError) {
      setError(`ルームの作成に失敗しました: ${insertError.message}`)
    } else {
      setTitle('')
      setDescription('')
      setImageFile(null)
      setImagePreview(null)
      cleanAndFetchRooms()
    }
    setLoading(false)
  }

  async function deleteRoom(id: string, imageUrl: string) {
    if (!confirm('このルームとすべてのコメントを削除しますか？')) return
    const filePath = imageUrl.split('/artwork/')[1]
    if (filePath) await supabase.storage.from('artwork').remove([filePath])
    await supabase.from('rooms').delete().eq('id', id)
    cleanAndFetchRooms()
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[#e5e5e0] px-8 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-[#211922]">ArtRoom</Link>
        <span className="text-sm text-[#62625b]">先生ダッシュボード</span>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* ルーム作成 */}
        <section className="mb-14">
          <h2 className="font-bold text-[#211922] mb-1" style={{ fontSize: '28px', letterSpacing: '-1.2px' }}>
            新しいルームを作成
          </h2>
          <p className="text-sm text-[#91918c] mb-8">作成から2時間後に自動で削除されます</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#211922] mb-1.5">作品タイトル</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="例：モナ・リザ"
                required
                className="w-full bg-white border border-[#91918c] rounded-2xl px-4 py-3 text-[#211922] placeholder-[#91918c] text-sm focus:outline-none focus:border-[#435ee5] focus:ring-2 focus:ring-[#435ee5]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#211922] mb-1.5">説明（任意）</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="例：レオナルド・ダ・ヴィンチ作、1503年頃"
                className="w-full bg-white border border-[#91918c] rounded-2xl px-4 py-3 text-[#211922] placeholder-[#91918c] text-sm focus:outline-none focus:border-[#435ee5] focus:ring-2 focus:ring-[#435ee5]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#211922] mb-1.5">作品画像</label>
              <div
                className="border border-dashed border-[#c8c8c1] rounded-[28px] p-8 text-center cursor-pointer hover:border-[#91918c] hover:bg-[#f6f6f3] transition-all"
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="max-h-48 mx-auto rounded-2xl object-contain" />
                ) : (
                  <div className="text-[#91918c]">
                    <div className="w-12 h-12 bg-[#e5e5e0] rounded-full flex items-center justify-center mx-auto mb-3 text-xl">↑</div>
                    <p className="font-medium text-sm text-[#62625b]">クリックして画像をアップロード</p>
                    <p className="text-xs mt-1 text-[#91918c]">JPG, PNG, GIF など</p>
                  </div>
                )}
                <input id="fileInput" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
            </div>

            {error && (
              <p className="text-sm text-[#9e0a0a] bg-[#fff0f0] border border-[#ffc6c6] px-4 py-2 rounded-2xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !imageFile || !title}
              className="w-full font-medium text-white bg-[#e60023] hover:bg-[#c0001d] disabled:bg-[#c8c8c1] disabled:cursor-not-allowed transition-colors py-3 rounded-2xl text-sm"
            >
              {loading ? '作成中...' : 'ルームを作成する'}
            </button>
          </form>
        </section>

        {/* ルーム一覧 */}
        <section>
          <h2 className="font-bold text-[#211922] mb-6" style={{ fontSize: '28px', letterSpacing: '-1.2px' }}>
            ルーム一覧
          </h2>

          {rooms.length === 0 ? (
            <div className="text-center py-16 bg-[#f6f6f3] rounded-[28px]">
              <p className="text-sm text-[#91918c]">現在アクティブなルームはありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map(room => (
                <div
                  key={room.id}
                  className="flex items-center gap-4 p-4 rounded-[20px] bg-[#f6f6f3] hover:bg-[#e5e5e0] transition-colors"
                >
                  <img
                    src={room.image_url}
                    alt={room.title}
                    className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 bg-[#e5e5e0]"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#211922] text-sm truncate mb-0.5">{room.title}</h3>
                    {room.description && (
                      <p className="text-xs text-[#62625b] truncate">{room.description}</p>
                    )}
                    <p className="text-xs text-[#91918c] mt-0.5">{formatRemaining(room.expires_at)}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      href={`/room/${room.id}`}
                      className="font-medium text-xs text-white bg-[#e60023] hover:bg-[#c0001d] transition-colors px-4 py-2 rounded-2xl"
                    >
                      表示
                    </Link>
                    <button
                      onClick={() => deleteRoom(room.id, room.image_url)}
                      className="font-medium text-xs text-[#62625b] bg-[#e5e5e0] hover:bg-[#d0d0c8] transition-colors px-4 py-2 rounded-2xl"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
