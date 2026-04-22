import { useCVStore } from '../../../store/useCVStore';
import { COVER_LETTER_TEMPLATE_COMPONENTS, mapCVDataToCLTemplateProps } from './templates/registry';
import PaginatedPreview from '../../Resumes/Preview/PaginatedPreview';

interface CoverLetterPreviewProps {
  scaleMode?: 'fit' | 'fill';
}

export const CoverLetterPreview = ({ scaleMode = "fit" }: CoverLetterPreviewProps) => {
  const { cvData } = useCVStore();
  const { coverLetter, coverLetterTheme, theme } = cvData;
  const templateKey = coverLetterTheme?.templateKey || coverLetter?.templateKey || 'soft-modern';
  const TemplateComponent =
    COVER_LETTER_TEMPLATE_COMPONENTS[templateKey] ?? COVER_LETTER_TEMPLATE_COMPONENTS['soft-modern'];
  const props = mapCVDataToCLTemplateProps(cvData);

  if (!coverLetter || !TemplateComponent) return null;

  return (
    <div className="flex justify-center w-full">
      <PaginatedPreview 
        templateId={templateKey}
        accentColor={coverLetterTheme?.primaryColor || theme.primaryColor}
        fontFamily={coverLetterTheme?.fontFamily || theme.fontFamily}
        fontSize={coverLetterTheme?.fontSize || theme.fontSize}
        letterSpacing={coverLetterTheme?.letterSpacing || theme.letterSpacing}
        lineSpacing={coverLetterTheme?.lineSpacing || theme.lineSpacing}
        scaleMode={scaleMode}
      >
        <TemplateComponent {...props} />
      </PaginatedPreview>
    </div>
  );
};
