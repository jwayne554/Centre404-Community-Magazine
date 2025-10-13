'use client';

import { useState } from 'react';
import { SimpleSubmissionForm } from '@/components/forms/simple-submission-form';
import { SimpleMagazineViewer } from '@/components/magazine/simple-magazine-viewer';

export default function Home() {
  const [activeView, setActiveView] = useState<'contribute' | 'magazine'>('contribute');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {/* Header - Matching original exactly */}
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

        {/* Navigation - Matching original button style */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <button
            className="btn-large"
            onClick={() => setActiveView('contribute')}
            style={activeView === 'contribute' ? {
              background: 'var(--primary-color)',
              color: 'white'
            } : {
              background: '#f8f9fa',
              color: 'var(--text-color)',
              border: '2px solid #ddd'
            }}
          >
            📝 Contribute
          </button>
          <button
            className="btn-large"
            onClick={() => setActiveView('magazine')}
            style={activeView === 'magazine' ? {
              background: 'var(--primary-color)',
              color: 'white'
            } : {
              background: '#f8f9fa',
              color: 'var(--text-color)',
              border: '2px solid #ddd'
            }}
          >
            📖 View Magazine
          </button>
        </div>

        {/* Content Area */}
        <div className="animate-in">
          {activeView === 'contribute' ? (
            <SimpleSubmissionForm />
          ) : (
            <SimpleMagazineViewer />
          )}
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