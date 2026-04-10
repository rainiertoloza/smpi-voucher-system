# Admin Dashboard Customization Guide

## 📍 Step-by-Step: Align "Vouchers Issued" Box

The "Vouchers Issued" box (`.limitBadge`) is in the header but doesn't align with the stat cards below. Here's how to fix it:

### Current Issue
- `.limitBadge` has custom padding and styling that doesn't match `.statCard`
- Different border-radius and shadow effects
- Height doesn't match the stat cards

### Solution Steps

**Step 1: Open the CSS file**
```
src/app/gate/v9x3k7m2q8/dashboard/dashboard.module.css
```

**Step 2: Find `.limitBadge` (around line 56)**
```css
.limitBadge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 88, 169, 0.3);
}
```

**Step 3: Replace with aligned version**
```css
.limitBadge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: linear-gradient(135deg, rgba(0, 88, 169, 0.15) 0%, rgba(234, 36, 41, 0.1) 100%);
  border: 1px solid rgba(0, 88, 169, 0.3);
  padding: 1rem;
  border-radius: 12px;
  transition: transform 0.2s;
}

.limitBadge:hover {
  transform: translateY(-2px);
}
```

**Step 4: Update `.limitLabel` (around line 66)**
```css
.limitLabel {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}
```

**Step 5: Update `.limitValue` (around line 73)**
```css
.limitValue {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--foreground);
  margin: 0.25rem 0 0 0;
}
```

---

## 🎨 Tutorial: Resize Dashboard Divs

### Understanding the Grid Layout

The dashboard uses CSS Grid for responsive layouts:

```css
.content {
  display: grid;
  grid-template-columns: 1fr 1fr;  /* 2 equal columns */
  grid-template-rows: auto auto 1fr;  /* 3 rows */
  gap: 1rem;  /* Space between items */
}
```

### 1. Resize Stat Cards (Top Row)

**Location:** `.statsSection` (line 93)

**Current:**
```css
.statsSection {
  grid-column: 1 / -1;  /* Spans all columns */
  display: grid;
  grid-template-columns: repeat(4, 1fr);  /* 4 equal cards */
  gap: 1rem;
}
```

**Options:**

**A) Make 2 cards per row:**
```css
grid-template-columns: repeat(2, 1fr);
```

**B) Make 3 cards per row:**
```css
grid-template-columns: repeat(3, 1fr);
```

**C) Make cards different sizes:**
```css
grid-template-columns: 2fr 1fr 1fr 1fr;  /* First card 2x bigger */
```

**D) Change card height:**
```css
.statCard {
  padding: 1.5rem;  /* Increase from 1rem */
  min-height: 120px;  /* Set minimum height */
}
```

---

### 2. Resize Chart Cards (Middle Row)

**Location:** `.chartCard` (line 130)

**Current:**
```css
.chartCard {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}
```

**Options:**

**A) Make charts taller:**
```css
.chartCard {
  min-height: 350px;  /* Add this */
}
```

**B) Make one chart span full width:**
In `page.tsx`, find the chart you want to span and add inline style:
```tsx
<div className={styles.chartCard} style={{ gridColumn: '1 / -1' }}>
```

**C) Change chart layout to 1 column:**
In `.content` (line 85):
```css
grid-template-columns: 1fr;  /* Change from "1fr 1fr" */
```

---

### 3. Resize Actions Card (Bottom Section)

**Location:** `.actionsCard` (line 143)

**Current:**
```css
.actionsCard {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;  /* 3 equal sections */
  gap: 1.5rem;
}
```

**Options:**

**A) Make 2 sections per row:**
```css
grid-template-columns: 1fr 1fr;
```

**B) Make sections different widths:**
```css
grid-template-columns: 2fr 1fr 1fr;  /* First section bigger */
```

**C) Stack vertically:**
```css
grid-template-columns: 1fr;
```

**D) Increase padding/spacing:**
```css
.actionsCard {
  padding: 2rem;  /* Increase from 1rem */
  gap: 2rem;  /* Increase from 1.5rem */
}
```

---

### 4. Resize Vouchers Table

**Location:** `.tableCard` (line 213)

**Current:**
```css
.tableCard {
  max-height: 500px;  /* Limits table height */
}
```

**Options:**

**A) Make table taller:**
```css
max-height: 700px;
```

**B) Remove height limit (full height):**
```css
max-height: none;
```

**C) Make table shorter:**
```css
max-height: 300px;
```

**D) Change font size:**
```css
.table {
  font-size: 0.9rem;  /* Increase from 0.85rem */
}
```

---

## 🎯 Quick Reference: Common Adjustments

### Spacing Between Elements
```css
.content {
  gap: 1.5rem;  /* Change from 1rem for more space */
}
```

### Overall Dashboard Width
```css
.page {
  max-width: 1600px;  /* Add this to limit width */
  margin: 0 auto;  /* Center it */
}
```

### Card Padding (All Cards)
```css
.statCard, .chartCard, .actionsCard, .tableCard {
  padding: 1.5rem;  /* Increase from 1rem */
}
```

### Border Radius (Roundness)
```css
.statCard {
  border-radius: 16px;  /* Increase from 12px for rounder corners */
}
```

---

## 📱 Responsive Breakpoints

The dashboard has responsive breakpoints:

**Desktop (default):** 2 columns
**Tablet (< 1400px):** 1 column
**Mobile (< 768px):** 2 stat cards per row

To adjust breakpoints, find `@media` queries at the bottom of the CSS file.

---

## 🔧 Pro Tips

1. **Use Browser DevTools:** Right-click any element → Inspect → Edit CSS live
2. **Test Responsively:** Use browser's responsive mode (F12 → Toggle device toolbar)
3. **Keep Backups:** Copy the original CSS before making changes
4. **Use `fr` units:** `1fr` = 1 fraction of available space (flexible)
5. **Use `rem` for sizing:** Scales with user's font size preferences

---

## 📝 Example: Custom Layout

Want a custom layout? Here's a complete example:

```css
/* Make stats 2 per row */
.statsSection {
  grid-template-columns: repeat(2, 1fr);
}

/* Make charts stack vertically */
.content {
  grid-template-columns: 1fr;
}

/* Make actions 2 per row */
.actionsCard {
  grid-template-columns: 1fr 1fr;
}

/* Bigger table */
.tableCard {
  max-height: 800px;
}

/* More spacing everywhere */
.content {
  gap: 2rem;
}
```

Save and refresh to see changes!
