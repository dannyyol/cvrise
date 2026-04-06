export function HowItWorksSection() {
  return (
    <section className="section" id="how">
      <div className="r">
        <div className="sec-eyebrow">How it works</div>
        <h2 className="sec-h">How CVRise helps you get hired</h2>
      </div>
      <div className="how-grid">
        <div className="rl">
          <div className="steps">
            <div className="step">
              <div className="step-illus">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="2" y="2" width="24" height="24" rx="5" fill="#e8f4fb" />
                  <rect x="7" y="8" width="14" height="2.5" rx="1.25" fill="#0672AD" />
                  <rect x="7" y="13" width="10" height="2" rx="1" fill="#94a3b8" />
                  <rect x="7" y="17" width="12" height="2" rx="1" fill="#94a3b8" />
                  <circle cx="21" cy="21" r="5" fill="#0672AD" />
                  <text
                    x="21"
                    y="25"
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="bold"
                    fill="white"
                  >
                    1
                  </text>
                </svg>
              </div>
              <div>
                <div className="step-t">Fill in your details</div>
                <div className="step-d">
                  Enter your experience, education, and skills using our guided editor.
                  Import from LinkedIn in one click.
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-illus">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="2" y="2" width="24" height="24" rx="5" fill="#fef3c7" />
                  <rect x="5" y="8" width="8" height="12" rx="2" fill="#f59e0b" opacity="0.5" />
                  <rect x="15" y="8" width="8" height="12" rx="2" fill="#f59e0b" />
                  <circle cx="21" cy="21" r="5" fill="#0672AD" />
                  <text
                    x="21"
                    y="25"
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="bold"
                    fill="white"
                  >
                    2
                  </text>
                </svg>
              </div>
              <div>
                <div className="step-t">Choose a template</div>
                <div className="step-d">
                  Pick from 50+ professionally designed templates and preview them live
                  — no commitment needed.
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-illus">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="2" y="2" width="24" height="24" rx="5" fill="#f0fdf4" />
                  <circle cx="14" cy="13" r="6" fill="#059669" opacity="0.15" />
                  <path d="M10 16 L14 8 H15 L12 14 H18 L14 20 H13 L16 14 H10Z" fill="#059669" />
                  <circle cx="21" cy="21" r="5" fill="#0672AD" />
                  <text
                    x="21"
                    y="25"
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="bold"
                    fill="white"
                  >
                    3
                  </text>
                </svg>
              </div>
              <div>
                <div className="step-t">Tailor to the job with AI</div>
                <div className="step-d">
                  Paste a job URL. Our AI analyses the role and rewrites your CV to align
                  with the posting, strengthening your application instantly.
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-illus">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="2" y="2" width="24" height="24" rx="5" fill="#f0fdf4" />
                  <path d="M14 6 L14 18" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
                  <path
                    d="M9 13 L14 18 L19 13"
                    stroke="#059669"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <rect x="7" y="19" width="14" height="3" rx="1.5" fill="#059669" opacity="0.3" />
                  <circle cx="21" cy="21" r="5" fill="#0672AD" />
                  <text
                    x="21"
                    y="25"
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="bold"
                    fill="white"
                  >
                    4
                  </text>
                </svg>
              </div>
              <div>
                <div className="step-t">Export &amp; apply</div>
                <div className="step-d">
                  Download a pixel-perfect PDF or share a public link. Apply with
                  confidence.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="rr">
          <div className="ai-panel">
            <div className="aip-bar">
              <div className="dot dr" />
              <div className="dot dy" />
              <div className="dot dg" />
              <div className="aip-url">AI Resume Analysis</div>
            </div>
            <div className="aip-body">
              <div className="aip-head">
                <div className="live-dot" /> Live Analysis
              </div>
              <div className="donut-wrap">
                <div className="donut">
                  <div className="donut-core">
                    <div className="donut-n">84</div>
                    <div className="donut-d">/ 100</div>
                  </div>
                </div>
              </div>
              <div className="bars">
                <div className="bar-row">
                  <div className="bar-top">
                    <span>Keywords coverage</span>
                    <span className="bar-pct">92%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: "92%" }} />
                  </div>
                </div>
                <div className="bar-row">
                  <div className="bar-top">
                    <span>Experience relevance</span>
                    <span className="bar-pct">88%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: "88%" }} />
                  </div>
                </div>
                <div className="bar-row">
                  <div className="bar-top">
                    <span>Skills alignment</span>
                    <span className="bar-pct warn">76%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill warn" style={{ width: "76%" }} />
                  </div>
                </div>
                <div className="bar-row">
                  <div className="bar-top">
                    <span>ATS compatibility</span>
                    <span className="bar-pct">95%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: "95%" }} />
                  </div>
                </div>
              </div>
              <div className="ai-tip">
                <div className="ai-tip-h">💡 AI Suggestion</div>
                <div className="ai-tip-b">
                  Add "cross-functional collaboration" to your summary — this keyword
                  appears 4× in the job description and can strengthen how relevant your
                  CV reads.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
