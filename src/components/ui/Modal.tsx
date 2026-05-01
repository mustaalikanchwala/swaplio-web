import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'md' }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-base/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.90, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.90, y: 20 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={`
              fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              z-50 w-full ${maxWidthClasses[maxWidth]} mx-4
              glass-card rounded-3xl p-6
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-display font-semibold text-gradient">{title}</h2>
                <button
                  id="modal-close-btn"
                  onClick={onClose}
                  className="p-2 rounded-xl text-muted hover:text-ink hover:bg-card/60 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {!title && (
              <button
                id="modal-close-btn-notitle"
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl text-muted hover:text-ink hover:bg-card/60 transition-colors"
              >
                <X size={18} />
              </button>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
