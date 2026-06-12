import Image from "next/image";

export function FooterSection() {
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <a href="#" className="footer-brand">
            <Image src="/images/blue-logo.png" alt="CVRise" width={36} height={36} />
            <span>
              CV<span style={{ color: "var(--blue)" }}>Rise</span>
            </span>
          </a>
          <p className="footer-desc">
            AI resume tailoring, ATS-friendly templates, and fast PDF export — privacy-first
            and open source.
          </p>
        </div>
        <div>
          <div className="f-col-h">Core Features</div>
          <ul className="f-links">
            <li>AI Tailoring</li>
            <li>ATS Optimization</li>
            <li>Smart Editor</li>
            <li>One-click Sections</li>
          </ul>
        </div>
        <div>
          <div className="f-col-h">Templates &amp; Export</div>
          <ul className="f-links">
            <li>Modern Templates</li>
            <li>PDF Export</li>
            <li>Print-ready Layouts</li>
            <li>Style Presets</li>
          </ul>
        </div>
        <div>
          <div className="f-col-h">Open Source</div>
          <ul className="f-links">
            <li>GNU Licensed</li>
            <li>Self-hosting</li>
            <li>GitHub Repo</li>
            <li>Contributing</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">
          © {new Date().getFullYear()} CVRise. AI tailoring • Templates • PDF export • Open
          source.
        </div>
        <div className="footer-love">
          <a href="https://github.com/dannyyol/cvrise" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
