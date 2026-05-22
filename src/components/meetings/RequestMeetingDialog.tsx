'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, MapPin, Clock, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRequestMeeting } from '@/hooks/useMeetings';

const schema = z.object({
  meetingDate: z.string().min(1, 'Date is required'),
  meetingTime: z.string().min(1, 'Time is required'),
  location: z.string().min(2, 'Location is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface RequestMeetingDialogProps {
  listingId: string;
  listingTitle: string;
  trigger: React.ReactNode;
}

export function RequestMeetingDialog({
  listingId,
  listingTitle,
  trigger,
}: RequestMeetingDialogProps) {
  const { mutateAsync, isPending } = useRequestMeeting();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync({
        listingId,
        meetingDate: data.meetingDate,
        meetingTime: data.meetingTime, // formatTime called inside useMeetings
        location: data.location,
        notes: data.notes,
      });
      toast.success('Meeting request sent!');
      reset();
    } catch {
      toast.error('Failed to send meeting request.');
    }
  };

  // Get today's date for min date attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass p-6 shadow-2xl shadow-violet-500/10 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <Dialog.Title className="font-bold text-[var(--text-primary)] text-lg">
                Request a Meeting
              </Dialog.Title>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">
                {listingTitle}
              </p>
            </div>
            <Dialog.Close className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all">
              <X size={18} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Date */}
            <div>
              <label className="label flex items-center gap-1.5">
                <Calendar size={12} /> Preferred Date
              </label>
              <input
                type="date"
                min={today}
                {...register('meetingDate')}
                className="input"
                style={{ colorScheme: 'dark' }}
              />
              {errors.meetingDate && (
                <p className="text-xs text-red-400 mt-1">{errors.meetingDate.message}</p>
              )}
            </div>

            {/* Time */}
            <div>
              <label className="label flex items-center gap-1.5">
                <Clock size={12} /> Preferred Time
              </label>
              <input
                type="time"
                {...register('meetingTime')}
                className="input"
                style={{ colorScheme: 'dark' }}
              />
              {errors.meetingTime && (
                <p className="text-xs text-red-400 mt-1">{errors.meetingTime.message}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="label flex items-center gap-1.5">
                <MapPin size={12} /> Location
              </label>
              <input
                type="text"
                placeholder="e.g. Library 2nd floor, Cafeteria..."
                {...register('location')}
                className="input"
              />
              {errors.location && (
                <p className="text-xs text-red-400 mt-1">{errors.location.message}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="label flex items-center gap-1.5">
                <FileText size={12} /> Notes <span className="text-[var(--text-muted)] normal-case">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Any additional info..."
                {...register('notes')}
                className="input resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Dialog.Close asChild>
                <button type="button" className="btn-ghost flex-1">
                  Cancel
                </button>
              </Dialog.Close>
              <button type="submit" className="btn-primary flex-1" disabled={isPending}>
                {isPending ? <Loader2 size={15} className="animate-spin" /> : null}
                {isPending ? 'Sending…' : 'Send Request'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
