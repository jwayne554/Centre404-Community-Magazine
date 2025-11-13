'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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
      // Redirect to admin dashboard on successful login
      router.push('/admin');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        padding: '40px',
        maxWidth: '400px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '10px'
          }}>
            Admin Login
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#7f8c8d'
          }}>
            Centre404 Community Magazine
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            style={{
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '20px',
              color: '#c33'
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2c3e50',
                fontSize: '14px'
              }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
              placeholder="admin@test.com"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s',
                opacity: isLoading ? 0.6 : 1
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2c3e50',
                fontSize: '14px'
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s',
                opacity: isLoading ? 0.6 : 1
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
              }}
            />
          </div>

          {/* Remember Me Checkbox */}
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              style={{
                width: '18px',
                height: '18px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            />
            <label
              htmlFor="rememberMe"
              style={{
                fontSize: '14px',
                color: '#2c3e50',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                userSelect: 'none',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              Remember me for 30 days (instead of 7 days)
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              background: isLoading ? '#95a5a6' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.1s, opacity 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isLoading ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }} />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Test Account Info */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#6c757d'
        }}>
          <strong style={{ display: 'block', marginBottom: '8px', color: '#495057' }}>
            Test Account:
          </strong>
          <div>Email: admin@test.com</div>
          <div>Password: password123</div>
        </div>

        {/* Home Link */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a
            href="/"
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            ← Back to Home
          </a>
        </div>
      </div>

      {/* Spinner Animation */}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
