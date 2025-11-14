'use client';

import Link from 'next/link';
import { useMagazineData } from '@/hooks/useMagazineData';
import { MagazineSkeletonGrid } from '@/components/skeletons/magazine-skeleton';
import Layout from '@/components/ui/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { BookOpen, Calendar } from 'lucide-react';

export default function MagazinesPage() {
  const { magazines, isLoading: loading } = useMagazineData({ publicOnly: true });

  const latestMagazine = magazines.length > 0 ? magazines[0] : null;
  const olderMagazines = magazines.slice(1);

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Magazine Archive</h1>
        <p className="text-dark-gray">
          Read all our community editions and discover stories from our members
        </p>
      </div>

      {loading ? (
        <MagazineSkeletonGrid />
      ) : magazines.length === 0 ? (
        <Card className="text-center p-12">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold mb-2">No magazines published yet</h2>
          <p className="text-dark-gray mb-6">
            Check back soon! Our first edition is being compiled from your wonderful contributions.
          </p>
          <Link href="/">
            <Button variant="primary">Share Your Story</Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* Latest Magazine - Large 2-Column Highlight */}
          {latestMagazine && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold">Latest Edition</h2>
                <span className="bg-accent text-charcoal px-3 py-1 rounded-full text-sm font-semibold">
                  New
                </span>
              </div>
              <Link href={`/magazines/${latestMagazine.id}`} className="block">
                <Card
                  hover={true}
                  className="bg-gradient-to-br from-primary to-primary/80 text-white border-primary overflow-hidden"
                >
                  <div className="grid md:grid-cols-2 gap-6 p-8">
                    {/* Left Column - Content */}
                    <div className="flex flex-col justify-center">
                      <h3 className="text-3xl font-bold mb-3 text-white">
                        {latestMagazine.title}
                      </h3>
                      {latestMagazine.description && (
                        <p className="text-white/95 mb-4 text-lg leading-relaxed">
                          {latestMagazine.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm mb-6">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {latestMagazine.publishedAt
                            ? new Date(latestMagazine.publishedAt).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Recently'}
                        </span>
                        <span>•</span>
                        <span>
                          {latestMagazine.items.length}{' '}
                          {latestMagazine.items.length === 1 ? 'story' : 'stories'}
                        </span>
                      </div>
                      <div>
                        <Button variant="secondary" size="lg">
                          📖 Read Edition
                        </Button>
                      </div>
                    </div>

                    {/* Right Column - Visual Element */}
                    <div className="hidden md:flex items-center justify-center">
                      <div className="bg-white/20 rounded-xl p-8 backdrop-blur-sm">
                        <BookOpen className="h-32 w-32 text-white" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          )}

          {/* Previous Editions - 3 Column Grid */}
          {olderMagazines.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Previous Editions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {olderMagazines.map((magazine) => (
                  <Link key={magazine.id} href={`/magazines/${magazine.id}`}>
                    <Card hover={true} className="h-full flex flex-col">
                      <div className="p-6 flex flex-col h-full">
                        {/* Book Icon */}
                        <div className="bg-primary/10 rounded-xl p-4 mb-4 inline-flex items-center justify-center self-start">
                          <BookOpen className="h-8 w-8 text-primary" />
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                          {magazine.title}
                        </h3>

                        {/* Description */}
                        {magazine.description && (
                          <p className="text-dark-gray text-sm mb-4 line-clamp-2 flex-grow">
                            {magazine.description}
                          </p>
                        )}

                        {/* Metadata */}
                        <div className="mt-auto space-y-2">
                          <div className="flex items-center gap-2 text-sm text-dark-gray">
                            <Calendar className="h-4 w-4" />
                            {magazine.publishedAt
                              ? new Date(magazine.publishedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'Recently'}
                          </div>
                          <div className="text-sm font-medium text-charcoal">
                            {magazine.items.length}{' '}
                            {magazine.items.length === 1 ? 'story' : 'stories'}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
