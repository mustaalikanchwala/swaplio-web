'use client';

import { ConversationList } from '@/components/chat/ConversationList';
import { useConversations } from '@/hooks/useChat';
import { Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useParams } from 'next/navigation';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { data: conversations = [], isLoading } = useConversations();
  const params = useParams();
  const conversationId = params.id as string | undefined;

  return (
    <ProtectedRoute>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="page-wrapper max-w-7xl font-sans"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 h-[calc(100vh-10rem)] bg-bg-surface border border-bg-border rounded-2xl overflow-hidden shadow-2xl">
          {/* Left Sidebar - Conversations list */}
          <div className={clsx(
            "md:col-span-4 border-r border-bg-border flex flex-col h-full bg-bg-surface",
            conversationId ? "hidden md:flex" : "flex"
          )}>
            <div className="p-4 border-b border-bg-border flex items-center justify-between">
              <h2 className="text-xl font-bold font-serif text-white">Messages</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex flex-col gap-2 p-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
                      <div className="skeleton w-10 h-10 rounded-full shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="skeleton h-4 w-3/4 rounded mb-2" />
                        <div className="skeleton h-3 w-1/2 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ConversationList conversations={conversations} activeId={conversationId} />
              )}
            </div>
          </div>

          {/* Right Panel - Active Chat Room or Empty State */}
          <div className={clsx(
            "md:col-span-8 flex flex-col h-full bg-black/40",
            conversationId ? "flex" : "hidden md:flex"
          )}>
            {children}
          </div>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}
