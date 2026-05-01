'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-[#e5e5e0]">
        <span className="font-bold text-lg text-[#211922]">ArtRoom</span>
        <div className="flex items-center gap-5">
          <a
            href="https://www.notion.so/synq-creative/art-room-35308401676c8065a82afe28c1e6fe8e?source=copy_link"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-[#62625b] hover:text-[#211922] transition-colors"
          >
            使い方ガイド
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="opacity-50">
              <path d="M2 2h8v8M10 2 2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <Link
            href="/admin"
            className="text-sm font-medium text-[#62625b] hover:text-[#211922] transition-colors"
          >
            先生ログイン
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1
          className="text-[#211922] font-bold mb-6 leading-tight"
          style={{ fontSize: 'clamp(40px, 8vw, 70px)', lineHeight: 1.1 }}
        >
          絵を見て、<br />
          感じたことを<br />
          シェアしよう。
        </h1>

        <p className="text-[#62625b] text-base max-w-sm mb-10" style={{ lineHeight: 1.6 }}>
          QRコードをスキャンするだけで参加できます。コメントがリアルタイムで絵の周りに広がります。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Link
            href="/admin"
            className="font-medium text-white bg-[#e60023] hover:bg-[#c0001d] transition-colors px-6 py-3 rounded-2xl text-sm"
          >
            先生はこちら
          </Link>
          <div className="font-medium text-[#211922] bg-[#e5e5e0] hover:bg-[#d5d5d0] transition-colors px-6 py-3 rounded-2xl text-sm">
            生徒はQRコードをスキャン
          </div>
        </div>
      </section>

      {/* Feature row */}
      <section className="border-t border-[#e5e5e0]">
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {[
            { label: 'リアルタイム反映', desc: 'コメントが即座に全員の画面へ' },
            { label: '匿名コメント',     desc: '誰のコメントかは分からない設計' },
            { label: 'QRで簡単参加',     desc: 'アプリ不要、スマホだけでOK' },
          ].map((item, i) => (
            <div
              key={item.label}
              className={`p-8 ${i < 2 ? 'sm:border-r border-[#e5e5e0]' : ''} ${i > 0 ? 'border-t sm:border-t-0 border-[#e5e5e0]' : ''}`}
            >
              <p className="font-bold text-[#211922] mb-1" style={{ letterSpacing: '-0.3px' }}>{item.label}</p>
              <p className="text-[#62625b] text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
