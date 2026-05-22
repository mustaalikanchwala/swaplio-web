import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import type { Conversation } from '@/types';
import clsx from 'clsx';

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
}

function formatTime(isoString?: string) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return 'now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function ConversationList({ conversations, activeId }: ConversationListProps) {
  if (!conversations.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <MessageCircle size={40} className="text-[var(--text-muted)] opacity-30" />
        <p className="text-sm text-[var(--text-muted)]">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {conversations.map((conv) => {
        const otherName = conv.buyerName; // will be rendered conditionally on chat page
        return (
          <Link
            key={conv.id}
            href={`/chat/${conv.id}`}
            className={clsx(
              'flex items-center gap-3 p-3 rounded-xl transition-all',
              activeId === conv.id
                ? 'bg-violet-500/15 border border-violet-500/30'
                : 'hover:bg-white/5 border border-transparent'
            )}
          >
            {/* Avatar */}
            <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {conv.listingTitle.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-medium text-sm text-[var(--text-primary)] truncate">
                  {conv.listingTitle}
                </p>
                <span className="shrink-0 text-[10px] text-[var(--text-muted)]">
                  {formatTime(conv.lastMessageAt)}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                {conv.lastMessage ?? 'No messages yet'}
              </p>
            </div>

            {/* Unread badge */}
            {conv.unreadCount > 0 && (
              <span className="shrink-0 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-pink-500 text-white text-[10px] font-bold px-1 shadow-lg shadow-pink-500/30">
                {conv.unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
