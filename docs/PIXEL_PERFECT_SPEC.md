# Pixel-Perfect Design Specification
**Comparing Prototype Screenshots to Current Implementation**

---

## Screenshot 1 Analysis (Landing Page - Initial State)

### Background
- **Prototype:** Very light gray background (#F9FAFB or similar)
- **Current:** Using `bg-background` (#F8F9FA) - ✅ Close enough

### Header
- **Logo:** Green book icon (BookOpen lucide) + "Centre404 Community Magazine"
- **Nav Links:** "Share Your Story" (green, underlined) | "Archive" | "Latest Edition"
- **Typography:** Clean, sans-serif (Inter)
- **Status:** ✅ Implemented

### Hero Section
**Prototype Measurements:**
- Heading: "Share Your Story"
  - Font size: ~36-40px (text-4xl = 36px) ✅
  - Font weight: Bold (700)
  - Color: Dark charcoal/black
  - Margin bottom: ~8-12px

- Subtitle: "Contribute to our community magazine..."
  - Font size: ~16-18px (text-base or text-lg)
  - Color: Gray (#6B7280 range)
  - Line height: Relaxed

**Status:** ✅ Likely correct

### Accordion
**Prototype Details:**
- Border: 1px solid light gray (#E5E7EB)
- Border radius: 12px (rounded-xl)
- Padding: 16-20px
- Background: White
- Text: "How does this work?" (medium weight)
- Icon: Chevron down/up (gray)

**Status:** ✅ Likely correct

### Category Cards
**THIS IS THE CRITICAL SECTION**

**Prototype Measurements (EXACT):**

**Card Container:**
- Width: Equal thirds (33.33% each)
- Padding: 24-32px vertical, 24-32px horizontal
- Border: 2px solid #E5E7EB (light gray) - **NOT selected initially**
- Border radius: 12px (rounded-xl)
- Background: White (#FFFFFF)
- Gap between cards: 16-24px

**Icon Circle (Unselected):**
- Size: 80px diameter (w-20 h-20)
- Background: #E5E7EB or #D1D5DB (light gray - 200/300 shade)
- Border radius: 50% (full circle)
- Icon size: 32px (h-8 w-8)
- Icon color: #6B7280 (dark gray - 500 shade)
- Margin bottom: 12-16px

**Label:**
- Text: "My News", "Saying Hello", "My Say"
- Font size: 16px (text-base)
- Font weight: Medium (500)
- Color: #1F2937 (charcoal/gray-800)

---

## Screenshot 2 Analysis (Category Selected State)

### Selected Card (e.g., "Saying Hello")
**Changes:**
- Border: 2px solid #34A853 (primary green)
- Background: Still white

**Icon Circle (Selected):**
- Background: #34A853 (primary green)
- Icon color: White (#FFFFFF)

**Label:**
- Same (no color change)

### Unselected Cards
- Remain as in Screenshot 1 (gray circles)

---

## Screenshot 3 Analysis (Magazine Archive)

### Page Title
- "Magazine Archive" (large, bold)
- Subtitle: "Browse through all editions..."

### Latest Edition Card
**Two-column layout:**

**Left Column:**
- Background: Light sage green (#E8F5E9 or similar)
- Large book icon (green)
- Title: "Summer 2023" (bold)
- Date: Calendar icon + "June 2023"

**Right Column:**
- Background: White
- "NEW" badge: Yellow (#FFBB00) background, dark text
- Title: "Centre404 Community Magazine"
- Description text
- "Read Now" button (green)

### Previous Editions Grid
- 3 columns
- Each card: Book icon, title, date
- White background, light border
- Minimal shadows

---

## Screenshot 4 Analysis (Magazine Viewer)

### Article Cards
**Structure:**
1. Category badge (top-left): Green pill, white text
2. Author + date (small, gray)
3. Article content (text)
4. Image (if present, full-width)
5. Like button (bottom): Heart icon + "5 Likes"

---

## Current Implementation Issues

### Likely Problems:

1. **Category Card Circle Size**
   - Should be: 80px diameter (w-20 h-20) ✅ I did this
   - Icon inside: 32px (h-8 w-8) ✅ I did this

2. **Card Padding**
   - Should be: p-8 (32px) instead of p-6 (24px)?
   - Need to verify exact spacing

3. **Border Weight**
   - Unselected: border (1px) or border-2 (2px)?
   - Selected: border-2 (2px) ✅

4. **Circle Background Color**
   - Unselected: Should be bg-gray-200 (#E5E7EB)
   - Currently using: bg-gray-200 ✅

5. **Typography**
   - Label font size: Should be text-base (16px) ✅

6. **Spacing**
   - Gap between cards: gap-6 (24px) ✅
   - Margin below hero: mb-12 (48px) ✅

---

## Action Items for Pixel-Perfect Match

### High Priority Fixes:

1. **Background Color**
   - Verify Layout uses correct light gray background
   - Should be #F9FAFB or #F8F9FA

2. **Category Card Border**
   - Unselected: Use `border-2` (2px) not `border` (1px)
   - Color: #E5E7EB

3. **Typography Sizes**
   - Hero heading: text-4xl (36px) - verify
   - Subtitle: text-lg (18px) - verify
   - Card label: text-base (16px) - verify

4. **Spacing/Padding**
   - Card padding: Increase to p-8 (32px)?
   - Gap between cards: Verify gap-6 (24px)

5. **Circle Size**
   - Verify w-20 h-20 (80px)
   - Icon: h-8 w-8 (32px)

6. **Shadow/Effects**
   - Prototype has NO shadows on category cards initially
   - Remove `shadow-card` class
   - Only subtle hover effect

---

## Exact CSS Values Needed

```css
/* Category Card (Unselected) */
.category-card {
  background: #FFFFFF;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 32px;
  cursor: pointer;
}

.category-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Category Card (Selected) */
.category-card.selected {
  border: 2px solid #34A853;
}

/* Icon Circle (Unselected) */
.icon-circle {
  width: 80px;
  height: 80px;
  background: #E5E7EB;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-circle svg {
  width: 32px;
  height: 32px;
  color: #6B7280;
  stroke-width: 1.5;
}

/* Icon Circle (Selected) */
.icon-circle.selected {
  background: #34A853;
}

.icon-circle.selected svg {
  color: #FFFFFF;
}

/* Label */
.category-label {
  font-size: 16px;
  font-weight: 500;
  color: #1F2937;
  margin-top: 16px;
}
```

---

## Comparison Checklist

### Layout Background
- [ ] Verify `bg-background` (#F8F9FA) or `bg-gray-50` (#F9FAFB)

### Hero Section
- [ ] H1: text-4xl (36px), font-bold, text-charcoal
- [ ] Subtitle: text-lg (18px), text-dark-gray, leading-relaxed
- [ ] Spacing: mb-12 (48px) after hero

### Accordion
- [ ] Border: border (1px), border-light-gray
- [ ] Padding: p-5 (20px)
- [ ] Hover: bg-gray-50

### Category Cards
- [ ] Border: border-2 (2px), border-light-gray (unselected)
- [ ] Border: border-2 (2px), border-primary (selected)
- [ ] Padding: p-8 (32px)
- [ ] Background: bg-white
- [ ] No shadow initially (only on hover)
- [ ] Gap: gap-6 (24px)

### Icon Circle
- [ ] Size: w-20 h-20 (80px)
- [ ] Background: bg-gray-200 (unselected)
- [ ] Background: bg-primary (selected)
- [ ] Icon: h-8 w-8 (32px), strokeWidth={1.5}
- [ ] Icon color: text-gray-600 (unselected)
- [ ] Icon color: text-white (selected)

### Label
- [ ] Font: text-base (16px), font-medium
- [ ] Color: text-charcoal
- [ ] Margin: mt-4 (16px) from circle

---

## Next Steps

1. Update CategoryCard.tsx with exact measurements
2. Remove shadows from initial state
3. Verify all spacing matches
4. Test hover states
5. Compare side-by-side with screenshots

---

**Status:** Draft specification for pixel-perfect implementation
**Created:** 2025-01-14
