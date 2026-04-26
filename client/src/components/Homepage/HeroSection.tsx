import type { ChangeEventHandler, RefObject } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "../ui/Button";

type HeroSectionProps = {
  onGetStarted: () => void;
  onUploadResumeClick: () => void;
  isUploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: ChangeEventHandler<HTMLInputElement>;
};

export function HeroSection({
  onGetStarted,
  onUploadResumeClick,
  isUploading,
  fileInputRef,
  onFileChange,
}: HeroSectionProps) {
  return (
    <section className="hero">
      <div className="hero-gradient" />
      <div className="hero-text">
        <h1 className="hero-h">Build the CV that<br />gets you hired</h1>
        <p className="hero-sub">
          Create a standout, AI-tailored CV with live preview and one-click PDF export, no experience needed.
        </p>
        <div className="cta-btns">
          <Button type="button" className="btn-cta-hero" onClick={onGetStarted} unstyled>
            <FileText size={18} />
            Create your resume
          </Button>
          <Button type="button" className="btn-cta-sec" onClick={onUploadResumeClick} disabled={isUploading} unstyled>
            <Upload size={18} />
            Upload your resume
          </Button>
          
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={onFileChange}
          disabled={isUploading}
        />
        <div className="hero-trust">
            <span className="ht">AI job tailoring</span>
            <span className="ht-dot"></span>
            <span className="ht">AI CV optimization</span>
            <span className="ht-dot"></span>
            <span className="ht">Live preview editor</span>
            <span className="ht-dot"></span>
            <span className="ht">One-click PDF export</span>
          </div>
      </div>

      <div className="mosaic-wrap">
        <div className="mosaic-track">
          <div className="mc mc-person g1"><div className="mc-person-emoji">⚡️</div><div className="mc-person-name">Real-time Preview</div><div className="mc-person-role">See changes instantly as you type</div></div>
          <div className="mc mc-stat sg1"><div className="mc-stat-num">ATS</div><div className="mc-stat-label">Optimized templates for Applicant Tracking Systems</div></div>
          <div className="mc mc-person g2"><div className="mc-person-emoji">🤖</div><div className="mc-person-name">AI Assistant</div><div className="mc-person-role">Get smart suggestions for your bullet points</div></div>
          <div className="mc mc-cv">
            <div className="mini-cv-name">Custom Sections</div><div className="mini-cv-role">Build it your way</div>
            <div className="mini-cv-div" /><div className="mini-cv-sec">Examples</div>
            <div className="mini-cv-bar" style={{ width: "88%" }} /><div className="mini-cv-bar" style={{ width: "70%" }} />
            <div className="mini-cv-div" /><div className="mini-cv-sec">Added</div>
            <span className="mini-cv-chip">Awards</span><span className="mini-cv-chip">Languages</span><span className="mini-cv-chip">Projects</span>
          </div>
          <div className="mc mc-person g3"><div className="mc-person-emoji">🎨</div><div className="mc-person-name">Beautiful Themes</div><div className="mc-person-role">Professional designs that stand out</div></div>
          <div className="mc mc-stat sg2"><div className="mc-stat-num">100%</div><div className="mc-stat-label">Free & Open Source forever</div></div>
          <div className="mc mc-feat"><div><div className="mc-feat-icon">✨</div><div className="mc-feat-title">No Watermarks</div><div className="mc-feat-desc">Export clean, professional PDFs without branding</div></div></div>
          <div className="mc mc-person g4"><div className="mc-person-emoji">�</div><div className="mc-person-name">Mobile Friendly</div><div className="mc-person-role">Edit your CV on the go, anywhere</div></div>
          <div className="mc mc-score"><div className="mc-score-num">Self</div><div className="mc-score-label">Host it on your own infrastructure</div></div>
          <div className="mc mc-person g5"><div className="mc-person-emoji">�</div><div className="mc-person-name">Privacy First</div><div className="mc-person-role">Your data stays yours</div></div>
          <div className="mc mc-quote"><div className="mc-quote-text">{`"Your data stays yours. We don't track, sell, or store your information without your explicit consent."`}</div><div className="mc-quote-author">— Privacy Policy</div></div>
          <div className="mc mc-stat sg3"><div className="mc-stat-num">Fast</div><div className="mc-stat-label">Built with modern tech for blazing speed</div></div>
          <div className="mc mc-person g1"><div className="mc-person-emoji">⚡️</div><div className="mc-person-name">Real-time Preview</div><div className="mc-person-role">See changes instantly as you type</div></div>
          <div className="mc mc-stat sg1"><div className="mc-stat-num">ATS</div><div className="mc-stat-label">Optimized templates for Applicant Tracking Systems</div></div>
          <div className="mc mc-person g2"><div className="mc-person-emoji">🤖</div><div className="mc-person-name">AI Assistant</div><div className="mc-person-role">Get smart suggestions for your bullet points</div></div>
          <div className="mc mc-cv">
            <div className="mini-cv-name">Custom Sections</div><div className="mini-cv-role">Build it your way</div>
            <div className="mini-cv-div" /><div className="mini-cv-sec">Examples</div>
            <div className="mini-cv-bar" style={{ width: "88%" }} /><div className="mini-cv-bar" style={{ width: "70%" }} />
            <div className="mini-cv-div" /><div className="mini-cv-sec">Added</div>
            <span className="mini-cv-chip">Awards</span><span className="mini-cv-chip">Languages</span><span className="mini-cv-chip">Projects</span>
          </div>
          <div className="mc mc-person g3"><div className="mc-person-emoji">🎨</div><div className="mc-person-name">Beautiful Themes</div><div className="mc-person-role">Professional designs that stand out</div></div>
          <div className="mc mc-stat sg2"><div className="mc-stat-num">100%</div><div className="mc-stat-label">Free & Open Source forever</div></div>
          <div className="mc mc-feat"><div><div className="mc-feat-icon">✨</div><div className="mc-feat-title">No Watermarks</div><div className="mc-feat-desc">Export clean, professional PDFs without branding</div></div></div>
          <div className="mc mc-person g4"><div className="mc-person-emoji">�</div><div className="mc-person-name">Mobile Friendly</div><div className="mc-person-role">Edit your CV on the go, anywhere</div></div>
          <div className="mc mc-score"><div className="mc-score-num">Self</div><div className="mc-score-label">Host it on your own infrastructure</div></div>
          <div className="mc mc-person g5"><div className="mc-person-emoji">�</div><div className="mc-person-name">Privacy First</div><div className="mc-person-role">Your data stays yours</div></div>
          <div className="mc mc-quote"><div className="mc-quote-text">{`"Your data stays yours. We don't track, sell, or store your information without your explicit consent."`}</div><div className="mc-quote-author">— Privacy Policy</div></div>
          <div className="mc mc-stat sg3"><div className="mc-stat-num">Fast</div><div className="mc-stat-label">Built with modern tech for blazing speed</div></div>
        </div>

        <div className="mosaic-track row2" style={{ marginTop: "14px" }}>
          <div className="mc mc-stat sg4"><div className="mc-stat-num">PDF</div><div className="mc-stat-label">Pixel-perfect export in one click</div></div>
          <div className="mc mc-person g6"><div className="mc-person-emoji">�</div><div className="mc-person-name">Localization</div><div className="mc-person-role">Support for multiple languages</div></div>
          <div className="mc mc-feat"><div><div className="mc-feat-icon">⚡</div><div className="mc-feat-title">Live Preview</div><div className="mc-feat-desc">Watch your CV update in real-time as you type — no surprises</div></div></div>
          <div className="mc mc-person g7"><div className="mc-person-emoji">�</div><div className="mc-person-name">Drag & Drop</div><div className="mc-person-role">Easily reorder sections and items</div></div>
          <div className="mc mc-quote"><div className="mc-quote-text">{`"Easily duplicate, translate, and manage multiple versions of your resume for different job applications."`}</div><div className="mc-quote-author">— Version Control</div></div>
          <div className="mc mc-stat" style={{ background: "linear-gradient(135deg,#0d9e6e,#059669)" }}><div className="mc-stat-num">MIT</div><div className="mc-stat-label">Licensed — free to use, fork and self-host</div></div>
          <div className="mc mc-person g8"><div className="mc-person-emoji">�</div><div className="mc-person-name">Multiple Formats</div><div className="mc-person-role">Export to PDF or JSON</div></div>
          <div className="mc mc-cv">
            <div className="mini-cv-name">Open Source</div><div className="mini-cv-role">Community Driven</div>
            <div className="mini-cv-div" /><div className="mini-cv-sec">Code</div>
            <div className="mini-cv-bar" style={{ width: "90%" }} /><div className="mini-cv-bar" style={{ width: "65%" }} />
            <div className="mini-cv-div" /><div className="mini-cv-sec">Stack</div>
            <span className="mini-cv-chip">React</span><span className="mini-cv-chip">Node.js</span><span className="mini-cv-chip">TypeScript</span>
          </div>
          <div className="mc mc-feat"><div><div className="mc-feat-icon">📑</div><div className="mc-feat-title">PDF Export</div><div className="mc-feat-desc">Pixel-perfect, ATS-compatible PDF in one click</div></div></div>
          <div className="mc mc-score"><div className="mc-score-num">Open</div><div className="mc-score-label">Community driven development</div></div>
          <div className="mc mc-stat sg4"><div className="mc-stat-num">PDF</div><div className="mc-stat-label">Pixel-perfect export in one click</div></div>
          <div className="mc mc-person g6"><div className="mc-person-emoji">�</div><div className="mc-person-name">Localization</div><div className="mc-person-role">Support for multiple languages</div></div>
          <div className="mc mc-feat"><div><div className="mc-feat-icon">⚡</div><div className="mc-feat-title">Live Preview</div><div className="mc-feat-desc">Watch your CV update in real-time as you type — no surprises</div></div></div>
          <div className="mc mc-person g7"><div className="mc-person-emoji">�</div><div className="mc-person-name">Drag & Drop</div><div className="mc-person-role">Easily reorder sections and items</div></div>
          <div className="mc mc-quote"><div className="mc-quote-text">{`"Easily duplicate, translate, and manage multiple versions of your resume for different job applications."`}</div><div className="mc-quote-author">— Version Control</div></div>
          <div className="mc mc-stat" style={{ background: "linear-gradient(135deg,#0d9e6e,#059669)" }}><div className="mc-stat-num">MIT</div><div className="mc-stat-label">Licensed — free to use, fork and self-host</div></div>
          <div className="mc mc-person g8"><div className="mc-person-emoji">�</div><div className="mc-person-name">Multiple Formats</div><div className="mc-person-role">Export to PDF or JSON</div></div>
          <div className="mc mc-cv">
            <div className="mini-cv-name">Open Source</div><div className="mini-cv-role">Community Driven</div>
            <div className="mini-cv-div" /><div className="mini-cv-sec">Code</div>
            <div className="mini-cv-bar" style={{ width: "90%" }} /><div className="mini-cv-bar" style={{ width: "65%" }} />
            <div className="mini-cv-div" /><div className="mini-cv-sec">Stack</div>
            <span className="mini-cv-chip">React</span><span className="mini-cv-chip">Node.js</span><span className="mini-cv-chip">TypeScript</span>
          </div>
          <div className="mc mc-feat"><div><div className="mc-feat-icon">📑</div><div className="mc-feat-title">PDF Export</div><div className="mc-feat-desc">Pixel-perfect, ATS-compatible PDF in one click</div></div></div>
          <div className="mc mc-score"><div className="mc-score-num">Open</div><div className="mc-score-label">Community driven development</div></div>
        </div>
      </div>
    </section>
  );
}
