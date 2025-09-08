# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-file web application for Centre404 Community Magazine - an accessible digital magazine platform that allows community members to contribute stories and view shared content. The entire application is contained in a single HTML file with embedded CSS and JavaScript.

## Key Features

- **Contribution System**: Users can submit stories in categories (My News, Saying Hello, My Say) with text, images, and drawings
- **Accessibility Features**: High contrast mode, adjustable font sizes, screen reader support, and speech-to-text/text-to-speech functionality
- **Local Storage**: All submissions are stored in browser localStorage (no backend required)
- **Drawing Canvas**: Built-in drawing tool with color selection
- **Symbol Board**: Quick emoji/symbol insertion for enhanced communication
- **Responsive Design**: Mobile-first approach with breakpoints for tablets and desktops

## Architecture

The application follows a simple client-side architecture:
- **Data Layer**: localStorage for persistence (key: 'magazineSubmissions')
- **UI Components**: Section-based navigation between Contribute and Magazine views
- **Event Handling**: Direct onclick handlers and form submission handling
- **State Management**: Global variables for UI state (isRecording, isDrawing, currentColor, etc.)

## Development Guidelines

When modifying this application:
1. Maintain accessibility features as top priority - all interactions must remain keyboard and screen reader accessible
2. Keep everything in the single HTML file unless specifically asked to refactor
3. Test localStorage operations carefully - the app relies entirely on browser storage
4. Preserve the simple, direct event handling approach rather than introducing complex frameworks
5. Ensure mobile responsiveness for all new features