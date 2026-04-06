"use client";

import { useCVStore } from '../../../store/useCVStore';
import { getTemplateComponent, isTemplateId, mapCVDataToTemplateProps } from './templates/registry';
import PaginatedPreview from './PaginatedPreview';
import { ErrorState } from '../../ui/ErrorState';

interface CVPreviewProps {
  scaleMode?: 'fit' | 'fill';
}

export const CVPreview = ({ scaleMode = "fit" }: CVPreviewProps) => {
  const { cvData, selectedTemplate } = useCVStore();

  if (!isTemplateId(selectedTemplate)) {
    return (
      <div className="flex justify-center w-full">
        <ErrorState
          title="Unknown template"
          message={`Template "${selectedTemplate}" is not supported by this client.`}
          showRetry={false}
        />
      </div>
    );
  }

  const renderTemplate = () => {
    const TemplateComponent = getTemplateComponent(selectedTemplate);
    const templateProps = mapCVDataToTemplateProps(cvData);
    
    return <TemplateComponent {...templateProps} />;
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <PaginatedPreview 
        templateId={selectedTemplate}
        accentColor={cvData.theme.primaryColor}
        fontFamily={cvData.theme.fontFamily}
        fontSize={cvData.theme.fontSize}
        letterSpacing={cvData.theme.letterSpacing}
        lineSpacing={cvData.theme.lineSpacing}
        scaleMode={scaleMode}
      >
        {renderTemplate()}
      </PaginatedPreview>
    </div>
  );
};
