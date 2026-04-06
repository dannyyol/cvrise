import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Briefcase } from 'lucide-react';
import { clsx } from 'clsx';
import { Input, TextArea } from '../../ui/Form';
import { Button } from '../../ui/Button';
import type { CoverLetterTemplateId } from '../../../types/resume';

interface JobContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (
    jobTitle: string,
    jobDescription: string,
    options: {
      tailorResume: boolean;
      generateCoverLetter: boolean;
      templateKey: CoverLetterTemplateId;
    }
  ) => Promise<void>;
}

export const JobContextModal = ({ isOpen, onClose, onGenerate }: JobContextModalProps) => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tailorResume, setTailorResume] = useState(true);
  const [generateCoverLetter, setGenerateCoverLetter] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobDescription) return;
    
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      await onGenerate(jobTitle, jobDescription, { 
        tailorResume, 
        generateCoverLetter, 
        templateKey: 'soft-modern', 
      });
      setIsGenerating(false);
      onClose();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Failed to generate. Please try again.';
      setErrorMsg(detail);
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    Tailor to Job
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 projects-form">
                  {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm flex items-start gap-3">
                      <div className="mt-0.5 text-red-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p>{errorMsg}</p>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-full">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-blue-900">AI-Powered Tailoring</h4>
                        <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                          We'll analyze the job description to optimize your application. Select what you'd like to generate below.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className={clsx(
                      "relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md",
                      tailorResume ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500/20" : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                    )}>
                      <input
                        type="checkbox"
                        checked={tailorResume}
                        onChange={(e) => setTailorResume(e.target.checked)}
                        className="sr-only"
                      />
                      <span className={clsx("font-bold mb-1 transition-colors", tailorResume ? "text-blue-700" : "text-gray-900")}>Tailor Resume</span>
                      <span className="text-xs text-gray-500 leading-relaxed">Rewrite summary & highlight relevant skills</span>
                      <div className={clsx(
                        "absolute top-4 right-4 transition-all duration-200",
                        tailorResume ? "text-blue-500 scale-100 opacity-100" : "scale-75 opacity-0"
                      )}>
                        <div className="bg-blue-100 rounded-full p-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </label>

                    <label className={clsx(
                      "relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md",
                      generateCoverLetter ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500/20" : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                    )}>
                      <input
                        type="checkbox"
                        checked={generateCoverLetter}
                        onChange={(e) => setGenerateCoverLetter(e.target.checked)}
                        className="sr-only"
                      />
                      <span className={clsx("font-bold mb-1 transition-colors", generateCoverLetter ? "text-blue-700" : "text-gray-900")}>Cover Letter</span>
                      <span className="text-xs text-gray-500 leading-relaxed">Generate a matching cover letter</span>
                      <div className={clsx(
                        "absolute top-4 right-4 transition-all duration-200",
                        generateCoverLetter ? "text-blue-500 scale-100 opacity-100" : "scale-75 opacity-0"
                      )}>
                        <div className="bg-blue-100 rounded-full p-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="space-y-5">
                    <Input
                      label="Job Title"
                      name="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      icon={<Briefcase className="w-4 h-4" />}
                      required
                      className="input-field-borderless"
                    />

                    <TextArea
                      label="Job Description"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={6}
                      placeholder="Paste the full job description here..."
                      required
                      className="min-h-[150px] rounded-2xl"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors shadow-sm"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isGenerating}
                      leftIcon={<Sparkles className="w-4 h-4" />}
                      className="rounded-xl"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Application'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
