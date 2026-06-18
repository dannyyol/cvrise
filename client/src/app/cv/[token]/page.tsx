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

export default async function SharedCvPage(props: PageProps<"/cv/[token]">) {
  const { token } = await props.params;
  return <PublicResumePageClient token={token} />;
}
