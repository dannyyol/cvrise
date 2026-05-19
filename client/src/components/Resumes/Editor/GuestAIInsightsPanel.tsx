"use client";

import { Lock, Sparkles, Target } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/src/components/ui/Card";

interface GuestAIInsightsPanelProps {
  onLoginClick: () => void;
}

function LockedCard({
  title,
  subtitle,
  description,
  iconBg,
  icon,
  onLoginClick,
}: {
  title: string;
  subtitle: string;
  description: string;
  iconBg: string;
  icon: React.ReactNode;
  onLoginClick: () => void;
}) {
  return (
    <Card variant="accordion" topBorder shadow={false}>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
            <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="py-6 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Sign in to unlock</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-[220px] leading-relaxed mx-auto">
              {description}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={onLoginClick}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Sign in to use AI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function GuestAIInsightsPanel({ onLoginClick }: GuestAIInsightsPanelProps) {
  return (
    <div className="space-y-5 pb-6">
      <LockedCard
        title="CV Score"
        subtitle="ATS, content & formatting"
        description="Get an instant AI score covering ATS compatibility, content quality, and formatting."
        iconBg="bg-[#04659A]/10"
        icon={<Sparkles className="w-3.5 h-3.5 text-[#04659A]" />}
        onLoginClick={onLoginClick}
      />
      <LockedCard
        title="Job Match"
        subtitle="Compare CV to a job posting"
        description="See your match score, missing keywords, and tailored suggestions for any job."
        iconBg="bg-emerald-100"
        icon={<Target className="w-3.5 h-3.5 text-emerald-600" />}
        onLoginClick={onLoginClick}
      />
    </div>
  );
}
