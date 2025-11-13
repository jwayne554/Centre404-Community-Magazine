'use client';

import Link from 'next/link';
import { useMagazineData } from '@/hooks/useMagazineData';
import { MagazineSkeletonGrid } from '@/components/skeletons/magazine-skeleton';

export default function MagazinesPage() {
  const { magazines, isLoading: loading } = useMagazineData({ publicOnly: true });

  const latestMagazine = magazines.length > 0 ? magazines[0] : null;
  const olderMagazines = magazines.slice(1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div className="main-header" style={{
          background: 'var(--primary-color)',
          color: 'white',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '30px',
          borderRadius: '8px',
          position: 'relative'
        }}>
          {/* Admin Link */}
          <Link
            href="/admin"
            className="hover-admin-link"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            🔐 Admin
          </Link>

          <h1 style={{ fontSize: '24px', marginBottom: '10px', color: 'white' }}>
            Centre404 Community Magazine Archive
          </h1>
          <p style={{ color: 'white' }}>Read all our community editions</p>
        </div>

        {/* Back Button */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: '#f8f9fa',
            border: '2px solid #ddd',
            borderRadius: '6px',
            textDecoration: 'none',
            color: 'var(--text-color)',
            marginBottom: '30px',
            fontWeight: '600'
          }}
        >
          <span style={{ fontSize: '16px' }}>←</span>
          Back to Contribute
        </Link>

        {loading ? (
          <MagazineSkeletonGrid />
        ) : magazines.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            border: '2px solid #ddd',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '20px', marginBottom: '10px', fontWeight: '600' }}>
              📚 No magazines published yet
            </p>
            <p style={{ color: '#666' }}>
              Check back soon! Our first edition is being compiled from your wonderful contributions.
            </p>
          </div>
        ) : (
          <>
            {/* Latest Magazine */}
            {latestMagazine && (
              <div style={{ marginBottom: '50px' }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '20px',
                  color: 'var(--text-color)'
                }}>
                  🏆 Latest Edition
                </h2>
                <Link
                  href={`/magazines/${latestMagazine.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    className="hover-lift-lg"
                    style={{
                      background: 'linear-gradient(135deg, var(--primary-color), var(--success-color))',
                      color: 'white',
                      padding: '30px',
                      borderRadius: '12px',
                      border: '3px solid var(--primary-color)',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <h3 style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      marginBottom: '10px',
                      color: 'white'
                    }}>
                      {latestMagazine.title}
                    </h3>
                    {latestMagazine.description && (
                      <p style={{ fontSize: '16px', marginBottom: '15px', opacity: 0.95 }}>
                        {latestMagazine.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '16px' }}>📅</span>
                        {latestMagazine.publishedAt ? new Date(latestMagazine.publishedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Recently'}
                      </span>
                      <span>•</span>
                      <span>{latestMagazine.items.length} {latestMagazine.items.length === 1 ? 'story' : 'stories'}</span>
                    </div>
                    <div style={{
                      marginTop: '20px',
                      padding: '12px 24px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      display: 'inline-block',
                      fontWeight: '600'
                    }}>
                      📖 Read Edition →
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Previous Editions */}
            {olderMagazines.length > 0 && (
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '20px',
                  color: 'var(--text-color)'
                }}>
                  📚 Previous Editions
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '20px'
                }}>
                  {olderMagazines.map((magazine) => (
                    <Link
                      key={magazine.id}
                      href={`/magazines/${magazine.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div
                        className="hover-lift-sm"
                        style={{
                          background: 'white',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          padding: '20px',
                          cursor: 'pointer',
                          height: '100%'
                        }}
                      >
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          marginBottom: '8px',
                          color: 'var(--text-color)'
                        }}>
                          {magazine.title}
                        </h3>
                        {magazine.description && (
                          <p style={{
                            fontSize: '14px',
                            color: '#666',
                            marginBottom: '12px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {magazine.description}
                          </p>
                        )}
                        <div style={{
                          fontSize: '13px',
                          color: '#999',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontSize: '12px' }}>📅</span>
                          {magazine.publishedAt ? new Date(magazine.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                          }) : 'Recently'}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#666',
                          fontWeight: '500'
                        }}>
                          {magazine.items.length} {magazine.items.length === 1 ? 'story' : 'stories'}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
