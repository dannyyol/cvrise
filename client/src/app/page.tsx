"use client"; 

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
  const githubUrl = "https://github.com/dannyyol/cvrise";

  const [scrolled, setScrolled] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const homeRef = useRef<HTMLDivElement | null>(null);
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const { setCurrentResumeId } = useCVStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const nextPath = searchParams.get("next");

  useEffect(() => {
    if (isLoading) return;
    if (nextPath) {
      if (isAuthenticated) {
        navigate.replace(nextPath);
      } else {
        setIsLoginOpen(true);
      }
    }
  }, [isLoading, isAuthenticated, nextPath, navigate]);

  const openGetStarted = () => {
    if (isAuthenticated) {
      navigate.push('/dashboard');
      return;
    }
    setIsLoginOpen(true);
  };

  const onLoginSuccess = () => {
    setIsLoginOpen(false);
    navigate.push(nextPath ?? "/dashboard");
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
