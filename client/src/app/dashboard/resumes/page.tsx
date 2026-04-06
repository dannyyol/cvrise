"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCVStore } from '../../../store/useCVStore';
import { resumeService } from '../../../services/resumeService';
import type { ResumeSummary } from '../../../services/resumeService';
import type { CoverLetterTemplateId } from '../../../types/resume';
import { FileText, Plus, Clock, Trash2, Pencil, Briefcase } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { ErrorState } from '../../../components/ui/ErrorState';
import { PageTitle } from '../../../components/ui/PageTitle';
import { JobContextModal } from '../../../components/Resumes/Editor/JobContextModal';
import { CoverLetterHistoryDrawer } from '../../../components/CoverLetters/Editor/CoverLetterHistoryDrawer';
import { CreateResumeModal } from '../../../components/Resumes/Modals/CreateResumeModal';
import { RenameResumeModal } from '../../../components/Resumes/Modals/RenameResumeModal';
import { DeleteResumeModal } from '../../../components/Resumes/Modals/DeleteResumeModal';
import { ROUTES } from '../../../lib/routes';

export default function ResumesPage() {
  const router = useRouter();

  const { fetchResumeById, setCurrentResumeId, generateCoverLetter, setDocumentMode, currentResumeId, templates, fetchTemplates } = useCVStore();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Resume Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Rename Resume Modal State
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [resumeToRename, setResumeToRename] = useState<ResumeSummary | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  // Job Context Modal State
  const [isJobContextOpen, setIsJobContextOpen] = useState(false);
  const [resumeToTailor, setResumeToTailor] = useState<string | null>(null);
  const [historyForResume, setHistoryForResume] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const loadResumes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await resumeService.getAllResumes();
      setResumes(data);
      setError(null);
    } catch (err) {
      setError('Failed to load resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResumes();
    fetchTemplates();
  }, [fetchTemplates, loadResumes]);

  const handleSelectResume = async (id: string) => {
    try {
      setCurrentResumeId(id);
      router.push(ROUTES.EDITOR);
    } catch (err) {
    }
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreate = async (
    titleOrPayload: string | { title: string; createAndTailor?: boolean },
    maybeCreateAndTailor?: boolean
  ) => {
    const title =
      typeof titleOrPayload === 'string' ? titleOrPayload : titleOrPayload.title;
    const createAndTailor =
      typeof titleOrPayload === 'string'
        ? !!maybeCreateAndTailor
        : !!titleOrPayload.createAndTailor;

    if (!title.trim()) return;

    try {
      setIsCreating(true);
      const finalTitle = title.trim() || 'Untitled Resume';
      const newResume = await resumeService.createResume(finalTitle, 'classic', createAndTailor);
      setCurrentResumeId(newResume.id);
      setIsCreateModalOpen(false);
      
      if (createAndTailor) {
        setResumeToTailor(newResume.id);
        setIsJobContextOpen(true);
      } else {
        router.push(ROUTES.EDITOR);
      }
    } catch (err) {
      setError('Failed to create new resume. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTailorToJob = async (e: React.MouseEvent, resumeId: string) => {
    e.stopPropagation();
    try {
      await fetchResumeById(resumeId);
      setResumeToTailor(resumeId);
      setIsJobContextOpen(true);
    } catch (err) {
    }
  };

  const handleGenerateTailoredContent = async (
    jobTitle: string,
    jobDescription: string,
    options: {
      tailorResume: boolean;
      generateCoverLetter: boolean;
      templateKey: CoverLetterTemplateId;
    }
  ) => {
    if (options.generateCoverLetter) {
      const company = jobTitle.split(' at ')[1] || 'Company';
      setDocumentMode('cover-letter');
      await generateCoverLetter({
        title: `${jobTitle} @ ${company}`,
        recipientName: 'Hiring Manager',
        recipientTitle: 'Hiring Manager',
        companyName: company,
        companyAddress: '',
        jobTitle,
        jobDescription,
        templateKey: options.templateKey,
      });
    } else {
      setDocumentMode('resume');
    }

    if (options.tailorResume) {
      await useCVStore.getState().tailorResume({
        jobTitle,
        jobDescription,
        tone: 'professional',
      });
      setDocumentMode('resume');
    }

    const idToOpen = resumeToTailor;
    if (idToOpen) {
      setCurrentResumeId(idToOpen);
      router.push(ROUTES.EDITOR);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setResumeToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!resumeToDelete) return;
    
    try {
      setIsDeleting(true);
      await resumeService.deleteResume(resumeToDelete);
      setResumes(resumes.filter(r => r.id !== resumeToDelete));
      setResumeToDelete(null);
    } catch (err) {
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenameClick = (e: React.MouseEvent, resume: ResumeSummary) => {
    e.stopPropagation();
    setResumeToRename(resume);
    setIsRenameModalOpen(true);
  };

  const handleConfirmRename = async (title: string) => {
    if (!resumeToRename || !title.trim()) return;

    try {
      setIsRenaming(true);

      const fullResume = await resumeService.getResumeById(resumeToRename.id);
      
      // Update title
      const updatedResume = { ...fullResume, title: title.trim() };
      
      // Save
      await resumeService.updateResume(resumeToRename.id, updatedResume);
      
      setResumes(resumes.map(r => 
        r.id === resumeToRename.id ? { ...r, title: title.trim(), updatedAt: new Date().toISOString() } : r
      ));
      
      setIsRenameModalOpen(false);
      setResumeToRename(null);
    } catch (err) {
      console.error('Failed to rename resume:', err);
      setError('Failed to rename resume. Please try again.');
    } finally {
      setIsRenaming(false);
    }
  };

  const getTemplateName = (id: string) => {
    return templates.find(t => t.key === id)?.name || id;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto bg-slate-50/50 p-4 md:p-6 font-sans scrollbar-thin scrollbar-thumb-slate-200">
        <div className="mx-auto w-full max-w-7xl space-y-8 2xl:max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <PageTitle
                title="My Resumes"
                icon={<FileText className="w-7 h-7" />}
                description="Manage and edit your saved resumes."
                titleClassName="text-2xl text-slate-900"
              />
            </div>

            <button
              disabled
              aria-disabled="true"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium transition-all shadow-sm w-full sm:w-auto opacity-60 cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Create New
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="h-40 bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-2/3 bg-slate-200 rounded-full" />
                  <div className="h-3 w-full bg-slate-100 rounded-full" />
                  <div className="h-3 w-5/6 bg-slate-100 rounded-full" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full p-8 bg-slate-50/50 flex items-center justify-center">
        <ErrorState
          title="Failed to load resumes"
          message={error}
          onRetry={loadResumes}
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50/50 p-4 md:p-6 font-sans scrollbar-thin scrollbar-thumb-slate-200">
      <div className="mx-auto w-full max-w-7xl space-y-8 2xl:max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <PageTitle
              title="My Resumes"
              icon={<FileText className="w-7 h-7" />}
              description="Manage and edit your saved resumes."
              titleClassName="text-2xl text-slate-900"
            />
          </div>
          
          <button
            onClick={handleCreateClick}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-95 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Create New
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume, index) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelectResume(resume.id)}
              className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left cursor-pointer relative"
            >
              <div className="h-40 bg-slate-100 border-b border-slate-100 relative overflow-hidden flex items-center justify-center">
                 <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100" />
                 <FileText className="w-16 h-16 text-slate-300 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                 
                 <div className="absolute top-4 right-4 z-20">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur shadow-sm text-slate-600">
                        {getTemplateName(resume.template_key)}
                    </Badge>
                 </div>
                 
                 <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 z-30 backdrop-blur-[2px]">
                    <button
                        onClick={(e) => handleTailorToJob(e, resume.id)}
                        className="p-2 bg-white rounded-full text-slate-700 hover:text-blue-600 hover:scale-110 transition-all shadow-lg"
                        title="Tailor to Job"
                    >
                        <Briefcase className="w-5 h-5" />
                    </button>
                    <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await fetchResumeById(resume.id);
                            setHistoryForResume(resume.id);
                            setIsHistoryOpen(true);
                          } catch (err) {
                            console.error('Failed to open history:', err);
                          }
                        }}
                        className="p-2 bg-white rounded-full text-slate-700 hover:text-blue-600 hover:scale-110 transition-all shadow-lg"
                        title="History"
                    >
                        <Clock className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => handleRenameClick(e, resume)}
                        className="p-2 bg-white rounded-full text-slate-700 hover:text-blue-600 hover:scale-110 transition-all shadow-lg"
                        title="Rename Resume"
                    >
                        <Pencil className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => handleDeleteClick(e, resume.id)}
                        className="p-2 bg-white rounded-full text-slate-700 hover:text-red-600 hover:scale-110 transition-all shadow-lg"
                        title="Delete Resume"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>

              <div className="p-5 flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {resume.title || 'Untitled Resume'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    Last edited on {formatDate(resume.updatedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-50 pt-4 mt-auto">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Updated {formatDate(resume.updatedAt)}</span>
                    </div>
                </div>
              </div>
            </motion.div>
          ))}

          {resumes.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No resumes found</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                    You haven&apos;t created any resumes yet. Start by creating your first resume!
                </p>
            </div>
          )}
        </div>
      </div>

      <DeleteResumeModal
        isOpen={!!resumeToDelete}
        onClose={() => setResumeToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <CreateResumeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleConfirmCreate}
        isCreating={isCreating}
      />

      <RenameResumeModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onSubmit={handleConfirmRename}
        initialTitle={resumeToRename?.title || ''}
        isRenaming={isRenaming}
      />
      {/* Job Context Modal */}
      <JobContextModal
        isOpen={isJobContextOpen}
        onClose={() => setIsJobContextOpen(false)}
        onGenerate={handleGenerateTailoredContent}
      />
      <CoverLetterHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelect={() => {
          const id = historyForResume || currentResumeId;
          if (id) {
            router.push(`${ROUTES.EDITOR}?source=cover-letter-history`);
          }
        }}
      />
    </div>
  );
};
