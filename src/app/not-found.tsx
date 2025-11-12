import Link from 'next/link';

export default function NotFound() {
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
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>404</h1>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Page Not Found</h2>
      <p style={{ marginBottom: '30px' }}>The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/"
        style={{
          padding: '12px 24px',
          background: '#27ae60',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px'
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
