'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '@/components/ui/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { BookOpen, Calendar, ArrowRight } from 'lucide-react'

interface Magazine {
  id: string
  title: string
  description: string | null
  publishedAt: string | null
  createdAt: string
  isPublic: boolean
}

const MagazineArchive = () => {
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMagazines = async () => {
      try {
        const response = await fetch('/api/magazines?public=true')
        if (response.ok) {
          const data = await response.json()
          setMagazines(data)
        }
      } catch (error) {
        console.error('Failed to fetch magazines:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMagazines()
  }, [])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const latestEdition = magazines.length > 0 ? magazines[0] : null
  const previousEditions = magazines.slice(1)

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Magazine Archive</h1>
          <p className="text-dark-gray">
            Browse through all editions of our community magazine
          </p>
        </div>
        {loading && (
          <div className="text-center py-12">
            <p className="text-dark-gray">Loading magazines...</p>
          </div>
        )}
        {!loading && magazines.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-dark-gray mx-auto mb-4" />
            <p className="text-dark-gray">No magazines published yet. Check back soon!</p>
          </div>
        )}
        {!loading && latestEdition && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Latest Edition</h2>
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="bg-primary/10 p-8 flex items-center justify-center md:w-1/3">
                  <div className="text-center">
                    <BookOpen className="h-16 w-16 text-primary mx-auto mb-2" />
                    <h3 className="text-xl font-bold">{latestEdition.title}</h3>
                    <p className="text-dark-gray flex items-center justify-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(latestEdition.publishedAt || latestEdition.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="p-6 md:p-8 md:w-2/3">
                  <div className="flex items-start">
                    <div className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-medium uppercase">
                      New
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mt-3">
                    {latestEdition.title}
                  </h3>
                  <p className="mt-2 text-dark-gray">
                    {latestEdition.description || 'Our latest edition features stories from community members, local news, and special announcements. Dive in to discover what\'s happening in our community!'}
                  </p>
                  <div className="mt-6">
                    <Link href={`/magazines/${latestEdition.id}`}>
                      <Button
                        variant="primary"
                        icon={<ArrowRight className="h-4 w-4" />}
                      >
                        Read Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
        {!loading && previousEditions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Previous Editions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {previousEditions.map((edition) => (
                <Link href={`/magazines/${edition.id}`} key={edition.id}>
                  <Card className="h-full hover:shadow-lg transition-shadow p-6">
                    <div className="text-center">
                      <BookOpen className="h-12 w-12 text-primary mx-auto mb-3" />
                      <h3 className="font-bold">{edition.title}</h3>
                      <p className="text-dark-gray flex items-center justify-center mt-1 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(edition.publishedAt || edition.createdAt)}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default MagazineArchive
