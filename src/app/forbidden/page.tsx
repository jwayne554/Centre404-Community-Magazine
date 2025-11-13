'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * 403 Forbidden Page
 *
 * Displayed when a user tries to access a resource they don't have permission for.
 * This page is accessible at /forbidden
 */
export default function ForbiddenPage() {
  const router = useRouter();

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
        padding: '60px 40px',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Error Icon */}
        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
          filter: 'grayscale(20%)'
        }}>
          🚫
        </div>

        {/* Status Code */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#e74c3c',
          marginBottom: '10px',
          fontFamily: 'monospace'
        }}>
          403
        </h1>

        {/* Error Title */}
        <h2 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: '#2c3e50',
          marginBottom: '20px'
        }}>
          Access Forbidden
        </h2>

        {/* Error Message */}
        <p style={{
          fontSize: '18px',
          color: '#7f8c8d',
          marginBottom: '15px',
          lineHeight: '1.6'
        }}>
          You don't have permission to access this resource.
        </p>

        <p style={{
          fontSize: '16px',
          color: '#95a5a6',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          This page requires special permissions that your account doesn't currently have.
          If you believe this is an error, please contact an administrator.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'transform 0.1s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
          >
            ← Go Back
          </button>

          <Link href="/" style={{ textDecoration: 'none' }}>
            <button
              style={{
                padding: '14px 28px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#667eea',
                background: 'white',
                border: '2px solid #667eea',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
              }}
            >
              Go to Home
            </button>
          </Link>
        </div>

        {/* Help Text */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#2c3e50',
            marginBottom: '12px'
          }}>
            Why am I seeing this?
          </h3>
          <ul style={{
            fontSize: '14px',
            color: '#7f8c8d',
            lineHeight: '1.8',
            paddingLeft: '20px',
            margin: 0
          }}>
            <li>You're not logged in to an account with sufficient permissions</li>
            <li>Your account role doesn't have access to this resource</li>
            <li>You're trying to access an admin-only page</li>
            <li>The resource you're accessing requires special privileges</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
