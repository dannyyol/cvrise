'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { authService } from '@/src/services/authService';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { Button } from '@/src/components/ui/Button';
import { ROUTES } from '@/src/lib/routes';

type VerifyStatus = 'idle' | 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const router = useRouter();

  const token = typeof window === 'undefined'
    ? null
    : new URLSearchParams(window.location.search).get('token');

  const [status, setStatus] = useState<VerifyStatus>('loading');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;
    const run = async () => {
      try {
        if (!token) {
          setStatus('error');
          setMessage('Missing verification token');
          return;
        }

        const res = await authService.verifyEmail(token);
        if (canceled) return;
        setStatus('success');
        setMessage(res.detail || 'Email verified successfully');
      } catch (err: unknown) {
        if (canceled) return;
        const errorObj = err as {
          message?: unknown;
          response?: { data?: { detail?: unknown } };
        };
        const detail = errorObj.response?.data?.detail;
        const msg =
          (typeof detail === 'string' && detail.trim())
            ? detail
            : (typeof errorObj.message === 'string' && errorObj.message.trim())
              ? errorObj.message
              : 'Failed to verify email';
        setStatus('error');
        setMessage(msg);
      }
    };

    void run();
    return () => {
      canceled = true;
    };
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
        <div className="w-full max-w-md flex flex-col gap-4">
          <ErrorState
            title="Email Verification Failed"
            message={message ?? undefined}
            showRetry={false}
          />
          <Button
            variant="primary"
            className="w-full justify-center"
            onClick={() => router.push(ROUTES.LOGIN)}
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center gap-3">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Email Verified</h3>
        <p className="text-gray-500">{message ?? 'You can now sign in.'}</p>
        <Button
          variant="primary"
          className="mt-3 w-full justify-center"
          onClick={() => router.push(ROUTES.LOGIN)}
        >
          Sign In
        </Button>
      </div>
    </div>
  );
}
