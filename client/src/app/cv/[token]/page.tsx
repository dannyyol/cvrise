import type { Metadata } from "next";

import { PublicResumePageClient } from "@/src/components/Resumes/Public/PublicResumePageClient";

export const metadata: Metadata = {
  title: "Shared CV | CVRise",
  description: "View a shared CV.",
  robots: {
    index: false,
    follow: false,
  },
};

type SharedCvPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function SharedCvPage(props: SharedCvPageProps) {
  const { token } = await props.params;
  return <PublicResumePageClient token={token} />;
}
