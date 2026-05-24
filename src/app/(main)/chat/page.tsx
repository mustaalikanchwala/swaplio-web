'use client';

import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 h-full bg-black/20">
      <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-bg-border flex items-center justify-center mb-4">
        <MessageSquare size={32} className="text-text-muted" />
      </div>
      <h2 className="text-2xl font-serif text-white mb-2">Select a conversation to start messaging</h2>
      <p className="text-text-secondary text-sm max-w-xs mx-auto">
        Choose a chat from the left sidebar to view messages and coordinate trades.
      </p>
    </div>
  );
}
