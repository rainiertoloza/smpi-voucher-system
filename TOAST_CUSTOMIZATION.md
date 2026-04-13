# 🎨 Toast Message Customization Guide

## Overview
Toast notifications appear at the top-right corner of the screen to provide feedback to users.

---

## 📍 Where to Customize Toast Messages

### **1. Claim Page** (`src/app/claim/page.tsx`)

#### **Success Messages:**
```typescript
// Line ~48 - When voucher is successfully sent
showToast('Voucher sent to your email!', 'success');

// Customize to:
showToast('🎉 Success! Check your email for the voucher code', 'success');
```

#### **Error Messages:**
```typescript
// Line ~23 - Invalid phone number
showToast('Please enter a valid Philippine phone number (09XXXXXXXXX)', 'error');

// Line ~44 - API error response
showToast(data.error || 'Failed to claim voucher', 'error');

// Line ~52 - Server error
showToast('Server error. Please try again.', 'error');
```

#### **Info/Warning Messages:**
```typescript
// Line ~46 - Email sent but with warning
showToast(data.warning, 'info');
```

---

## 🎨 Toast Styling

### **Colors** (`src/components/Toast.module.css`)

#### **Success Toast (Green):**
```css
.toast.success {
  background: rgba(16, 185, 129, 0.95);  /* Change this */
  border: 1px solid rgba(16, 185, 129, 1);
}
```

#### **Error Toast (Red):**
```css
.toast.error {
  background: rgba(239, 68, 68, 0.95);  /* Change this */
  border: 1px solid rgba(239, 68, 68, 1);
}
```

#### **Info Toast (Blue):**
```css
.toast.info {
  background: rgba(59, 130, 246, 0.95);  /* Change this */
  border: 1px solid rgba(59, 130, 246, 1);
}
```

### **SMPI Brand Colors:**
```css
/* Primary Blue */
.toast.success {
  background: rgba(0, 88, 169, 0.95);  /* #0058a9 */
  border: 1px solid rgba(0, 88, 169, 1);
}

/* Yellow */
.toast.info {
  background: rgba(253, 216, 2, 0.95);  /* #fdd802 */
  border: 1px solid rgba(253, 216, 2, 1);
  color: #333 !important;  /* Dark text for yellow background */
}

/* Red */
.toast.error {
  background: rgba(234, 36, 41, 0.95);  /* #ea2429 */
  border: 1px solid rgba(234, 36, 41, 1);
}
```

---

## 🔧 Toast Configuration

### **Duration** (`src/components/Toast.tsx`)

```typescript
// Default: 3 seconds (3000ms)
export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps)

// Change to 5 seconds:
duration = 5000

// Change to 2 seconds:
duration = 2000
```

### **Position** (`src/components/Toast.module.css`)

```css
.toast {
  position: fixed;
  top: 2rem;      /* Distance from top */
  right: 2rem;    /* Distance from right */
}

/* Move to top-left: */
.toast {
  top: 2rem;
  left: 2rem;
  right: auto;
}

/* Move to bottom-right: */
.toast {
  top: auto;
  bottom: 2rem;
  right: 2rem;
}

/* Center top: */
.toast {
  top: 2rem;
  left: 50%;
  right: auto;
  transform: translateX(-50%);
}
```

### **Animation** (`src/components/Toast.module.css`)

```css
/* Current: Slide from right */
@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Fade in: */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Slide from top: */
@keyframes slideIn {
  from {
    transform: translateY(-100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

---

## 📝 Common Toast Messages

### **Claim Page Messages:**

```typescript
// Success
showToast('✅ Voucher sent successfully!', 'success');
showToast('🎉 Check your email for your voucher code', 'success');
showToast('📧 Voucher delivered to your inbox', 'success');

// Error - Validation
showToast('❌ Please enter a valid email address', 'error');
showToast('⚠️ Only Gmail and Yahoo emails are accepted', 'error');
showToast('📱 Invalid phone number format', 'error');

// Error - Rate Limiting
showToast('⏰ Too many requests. Please try again in 30 minutes', 'error');
showToast('🚫 This email has already claimed a voucher today', 'error');

// Error - Server
showToast('💥 Server error. Please try again later', 'error');
showToast('🔌 Connection failed. Check your internet', 'error');

// Info
showToast('ℹ️ Voucher created but email delivery delayed', 'info');
showToast('⏳ Processing your request...', 'info');
```

### **Admin Dashboard Messages:**

```typescript
// Success
showToast('✅ Voucher redeemed successfully!', 'success');
showToast('💾 Settings saved', 'success');
showToast('🗑️ Data cleaned up successfully', 'success');

// Error
showToast('❌ Voucher not found', 'error');
showToast('⚠️ Voucher already redeemed', 'error');
showToast('🔒 Unauthorized access', 'error');
```

---

## 🎯 Best Practices

1. **Keep messages short** - Max 60 characters
2. **Use emojis** - Makes messages more engaging
3. **Be specific** - Tell users exactly what happened
4. **Provide action** - Tell users what to do next
5. **Match tone** - Success = positive, Error = helpful

### **Good Examples:**
✅ "Voucher sent! Check your email"
✅ "Invalid email. Only Gmail and Yahoo accepted"
✅ "Too many requests. Try again in 30 minutes"

### **Bad Examples:**
❌ "Success" (too vague)
❌ "An error occurred" (not helpful)
❌ "Error code 500" (technical jargon)

---

## 🔄 Adding Custom Toast Types

### **1. Add new type** (`src/components/Toast.tsx`)

```typescript
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';  // Add 'warning'
  onClose: () => void;
  duration?: number;
}

// Add icon
<span className={styles.icon}>
  {type === 'success' && '✓'}
  {type === 'error' && '✕'}
  {type === 'info' && 'ℹ'}
  {type === 'warning' && '⚠'}  // Add this
</span>
```

### **2. Add styling** (`src/components/Toast.module.css`)

```css
.toast.warning {
  background: rgba(245, 158, 11, 0.95);  /* Orange */
  border: 1px solid rgba(245, 158, 11, 1);
}
```

### **3. Use it:**

```typescript
showToast('⚠️ Voucher expires in 3 days', 'warning');
```

---

## 📱 Mobile Responsiveness

Current mobile styling:
```css
@media (max-width: 768px) {
  .toast {
    top: 1rem;
    right: 1rem;
    left: 1rem;      /* Full width on mobile */
    min-width: auto;
  }
}
```

---

## 🎨 Example: SMPI Branded Toast

```css
/* src/components/Toast.module.css */

.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 16px;  /* More rounded */
  box-shadow: 0 10px 40px rgba(0, 88, 169, 0.3);  /* SMPI blue shadow */
  backdrop-filter: blur(20px);
  z-index: 9999;
  animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);  /* Bounce effect */
  min-width: 320px;
  max-width: 500px;
  font-family: 'Geist', sans-serif;
}

.toast.success {
  background: linear-gradient(135deg, rgba(0, 88, 169, 0.95) 0%, rgba(0, 112, 217, 0.95) 100%);
  border: 2px solid #0058a9;
}

.toast.error {
  background: linear-gradient(135deg, rgba(234, 36, 41, 0.95) 0%, rgba(200, 30, 35, 0.95) 100%);
  border: 2px solid #ea2429;
}

.toast.info {
  background: linear-gradient(135deg, rgba(253, 216, 2, 0.95) 0%, rgba(255, 230, 50, 0.95) 100%);
  border: 2px solid #fdd802;
  color: #333 !important;
}

.message {
  flex: 1;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.3px;
}

.toast.info .message {
  color: #333;
}
```

---

**Quick Reference:**
- Toast component: `src/components/Toast.tsx`
- Toast styles: `src/components/Toast.module.css`
- Claim page messages: `src/app/claim/page.tsx` (lines 23, 44, 48, 52)
- Admin messages: `src/app/gate/v9x3k7m2q8/dashboard/page.tsx`
