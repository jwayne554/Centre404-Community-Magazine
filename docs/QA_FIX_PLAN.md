# Centre404 Community Magazine - QA Fix Plan

**Date**: January 16, 2026
**Production URL**: https://centre404-community-magazine-production.up.railway.app/

---

## Executive Summary

Deep QA investigation identified **19 issues** across 4 workflows. The most critical issues are:
1. **Audio playback is completely broken** - users can submit audio but no one can listen to it
2. **Images stored as base64 in database** - causes performance and scalability issues
3. **Draft magazines are inaccessible** - no UI to find/publish them after creation

---

## Issue Inventory by Priority

### P0: CRITICAL - Breaks Core Functionality

| # | Issue | Workflow | File(s) | Impact |
|---|-------|----------|---------|--------|
| 1 | **Admin cannot preview audio submissions** | Audio | `src/app/admin/page.tsx` | Admins approve audio blindly - can't hear content |
| 2 | **Magazine "Listen" button non-functional** | Audio | `src/components/magazine/MagazineContent.tsx` | Users can't play published audio |
| 3 | **Drawing uses Next.js Image with data URI** | Drawing | `src/components/magazine/MagazineContent.tsx` | Drawings may not render correctly |
| 4 | **Images stored as base64 in database** | Image | `src/components/forms/simple-submission-form.tsx` | DB bloat, no optimization, slow queries |
| 5 | **No UI to access draft magazines** | Magazine | `src/app/admin/` | Drafts are invisible after creation |

### P1: HIGH - Significant Problems

| # | Issue | Workflow | File(s) | Impact |
|---|-------|----------|---------|--------|
| 6 | **No server-side validation of base64 images** | Image | `src/app/api/submissions/route.ts` | Could store invalid/malicious content |
| 7 | **Weak Zod validation on drawingData** | Drawing | `src/app/api/submissions/route.ts` | Uses `z.any()` - no type safety |
| 8 | **No size validation for drawings** | Drawing | `src/app/api/submissions/route.ts` | Unlimited data can be stored |
| 9 | **No error handling in admin canvas** | Drawing | `src/app/admin/page.tsx` | Silent failure on corrupted drawings |
| 10 | **TypeScript syntax errors** | Magazine | `src/repositories/magazine.repository.ts` | Build errors (semicolons vs commas) |
| 11 | **Upload endpoint unused for images** | Image | Form bypasses `/api/upload` | No file streaming, validation, or optimization |

### P2: MEDIUM - Should Fix

| # | Issue | Workflow | File(s) | Impact |
|---|-------|----------|---------|--------|
| 12 | **Drawing + text should be MIXED type** | Drawing | `src/components/forms/simple-submission-form.tsx` | Incorrect content type |
| 13 | **Drawing stored in both mediaUrl AND drawingData** | Drawing | `src/components/forms/simple-submission-form.tsx` | Data duplication |
| 14 | **No accessibility text for drawings/audio** | All | Form components | WCAG compliance issue |
| 15 | **No magazine edit/reorder after creation** | Magazine | Missing API/UI | Can't fix mistakes |
| 16 | **Uses alert() instead of toast** | Magazine | `src/app/admin/compile/page.tsx` | Poor UX |
| 17 | **Cloudinary configured but not used** | Image | Environment + dead code | Wasted configuration |

### P3: LOW - Nice to Have

| # | Issue | Workflow | File(s) | Impact |
|---|-------|----------|---------|--------|
| 18 | **WebM type detection may be fragile** | Audio | `src/app/api/upload/route.ts` | Edge case rejections |
| 19 | **No magazine statistics in admin** | Magazine | `src/app/admin/page.tsx` | Missing visibility |

---

## Detailed Fix Plan

### Fix #1: Add Audio Preview to Admin Dashboard
**Priority**: P0 (CRITICAL)
**Effort**: Small
**File**: `src/app/admin/page.tsx`

**Problem**: Lines 379-414 show image and drawing previews but NO audio player.

**Solution**: Add audio player after drawing preview section (~line 415):
```tsx
{/* Audio playback */}
{selectedSubmission.mediaUrl &&
 (selectedSubmission.contentType === 'AUDIO' || selectedSubmission.contentType === 'MIXED') &&
 selectedSubmission.mediaUrl.endsWith('.webm') && (
  <div className="mb-6">
    <h3 className="font-semibold mb-2">Audio Recording</h3>
    <audio
      controls
      src={selectedSubmission.mediaUrl}
      className="w-full"
    >
      Your browser does not support audio playback.
    </audio>
  </div>
)}
```

---

### Fix #2: Fix Magazine "Listen" Button
**Priority**: P0 (CRITICAL)
**Effort**: Small
**File**: `src/components/magazine/MagazineContent.tsx`

**Problem**: Lines 124-133 render a button with NO onClick handler.

**Solution**: Replace button with actual audio element:
```tsx
{submission.contentType === 'AUDIO' && submission.mediaUrl && (
  <div className="mt-4">
    <audio
      controls
      src={submission.mediaUrl}
      className="w-full"
    >
      Your browser does not support audio playback.
    </audio>
  </div>
)}
```

---

### Fix #3: Fix Drawing Display in Magazine
**Priority**: P0 (CRITICAL)
**Effort**: Small
**File**: `src/components/magazine/MagazineContent.tsx`

**Problem**: Lines 105-115 use Next.js `Image` component with data URI (doesn't work).

**Solution**: Replace with HTML `<img>` tag:
```tsx
{submission.drawingData && (
  <img
    src={submission.drawingData}
    alt="Drawing submission"
    className="max-w-full h-auto rounded-lg border border-light-gray"
  />
)}
```

---

### Fix #4: Route Images Through Upload Endpoint
**Priority**: P0 (CRITICAL)
**Effort**: Medium
**File**: `src/components/forms/simple-submission-form.tsx`

**Problem**: Images use `FileReader.readAsDataURL()` and store base64 in DB.

**Solution**: Upload images like audio files:
```tsx
// In handleSubmit, before creating submission:
let imageMediaUrl = null;
if (imageFile) {  // Need to store File object, not just preview
  const formData = new FormData();
  formData.append('file', imageFile);
  const uploadResponse = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (!uploadResponse.ok) throw new Error('Image upload failed');
  const uploadData = await uploadResponse.json();
  imageMediaUrl = uploadData.url;
}

// Then use imageMediaUrl instead of imagePreview (base64)
mediaUrl: audioMediaUrl || imageMediaUrl || null,
```

**Additional changes needed**:
1. Store `imageFile` in state (the actual File object)
2. Keep `imagePreview` (base64) for preview only
3. Clear both on form reset

---

### Fix #5: Create Draft Magazines Admin Page
**Priority**: P0 (CRITICAL)
**Effort**: Medium
**Files**: New file `src/app/admin/magazines/page.tsx`

**Problem**: No UI to view/manage draft magazines after creation.

**Solution**: Create new admin page at `/admin/magazines`:
```tsx
// New page that lists all magazines (draft and published)
// Shows status, allows publishing drafts, viewing details
// Uses MagazineService.getDraftMagazines() which already exists
```

**Also update**:
- Add link in admin dashboard navigation
- Add "View Drafts" button after saving draft in compile page

---

### Fix #6: Add Server-Side Image Validation
**Priority**: P1 (HIGH)
**Effort**: Small
**File**: `src/app/api/submissions/route.ts`

**Problem**: `mediaUrl` accepts any string without validation.

**Solution**: Add validation in Zod schema:
```tsx
const createSubmissionSchema = z.object({
  // ... existing fields
  mediaUrl: z.string()
    .refine(val => {
      if (!val) return true;
      // Allow file URLs from upload endpoint
      if (val.startsWith('/uploads/')) return true;
      // Reject base64 for images (should use upload endpoint)
      if (val.startsWith('data:image/')) return false;
      return true;
    }, 'Images must be uploaded via /api/upload')
    .nullable()
    .optional(),
});
```

---

### Fix #7: Strengthen Drawing Validation
**Priority**: P1 (HIGH)
**Effort**: Small
**File**: `src/app/api/submissions/route.ts`

**Problem**: `drawingData: z.any()` provides no validation.

**Solution**:
```tsx
drawingData: z.string()
  .regex(/^data:image\/png;base64,/, 'Drawing must be PNG data URI')
  .max(2 * 1024 * 1024, 'Drawing too large (max 2MB)')  // ~1.5MB actual image
  .nullable()
  .optional(),
```

---

### Fix #8: Add Error Handling to Admin Canvas
**Priority**: P1 (HIGH)
**Effort**: Small
**File**: `src/app/admin/page.tsx`

**Problem**: Lines 398-410 have no error handling for image load failures.

**Solution**:
```tsx
const img = new window.Image();
img.onload = () => {
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.drawImage(img, 0, 0);
};
img.onerror = () => {
  // Show error state
  const ctx = canvas.getContext('2d');
  if (ctx) {
    canvas.width = 200;
    canvas.height = 100;
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, 200, 100);
    ctx.fillStyle = '#ef4444';
    ctx.font = '14px Inter';
    ctx.fillText('Drawing failed to load', 20, 55);
  }
};
img.src = selectedSubmission.drawingData;
```

---

### Fix #9: Fix TypeScript Syntax in MagazineRepository
**Priority**: P1 (HIGH)
**Effort**: Small
**File**: `src/repositories/magazine.repository.ts`

**Problem**: Lines 19-31 use semicolons instead of commas in type definition.

**Solution**: Replace all semicolons with commas in the type definition:
```tsx
export type MagazineWithRelations = Prisma.MagazineGetPayload<{
  include: {
    items: {
      include: {
        submission: {
          include: {
            user: {
              select: {
                id: true,    // comma, not semicolon
                name: true,  // comma, not semicolon
              },
            },
          },
        },
      },
    },
    publishedBy: {
      select: {
        id: true,
        name: true,
      },
    },
  },
}>;
```

---

### Fix #10: Fix Content Type for Drawing + Text
**Priority**: P2 (MEDIUM)
**Effort**: Small
**File**: `src/components/forms/simple-submission-form.tsx`

**Problem**: Lines 88-94 don't handle drawing + text combination.

**Solution**:
```tsx
let contentType: 'TEXT' | 'IMAGE' | 'AUDIO' | 'DRAWING' | 'MIXED' = 'TEXT';
if (audioMediaUrl && textContent) contentType = 'MIXED';
else if (audioMediaUrl) contentType = 'AUDIO';
else if (imagePreview && textContent) contentType = 'MIXED';
else if (imagePreview) contentType = 'IMAGE';
else if (drawingData && textContent) contentType = 'MIXED';  // ADD THIS
else if (drawingData) contentType = 'DRAWING';
```

---

## Implementation Order

**Phase 1: Critical Audio/Drawing Fixes (Day 1)**
1. Fix #1 - Admin audio preview
2. Fix #2 - Magazine Listen button
3. Fix #3 - Drawing display in magazine

**Phase 2: Image Pipeline Fix (Day 2)**
4. Fix #4 - Route images through upload endpoint
5. Fix #6 - Server-side image validation

**Phase 3: Drawing & Magazine Fixes (Day 3)**
6. Fix #7 - Strengthen drawing validation
7. Fix #8 - Admin canvas error handling
8. Fix #9 - TypeScript syntax fix
9. Fix #10 - Content type for drawing + text

**Phase 4: Magazine Management (Day 4)**
10. Fix #5 - Draft magazines admin page

---

## Testing Checklist After Fixes

### Audio Workflow
- [ ] Record audio on landing page
- [ ] Submit audio-only submission
- [ ] Submit audio + text (MIXED) submission
- [ ] Admin can play audio in submission detail
- [ ] Published audio plays in magazine viewer

### Drawing Workflow
- [ ] Create drawing on landing page
- [ ] Submit drawing-only submission
- [ ] Submit drawing + text (MIXED) submission
- [ ] Drawing displays in admin review
- [ ] Drawing displays in magazine viewer
- [ ] Corrupted drawing shows error state

### Image Workflow
- [ ] Upload image on landing page
- [ ] Image uploads to /uploads/ directory (not base64)
- [ ] Submit image-only submission
- [ ] Submit image + text (MIXED) submission
- [ ] Image displays in admin review
- [ ] Image displays in magazine viewer

### Magazine Workflow
- [ ] Create magazine from approved submissions
- [ ] Save as draft
- [ ] Find draft in admin magazines page
- [ ] Publish draft magazine
- [ ] View published magazine

---

## Files Modified Summary

| File | Fixes |
|------|-------|
| `src/app/admin/page.tsx` | #1, #8 |
| `src/components/magazine/MagazineContent.tsx` | #2, #3 |
| `src/components/forms/simple-submission-form.tsx` | #4, #10 |
| `src/app/api/submissions/route.ts` | #6, #7 |
| `src/repositories/magazine.repository.ts` | #9 |
| `src/app/admin/magazines/page.tsx` (NEW) | #5 |

---

## Notes

- All fixes maintain backward compatibility with existing data
- Existing base64 images in database will continue to work
- New images will be stored as files going forward
- Consider data migration script to convert existing base64 to files (future)
