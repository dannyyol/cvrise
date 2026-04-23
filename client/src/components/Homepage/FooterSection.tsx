import Image from "next/image";

export function FooterSection() {
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <a href="#" className="footer-brand">
            <Image src="/images/blue-logo.png" alt="CVRise" width={32} height={32} />
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
            <li>
              <a href="#">AI Tailoring</a>
            </li>
            <li>
              <a href="#">ATS Optimization</a>
            </li>
            <li>
              <a href="#">Smart Editor</a>
            </li>
            <li>
              <a href="#">One-click Sections</a>
            </li>
          </ul>
        </div>
        <div>
          <div className="f-col-h">Templates &amp; Export</div>
          <ul className="f-links">
            <li>
              <a href="#">Modern Templates</a>
            </li>
            <li>
              <a href="#">PDF Export</a>
            </li>
            <li>
              <a href="#">Print-ready Layouts</a>
            </li>
            <li>
              <a href="#">Style Presets</a>
            </li>
          </ul>
        </div>
        <div>
          <div className="f-col-h">Open Source</div>
          <ul className="f-links">
            <li>
              <a href="#">GNU Licensed</a>
            </li>
            <li>
              <a href="#">Self-hosting</a>
            </li>
            <li>
              <a href="https://github.com/dannyyol/cvrise" target="_blank" rel="noreferrer">
                GitHub Repo
              </a>
            </li>
            <li>
              <a href="#">Contributing</a>
            </li>
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
