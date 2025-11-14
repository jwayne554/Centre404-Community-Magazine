'use client'

import React from 'react'
import Link from 'next/link'
import Layout from '@/components/ui/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Heart, Volume2, Plus } from 'lucide-react'

const MagazineEdition = () => {
  // Mock data for articles
  const articles = [
    {
      id: 1,
      category: 'MY NEWS',
      author: 'Paul',
      content:
        "I'm excited to share that I've started a community garden project in our neighborhood! We've already planted tomatoes, peppers, and herbs. Everyone is welcome to join us on Saturdays from 10am-12pm.",
      image:
        'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      likes: 12,
      hasAudio: true,
    },
    {
      id: 2,
      category: 'SAYING HELLO',
      author: 'Maria',
      content:
        "Hello everyone! I'm new to the community and wanted to introduce myself. I moved here last month and I'm loving the neighborhood so far. I enjoy painting, hiking, and trying new restaurants. Looking forward to meeting more of you!",
      image: '',
      likes: 8,
      hasAudio: false,
    },
    {
      id: 3,
      category: 'MY SAY',
      author: 'James',
      content:
        'I think we should organize more events for the elderly in our community. They have so much wisdom to share and many are feeling isolated. What do you all think about a monthly tea gathering where we can connect across generations?',
      image:
        'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      likes: 15,
      hasAudio: true,
    },
    {
      id: 4,
      category: 'MY NEWS',
      author: 'Sophie',
      content:
        "Our local library is now offering free coding classes for kids every Wednesday afternoon! My daughter attended last week and loved it. They're looking for volunteers with programming experience too.",
      image: '',
      likes: 10,
      hasAudio: false,
    },
  ]

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Summer 2023 Edition</h1>
          <p className="text-dark-gray">
            Stories, news, and greetings from our community members
          </p>
        </div>
        <div className="space-y-6">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium mr-3">
                    {article.category}
                  </span>
                  <span className="text-dark-gray text-sm">
                    By {article.author}
                  </span>
                </div>
                <p className="mb-4">{article.content}</p>
                {article.image && (
                  <div className="mb-4 -mx-6">
                    <img
                      src={article.image}
                      alt="Article"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center space-x-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Heart className="h-4 w-4" />}
                    className="text-sm"
                  >
                    {article.likes}
                  </Button>
                  {article.hasAudio && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Volume2 className="h-4 w-4" />}
                      className="text-sm"
                    >
                      Listen
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <div className="mb-6">
            <h3 className="text-xl font-medium">Thank you for reading!</h3>
            <p className="text-dark-gray mt-2">
              We love hearing from our community members.
            </p>
          </div>
          <Link href="/">
            <Button
              variant="primary"
              size="lg"
              icon={<Plus className="h-5 w-5" />}
            >
              Share Your Story
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

export default MagazineEdition
