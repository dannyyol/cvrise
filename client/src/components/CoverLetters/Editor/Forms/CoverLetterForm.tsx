import React, { useState } from 'react';
import { useCVStore } from '../../../../store/useCVStore';
import { Input } from '../../../ui/Form';
import { RichTextEditor } from '../../../ui/RichTextEditor';
import { User, Building2, MapPin, RefreshCw, Briefcase, FileText, ChevronDown, ChevronUp } from 'lucide-react';

export const CoverLetterForm = () => {
  const { cvData, updateCoverLetter, generateCoverLetter } = useCVStore();
  const { coverLetter } = cvData;
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecipientOpen, setIsRecipientOpen] = useState(false);

  if (!coverLetter) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateCoverLetter({ [name]: value });
  };

  const handleContentChange = (content: string) => {
    updateCoverLetter({ content });
  };

  const handleRegenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const company = coverLetter.companyName || 'Company';
    try {
      await generateCoverLetter({
        title: `${coverLetter.jobTitle || 'Cover Letter'} @ ${company}`,
        recipientName: coverLetter.recipientName || 'Hiring Manager',
        recipientTitle: coverLetter.recipientTitle || 'Hiring Manager',
        companyName: company,
        companyAddress: coverLetter.companyAddress || '',
        jobTitle: coverLetter.jobTitle || '',
        jobDescription: coverLetter.jobDescription || '',
        templateKey: coverLetter.templateKey || 'soft-modern',
      });
    } catch {
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm border border-blue-100/50">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Recipient Details</h4>
              <p className="text-sm text-gray-500">Who are you writing to?</p>
            </div>
          </div>
          <button
            onClick={() => setIsRecipientOpen(!isRecipientOpen)}
            className="text-gray-400 p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle recipient details section"
          >
            {isRecipientOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {isRecipientOpen ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Hiring Manager Name"
                name="recipientName"
                value={coverLetter.recipientName}
                onChange={handleChange}
                icon={<User className="w-4 h-4" />}
                placeholder="e.g. Jane Smith"
              />
              <Input
                label="Hiring Manager Title"
                name="recipientTitle"
                value={coverLetter.recipientTitle}
                onChange={handleChange}
                icon={<Briefcase className="w-4 h-4" />}
                placeholder="e.g. Hiring Manager"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Company Name"
                name="companyName"
                value={coverLetter.companyName}
                onChange={handleChange}
                icon={<Building2 className="w-4 h-4" />}
                placeholder="e.g. Acme Corp"
              />
              <Input
                label="Company Address"
                name="companyAddress"
                value={coverLetter.companyAddress}
                onChange={handleChange}
                icon={<MapPin className="w-4 h-4" />}
                placeholder="e.g. 123 Tech Lane, San Francisco, CA"
              />
            </div>
          </>
        ) : null}
      </div>

      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm border border-blue-100/50">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Letter Content</h4>
              <p className="text-sm text-gray-500">The main body of your cover letter.</p>
            </div>
          </div>
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </>
            )}
          </button>
        </div>

        <RichTextEditor
          label="Body Content"
          value={coverLetter.content}
          onChange={handleContentChange}
          placeholder="Dear Hiring Manager..."
          className="min-h-[400px]"
        />
      </div>
    </div>
  );
};
