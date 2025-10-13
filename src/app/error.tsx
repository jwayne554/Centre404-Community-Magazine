'use client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Oops!</h1>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Something went wrong</h2>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        {error.message || 'An unexpected error occurred'}
      </p>
      <div style={{ display: 'flex', gap: '15px' }}>
        <button
          onClick={reset}
          style={{
            padding: '12px 24px',
            background: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Try again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 24px',
            background: '#f8f9fa',
            color: '#2c3e50',
            borderRadius: '8px',
            border: '2px solid #ddd',
            cursor: 'pointer'
          }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
