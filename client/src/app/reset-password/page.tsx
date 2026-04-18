'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { authService } from '@/src/services/authService';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Form';
import { ROUTES } from '@/src/lib/routes';

type ResetStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ResetPasswordPage() {
  const router = useRouter();

  const token = typeof window === 'undefined'
    ? null
    : new URLSearchParams(window.location.search).get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<ResetStatus>('loading');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;
    const run = async () => {
      if (!token) {
        if (canceled) return;
        setStatus('error');
        setMessage('Missing reset token');
        return;
      }
      if (canceled) return;
      setStatus('idle');
      setMessage(null);
    };

    void run();
    return () => {
      canceled = true;
    };
  }, [token]);

  const passwordError = useMemo(() => {
    if (!newPassword) return null;
    if (newPassword.length < 8) return 'Password must be at least 8 characters';
    if (newPassword.length > 50) return 'Password must be at most 50 characters';
    return null;
  }, [newPassword]);

  const confirmError = useMemo(() => {
    if (!confirmPassword) return null;
    if (confirmPassword !== newPassword) return 'Passwords do not match';
    return null;
  }, [confirmPassword, newPassword]);

  const isSubmitting = status === 'loading';

  const canSubmit = Boolean(
    token &&
      newPassword &&
      confirmPassword &&
      !passwordError &&
      !confirmError &&
      !isSubmitting
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Preparing reset form...</p>
        </div>
      </div>
    );
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!token) {
      setStatus('error');
      setMessage('Missing reset token');
      return;
    }
    if (passwordError || confirmError) return;
    if (!newPassword || !confirmPassword) return;

    setStatus('loading');
    setMessage(null);
    try {
      const res = await authService.resetPassword(token, newPassword);
      setStatus('success');
      setMessage(res.detail || 'Password updated successfully');
    } catch (err: unknown) {
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
            : 'Failed to reset password';
      setStatus('error');
      setMessage(msg);
    }
  };

  if (status === 'error' && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
        <div className="w-full max-w-md flex flex-col gap-4">
          <ErrorState
            title="Reset Password Failed"
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

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
        <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Password Updated</h3>
          <p className="text-gray-500">{message ?? 'You can now sign in with your new password.'}</p>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-xl font-semibold text-gray-900">Reset Password</h1>
        <p className="text-sm text-gray-500 mt-1">Choose a new password for your account.</p>

        {status === 'error' && message && (
          <div className="mt-4">
            <ErrorState
              title="Reset Failed"
              message={message}
              showRetry={false}
              className="p-5"
            />
          </div>
        )}

        <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon={<Lock className="w-4 h-4 text-gray-400" />}
            error={passwordError ?? undefined}
            autoFocus
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock className="w-4 h-4 text-gray-400" />}
            error={confirmError ?? undefined}
            required
          />

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full justify-center"
            disabled={!canSubmit}
          >
            Update Password
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full justify-center"
            onClick={() => router.push(ROUTES.LOGIN)}
            disabled={isSubmitting}
          >
            Back to Home
          </Button>
        </form>
      </div>
    </div>
  );
}
