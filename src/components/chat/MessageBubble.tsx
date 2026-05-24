import clsx from 'clsx';
import type { Message } from '@/types';
import { CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

function formatTime(sentAt: string) {
  const d = new Date(sentAt);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  return (
    <div className={clsx('flex', isMine ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed font-sans',
          isMine
            ? 'bg-accent text-white rounded-br-sm shadow-glow-sm border border-accent/10'
            : 'bg-bg-elevated border border-bg-border text-white rounded-bl-sm'
        )}
      >
        <p className="break-words">{message.content}</p>
        
        <div className="flex items-center justify-end gap-1.5 mt-1.5 select-none">
          <p
            className={clsx(
              'text-[9px] font-medium',
              isMine ? 'text-blue-100/70' : 'text-text-muted'
            )}
          >
            {formatTime(message.sentAt)}
          </p>
          {isMine && (
            <CheckCheck size={11} className="text-white/60 shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}
