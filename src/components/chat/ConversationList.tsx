'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import type { Conversation } from '@/types';
import clsx from 'clsx';
import { motion } from 'framer-motion';

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
      <div className="flex flex-col items-center justify-center h-64 gap-3 font-sans">
        <MessageCircle size={40} className="text-text-muted opacity-30" />
        <p className="text-sm text-text-muted">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 font-sans">
      {conversations.map((conv, index) => {
        const isActive = activeId === conv.id;
        return (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
          >
            <Link
              href={`/chat/${conv.id}`}
              className={clsx(
                'flex items-center gap-3 p-3 rounded-xl transition-all border-l-2 relative overflow-hidden',
                isActive
                  ? 'bg-accent/10 border-l-accent border-y-transparent border-r-transparent'
                  : 'hover:bg-bg-elevated border-l-transparent border-y-transparent border-r-transparent'
              )}
            >
              {/* Avatar */}
              <div className="shrink-0 w-10 h-10 rounded-full bg-accent/20 border border-accent/20 flex items-center justify-center text-accent font-semibold text-sm">
                {conv.listingTitle.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold text-sm text-white truncate">
                    {conv.listingTitle}
                  </p>
                  <span className="shrink-0 text-[10px] text-text-muted">
                    {formatTime(conv.lastMessageAt)}
                  </span>
                </div>
                <p className="text-xs text-text-muted truncate mt-0.5">
                  {conv.lastMessage ?? 'No messages yet'}
                </p>
              </div>

              {/* Unread badge */}
              {conv.unreadCount > 0 && (
                <span className="shrink-0 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold px-1.5 shadow-glow-sm">
                  {conv.unreadCount}
                </span>
              )}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
