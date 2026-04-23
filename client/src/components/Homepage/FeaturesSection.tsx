export function FeaturesSection() {
  return (
    <section className="section" id="features">
      <div className="r">
        <div className="sec-eyebrow">Features</div>
        <h2 className="sec-h">Everything you need to land the job</h2>
        <p className="sec-p">
          From creation to application — CVRise covers the entire journey with smart
          tools built for modern job seekers.
        </p>
      </div>
      <div className="feat-grid r">
        <div className="fg">
          <div className="fg-num">01</div>
          <span className="fg-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="10" width="20" height="16" rx="4" fill="#0672AD" />
              <rect x="9" y="14" width="4" height="3" rx="1.5" fill="white" />
              <rect x="19" y="14" width="4" height="3" rx="1.5" fill="white" />
              <path
                d="M12 21 Q16 24 20 21"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
              <rect x="14" y="6" width="4" height="5" rx="2" fill="#0672AD" />
              <circle cx="16" cy="5" r="2.5" fill="#f59e0b" />
              <rect x="3" y="15" width="4" height="6" rx="2" fill="#1a8fd1" />
              <rect x="25" y="15" width="4" height="6" rx="2" fill="#1a8fd1" />
            </svg>
          </span>
          <div className="fg-title">AI Job Tailoring</div>
          <div className="fg-desc">
            Paste a job listing URL and our AI rewrites your CV to align with the role&apos;s
            keywords and requirements, improving ATS compatibility.
          </div>
          <span className="fg-chip chip-ai">Powered by AI</span>
        </div>
        <div className="fg">
          <div className="fg-num">02</div>
          <span className="fg-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="4" width="24" height="24" rx="5" fill="#e8f4fb" />
              <rect x="8" y="18" width="4" height="6" rx="2" fill="#0672AD" />
              <rect x="14" y="14" width="4" height="10" rx="2" fill="#1a8fd1" />
              <rect x="20" y="10" width="4" height="14" rx="2" fill="#059669" />
              <path
                d="M8 10 L14 7 L20 9 L26 5"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="26" cy="5" r="2" fill="#f59e0b" />
            </svg>
          </span>
          <div className="fg-title">CV Review &amp; Insights</div>
          <div className="fg-desc">
            Get instant AI feedback on clarity, relevance, and impact. See which skills
            to add and what to rephrase to improve your CV.
          </div>
          <span className="fg-chip chip-ai">Powered by AI</span>
        </div>
        <div className="fg">
          <div className="fg-num">03</div>
          <span className="fg-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="13" fill="#fef3c7" />
              <path d="M18 5 L10 18 H16 L14 27 L24 13 H18 Z" fill="#f59e0b" />
            </svg>
          </span>
          <div className="fg-title">Live Preview</div>
          <div className="fg-desc">
            Your CV updates in real-time as you type. What you see is exactly what gets
            exported — no surprises.
          </div>
          <span className="fg-chip chip-free">Free</span>
        </div>
        <div className="fg">
          <div className="fg-num">04</div>
          <span className="fg-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect
                x="6"
                y="3"
                width="20"
                height="26"
                rx="3"
                fill="white"
                stroke="#e2e8f0"
                strokeWidth="1.5"
              />
              <rect x="10" y="8" width="12" height="2.5" rx="1.25" fill="#0672AD" />
              <rect x="10" y="13" width="14" height="2" rx="1" fill="#e2e8f0" />
              <rect x="10" y="17" width="11" height="2" rx="1" fill="#e2e8f0" />
              <rect x="10" y="21" width="13" height="2" rx="1" fill="#e2e8f0" />
              <circle cx="23" cy="23" r="6" fill="#059669" />
              <path
                d="M20 23l2 2 4-4"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="fg-title">One-Click PDF Export</div>
          <div className="fg-desc">
            Pixel-perfect PDFs in seconds. Professional formatting guaranteed across all
            devices and ATS systems.
          </div>
          <span className="fg-chip chip-free">Free</span>
        </div>
        <div className="fg">
          <div className="fg-num">05</div>
          <span className="fg-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="#f0f9ff"
                stroke="#e0f2fe"
                strokeWidth="1"
              />
              <circle cx="11" cy="12" r="3" fill="#0672AD" />
              <circle cx="21" cy="12" r="3" fill="#059669" />
              <circle cx="11" cy="21" r="3" fill="#f59e0b" />
              <circle cx="21" cy="21" r="3" fill="#ec4899" />
              <circle cx="16" cy="16" r="4" fill="white" stroke="#e2e8f0" strokeWidth="1" />
              <circle cx="16" cy="16" r="2" fill="#0672AD" />
            </svg>
          </span>
          <div className="fg-title">50+ Templates</div>
          <div className="fg-desc">
            Professionally designed templates for every industry — from creative roles
            to corporate positions.
          </div>
          <span className="fg-chip chip-new">New</span>
        </div>
        <div className="fg">
          <div className="fg-num">06</div>
          <span className="fg-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="8" y="16" width="16" height="13" rx="3" fill="#0672AD" />
              <path
                d="M11 16 V11 A7 7 0 0 1 24 11"
                stroke="#94a3b8"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="16" cy="22" r="2.5" fill="white" />
              <rect x="15" y="22" width="2" height="4" rx="1" fill="white" />
            </svg>
          </span>
          <div className="fg-title">100% Open Source</div>
          <div className="fg-desc">
            Self-host, extend, or contribute. GNU licensed — your data stays yours,
            forever. No vendor lock-in.
          </div>
          <span className="fg-chip chip-free">GNU License</span>
        </div>
      </div>
    </section>
  );
}
