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
          Join 12,000+ job seekers creating stunning, AI-tailored CVs with live preview and one-click PDF export. No experience needed.
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

      <div className="hero-illus-wrap">
        <svg
          width="420"
          height="200"
          viewBox="0 0 420 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="60" y="148" width="300" height="12" rx="6" fill="#e2e8f0" />
          <rect x="90" y="158" width="12" height="32" rx="4" fill="#cbd5e1" />
          <rect x="318" y="158" width="12" height="32" rx="4" fill="#cbd5e1" />
          <rect x="130" y="68" width="160" height="84" rx="10" fill="#1e293b" />
          <rect x="136" y="74" width="148" height="72" rx="7" fill="#0f172a" />
          <rect
            x="148"
            y="86"
            width="80"
            height="5"
            rx="2.5"
            fill="#0672AD"
            opacity="0.9"
          />
          <rect
            x="148"
            y="97"
            width="110"
            height="4"
            rx="2"
            fill="#334155"
            opacity="0.8"
          />
          <rect
            x="148"
            y="107"
            width="95"
            height="4"
            rx="2"
            fill="#334155"
            opacity="0.8"
          />
          <rect
            x="148"
            y="117"
            width="60"
            height="4"
            rx="2"
            fill="#334155"
            opacity="0.6"
          />
          <circle cx="264" cy="104" r="14" fill="#059669" />
          <path
            d="M257 104l5 5 9-9"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="198" y="150" width="24" height="8" rx="3" fill="#94a3b8" />
          <rect
            x="188"
            y="156"
            width="44"
            height="5"
            rx="2.5"
            fill="#cbd5e1"
          />
          <rect x="148" y="152" width="124" height="14" rx="4" fill="#e2e8f0" />
          <rect x="152" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1" />
          <rect x="163" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1" />
          <rect x="174" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1" />
          <rect x="185" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1" />
          <rect x="196" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1" />
          <rect x="207" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1" />
          <rect x="218" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1" />
          <rect x="229" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1" />
          <rect x="240" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1" />
          <rect x="251" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1" />
          <rect x="262" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1" />
          <ellipse cx="96" cy="128" rx="20" ry="22" fill="#0672AD" />
          <circle cx="96" cy="98" r="18" fill="#fed7aa" />
          <ellipse cx="96" cy="84" rx="18" ry="10" fill="#1e293b" />
          <circle cx="90" cy="97" r="3" fill="#1e293b" />
          <circle cx="102" cy="97" r="3" fill="#1e293b" />
          <circle cx="91" cy="96" r="1" fill="white" />
          <circle cx="103" cy="96" r="1" fill="white" />
          <path
            d="M90 104 Q96 110 102 104"
            stroke="#92400e"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M76 120 Q60 130 68 148"
            stroke="#0672AD"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M116 120 Q132 130 148 148"
            stroke="#0672AD"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx="68" cy="150" rx="8" ry="6" fill="#fed7aa" />
          <ellipse cx="148" cy="150" rx="8" ry="6" fill="#fed7aa" />
          <path
            d="M320 48 l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"
            fill="#f59e0b"
          />
          <path
            d="M356 72 l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"
            fill="#6366f1"
            opacity="0.8"
          />
          <path
            d="M44 62 l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"
            fill="#0672AD"
            opacity="0.7"
          />
          <circle cx="340" cy="88" r="4" fill="#f59e0b" opacity="0.5" />
          <circle cx="62" cy="92" r="3" fill="#059669" opacity="0.6" />
          <circle cx="380" cy="52" r="5" fill="#ec4899" opacity="0.4" />
          <rect
            x="328"
            y="100"
            width="52"
            height="64"
            rx="6"
            fill="white"
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />
          <rect x="336" y="112" width="24" height="4" rx="2" fill="#0672AD" />
          <rect x="336" y="120" width="36" height="3" rx="1.5" fill="#e2e8f0" />
          <rect x="336" y="127" width="30" height="3" rx="1.5" fill="#e2e8f0" />
          <rect x="336" y="134" width="36" height="3" rx="1.5" fill="#e2e8f0" />
          <rect x="336" y="142" width="24" height="3" rx="1.5" fill="#e2e8f0" />
          <circle cx="366" cy="108" r="5" fill="#059669" />
          <path
            d="M363 108l2 2 4-4"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
