'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { supabase, Room, Comment } from '@/lib/supabase'
import { use } from 'react'

type Props = { params: Promise<{ id: string }> }

function randomPosition() {
  return { x: Math.random() * 70 + 5, y: Math.random() * 70 + 5 }
}

const WARM_COLORS = ['#fff0e8', '#fdf4e7', '#f6f6f3', '#e5e5e0', '#fef3f3', '#f0f0e8', '#fdf9ec', '#ece8f8']

export default function JoinPage({ params }: Props) {
  const { id } = use(params)
  const [room, setRoom] = useState<Room | null>(null)
  const [nickname, setNickname] = useState('')
  const [nicknameSet, setNicknameSet] = useState(false)
  const [comment, setComment] = useState('')
  const [lastComment, setLastComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [notFound, setNotFound] = useState(false)
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('rooms').select('*').eq('id', id).single()
      if (!data) { setNotFound(true); return }
      if (new Date(data.expires_at) < new Date()) { setNotFound(true); return }
      setRoom(data)
      const { data: existing } = await supabase
        .from('comments').select('*').eq('room_id', id).order('created_at', { ascending: true })
      if (existing) setComments(existing)
    }
    load()

    const channel = supabase
      .channel(`join-feed-${id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `room_id=eq.${id}` },
        (payload) => setComments(prev => [...prev, payload.new as Comment])
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [comments])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim() || loading) return
    setLoading(true)
    const pos = randomPosition()
    const color = WARM_COLORS[Math.floor(Math.random() * WARM_COLORS.length)]
    await supabase.from('comments').insert({
      room_id: id, content: comment.trim(), color,
      x_position: pos.x, y_position: pos.y,
    })
    setLastComment(comment.trim())
    setComment('')
    setLoading(false)
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <p className="font-bold text-xl text-[#211922] mb-2">ルームが見つかりません</p>
          <p className="text-sm text-[#62625b]">QRコードをもう一度読み取ってください</p>
        </div>
      </main>
    )
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#e5e5e0] border-t-[#e60023] rounded-full animate-spin" />
      </main>
    )
  }

  if (room.status === 'closed') {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <p className="font-bold text-xl text-[#211922] mb-2">このルームは終了しました</p>
          <p className="text-sm text-[#62625b]">先生に確認してください</p>
        </div>
      </main>
    )
  }

  /* ニックネーム入力 */
  if (!nicknameSet) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <span className="inline-block text-xs font-bold text-[#62625b] bg-[#f6f6f3] px-3 py-1 rounded-full mb-4">
              {room.title}
            </span>
            <h1 className="font-bold text-[#211922]" style={{ fontSize: '36px', letterSpacing: '-1.2px', lineHeight: 1.1 }}>
              ArtRoomへ<br />ようこそ！
            </h1>
            <p className="text-[#62625b] text-sm mt-3">ニックネームを入力して参加しよう</p>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && nickname.trim()) setNicknameSet(true) }}
              placeholder="ニックネームを入力"
              maxLength={20}
              className="w-full bg-white border border-[#91918c] rounded-2xl px-4 py-3 text-[#211922] placeholder-[#91918c] text-sm focus:outline-none focus:border-[#435ee5] focus:ring-2 focus:ring-[#435ee5]/20 transition-all"
            />
            <p className="text-xs text-[#91918c]">※ ニックネームはコメントに表示されません</p>
            <button
              onClick={() => { if (nickname.trim()) setNicknameSet(true) }}
              disabled={!nickname.trim()}
              className="w-full font-medium text-white bg-[#e60023] hover:bg-[#c0001d] disabled:bg-[#c8c8c1] disabled:cursor-not-allowed transition-colors py-3 rounded-2xl text-sm"
            >
              入室する
            </button>
          </div>
        </div>
      </main>
    )
  }

  /* コメント入力 */
  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* 作品エリア */}
      <div className="bg-[#f6f6f3] flex-shrink-0">
        <img
          src={room.image_url}
          alt={room.title}
          className="w-full object-contain"
          style={{ maxHeight: '42vh' }}
        />
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#e5e5e0]">
          <div className="min-w-0">
            <p className="font-bold text-[#211922] text-sm truncate">{room.title}</p>
            {room.description && <p className="text-xs text-[#91918c] truncate">{room.description}</p>}
          </div>
          <span className="text-xs font-bold text-[#62625b] bg-[#e5e5e0] px-3 py-1 rounded-full flex-shrink-0 ml-3">
            {comments.length} 件
          </span>
        </div>
      </div>

      {/* メインエリア：左=入力、右=一覧 */}
      <div className="flex-1 flex overflow-hidden">

        {/* 左：コメント入力（固定） */}
        <div className="flex flex-col p-4 gap-3 border-r border-[#e5e5e0]" style={{ width: '55%' }}>

          <div className="flex-1 bg-[#f6f6f3] rounded-[24px] p-4 flex flex-col">
            <p className="font-bold text-[#211922] text-sm mb-1">
              {nickname} さん
            </p>
            <p className="text-xs text-[#91918c] mb-3">この絵を見てどう感じましたか？</p>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-3">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="色・形・雰囲気・感情... なんでも OK！"
                maxLength={100}
                className="flex-1 w-full bg-white border border-[#91918c] rounded-2xl px-3 py-3 text-[#211922] placeholder-[#91918c] text-sm focus:outline-none focus:border-[#435ee5] focus:ring-2 focus:ring-[#435ee5]/20 transition-all resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#91918c]">{comment.length}/100</span>
                <button
                  type="submit"
                  disabled={loading || !comment.trim()}
                  className="font-medium text-sm text-white bg-[#e60023] hover:bg-[#c0001d] disabled:bg-[#c8c8c1] disabled:cursor-not-allowed transition-colors px-5 py-2 rounded-2xl"
                >
                  {loading ? '...' : '送る'}
                </button>
              </div>
            </form>
          </div>

          {/* 送信済みフィードバック */}
          {lastComment && (
            <div className="bg-[#f6f6f3] rounded-[16px] px-3 py-2.5 flex-shrink-0">
              <p className="text-xs font-bold text-[#62625b]">送信しました ✓</p>
              <p className="text-xs text-[#91918c] truncate">「{lastComment}」</p>
            </div>
          )}
        </div>

        {/* 右：コメント一覧（スクロール） */}
        <div className="flex flex-col overflow-hidden" style={{ width: '45%' }}>
          <div className="px-3 pt-4 pb-2 flex-shrink-0">
            <p className="text-xs font-bold text-[#91918c] uppercase tracking-wider">みんなのコメント</p>
          </div>

          {comments.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-xs text-[#c8c8c1] text-center">まだコメントは<br />ありません</p>
            </div>
          ) : (
            <div ref={feedRef} className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#f6f6f3] rounded-2xl px-3 py-2.5"
                >
                  <p className="text-xs text-[#211922] leading-snug break-words">{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
