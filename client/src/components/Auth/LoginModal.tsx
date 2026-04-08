import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Form';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { register, login, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
        onLoginSuccess();
        onClose();
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Google login failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setNeedsVerification(false);
    setIsLoading(true);

    try {
      if (isForgot) {
        if (!email) throw new Error('Please enter your email');
        const res = await authService.forgotPassword(email);
        setInfo(res.detail || 'If that email exists, we sent a reset link');
        return;
      }

      if (!email || !password) throw new Error('Please fill in all fields');

      if (!isLogin) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await register({
          email,
          password,
          confirm_password: confirmPassword,
        });
        setInfo('Account created. Please check your email to verify your account before signing in.');
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
        setNeedsVerification(true);
        return;
      } else {
        await login({ email, password });
        onLoginSuccess();
        onClose();
      }
    } catch (err: unknown) {
      console.error(err);
      const errorObj = err as {
        message?: unknown;
        response?: { data?: { detail?: unknown } };
      };

      let msg = typeof errorObj.message === 'string' && errorObj.message.trim()
        ? errorObj.message
        : 'Something went wrong';
      
      if (errorObj.response?.data?.detail) {
        const detail = errorObj.response.data.detail;
        if (Array.isArray(detail)) {
          msg = (detail as Array<{ msg?: unknown }>).map((e) => {
            return typeof e?.msg === 'string' ? e.msg : '';
          }).filter(Boolean).join(', ');
        } else if (typeof detail === 'string') {
          msg = detail;
        }
      }
      
      setError(msg);
      setNeedsVerification(msg.toLowerCase().includes('not verified'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setInfo(null);
    setNeedsVerification(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setIsForgot(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isForgot ? 'Reset your password' : isLogin ? 'Sign in to cvrise' : 'Create your account'
      }
      maxWidth="sm"
    >
      {!isForgot && (
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            width="100%"
          />
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white">Or continue with email</span>
          </div>
        </div>
      </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}
        {info && (
          <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
            {info}
          </div>
        )}
        
        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4 text-gray-400" />}
            required
            autoFocus
          />
          {!isForgot && (
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4 text-gray-400" />}
              required
            />
          )}

          {!isLogin && !isForgot && (
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="w-4 h-4 text-gray-400" />}
              required
            />
          )}
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full justify-center"
            leftIcon={
              isForgot ? <Lock className="w-4 h-4" /> : isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />
            }
          >
            {isForgot ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>

          {needsVerification && !isForgot && (
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-center"
              onClick={async () => {
                setError(null);
                setInfo(null);
                setIsLoading(true);
                try {
                  const res = await authService.resendVerification(email);
                  setInfo(res.detail || 'If that email exists, we sent a verification link');
                } catch (err: unknown) {
                  const errorObj = err as {
                    message?: unknown;
                    response?: { data?: { detail?: unknown } };
                  };
                  const detail = errorObj.response?.data?.detail;
                  setError(
                    (typeof detail === 'string' && detail.trim())
                      ? detail
                      : (typeof errorObj.message === 'string' && errorObj.message.trim())
                        ? errorObj.message
                        : 'Failed to resend verification email'
                  );
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              Resend verification email
            </Button>
          )}
          
          {!isForgot && (
            <div className="text-center text-sm text-gray-500">
              <button
                type="button"
                onClick={() => { setIsForgot(true); setError(null); setInfo(null); }}
                className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          {!isForgot && (
            <div className="text-center text-sm text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </div>
          )}

          {isForgot && (
            <div className="text-center text-sm text-gray-500">
              <button
                type="button"
                onClick={() => { setIsForgot(false); setError(null); setInfo(null); }}
                className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
