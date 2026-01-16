'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LockKeyhole, ArrowLeft, AlertCircle, Info } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const success = await login(email, password, rememberMe);
    if (success) {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/80 p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-modal p-6 sm:p-10 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <LockKeyhole className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-display text-2xl sm:text-3xl font-bold text-charcoal mb-2">
            Admin Login
          </h1>
          <p className="text-small text-dark-gray">
            Centre404 Community Magazine
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          >
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Login Failed</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@test.com"
            required
            className="mb-0"
          />

          {/* Password Field */}
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="mb-0"
          />

          {/* Remember Me Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="w-5 h-5 rounded border-light-gray text-primary focus:ring-primary focus:ring-2 cursor-pointer disabled:opacity-50"
            />
            <span className="text-sm text-charcoal">
              Remember me for 30 days
            </span>
          </label>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            loadingText="Logging in..."
            className="w-full"
          >
            Login
          </Button>
        </form>

        {/* Test Account Info */}
        <div className="mt-6 p-4 bg-background rounded-xl border border-light-gray">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-charcoal mb-1">Test Account</p>
              <p className="text-xs text-dark-gray">Email: admin@test.com</p>
              <p className="text-xs text-dark-gray">Password: password123</p>
            </div>
          </div>
        </div>

        {/* Home Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
