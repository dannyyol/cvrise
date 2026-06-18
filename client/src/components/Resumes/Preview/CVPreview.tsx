"use client";

import { useCVStore } from '../../../store/useCVStore';
import type { TemplateId, TemplateProps } from '../../../types/resume';
import { getTemplateComponent, isTemplateId, mapCVDataToTemplateProps } from './templates/registry';
import PaginatedPreview from './PaginatedPreview';
import { ErrorState } from '../../ui/ErrorState';

interface CVPreviewProps {
  scaleMode?: 'fit' | 'fill';
  data?: TemplateProps;
  templateId?: TemplateId;
}

export const CVPreview = ({ scaleMode = "fit", data, templateId }: CVPreviewProps) => {
  const { cvData, selectedTemplate } = useCVStore();
  const previewData = data ?? cvData;
  const previewTemplate = templateId ?? selectedTemplate;

  if (!isTemplateId(previewTemplate)) {
    return (
      <div className="flex justify-center w-full">
        <ErrorState
          title="Unknown template"
          message={`Template "${previewTemplate}" is not supported by this client.`}
          showRetry={false}
        />
      </div>
    );
  }

  const renderTemplate = () => {
    const TemplateComponent = getTemplateComponent(previewTemplate);
    const templateProps = mapCVDataToTemplateProps(previewData);
    
    return <TemplateComponent {...templateProps} />;
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <PaginatedPreview 
        templateId={previewTemplate}
        accentColor={previewData.theme.primaryColor}
        fontFamily={previewData.theme.fontFamily}
        fontSize={previewData.theme.fontSize}
        letterSpacing={previewData.theme.letterSpacing}
        lineSpacing={previewData.theme.lineSpacing}
        scaleMode={scaleMode}
      >
        {renderTemplate()}
      </PaginatedPreview>
    </div>
  );
};
