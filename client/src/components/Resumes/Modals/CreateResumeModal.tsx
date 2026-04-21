import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Form';

interface CreateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, createAndTailor: boolean) => Promise<void>;
  isCreating: boolean;
}

export const CreateResumeModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isCreating 
}: CreateResumeModalProps) => {
  function ModalContent({ keyId }: { keyId: string }) {
    const [title, setTitle] = useState('');
    const [createAndTailor, setCreateAndTailor] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;
      await onSubmit(title, createAndTailor);
    };

    return (
      <form key={keyId} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Give your resume a name to help you identify it later.
          </p>
          <Input
            autoFocus
            label="Resume Title"
            placeholder="e.g. Software Engineer, Marketing Manager"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <div className="mt-4 p-4 border border-blue-100 bg-blue-50/50 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={createAndTailor}
                onChange={(e) => setCreateAndTailor(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div>
                <span className="block font-medium text-gray-900">Tailor to Job Application</span>
                <span className="block text-sm text-gray-500 mt-0.5">
                  Immediately optimize this resume for a specific job description and optionally create a cover letter.
                </span>
              </div>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || isCreating}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isCreating ? 'Creating...' : 'Create Resume'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Resume"
      maxWidth="sm"
    >
      <ModalContent keyId={isOpen ? 'open' : 'closed'} />
    </Modal>
  );
};
