'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { supabase, Room, Comment } from '@/lib/supabase'
import CommentCard from '@/components/CommentCard'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import { use } from 'react'
import Link from 'next/link'

type Props = { params: Promise<{ id: string }> }

function formatRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return '期限切れ'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `あと${h}時間${m}分`
  return `あと${m}分`
}

export default function RoomDisplayPage({ params }: Props) {
  const { id } = use(params)
  const [room, setRoom] = useState<Room | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [showQR, setShowQR] = useState(true)
  const [remaining, setRemaining] = useState('')
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/join/${id}` : ''

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('rooms').select('*').eq('id', id).single()
      if (data) {
        if (new Date(data.expires_at) < new Date()) {
          await supabase.from('rooms').delete().eq('id', id)
          setRoom({ ...data, status: 'closed' })
        } else {
          setRoom(data)
        }
      }
      const { data: c } = await supabase.from('comments').select('*').eq('room_id', id).order('created_at')
      if (c) setComments(c)
    }
    load()

    const channel = supabase
      .channel(`room-${id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `room_id=eq.${id}` },
        (payload) => setComments(prev => [...prev, payload.new as Comment])
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  useEffect(() => {
    if (!room?.expires_at) return
    setRemaining(formatRemaining(room.expires_at))
    const timer = setInterval(() => setRemaining(formatRemaining(room.expires_at)), 60000)
    return () => clearInterval(timer)
  }, [room])

  if (!room) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#e5e5e0] border-t-[#e60023] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e0]">
        <Link href="/admin" className="text-sm text-[#91918c] hover:text-[#211922] transition-colors">
          ← 管理画面
        </Link>
        <div className="text-center">
          <span className="font-bold text-[#211922]">{room.title}</span>
          {room.description && (
            <span className="text-[#91918c] text-sm ml-3">{room.description}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {remaining && (
            <span className="text-xs text-[#91918c] bg-[#f6f6f3] px-3 py-1 rounded-full">{remaining}</span>
          )}
          <span className="text-sm text-[#91918c]">{comments.length} 件</span>
          <button
            onClick={() => setShowQR(!showQR)}
            className="text-xs font-medium text-[#62625b] bg-[#e5e5e0] hover:bg-[#d5d5d0] px-3 py-1.5 rounded-2xl transition-colors"
          >
            {showQR ? 'QRを隠す' : 'QRを表示'}
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden min-h-0">
        {/* Canvas */}
        <div className="flex-1 relative rounded-[28px] overflow-hidden bg-[#f6f6f3]">
          <img
            src={room.image_url}
            alt={room.title}
            className="absolute inset-0 w-full h-full object-contain p-6"
          />
          {comments.map((comment, index) => (
            <CommentCard key={comment.id} comment={comment} index={index} />
          ))}
          {comments.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-[#c8c8c1]">
                <p className="font-bold text-xl mb-1">コメント待機中</p>
                <p className="text-sm">QRコードをスキャンして参加してください</p>
              </div>
            </div>
          )}
        </div>

        {/* QR Panel */}
        {showQR && (
          <div className="w-56 flex-shrink-0 flex flex-col gap-3">
            <div className="bg-white rounded-[28px] p-5 text-center border border-[#e5e5e0]">
              <p className="font-bold text-[#211922] text-sm mb-3">参加はこちら</p>
              <QRCodeDisplay url={joinUrl} size={164} />
              <p className="text-[#91918c] text-xs mt-3 break-all leading-relaxed">{joinUrl}</p>
            </div>

            <div className="bg-[#f6f6f3] rounded-[28px] p-4 flex-1 overflow-hidden">
              <p className="text-[#91918c] text-xs font-bold uppercase tracking-wider mb-3">最新コメント</p>
              <div className="space-y-2 overflow-y-auto h-full">
                {[...comments].reverse().slice(0, 15).map(c => (
                  <div key={c.id} className="bg-white rounded-2xl px-3 py-2 border border-[#e5e5e0]">
                    <p className="text-[#211922] text-xs leading-snug">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
