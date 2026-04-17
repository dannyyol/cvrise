"use client"; 

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { FileText, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { resumeService } from "../services/resumeService";
import { useCVStore } from "../store/useCVStore";
import { LoginModal } from "../components/Auth/LoginModal";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { HeroSection } from "../components/Homepage/HeroSection";
import { HowItWorksSection } from "../components/Homepage/HowItWorksSection";
import { FeaturesSection } from "../components/Homepage/FeaturesSection";
import { FooterSection } from "../components/Homepage/FooterSection";
import { FaqSection } from "../components/Homepage/FaqSection";
import { GitHubIcon } from "../components/ui/SocialIcons";
import { ROUTES } from "../lib/routes";

export default function Home() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "CVRise";
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL || "";

  const githubCloneUrl = githubUrl.endsWith(".git") ? githubUrl : `${githubUrl}.git`;

  const [scrolled, setScrolled] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const homeRef = useRef<HTMLDivElement | null>(null);
  const navigate = useRouter();
  const { isAuthenticated } = useAuth();
  const { setCurrentResumeId } = useCVStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const openGetStarted = () => {
    if (isAuthenticated) {
      navigate.push('/dashboard');
      return;
    }
    setIsLoginOpen(true);
  };

  const onLoginSuccess = () => {
    setIsLoginOpen(false);
    navigate.push("/dashboard");
  };

  const handleUploadResumeClick = () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const closeUploadModal = () => {
    if (!isUploading) {
      setUploadError(null);
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
  
      setIsUploading(true);
      setUploadError(null);
  
      try {
        const resume = await resumeService.uploadResume(file);
        setCurrentResumeId(resume.id);
        navigate.push(`${ROUTES.EDITOR}?source=upload`);
      } catch (error: unknown) {
        let errorMessage = 'Failed to upload resume. Please try again.';
  
        const responseDetail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
        if (responseDetail) {
          if (typeof responseDetail === 'string') {
            errorMessage = responseDetail;
          } else if (Array.isArray(responseDetail)) {
            errorMessage = responseDetail
              .map((err) => ((err as { msg?: string })?.msg ? (err as { msg?: string }).msg : JSON.stringify(err)))
              .join(', ');
          } else {
            errorMessage = JSON.stringify(responseDetail);
          }
        }
  
        setUploadError(errorMessage);
      } finally {
        setIsUploading(false);
        event.target.value = '';
      }
    };
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("in"), i * 65);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.07, rootMargin: "0px 0px -20px 0px" }
    );
    homeRef.current
      ?.querySelectorAll(".r,.rl,.rr")
      .forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="homepage" ref={homeRef}>
      {/* ── NAV ── */}
      <div className={`nav-outer${scrolled ? " scrolled" : ""}`}>
        <nav>
          <div className="nav-bg" />
          <div className="nav-inner">
            <a className="nav-logo" href="#">
              <Image src="/images/blue-logo.png" alt={appName} width={28} height={28} />
              <span>CV<span>Rise</span></span>
            </a>
            <ul className="nav-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how">How it works</a></li>
              <li><a href="#oss">Open Source</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
            <div className="nav-right">
              <a className="btn-login inline-flex items-center gap-1.5" href={githubUrl} target="_blank" rel="noreferrer">
                <GitHubIcon className="w-3.5 h-3.5" /> GitHub
              </a>
              <a
                className="btn-nav-cta"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openGetStarted();
                }}
              >
                <span className="btn-nav-cta-dot" />
                Get Started Free
              </a>
            </div>
            <Button
              type="button"
              className={`nav-menu-btn${menuOpen ? " open" : ""}`}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((prev) => !prev)}
              unstyled
            >
              <span />
              <span />
              <span />
            </Button>
          </div>
          <div className={`nav-mobile${menuOpen ? " open" : ""}`}>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#oss" onClick={() => setMenuOpen(false)}>Open Source</a>
            <a href={githubUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>GitHub</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            <div className="nav-mobile-actions">
              <a className="btn-login" href="#" onClick={() => setMenuOpen(false)}>Log in</a>
              <a
                className="btn-nav-cta"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  openGetStarted();
                }}
              >
                <span className="btn-nav-cta-dot" />
                Get Started Free
              </a>
            </div>
          </div>
        </nav>
      </div>

      {/* ── HERO ── */}
      <HeroSection
        onGetStarted={openGetStarted}
        onUploadResumeClick={handleUploadResumeClick}
        isUploading={isUploading}
        fileInputRef={fileInputRef}
        onFileChange={handleFileUpload}
      />
      {false && (
      <section className="hero">
        <div className="hero-gradient" />
        <div className="hero-text">
          <h1 className="hero-h">Build the CV that<br />gets you hired</h1>
          <p className="hero-sub">
            Join 12,000+ job seekers creating stunning, AI-tailored CVs with live preview and one-click PDF export. No experience needed.
          </p>
          <div className="cta-btns">
            <Button type="button" className="btn-cta-hero" onClick={openGetStarted} unstyled>
              <FileText size={18} />
              Create your resume
            </Button>
            <Button type="button" className="btn-cta-sec" onClick={handleUploadResumeClick} disabled={isUploading} unstyled>
              <Upload size={18} />
              Upload your resume
            </Button>
            
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <div className="hero-trust">
              <span className="ht">AI job tailoring</span>
              <span className="ht">AI CV optimization</span>
              <span className="ht">Live preview editor</span>
              <span className="ht">One-click PDF export</span>
            </div>
          </div>

        {/* HERO ILLUSTRATION */}
        <div className="hero-illus-wrap">
          <svg width="420" height="200" viewBox="0 0 420 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="60" y="148" width="300" height="12" rx="6" fill="#e2e8f0"></rect>
          <rect x="90" y="158" width="12" height="32" rx="4" fill="#cbd5e1"></rect>
          <rect x="318" y="158" width="12" height="32" rx="4" fill="#cbd5e1"></rect>
          <rect x="130" y="68" width="160" height="84" rx="10" fill="#1e293b"></rect>
          <rect x="136" y="74" width="148" height="72" rx="7" fill="#0f172a"></rect>
          <rect x="148" y="86" width="80" height="5" rx="2.5" fill="#0672AD" opacity="0.9"></rect>
          <rect x="148" y="97" width="110" height="4" rx="2" fill="#334155" opacity="0.8"></rect>
          <rect x="148" y="107" width="95" height="4" rx="2" fill="#334155" opacity="0.8"></rect>
          <rect x="148" y="117" width="60" height="4" rx="2" fill="#334155" opacity="0.6"></rect>
          <circle cx="264" cy="104" r="14" fill="#059669"></circle>
          <path d="M257 104l5 5 9-9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
          <rect x="198" y="150" width="24" height="8" rx="3" fill="#94a3b8"></rect>
          <rect x="188" y="156" width="44" height="5" rx="2.5" fill="#cbd5e1"></rect><rect x="148" y="152" width="124" height="14" rx="4" fill="#e2e8f0"></rect><rect x="152" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1"></rect><rect x="163" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1"></rect><rect x="174" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1"></rect><rect x="185" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1"></rect><rect x="196" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1"></rect><rect x="207" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1"></rect><rect x="218" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1"></rect><rect x="229" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1"></rect><rect x="240" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1"></rect><rect x="251" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1"></rect><rect x="262" y="155" width="9" height="4" rx="1.5" fill="#cbd5e1"></rect><ellipse cx="96" cy="128" rx="20" ry="22" fill="#0672AD"></ellipse><circle cx="96" cy="98" r="18" fill="#fed7aa"></circle><ellipse cx="96" cy="84" rx="18" ry="10" fill="#1e293b"></ellipse><circle cx="90" cy="97" r="3" fill="#1e293b"></circle><circle cx="102" cy="97" r="3" fill="#1e293b"></circle><circle cx="91" cy="96" r="1" fill="white"></circle><circle cx="103" cy="96" r="1" fill="white"></circle><path d="M90 104 Q96 110 102 104" stroke="#92400e" stroke-width="1.8" stroke-linecap="round" fill="none"></path><path d="M76 120 Q60 130 68 148" stroke="#0672AD" stroke-width="10" stroke-linecap="round" fill="none"></path><path d="M116 120 Q132 130 148 148" stroke="#0672AD" stroke-width="10" stroke-linecap="round" fill="none"></path><ellipse cx="68" cy="150" rx="8" ry="6" fill="#fed7aa"></ellipse><ellipse cx="148" cy="150" rx="8" ry="6" fill="#fed7aa"></ellipse><path d="M320 48 l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#f59e0b"></path><path d="M356 72 l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#6366f1" opacity="0.8"></path><path d="M44 62 l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#0672AD" opacity="0.7"></path><circle cx="340" cy="88" r="4" fill="#f59e0b" opacity="0.5"></circle><circle cx="62" cy="92" r="3" fill="#059669" opacity="0.6"></circle><circle cx="380" cy="52" r="5" fill="#ec4899" opacity="0.4"></circle><rect x="328" y="100" width="52" height="64" rx="6" fill="white" stroke="#e2e8f0" stroke-width="1.5"></rect><rect x="336" y="112" width="24" height="4" rx="2" fill="#0672AD"></rect><rect x="336" y="120" width="36" height="3" rx="1.5" fill="#e2e8f0"></rect><rect x="336" y="127" width="30" height="3" rx="1.5" fill="#e2e8f0"></rect><rect x="336" y="134" width="36" height="3" rx="1.5" fill="#e2e8f0"></rect><rect x="336" y="142" width="24" height="3" rx="1.5" fill="#e2e8f0"></rect><circle cx="366" cy="108" r="5" fill="#059669"></circle><path d="M363 108l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            </path></svg>
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
            <div className="mc mc-quote"><div className="mc-quote-text">&quot;Your data stays yours. We don&apos;t track, sell, or store your information without your explicit consent.&quot;</div><div className="mc-quote-author">— Privacy Policy</div></div>
            <div className="mc mc-stat sg3"><div className="mc-stat-num">Fast</div><div className="mc-stat-label">Built with modern tech for blazing speed</div></div>
            {/* duplicated for seamless loop */}
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
            <div className="mc mc-quote"><div className="mc-quote-text">&quot;Your data stays yours. We don&apos;t track, sell, or store your information without your explicit consent.&quot;</div><div className="mc-quote-author">— Privacy Policy</div></div>
            <div className="mc mc-stat sg3"><div className="mc-stat-num">Fast</div><div className="mc-stat-label">Built with modern tech for blazing speed</div></div>
          </div>

          {/* Row 2 */}
          <div className="mosaic-track row2" style={{ marginTop: "14px" }}>
            <div className="mc mc-stat sg4"><div className="mc-stat-num">PDF</div><div className="mc-stat-label">Pixel-perfect export in one click</div></div>
            <div className="mc mc-person g6"><div className="mc-person-emoji">�</div><div className="mc-person-name">Localization</div><div className="mc-person-role">Support for multiple languages</div></div>
            <div className="mc mc-feat"><div><div className="mc-feat-icon">⚡</div><div className="mc-feat-title">Live Preview</div><div className="mc-feat-desc">Watch your CV update in real-time as you type — no surprises</div></div></div>
            <div className="mc mc-person g7"><div className="mc-person-emoji">�</div><div className="mc-person-name">Drag & Drop</div><div className="mc-person-role">Easily reorder sections and items</div></div>
            <div className="mc mc-quote"><div className="mc-quote-text">&quot;Easily duplicate, translate, and manage multiple versions of your resume for different job applications.&quot;</div><div className="mc-quote-author">— Version Control</div></div>
            <div className="mc mc-stat" style={{ background: "linear-gradient(135deg,#0d9e6e,#059669)" }}><div className="mc-stat-num">GNU</div><div className="mc-stat-label">Licensed — free to use, fork and self-host</div></div>
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
            {/* duplicated */}
            <div className="mc mc-stat sg4"><div className="mc-stat-num">PDF</div><div className="mc-stat-label">Pixel-perfect export in one click</div></div>
            <div className="mc mc-person g6"><div className="mc-person-emoji">�</div><div className="mc-person-name">Localization</div><div className="mc-person-role">Support for multiple languages</div></div>
            <div className="mc mc-feat"><div><div className="mc-feat-icon">⚡</div><div className="mc-feat-title">Live Preview</div><div className="mc-feat-desc">Watch your CV update in real-time as you type — no surprises</div></div></div>
            <div className="mc mc-person g7"><div className="mc-person-emoji">�</div><div className="mc-person-name">Drag & Drop</div><div className="mc-person-role">Easily reorder sections and items</div></div>
            <div className="mc mc-quote"><div className="mc-quote-text">&quot;Easily duplicate, translate, and manage multiple versions of your resume for different job applications.&quot;</div><div className="mc-quote-author">— Version Control</div></div>
            <div className="mc mc-stat" style={{ background: "linear-gradient(135deg,#0d9e6e,#059669)" }}><div className="mc-stat-num">GNU</div><div className="mc-stat-label">Licensed — free to use, fork and self-host</div></div>
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
      )}

      <div className="mx-10 h-px bg-[rgba(0,0,0,0.07)]" />

      {/* ── HOW IT WORKS ── */}
      <HowItWorksSection />

      <div className="mx-10 h-px bg-[rgba(0,0,0,0.07)]" />

      {/* ── FEATURES ── */}
      <FeaturesSection />
      <div className="mx-10 h-px bg-[rgba(0,0,0,0.07)]" />

      {/* ── FAQ ── */}
      <FaqSection />

      {/* ── FINAL CTA ── */}
      <div className="cta-wrap r">
        <div className="cta-box cta-split">
          <div className="cta-text-content">
            <h2 className="cta-h">Ready to build your<br />best CV yet?</h2>
            <p className="cta-sub">Free. Open source. No account required to get started.</p>
            <div className="cta-btns">
              <a
                className="btn-cta-hero"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openGetStarted();
                }}
              >
                Get Started Free
              </a>
              <a className="btn-cta-sec" href="#">View Templates</a>
            </div>
          </div>
          <div className="cta-illus-side">
            <Image src="/images/getstarted.png" width={600} height={285} alt="Hero Illustration" style={{ objectFit: 'contain' }} />
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <FooterSection />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={onLoginSuccess}
      />
      <Modal
        isOpen={isUploading || Boolean(uploadError)}
        onClose={closeUploadModal}
        title={isUploading ? "Analyzing Resume" : "Upload Failed"}
        maxWidth="md"
      >
        {isUploading ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 font-semibold text-primary-700">
              <div className="rounded-lg bg-primary-50 p-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
              </div>
              <span>Analyzing your resume with AI...</span>
            </div>
            <p className="text-sm leading-relaxed text-neutral-600">
              We&apos;re extracting your skills, experience, and education details. This might take up to a minute, please don&apos;t close this window.
            </p>
          </div>
        ) : (
          <div className="break-words rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <p className="font-medium">Upload Failed</p>
            <p className="mt-1 whitespace-pre-wrap">{uploadError}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
