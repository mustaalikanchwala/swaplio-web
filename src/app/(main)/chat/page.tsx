'use client';

import { useConversations } from '@/hooks/useChat';
import { ConversationList } from '@/components/chat/ConversationList';
import { Loader2, MessageCircle } from 'lucide-react';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';

export default function ChatPage() {
  const { data: conversations = [], isLoading } = useConversations();

  return (
    <ProtectedRoute>
      <div className="page-wrapper max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle size={24} className="text-violet-400" />
          <h1 className="text-2xl font-bold gradient-text">Messages</h1>
        </div>

        <div className="glass p-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={28} className="animate-spin text-violet-400" />
            </div>
          ) : (
            <ConversationList conversations={conversations} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
