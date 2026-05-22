import clsx from 'clsx';
import type { Message } from '@/types';

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
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isMine
            ? 'bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-br-sm shadow-lg shadow-violet-500/20'
            : 'glass text-[var(--text-primary)] rounded-bl-sm'
        )}
      >
        <p className="break-words">{message.content}</p>
        <p
          className={clsx(
            'text-[10px] mt-1 text-right',
            isMine ? 'text-violet-200/70' : 'text-[var(--text-muted)]'
          )}
        >
          {formatTime(message.sentAt)}
        </p>
      </div>
    </div>
  );
}
