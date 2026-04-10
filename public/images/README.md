# Images Folder Structure

This folder contains all static images used in the voucher system.

## Folder Organization

### `/backgrounds`
Place background images here for:
- Landing page backgrounds
- Admin dashboard backgrounds
- Login page backgrounds

**Recommended formats:** JPG, PNG, WebP
**Recommended sizes:** 1920x1080 or larger for full-screen backgrounds

### `/icons`
Place icon files here for:
- Favicon (favicon.ico)
- App icons (various sizes)
- Logo files
- UI icons

**Recommended formats:** ICO, PNG, SVG

## Usage Examples

### Background Image
```tsx
// In your component
<div style={{ 
  backgroundImage: 'url(/images/backgrounds/hero-bg.jpg)',
  backgroundSize: 'cover'
}}>
```

### Favicon
Place `favicon.ico` in `/icons` folder and reference in layout:
```tsx
// In app/layout.tsx
<link rel="icon" href="/images/icons/favicon.ico" />
```

### Logo
```tsx
import Image from 'next/image';

<Image 
  src="/images/icons/logo.png" 
  alt="Logo" 
  width={200} 
  height={50} 
/>
```

## Current Files
- No images uploaded yet. Add your custom images to the appropriate folders.

## Tips
- Use WebP format for better compression
- Optimize images before uploading (use tools like TinyPNG)
- Keep file sizes under 500KB for backgrounds
- Use descriptive filenames (e.g., `admin-dashboard-bg.jpg`)
