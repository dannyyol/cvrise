import React from 'react';
import type { CoverLetterTemplateProps } from '../registry';
import { formatToday } from '@/src/lib/dateFormatting';
import './styles.css';

export default function Silhouette({ personalDetails, coverLetter, theme }: CoverLetterTemplateProps) {
  const appliedFont =
    theme.fontFamily ||
    'Georgia, ui-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"';
  const today = formatToday(theme.dateLocale || 'en-US', 'full');

  return (
    <div
      className="cl-html-root cl-silhouette"
      style={{ '--accent-color': theme.primaryColor, '--font-family': appliedFont, fontFamily: appliedFont } as React.CSSProperties}
    >
      <div data-cl-block="header" className="cl-header">
        <div className="cl-name-row">
          <div className="cl-header-name">{personalDetails.fullName || 'Your Name'}</div>
          {personalDetails.jobTitle ? <div className="cl-header-role">{personalDetails.jobTitle}</div> : null}
        </div>
        <div className="cl-header-contact">
          {personalDetails.email}
          {personalDetails.phone ? <span className="cl-dot"> • </span> : null}
          {personalDetails.phone}
          {personalDetails.website ? <span className="cl-dot"> • </span> : null}
          {personalDetails.website}
        </div>
      </div>

      <div data-cl-block="recipient" className="cl-recipient">
        <p className="cl-date">{today}</p>
        <div className="cl-recipient-details">
          {coverLetter.recipientName ? <p className="cl-recipient-name">{coverLetter.recipientName}</p> : null}
          {coverLetter.recipientTitle ? <p className="cl-recipient-title">{coverLetter.recipientTitle}</p> : null}
          {coverLetter.companyName ? <p className="cl-recipient-company">{coverLetter.companyName}</p> : null}
          {coverLetter.companyAddress ? <p className="cl-recipient-address">{coverLetter.companyAddress}</p> : null}
        </div>
      </div>

      <div data-cl-content className="cl-content" dangerouslySetInnerHTML={{ __html: coverLetter.content || '' }} />
    </div>
  );
}
