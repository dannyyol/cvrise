import { useState } from "react";
import { Button } from "../ui/Button";

type FaqItem = {
  q: string;
  a: string;
};

const faqData: FaqItem[] = [
  {
    q: "What is CVRise?",
    a: "CVRise is a free, open source CV builder with AI-powered job tailoring and optimization. It helps job seekers create professional CVs, tailor them to specific job descriptions, and understand exactly how to improve their interview chances.",
  },
  {
    q: "Is CVRise really free?",
    a: "Yes — CVRise is completely free. It's MIT-licensed open source software, meaning you can use it, fork it, or self-host it at no cost. There are no hidden fees, no premium tiers for core features, and no data selling.",
  },
  {
    q: "How does the AI job tailoring work?",
    a: "Paste a job listing URL into CVRise and our AI analyses the role's requirements, keywords, and tone. It then rewrites your CV to align with the role — adjusting your summary, reordering bullet points, and highlighting relevant skills for ATS-friendly results.",
  },
  {
    q: "Can I self-host CVRise?",
    a: "Absolutely. CVRise is MIT-licensed and built for self-hosting. Clone the repo, follow the setup guide in the docs, and have your own instance running in minutes. Your data stays on your own infrastructure.",
  },
  {
    q: "What CV formats can I export?",
    a: "CVRise currently supports PDF export with pixel-perfect, ATS-compatible formatting. All exported PDFs are guaranteed to render correctly across HR systems, job boards, and email clients.",
  },
  {
    q: "How do I contribute to CVRise?",
    a: "We welcome all contributions — code, design, documentation, and bug reports. Check the CONTRIBUTING.md in the GitHub repo for guidelines. You can also join our Discord to discuss ideas and collaborate with contributors.",
  },
];

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <section className="section" id="faq">
      <div className="r">
        <div className="sec-eyebrow">Frequently asked questions</div>
        <h2 className="sec-h">FAQs</h2>
      </div>
      <div className="faq-split r">
        <div className="faq-illus-side">
          <img src="/images/faq.png" alt="FAQ Illustration" />
        </div>
        <div className="faq-content">
          <div className="faq-list mt-[52px] flex flex-col">
            {faqData.map((item, idx) => (
              <div
                key={idx}
                className={`faq-item border-b border-gray-200${openFaq === idx ? " open" : ""}`}
              >
                <Button className="faq-btn" onClick={() => toggleFaq(idx)} unstyled>
                  {item.q}
                  <div className="faq-icon">+</div>
                </Button>
                <div className="faq-ans">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
