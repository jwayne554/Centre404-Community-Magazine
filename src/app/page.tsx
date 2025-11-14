'use client'

import React, { useState } from 'react'
import {
  Newspaper,
  Hand,
  MessageCircle,
  Mic,
  Smile,
  Trash2,
  ArrowRight,
} from 'lucide-react'
import Layout from '@/components/ui/Layout'
import Button from '@/components/ui/Button'
import { CategoryCard } from '@/components/ui/Card'
import { Input, TextArea, FileUpload } from '@/components/ui/Input'
import Accordion from '@/components/ui/Accordion'

const ContributionForm = () => {
  const [category, setCategory] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [symbolsOpen, setSymbolsOpen] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category || !message.trim()) {
      alert('Please select a category and enter a message')
      return
    }

    setIsSubmitting(true)
    setSubmitSuccess(false)

    try {
      // Upload file if present
      let mediaUrl = null
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file')
        }

        const uploadData = await uploadResponse.json()
        mediaUrl = uploadData.url
      }

      // Determine content type
      const contentType = mediaUrl && message.trim() ? 'MIXED' : mediaUrl ? 'IMAGE' : 'TEXT'

      // Submit to API
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          textContent: message,
          contentType,
          mediaUrl: mediaUrl || null,
          userName: name || 'Community Member',
        }),
      })

      if (response.ok) {
        setSubmitSuccess(true)
        setSuccessMessage('✓ Thank you! Your contribution is being reviewed by our team.')

        // Clear form
        setCategory('')
        setName('')
        setMessage('')
        setSelectedFile(null)

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' })

        // Reset success state after delay
        setTimeout(() => {
          setSuccessMessage('')
          setSubmitSuccess(false)
        }, 8000)
      } else {
        const errorData = await response.text()
        console.error('Submission failed:', response.status, errorData)
        alert(`Submission failed: ${response.status}. Please try again.`)
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const handleAddSymbol = (symbol: string) => {
    setMessage((prev) => prev + symbol)
    setSymbolsOpen(false)
  }

  const symbols = [
    '😊',
    '👍',
    '❤️',
    '🎉',
    '👋',
    '🙏',
    '✅',
    '⭐',
    '🔥',
    '💯',
    '🌟',
    '👏',
  ]

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Share Your Story</h1>
          <p className="text-dark-gray">
            Contribute to our community magazine by sharing your news, thoughts,
            or just saying hello!
          </p>
        </div>
        {successMessage && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary rounded-xl">
            <p className="text-primary font-medium">{successMessage}</p>
          </div>
        )}
        <Accordion title="How does this work?">
          <p className="mb-2">
            The Centre404 Community Magazine is a platform for our community
            members to share their stories, news, and thoughts.
          </p>
          <p className="mb-2">
            Your contribution will be reviewed and may be featured in our next
            edition. You can include text, photos, or even record audio!
          </p>
          <p>
            Select a category, fill out the form, and hit submit. It's that easy!
          </p>
        </Accordion>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Select a category for your contribution
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CategoryCard
                title="My News"
                icon={<Newspaper className="h-6 w-6" />}
                active={category === 'MY_NEWS'}
                onClick={() => setCategory('MY_NEWS')}
              />
              <CategoryCard
                title="Saying Hello"
                icon={<Hand className="h-6 w-6" />}
                active={category === 'SAYING_HELLO'}
                onClick={() => setCategory('SAYING_HELLO')}
              />
              <CategoryCard
                title="My Say"
                icon={<MessageCircle className="h-6 w-6" />}
                active={category === 'MY_SAY'}
                onClick={() => setCategory('MY_SAY')}
              />
            </div>
          </div>
          {category && (
            <>
              <Input
                label="Your name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
              <div className="mb-4">
                <TextArea
                  label="Write your message"
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your story, news, or just say hello..."
                  required
                  rows={6}
                />
                <div className="flex items-center space-x-2 mt-2">
                  <Button
                    variant="icon"
                    icon={<Mic className="h-5 w-5" />}
                    onClick={() => alert('Record audio feature')}
                  >
                    Record Audio
                  </Button>
                  <div className="relative">
                    <Button
                      variant="icon"
                      icon={<Smile className="h-5 w-5" />}
                      onClick={() => setSymbolsOpen(!symbolsOpen)}
                    >
                      Symbols
                    </Button>
                    {symbolsOpen && (
                      <div className="absolute z-10 mt-1 w-64 p-2 bg-white rounded-xl shadow-lg border border-light-gray">
                        <div className="grid grid-cols-6 gap-2">
                          {symbols.map((symbol) => (
                            <button
                              key={symbol}
                              type="button"
                              className="h-10 w-10 flex items-center justify-center text-xl rounded hover:bg-background"
                              onClick={() => handleAddSymbol(symbol)}
                            >
                              {symbol}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="icon"
                    icon={<Trash2 className="h-5 w-5" />}
                    onClick={() => setMessage('')}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <FileUpload
                onFileSelect={handleFileSelect}
                label="Add a photo to your contribution"
              />
              {selectedFile && (
                <div className="mb-4 p-3 bg-background rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate">{selectedFile.name}</span>
                    <Button
                      variant="icon"
                      size="sm"
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => setSelectedFile(null)}
                    />
                  </div>
                </div>
              )}
              <div className="mt-8">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  icon={<ArrowRight className="h-5 w-5" />}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : submitSuccess ? '✓ Submitted!' : 'Submit My Contribution'}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </Layout>
  )
}

export default ContributionForm
