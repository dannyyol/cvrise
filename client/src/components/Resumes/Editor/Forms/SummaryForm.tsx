import { useCVStore } from '../../../../store/useCVStore';
import { RichTextEditor } from '../../../ui/RichTextEditor';

export const SummaryForm = () => {
  const { cvData, updateSummary } = useCVStore();

  return (
    <div className="form-container professional-summary-form">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">Professional Summary</h3>
          <p className="text-sm text-slate-500">Write a brief overview of your background and goals.</p>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-content">
            <div className="flex-1">
                 <RichTextEditor
                    value={cvData?.professionalSummary?.content}
                    onChange={updateSummary}
                    placeholder="e.g. Dedicated and experienced Software Engineer with over 5 years of experience in building scalable web applications..."
                    className="rich-text-container-borderless"
                  />
                  <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Tip: Keep it concise and focused on your key achievements and skills.
                  </p>
            </div>
        </div>
      </div>
    </div>
  );
};
