import { useState, useEffect } from 'react';
import { useCVStore } from '@/src/store/useCVStore';
import { Palette, Type, ChevronDown, Scaling, MoveHorizontal, MoveVertical, CalendarDays } from 'lucide-react';
import { cn } from '@/src/components/ui/Form';
import { AccentColorPicker } from '@/src/components/Theme/AccentColorPicker';
import { FontFamilySelect } from '@/src/components/Theme/FontFamilySelect';
import { Card, CardHeader, CardContent } from '@/src/components/ui/Card';
import {
  getFontSizeFromSliderValue,
  getFontSizeSliderValue,
  getLetterSpacingCssValue,
  getLetterSpacingFromSliderValue,
  getLetterSpacingSliderValue,
  getLineHeightCssValue,
  getLineSpacingFromSliderValue,
  getLineSpacingSliderValue,
  getRootFontSizePx,
  type FontSizeSetting,
  type LetterSpacingSetting,
  type LineSpacingSetting,
} from '@/src/lib/typography';

export const ThemeSettingsForm = () => {
  const { 
    cvData, 
    updateTheme, 
    updateCoverLetterTheme, 
    selectedTemplate, 
    activeDocumentMode, 
    templates,
    fetchTemplates,
    coverLetterTemplates,
    fetchCoverLetterTemplates,
    currentResumeId,
    saveResume
  } = useCVStore();
  const { theme, coverLetterTheme } = cvData;
  const currentTemplate = templates.find(t => t.key === selectedTemplate);
  const supportsAccent = activeDocumentMode === 'cover-letter' ? true : (currentTemplate?.supports_accent ?? true);
  const [isOpen, setIsOpen] = useState(true);
  const dateLocale = (activeDocumentMode === 'cover-letter' ? (coverLetterTheme?.dateLocale ?? theme.dateLocale) : theme.dateLocale) || 'en-US';
  const fontSize: FontSizeSetting =
    (activeDocumentMode === 'cover-letter' ? (coverLetterTheme?.fontSize ?? theme.fontSize) : theme.fontSize) || 'medium';
  const letterSpacing: LetterSpacingSetting =
    (activeDocumentMode === 'cover-letter' ? (coverLetterTheme?.letterSpacing ?? theme.letterSpacing) : theme.letterSpacing) || 'normal';
  const lineSpacing: LineSpacingSetting =
    (activeDocumentMode === 'cover-letter' ? (coverLetterTheme?.lineSpacing ?? theme.lineSpacing) : theme.lineSpacing) || 'normal';

  const fontSizeValue = getFontSizeSliderValue(fontSize);
  const letterSpacingValue = getLetterSpacingSliderValue(letterSpacing);
  const lineSpacingValue = getLineSpacingSliderValue(lineSpacing);

  const handleColorChange = (key: 'primaryColor' | 'secondaryColor', value: string) => {
    if (activeDocumentMode === 'cover-letter') {
      updateCoverLetterTheme({ [key]: value });
    } else {
      updateTheme({ [key]: value });
    }

    if (currentResumeId) {
      saveResume();
    }
  };

  useEffect(() => {
    if (activeDocumentMode === 'cover-letter' && coverLetterTemplates.length === 0) {
      fetchCoverLetterTemplates();
    }
  }, [activeDocumentMode, coverLetterTemplates.length, fetchCoverLetterTemplates]);

  useEffect(() => {
    if (templates.length === 0) {
      fetchTemplates();
    }
  }, [templates.length, fetchTemplates]);

  return (
    <Card variant="accordion" topBorder shadow={false} className="mb-6">
      <CardHeader 
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="theme-icon">
              <Palette className="w-5 h-5" />
          </div>
          <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Design &amp; Formatting</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Customize your CV&apos;s design and formatting</p>
          </div>
        </div>
        <div className={cn("transition-transform duration-200 text-gray-400", isOpen ? "rotate-180" : "")}>
            <ChevronDown className="w-5 h-5" />
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-10">
          <div className={cn("transition-all duration-300", !supportsAccent && "pointer-events-none select-none")}>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 tracking-wide">
                <Palette className="w-4 h-4 text-gray-400" />
                Accent Color
              </label>
            </div>
            <AccentColorPicker
              value={activeDocumentMode === 'cover-letter' ? (coverLetterTheme?.primaryColor || theme.primaryColor) : theme.primaryColor}
              onChange={(color) => handleColorChange('primaryColor', color)}
              supportsAccent={supportsAccent}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 tracking-wide pb-2 border-b border-gray-100">
              <Type className="w-4 h-4 text-gray-400" />
              Typography
            </label>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4 text-gray-400" />
                  Font Family
                </label>
                <FontFamilySelect
                  value={activeDocumentMode === 'cover-letter' ? (coverLetterTheme?.fontFamily || theme.fontFamily) : theme.fontFamily}
                  onChange={(font) => {
                    if (activeDocumentMode === 'cover-letter') {
                      updateCoverLetterTheme({ fontFamily: font });
                    } else {
                      updateTheme({ fontFamily: font });
                    }
                    if (currentResumeId) {
                      saveResume();
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-semibold text-gray-700 flex items-center gap-2">
                      <Scaling className="w-4 h-4 text-gray-400" />
                      Font Size
                    </label>
                    <span className="text-[10px] font-medium text-gray-400">{getRootFontSizePx(fontSize)}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={fontSizeValue}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const next = getFontSizeFromSliderValue(val);
                      if (activeDocumentMode === 'cover-letter') {
                        updateCoverLetterTheme({ fontSize: next });
                      } else {
                        updateTheme({ fontSize: next });
                      }
                      if (currentResumeId) {
                        saveResume();
                      }
                    }}
                    className="w-full accent-primary-500"
                  />
                  <div className="flex justify-between text-[10px] font-medium text-gray-400 mt-2">
                    <span>Small</span>
                    <span>Medium</span>
                    <span>Large</span>
                    <span>X-Large</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-semibold text-gray-700 flex items-center gap-2">
                      <MoveHorizontal className="w-4 h-4 text-gray-400" />
                      Letter Spacing
                    </label>
                    <span className="text-[10px] font-medium text-gray-400">{getLetterSpacingCssValue(letterSpacing)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={25}
                    value={letterSpacingValue}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const spacing = getLetterSpacingFromSliderValue(val);
                      if (activeDocumentMode === 'cover-letter') {
                        updateCoverLetterTheme({ letterSpacing: spacing });
                      } else {
                        updateTheme({ letterSpacing: spacing });
                      }
                      if (currentResumeId) {
                        saveResume();
                      }
                    }}
                    className="w-full accent-primary-500"
                  />
                  <div className="flex justify-between text-[10px] font-medium text-gray-400 mt-2">
                    <span>Tighter</span>
                    <span>Normal</span>
                    <span>Wider</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-semibold text-gray-700 flex items-center gap-2">
                      <MoveVertical className="w-4 h-4 text-gray-400" />
                      Line Height
                    </label>
                    <span className="text-[10px] font-medium text-gray-400">{getLineHeightCssValue(lineSpacing)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={25}
                    value={lineSpacingValue}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const spacing = getLineSpacingFromSliderValue(val);
                      if (activeDocumentMode === 'cover-letter') {
                        updateCoverLetterTheme({ lineSpacing: spacing });
                      } else {
                        updateTheme({ lineSpacing: spacing });
                      }
                      if (currentResumeId) {
                        saveResume();
                      }
                    }}
                    className="w-full accent-primary-500"
                  />
                  <div className="flex justify-between text-[10px] font-medium text-gray-400 mt-2">
                    <span>Tight</span>
                    <span>Normal</span>
                    <span>Loose</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3 tracking-wide pb-2 border-b border-gray-100">
              <CalendarDays className="w-4 h-4 text-gray-400" />
              Date Locale
            </label>
            <select
              value={dateLocale}
              onChange={(e) => {
                const next = e.target.value;
                updateTheme({ dateLocale: next });
                updateCoverLetterTheme({ dateLocale: next });
                saveResume();
              }}
              className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              <option value="en-US">United States (en-US)</option>
              <option value="en-GB">United Kingdom (en-GB)</option>
              <option value="en-CA">Canada (en-CA)</option>
              <option value="en-AU">Australia (en-AU)</option>
            </select>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
