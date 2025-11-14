'use client';

import { useState } from 'react';
import Layout from '@/components/ui/Layout';
import CategoryCard from '@/components/ui/CategoryCard';
import { Newspaper, Hand, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { SimpleSubmissionForm } from '@/components/forms/simple-submission-form';

export default function Home() {
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Hero Section - Minimal */}
        <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Share Your Story
        </h1>
        <p className="text-lg text-dark-gray leading-relaxed">
          Contribute to our community magazine by sharing your news, thoughts, or just saying hello!
        </p>
      </div>

      {/* Accordion - How does this work? */}
      <div className="mb-6">
        <button
          onClick={() => setAccordionOpen(!accordionOpen)}
          className="w-full px-4 py-3 flex justify-between items-center bg-white border border-light-gray rounded-xl hover:bg-background transition-colors"
          aria-expanded={accordionOpen}
        >
          <span className="text-base font-medium text-charcoal">
            How does this work?
          </span>
          {accordionOpen ? (
            <ChevronUp className="h-5 w-5 text-dark-gray" />
          ) : (
            <ChevronDown className="h-5 w-5 text-dark-gray" />
          )}
        </button>

        {accordionOpen && (
          <div className="mt-1 overflow-hidden transition-all duration-300">
            <div className="p-4 bg-background rounded-xl">
              <p className="mb-2">
                The Centre404 Community Magazine is a platform for our community members to share their stories, news, and thoughts.
              </p>
              <p className="mb-2">
                Your contribution will be reviewed and may be featured in our next edition. You can include text, photos, or even record audio!
              </p>
              <p>
                Select a category, fill out the form, and hit submit. It's that easy!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">
          Select a category for your contribution
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CategoryCard
            icon={<Newspaper className="h-6 w-6" />}
            label="My News"
            selected={selectedCategory === 'MY_NEWS'}
            onClick={() => setSelectedCategory('MY_NEWS')}
          />
          <CategoryCard
            icon={<Hand className="h-6 w-6" />}
            label="Saying Hello"
            selected={selectedCategory === 'SAYING_HELLO'}
            onClick={() => setSelectedCategory('SAYING_HELLO')}
          />
          <CategoryCard
            icon={<MessageSquare className="h-6 w-6" />}
            label="My Say"
            selected={selectedCategory === 'MY_SAY'}
            onClick={() => setSelectedCategory('MY_SAY')}
          />
        </div>
      </div>

      {/* Submission Form - Only shows when category selected */}
      {selectedCategory && (
        <div className="animate-in">
          <SimpleSubmissionForm preselectedCategory={selectedCategory} />
        </div>
      )}
      </div>
    </Layout>
  );
}
