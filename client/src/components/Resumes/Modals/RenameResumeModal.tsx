import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Form';

interface RenameResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => Promise<void>;
  initialTitle: string;
  isRenaming: boolean;
}

export const RenameResumeModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialTitle, 
  isRenaming 
}: RenameResumeModalProps) => {
  function ModalContent({
    keyId,
  }: {
    keyId: string;
  }) {
    const [title, setTitle] = useState(initialTitle);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;
      await onSubmit(title);
    };

    return (
      <form key={keyId} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Enter a new name for your resume.
          </p>
          <Input
            autoFocus
            label="Resume Title"
            placeholder="e.g. Software Engineer, Marketing Manager"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            disabled={isRenaming}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || isRenaming}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRenaming && <Loader2 className="w-4 h-4 animate-spin" />}
            {isRenaming ? 'Renaming...' : 'Save Changes'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rename Resume"
      maxWidth="sm"
    >
      <ModalContent keyId={isOpen ? `open-${initialTitle}` : 'closed'} />
    </Modal>
  );
};
