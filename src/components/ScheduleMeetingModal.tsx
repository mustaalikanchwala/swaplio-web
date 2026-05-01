import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { InputField, TextareaField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { meetingsApi } from '@/api/meetings';

const schema = z.object({
  meetingDate: z.string().min(1, 'Date is required'),
  meetingTime: z.string().min(1, 'Time is required'),
  location: z.string().min(3, 'Location is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string | number;
  listingTitle?: string;
  onSuccess?: () => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        listingId,
        ...data,
        meetingTime: data.meetingTime.length === 5 ? `${data.meetingTime}:00` : data.meetingTime,
      };
      await meetingsApi.create(payload);
      toast.success('Meeting scheduled! 🎉', { className: 'toast-custom' });
      reset();
      onClose();
      onSuccess?.();
    } catch {
      // error handled by interceptor
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); reset(); }} title="Schedule a Meeting">
      {listingTitle && (
        <p className="text-sm text-muted mb-5 -mt-3">
          for <span className="text-primary font-medium">{listingTitle}</span>
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="schedule-meeting-form">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            id="meeting-date"
            label="Date"
            type="date"
            min={today}
            leftIcon={<Calendar size={15} />}
            error={errors.meetingDate?.message}
            {...register('meetingDate')}
          />
          <InputField
            id="meeting-time"
            label="Time"
            type="time"
            leftIcon={<Clock size={15} />}
            error={errors.meetingTime?.message}
            {...register('meetingTime')}
          />
        </div>

        <InputField
          id="meeting-location"
          label="Location"
          placeholder="e.g., College canteen, Library entrance"
          leftIcon={<MapPin size={15} />}
          error={errors.location?.message}
          {...register('location')}
        />

        <TextareaField
          id="meeting-notes"
          label="Notes (optional)"
          placeholder="Any specific details or instructions..."
          rows={3}
          {...register('notes')}
        />

        <div className="flex gap-3 pt-2">
          <Button
            id="schedule-meeting-cancel-btn"
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => { onClose(); reset(); }}
          >
            Cancel
          </Button>
          <Button
            id="schedule-meeting-submit-btn"
            type="submit"
            variant="primary"
            fullWidth
            loading={isSubmitting}
          >
            Schedule Meeting
          </Button>
        </div>
      </form>
    </Modal>
  );
};

