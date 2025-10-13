'use client';

import { useState } from 'react';
import { SimpleSubmissionForm } from '@/components/forms/simple-submission-form';
import Link from 'next/link';

export default function Home() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div className="main-header" style={{
          background: 'var(--primary-color)',
          color: 'white',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '30px',
          borderRadius: '8px'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px', color: 'white' }}>
            Centre404 Community Magazine
          </h1>
          <p style={{ color: 'white' }}>Your Voice, Your Stories</p>
        </div>

        {/* Info Banner */}
        <div style={{
          background: '#e3f2fd',
          border: '2px solid #2196f3',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <p style={{ marginBottom: '10px', fontWeight: '600' }}>
            📖 Want to read our community magazines?
          </p>
          <Link
            href="/magazines"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: 'var(--primary-color)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600'
            }}
          >
            View Magazine Archive →
          </Link>
        </div>

        {/* Info Section */}
        <div style={{
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <button
            onClick={() => setShowInfo(!showInfo)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              justifyContent: 'space-between'
            }}
          >
            <span>ℹ️ How does this work?</span>
            <span>{showInfo ? '▲' : '▼'}</span>
          </button>

          {showInfo && (
            <div style={{ marginTop: '15px', lineHeight: '1.8' }}>
              <ol style={{ paddingLeft: '20px' }}>
                <li><strong>You submit</strong> your stories, photos, and drawings below</li>
                <li><strong>Our team reviews</strong> each contribution carefully</li>
                <li><strong>We compile</strong> approved submissions into beautiful magazine editions</li>
                <li><strong>You read</strong> the published magazines in our archive!</li>
              </ol>
              <p style={{ marginTop: '15px', fontStyle: 'italic', color: '#666' }}>
                Every voice matters in our community. We can&apos;t wait to see what you share!
              </p>
            </div>
          )}
        </div>

        {/* Contribution Form */}
        <div className="animate-in">
          <SimpleSubmissionForm />
        </div>
      </div>

      {/* Accessibility Controls - Fixed position like original */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '10px',
        zIndex: 100
      }}>
        <button
          onClick={() => document.body.classList.toggle('high-contrast')}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'var(--bg-color)',
            border: '2px solid #27ae60',
            cursor: 'pointer',
            fontSize: '20px',
            boxShadow: 'var(--shadow)',
            color: 'var(--text-color)'
          }}
          title="Toggle High Contrast"
        >
          ◐
        </button>
        <button
          onClick={() => {
            const root = document.documentElement;
            const currentSize = parseInt(getComputedStyle(root).fontSize);
            root.style.fontSize = `${currentSize + 2}px`;
          }}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'var(--bg-color)',
            border: '2px solid #27ae60',
            cursor: 'pointer',
            fontSize: '20px',
            boxShadow: 'var(--shadow)',
            color: 'var(--text-color)'
          }}
          title="Increase Font Size"
        >
          A+
        </button>
        <button
          onClick={() => {
            const root = document.documentElement;
            const currentSize = parseInt(getComputedStyle(root).fontSize);
            if (currentSize > 14) {
              root.style.fontSize = `${currentSize - 2}px`;
            }
          }}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'var(--bg-color)',
            border: '2px solid #27ae60',
            cursor: 'pointer',
            fontSize: '20px',
            boxShadow: 'var(--shadow)',
            color: 'var(--text-color)'
          }}
          title="Decrease Font Size"
        >
          A-
        </button>
      </div>
    </div>
  );
}