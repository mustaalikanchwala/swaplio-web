'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, MapPin, Clock, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSellerRespond } from '@/hooks/useMeetings';
import { motion } from 'framer-motion';

const schema = z.object({
  proposedDate: z.string().min(1, 'Date is required'),
  proposedTime: z.string().min(1, 'Time is required'),
  proposedLocation: z.string().min(2, 'Location is required'),
  sellerNote: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface RescheduleDialogProps {
  meetingId: string;
  trigger: React.ReactNode;
}

export function RescheduleDialog({ meetingId, trigger }: RescheduleDialogProps) {
  const { mutateAsync, isPending } = useSellerRespond(meetingId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync({
        action: 'RESCHEDULED',
        proposedDate: data.proposedDate,
        proposedTime: data.proposedTime,
        proposedLocation: data.proposedLocation,
        sellerNote: data.sellerNote,
      });
      toast.success('Reschedule proposal sent!');
      reset();
    } catch {
      toast.error('Failed to send reschedule proposal.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-fade-in" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Content className="w-full max-w-md bg-bg-surface border border-bg-border p-6 shadow-2xl rounded-2xl font-sans animate-scale-up">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="font-bold text-white text-lg font-serif">
                Propose Reschedule
              </Dialog.Title>
              <Dialog.Close className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-all">
                <X size={18} />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label flex items-center gap-1.5">
                  <Calendar size={12} /> New Date
                </label>
                <input type="date" min={today} {...register('proposedDate')} className="input" style={{ colorScheme: 'dark' }} />
                {errors.proposedDate && <p className="text-xs text-red-400 mt-1">{errors.proposedDate.message}</p>}
              </div>

              <div>
                <label className="label flex items-center gap-1.5">
                  <Clock size={12} /> New Time
                </label>
                <input type="time" {...register('proposedTime')} className="input" style={{ colorScheme: 'dark' }} />
                {errors.proposedTime && <p className="text-xs text-red-400 mt-1">{errors.proposedTime.message}</p>}
              </div>

              <div>
                <label className="label flex items-center gap-1.5">
                  <MapPin size={12} /> New Location
                </label>
                <input type="text" placeholder="e.g. Library 3rd floor..." {...register('proposedLocation')} className="input" />
                {errors.proposedLocation && <p className="text-xs text-red-400 mt-1">{errors.proposedLocation.message}</p>}
              </div>

              <div>
                <label className="label flex items-center gap-1.5">
                  <FileText size={12} /> Notes <span className="text-text-muted normal-case">(optional)</span>
                </label>
                <textarea rows={3} placeholder="Reason for reschedule..." {...register('sellerNote')} className="input resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <Dialog.Close asChild>
                  <button type="button" className="btn-ghost flex-1 py-2.5 rounded-full">Cancel</button>
                </Dialog.Close>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
                  <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2 h-11" disabled={isPending}>
                    {isPending && <Loader2 size={15} className="animate-spin" />}
                    <span>{isPending ? 'Sending…' : 'Propose'}</span>
                  </button>
                </motion.div>
              </div>
            </form>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
