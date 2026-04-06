import { Loader2 } from 'lucide-react';
import { Modal } from '../../ui/Modal';

interface DeleteResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteResumeModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting 
}: DeleteResumeModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Resume"
      maxWidth="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-gray-500">
          Are you sure you want to delete this resume? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete Resume'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
