"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from "next/navigation";
import { Plus, MoreVertical, ExternalLink, Clock, Upload, Loader2 } from 'lucide-react';
import { resumeService } from '@/src/services/resumeService';
import type { ResumeSummary } from '@/src/services/resumeService';
import { useCVStore } from '@/src/store/useCVStore';
import { CreateResumeModal } from '@/src/components/Resumes/Modals/CreateResumeModal';
import { motion } from 'framer-motion';
import { ROUTES } from '@/src/lib/routes';

export default function DashboardPage () {
  const router = useRouter();
  const { setCurrentResumeId } = useCVStore();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await resumeService.getAllResumes();
        setResumes(data);
        if (data.length > 0) {
          setCurrentResumeId(data[0].id);
        } else {
          setCurrentResumeId(null);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [setCurrentResumeId]);

  const handleCreateResume = async (title: string, createAndTailor: boolean) => {
    try {
      setIsCreating(true);
      const finalTitle = title.trim() || 'Untitled Resume';
      const newResume = await resumeService.createResume(finalTitle, 'classic', createAndTailor);
      setCurrentResumeId(newResume.id);
      setIsCreateModalOpen(false);
      router.push(ROUTES.EDITOR);
    } catch {
    } finally {
      setIsCreating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const resume = await resumeService.uploadResume(file);
      setCurrentResumeId(resume.id);
      router.push(ROUTES.EDITOR);
    } catch {
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 font-sans scrollbar-thin scrollbar-thumb-slate-200">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-6xl">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              Workspace
            </h1>
            <p className="text-slate-500 text-lg">
              Manage your career documents and applications.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-full hover:bg-slate-50 font-medium transition-all hover:shadow-sm disabled:opacity-50"
            >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{isUploading ? 'Importing...' : 'Import PDF'}</span>
            </button>
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf"
            />
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-3xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="group relative flex flex-col items-center justify-center h-72 rounded-3xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer"
            >
              <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm group-hover:shadow-md">
                <Plus className="w-7 h-7" />
              </div>
              <span className="font-bold text-lg text-slate-900 mb-1">New Resume</span>
              <span className="text-sm text-slate-500">Create from scratch</span>
            </motion.button>

            {resumes.map((resume, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={resume.id}
                className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-72 flex flex-col"
              >
                <div 
                  className="flex-1 bg-slate-50 p-6 relative overflow-hidden cursor-pointer"
                  onClick={() => {
                    setCurrentResumeId(resume.id);
                    router.push(ROUTES.EDITOR);
                  }}
                >
                  <div className="w-full h-full bg-white shadow-sm rounded-t-lg opacity-90 transform group-hover:translate-y-[-8px] transition-transform duration-500 p-4 space-y-3 border border-slate-100">
                    <div className="flex gap-3 mb-2">
                       <div className="h-8 w-8 bg-slate-100 rounded-full shrink-0"></div>
                       <div className="space-y-1 w-full">
                         <div className="h-2 w-1/2 bg-slate-200 rounded-full"></div>
                         <div className="h-2 w-1/3 bg-slate-100 rounded-full"></div>
                       </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full"></div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full"></div>
                    <div className="h-1.5 w-5/6 bg-slate-100 rounded-full"></div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full"></div>
                    <div className="mt-4 flex gap-2">
                       <div className="h-12 w-1/2 bg-slate-50 rounded-lg"></div>
                       <div className="h-12 w-1/2 bg-slate-50 rounded-lg"></div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentResumeId(resume.id);
                        router.push(ROUTES.EDITOR);
                      }}
                      className="bg-[#0572AD] text-white px-6 py-2.5 rounded-full font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all hover:bg-[#046193] hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <span>Open Editor</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5 border-t border-slate-50 bg-white z-10 flex justify-between items-center">
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-slate-900 truncate pr-2 text-base group-hover:text-blue-600 transition-colors">
                      {resume.title || 'Untitled Resume'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(resume.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CreateResumeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateResume}
        isCreating={isCreating}
      />
    </div>
  );
};
