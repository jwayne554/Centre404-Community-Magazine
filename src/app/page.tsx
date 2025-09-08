'use client';

import { useState } from 'react';
import { EnhancedSubmissionForm } from '@/components/forms/enhanced-submission-form';
import { MagazineViewer } from '@/components/magazine/magazine-viewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Edit3, Users, Heart, Accessibility, Globe } from 'lucide-react';

export default function Home() {
  const [activeView, setActiveView] = useState<'home' | 'contribute' | 'magazine'>('home');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            Centre404 Community Magazine
          </h1>
          <p className="text-center mt-2 text-lg opacity-90">
            Your Voice, Your Stories
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-10 bg-background border-b py-4 px-4">
        <div className="container mx-auto flex justify-center gap-4 flex-wrap">
          <Button
            variant={activeView === 'home' ? 'default' : 'outline'}
            onClick={() => setActiveView('home')}
            size="lg"
          >
            <Heart className="mr-2 h-5 w-5" />
            Home
          </Button>
          <Button
            variant={activeView === 'contribute' ? 'default' : 'outline'}
            onClick={() => setActiveView('contribute')}
            size="lg"
          >
            <Edit3 className="mr-2 h-5 w-5" />
            Contribute
          </Button>
          <Button
            variant={activeView === 'magazine' ? 'default' : 'outline'}
            onClick={() => setActiveView('magazine')}
            size="lg"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            View Magazine
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {activeView === 'home' && <HomeContent />}
        {activeView === 'contribute' && <EnhancedSubmissionForm />}
        {activeView === 'magazine' && <MagazineView />}
      </main>

      {/* Footer */}
      <footer className="bg-muted mt-16 py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="mb-2">© 2024 Centre404 Community Magazine</p>
          <p className="text-sm">
            Supporting adults with learning disabilities to share their voices
          </p>
        </div>
      </footer>
    </div>
  );
}

function HomeContent() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome to Our Community Magazine!</CardTitle>
          <CardDescription className="text-lg mt-4">
            This is a place where everyone in our community can share their stories, 
            news, and thoughts. Your voice matters, and we want to hear from you!
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="text-4xl mb-3">📰</div>
            <CardTitle>My News</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Share what's happening in your life. Did something exciting happen? 
            Tell us about it!</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="text-4xl mb-3">👋</div>
            <CardTitle>Saying Hello</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Connect with friends and make new ones. Send greetings and messages 
            to the community.</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="text-4xl mb-3">💬</div>
            <CardTitle>My Say</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Share your thoughts and opinions. What's important to you? 
            What would you like to talk about?</p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-lg">Choose Your Category</h3>
              <p className="text-muted-foreground">Pick from My News, Saying Hello, or My Say</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-lg">Share Your Story</h3>
              <p className="text-muted-foreground">Write, speak, draw, or add photos</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-lg">See It Published</h3>
              <p className="text-muted-foreground">Your contribution appears in the community magazine</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Features */}
      <Card className="bg-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-6 w-6" />
            Accessibility Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-3">
            <li className="flex items-center gap-2">
              ✓ Large, clear text that's easy to read
            </li>
            <li className="flex items-center gap-2">
              ✓ Speech-to-text for easy writing
            </li>
            <li className="flex items-center gap-2">
              ✓ Symbol board for communication
            </li>
            <li className="flex items-center gap-2">
              ✓ Screen reader friendly
            </li>
            <li className="flex items-center gap-2">
              ✓ High contrast mode available
            </li>
            <li className="flex items-center gap-2">
              ✓ Simple, clear navigation
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function MagazineView() {
  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Community Magazine</CardTitle>
          <CardDescription>
            Browse stories and contributions from our community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MagazineViewer />
        </CardContent>
      </Card>
    </div>
  );
}