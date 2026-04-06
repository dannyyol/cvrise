export type FontSizeSetting = 'small' | 'medium' | 'large' | 'xlarge';
export type LetterSpacingSetting = 'tighter' | 'tight' | 'normal' | 'wide' | 'wider';
export type LineSpacingSetting = 'tight' | 'compact' | 'normal' | 'loose' | 'looser';

export const getRootFontSizePx = (fontSize: FontSizeSetting | undefined): number => {
  switch (fontSize) {
    case 'small':
      return 14;
    case 'large':
      return 18;
    case 'xlarge':
      return 20;
    case 'medium':
    default:
      return 16;
  }
};

export const getFontSizeSliderValue = (fontSize: FontSizeSetting | undefined): number => {
  switch (fontSize) {
    case 'small':
      return 0;
    case 'medium':
      return 33;
    case 'large':
      return 67;
    case 'xlarge':
      return 100;
    default:
      return 33;
  }
};

export const getFontSizeFromSliderValue = (value: number): FontSizeSetting => {
  if (value <= 16) return 'small';
  if (value <= 50) return 'medium';
  if (value <= 83) return 'large';
  return 'xlarge';
};

export const getLetterSpacingCssValue = (letterSpacing: LetterSpacingSetting | undefined): string => {
  switch (letterSpacing) {
    case 'tighter':
      return '-0.02em';
    case 'tight':
      return '-0.01em';
    case 'wide':
      return '0.01em';
    case 'wider':
      return '0.02em';
    case 'normal':
    default:
      return '0';
  }
};

export const getLetterSpacingSliderValue = (letterSpacing: LetterSpacingSetting | undefined): number => {
  switch (letterSpacing) {
    case 'tighter':
      return 0;
    case 'tight':
      return 25;
    case 'normal':
      return 50;
    case 'wide':
      return 75;
    case 'wider':
      return 100;
    default:
      return 50;
  }
};

export const getLetterSpacingFromSliderValue = (value: number): LetterSpacingSetting => {
  if (value <= 12) return 'tighter';
  if (value <= 37) return 'tight';
  if (value <= 62) return 'normal';
  if (value <= 87) return 'wide';
  return 'wider';
};

export const getLineHeightCssValue = (lineSpacing: LineSpacingSetting | undefined): string => {
  switch (lineSpacing) {
    case 'tight':
      return '1.25';
    case 'compact':
      return '1.35';
    case 'loose':
      return '1.65';
    case 'looser':
      return '1.8';
    case 'normal':
    default:
      return '1.5';
  }
};

export const getLineSpacingSliderValue = (lineSpacing: LineSpacingSetting | undefined): number => {
  switch (lineSpacing) {
    case 'tight':
      return 0;
    case 'compact':
      return 25;
    case 'normal':
      return 50;
    case 'loose':
      return 75;
    case 'looser':
      return 100;
    default:
      return 50;
  }
};

export const getLineSpacingFromSliderValue = (value: number): LineSpacingSetting => {
  if (value <= 12) return 'tight';
  if (value <= 37) return 'compact';
  if (value <= 62) return 'normal';
  if (value <= 87) return 'loose';
  return 'looser';
};
