'use client'

import { Comment } from '@/lib/supabase'

const WARM_SETS = [
  { bg: '#fff0e8', text: '#7c2d12' },
  { bg: '#fdf4e7', text: '#713f12' },
  { bg: '#f6f6f3', text: '#211922' },
  { bg: '#e5e5e0', text: '#211922' },
  { bg: '#fef3f3', text: '#9e0a0a' },
  { bg: '#f0f0e8', text: '#3d3d38' },
  { bg: '#fdf9ec', text: '#62625b' },
  { bg: '#ece8f8', text: '#3b0764' },
]

const ROTATIONS = [-2, 1.5, -1, 2, -2.5, 1, -1.5, 2.5]

type Props = { comment: Comment; index: number }

export default function CommentCard({ comment, index }: Props) {
  const set = WARM_SETS[index % WARM_SETS.length]
  const rotate = ROTATIONS[index % ROTATIONS.length]

  return (
    <div
      className="comment-card absolute max-w-[160px] rounded-[20px] p-3 cursor-default select-none"
      style={{
        left: `${comment.x_position}%`,
        top: `${comment.y_position}%`,
        zIndex: index + 1,
        background: set.bg,
        color: set.text,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <p className="text-xs font-medium leading-snug break-words">{comment.content}</p>
    </div>
  )
}
