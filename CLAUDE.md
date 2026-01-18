# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based Sales Applications frontend (SPK - Sales Order/Purchase Order management system). It connects to a Strapi CMS backend and provides features for sales personnel to manage orders, track attendance with geolocation, and generate PDF documents.

**Tech Stack:**
- React 19.2 + TypeScript
- Vite 7.2 (dev server on port 5555)
- React Router DOM 7 for client-side routing
- Zustand for state management
- Tailwind CSS + Radix UI components
- React Hook Form + Zod for form validation
- Axios for API communication

## Development Commands

```bash
npm run dev      # Start Vite dev server on port 5555
npm run build    # TypeScript compilation + Vite build
npm run lint     # Run ESLint
npm run preview  # Preview production build on port 5555
```

**Required Node version:** >= 22.12.0

## Project Structure

```
src/
├── components/ui/       # Base UI components (shadcn/ui pattern)
├── features/            # Feature-based modules (auth, dashboard, spk, attendance, profile)
├── layouts/             # Layout components
├── lib/                 # Utilities (axios instance, url helpers, generators)
├── stores/              # Zustand stores (auth state)
├── hooks/               # Custom React hooks
├── data/                # Static/mock data
└── config/              # Configuration files (env.ts)
```

## Path Alias

Use `@` to reference the `src` directory (configured in `vite.config.ts`):
```ts
import { something } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
```

## API Communication

The app uses an Axios instance configured in `src/lib/axios.ts`:
- Base URL from `ENV.STRAPI_BASE_URL`
- Bearer token authentication (auto-injected from Zustand auth store)
- Automatic 401 handling (auto-logout on unauthorized responses)

**Usage:**
```ts
import { api } from '@/lib/axios';

const response = await api.get('/endpoint');
const postData = await api.post('/endpoint', data);
```

## Environment Configuration

Located in `src/config/env.ts`. Required environment variables:
- `VITE_STRAPI_BASE_URL` - Strapi API base URL (required)
- `VITE_STRAPI_URL` - Strapi media URL (auto-derived from BASE_URL if missing)
- `VITE_QR_BASE_URL` - Base URL for QR code generation (required)
- `VITE_GOOGLE_MAPS_API_KEY` - Optional, for maps integration
- `VITE_APP_VERSION` - Optional, defaults to '1.0.0'

**Important:** The app includes security warnings if localhost URLs are detected in production builds.

## URL Handling for Strapi Media

Use `getStrapiMedia()` from `src/lib/url.ts` when dealing with Strapi media URLs. It handles:
- Converting relative paths to absolute URLs
- Replacing localhost URLs that may be stored in the database
```ts
import { getStrapiMedia } from '@/lib/url';
const imageUrl = getStrapiMedia(item.image);
```

## State Management

Zustand is used for global state. The auth store (`src/stores/authStore.ts`) includes:
- `user`, `token`, `isAuthenticated`, `isApproved`
- Persisted to localStorage as `auth-storage`
- Use via `useAuthStore` hook throughout the app

## Features

**Auth (`src/features/auth/`)** - Login/Register pages with form validation
**SPK (`src/features/spk/`)** - Sales order creation and management with PDF generation
**Dashboard (`src/features/dashboard/`)** - Main dashboard view
**Attendance (`src/features/attendance/`)** - Geolocation-based attendance tracking
**Profile (`src/features/profile/`)** - User profile management with QR code generation

## Form Validation

Forms use React Hook Form with Zod schemas:
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  field: z.string().min(1, "Required"),
});
```

## Deployment

The app is containerized with Docker using a multi-stage build and served via Nginx. It is designed to be deployed on platforms like Coolify.
