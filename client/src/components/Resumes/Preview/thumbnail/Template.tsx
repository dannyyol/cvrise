import { initialCVData } from '../../../../store/useCVStore';
import { getTemplateComponent, isTemplateId, mapCVDataToTemplateProps } from '../templates/registry';

const A4_UK = {
  width: 794,
  height: 1123,
  margin: 40,
};

export default function Template() {
  const params = new URLSearchParams(window.location.search);
  const templateParam = params.get('template');
  if (!templateParam || !isTemplateId(templateParam)) {
    return (
      <div className="w-full min-h-screen bg-neutral-100 flex items-center justify-center py-8">
        <div className="bg-white border border-neutral-200 rounded-lg px-6 py-4 text-neutral-700">
          Missing or invalid template
        </div>
      </div>
    );
  }
  const accent = params.get('accent') || '#475569';

  const commonProps = mapCVDataToTemplateProps({
    ...initialCVData,
    theme: {
      ...initialCVData.theme,
      primaryColor: accent,
    },
  });

  const renderTemplate = () => {
    const TemplateComponent = getTemplateComponent(templateParam);
    return <TemplateComponent {...commonProps} />;
  };

  return (
    <div className="w-full min-h-screen bg-neutral-100 flex items-center justify-center py-8">
      <div
        className="page bg-white"
        style={{
          width: `${A4_UK.width}px`,
          height: `${A4_UK.height}px`,
          boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        {(() => {
          const pageInnerStyle = {
            boxSizing: 'border-box',
            width: `${A4_UK.width}px`,
            height: `${A4_UK.height}px`,
            padding: `${A4_UK.margin}px`,
            ['--cv-padding']: `${A4_UK.margin}px`,
            overflow: 'hidden',
          } as React.CSSProperties & Record<string, string>;
          return (
            <div className="page-inner cv-preview-container" style={pageInnerStyle}>
              {renderTemplate()}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
