# 🔒 Walled Garden / Captive Portal Implementation Guide

## Overview

This guide explains how to implement one-time access control for the SMPI Voucher System claim page using Walled Garden or Captive Portal techniques. This ensures customers can only claim vouchers once per device/session when connected to your WLAN.

---

## 🎯 Implementation Approaches

### **Approach 1: Router-Level Captive Portal (Recommended)**

This is the most secure and reliable method, implemented at the network infrastructure level.

#### **Requirements:**
- Enterprise router/access point with captive portal support
- Examples: UniFi, MikroTik, pfSense, Cisco, Aruba, Ruckus

#### **Setup Steps:**

##### **1. Configure Captive Portal on Router**

**For UniFi (Ubiquiti):**
```
1. Open UniFi Controller
2. Go to Settings → Guest Control
3. Enable Guest Portal
4. Set Portal Customization:
   - Redirect URL: https://your-domain.com/claim
   - Authentication: None (or Custom)
5. Set Access Policy:
   - Duration: 1 hour (or custom)
   - Download/Upload limits (optional)
6. Enable MAC address tracking
7. Save and apply
```

**For MikroTik:**
```
/ip hotspot profile
add name=smpi-voucher login-by=http-chap,http-pap

/ip hotspot
add name=smpi-hotspot interface=wlan1 address-pool=hotspot-pool profile=smpi-voucher

/ip hotspot walled-garden
add dst-host=your-domain.com
add dst-host=*.your-domain.com

/ip hotspot walled-garden ip
add action=accept dst-address=your-server-ip
```

**For pfSense:**
```
1. Services → Captive Portal
2. Add new zone: "SMPI_Voucher"
3. Enable Captive Portal
4. Redirect URL: https://your-domain.com/claim
5. Allowed Hostnames: your-domain.com
6. Authentication: None
7. Hard timeout: 3600 seconds (1 hour)
8. Save
```

##### **2. Configure Walled Garden Whitelist**

Allow access ONLY to your voucher system domain:

```
Allowed Domains:
- your-domain.com
- *.your-domain.com
- vercel.app (if using Vercel)

Blocked:
- All other internet access until voucher claimed
```

##### **3. Set Session Timeout**

```
Session Duration: 1-2 hours
Hard Timeout: Yes
Idle Timeout: 30 minutes
MAC Address Binding: Yes (prevents re-connection)
```

---

### **Approach 2: Application-Level MAC Address Tracking**

Implement MAC address tracking in your application (requires additional infrastructure).

#### **Architecture:**

```
Client Device → WiFi Router → Middleware Server → Voucher System
                    ↓
              MAC Address Capture
```

#### **Implementation:**

##### **1. Create MAC Address Tracking API**

Create `src/app/api/track-device/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-direct';

export async function POST(req: NextRequest) {
  try {
    const { macAddress, ipAddress } = await req.json();
    
    // Check if device already claimed
    const existing = await db.prepare(
      'SELECT * FROM DeviceAccess WHERE macAddress = ? AND claimedAt > datetime("now", "-24 hours")'
    ).get(macAddress);
    
    if (existing) {
      return NextResponse.json(
        { error: 'Device already claimed a voucher today' },
        { status: 403 }
      );
    }
    
    // Record device access
    await db.prepare(
      'INSERT INTO DeviceAccess (macAddress, ipAddress, accessedAt) VALUES (?, ?, datetime("now"))'
    ).run(macAddress, ipAddress);
    
    return NextResponse.json({ allowed: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

##### **2. Add Database Schema**

Add to `prisma/schema.prisma`:

```prisma
model DeviceAccess {
  id          Int      @id @default(autoincrement())
  macAddress  String   @unique
  ipAddress   String?
  accessedAt  DateTime @default(now())
  claimedAt   DateTime?
  
  @@index([macAddress])
  @@index([accessedAt])
}
```

##### **3. Router Configuration for MAC Forwarding**

**MikroTik Script:**
```
/ip hotspot user profile
set default transparent-proxy=yes

/ip firewall nat
add chain=dstnat action=redirect to-ports=3000 protocol=tcp dst-port=80,443 \
    comment="Redirect to voucher system with MAC"
```

**Note:** MAC address spoofing is possible, so this method is less secure than router-level captive portal.

---

### **Approach 3: Cookie + IP + Browser Fingerprinting (Software Only)**

Pure software solution without router configuration (least secure but easiest).

#### **Implementation:**

##### **1. Create Device Fingerprinting Utility**

Create `src/lib/device-fingerprint.ts`:

```typescript
import crypto from 'crypto';

export function generateFingerprint(req: Request): string {
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = req.headers.get('user-agent') || '';
  const acceptLanguage = req.headers.get('accept-language') || '';
  const acceptEncoding = req.headers.get('accept-encoding') || '';
  
  const fingerprintData = `${ip}|${userAgent}|${acceptLanguage}|${acceptEncoding}`;
  
  return crypto
    .createHash('sha256')
    .update(fingerprintData)
    .digest('hex');
}
```

##### **2. Update Claim API**

Modify `src/app/api/claim/route.ts`:

```typescript
import { generateFingerprint } from '@/lib/device-fingerprint';
import db from '@/lib/db-direct';

export async function POST(req: NextRequest) {
  try {
    const fingerprint = generateFingerprint(req);
    
    // Check if fingerprint already claimed today
    const existing = await db.prepare(
      'SELECT * FROM ClaimAttempts WHERE fingerprint = ? AND claimedAt > datetime("now", "-24 hours")'
    ).get(fingerprint);
    
    if (existing) {
      return NextResponse.json(
        { error: 'This device has already claimed a voucher today' },
        { status: 403 }
      );
    }
    
    // ... rest of claim logic
    
    // Record fingerprint
    await db.prepare(
      'INSERT INTO ClaimAttempts (fingerprint, claimedAt) VALUES (?, datetime("now"))'
    ).run(fingerprint);
    
    // ... return voucher
  } catch (error) {
    // ... error handling
  }
}
```

##### **3. Add Client-Side Fingerprinting**

Install library:
```bash
npm install @fingerprintjs/fingerprintjs
```

Update `src/app/claim/page.tsx`:
```typescript
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Get browser fingerprint
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  const visitorId = result.visitorId;
  
  const response = await fetch('/api/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...formData,
      deviceFingerprint: visitorId
    })
  });
  
  // ... handle response
};
```

---

## 🏗️ Recommended Architecture

### **Production Setup (Most Secure):**

```
┌─────────────────────────────────────────────────────────┐
│                    Customer Device                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              WiFi Router with Captive Portal            │
│  - MAC Address Tracking                                 │
│  - Walled Garden (only voucher domain allowed)          │
│  - Session timeout: 1 hour                              │
│  - Hard timeout after claim                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Voucher System                          │
│  - Email validation (one per email)                     │
│  - Rate limiting                                        │
│  - Device fingerprinting (backup)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Step-by-Step Implementation Checklist

### **Phase 1: Router Configuration**
- [ ] Choose router/AP with captive portal support
- [ ] Configure captive portal zone
- [ ] Set redirect URL to `/claim` page
- [ ] Configure walled garden whitelist
- [ ] Set session timeout (1-2 hours)
- [ ] Enable MAC address tracking
- [ ] Test captive portal redirect

### **Phase 2: Application Updates**
- [ ] Add device fingerprinting (optional backup)
- [ ] Update claim API with fingerprint check
- [ ] Add rate limiting per IP
- [ ] Create admin view for device tracking
- [ ] Add logging for claim attempts

### **Phase 3: Database Schema**
- [ ] Add DeviceAccess table (if using app-level tracking)
- [ ] Add ClaimAttempts table
- [ ] Run migrations
- [ ] Add indexes for performance

### **Phase 4: Testing**
- [ ] Test captive portal redirect
- [ ] Test one-time access enforcement
- [ ] Test session timeout
- [ ] Test MAC address blocking
- [ ] Test from multiple devices
- [ ] Test edge cases (VPN, proxy, etc.)

### **Phase 5: Monitoring**
- [ ] Set up logging for claim attempts
- [ ] Monitor for abuse patterns
- [ ] Track success/failure rates
- [ ] Set up alerts for suspicious activity

---

## 🔧 Router-Specific Configuration Examples

### **UniFi (Ubiquiti) - Detailed Setup**

```yaml
Guest Control Settings:
  Portal:
    - Enable: Yes
    - Portal Customization: External
    - Redirect URL: https://your-domain.com/claim
    - Redirect using hostname: Yes
  
  Access Control:
    - Pre-Authorization Access: your-domain.com
    - Post-Authorization Restrictions: None
    - Expire clients after: 1 hour
    - Use voucher-based authentication: No
  
  Advanced:
    - Enable HTTPS redirection: Yes
    - Restrict access to: Specific subnet
    - MAC address format: xx:xx:xx:xx:xx:xx
```

### **MikroTik - Complete Script**

```routeros
# Create IP pool for hotspot
/ip pool
add name=hotspot-pool ranges=192.168.88.100-192.168.88.200

# Create hotspot profile
/ip hotspot profile
add name=smpi-voucher \
    login-by=http-chap,http-pap \
    use-radius=no

# Create hotspot server
/ip hotspot
add name=smpi-hotspot \
    interface=wlan1 \
    address-pool=hotspot-pool \
    profile=smpi-voucher \
    idle-timeout=30m \
    keepalive-timeout=1h

# Configure walled garden
/ip hotspot walled-garden
add dst-host=your-domain.com comment="Voucher System"
add dst-host=*.vercel.app comment="Vercel CDN"

# Add walled garden IPs
/ip hotspot walled-garden ip
add action=accept dst-address=your-server-ip

# Create user profile with auto-logout
/ip hotspot user profile
add name=voucher-user \
    session-timeout=1h \
    idle-timeout=30m \
    keepalive-timeout=1h \
    status-autorefresh=1m

# Redirect to claim page
/ip hotspot
set [find name=smpi-hotspot] \
    login-page=https://your-domain.com/claim
```

### **pfSense - Configuration Steps**

```
1. Services → Captive Portal → Add
   
   Zone Configuration:
   - Zone name: SMPI_Voucher
   - Interface: LAN or WLAN
   - Maximum concurrent connections: 100
   - Idle timeout: 30 minutes
   - Hard timeout: 60 minutes
   - Logout popup window: No
   
2. Portal Page Contents:
   - Redirect URL: https://your-domain.com/claim
   - Auth Method: No Authentication
   
3. Allowed Hostnames:
   - your-domain.com
   - *.your-domain.com
   - vercel.app (if using Vercel)
   
4. Allowed IP Addresses:
   - Add your server IP
   
5. MAC Filtering:
   - Enable MAC filtering: Yes
   - MAC address format: xx:xx:xx:xx:xx:xx
   
6. Save and Apply
```

---

## 🛡️ Security Considerations

### **Prevent Bypass Attempts:**

1. **MAC Address Spoofing:**
   - Use router-level enforcement (harder to bypass)
   - Combine with IP tracking
   - Monitor for duplicate MAC addresses

2. **VPN/Proxy Bypass:**
   - Block VPN ports on guest network
   - Detect proxy headers
   - Use device fingerprinting

3. **Cookie Deletion:**
   - Use HTTP-only cookies
   - Combine with server-side session tracking
   - Use device fingerprinting as backup

4. **Multiple Devices:**
   - Enforce email uniqueness (already implemented)
   - Track claims per household (optional)
   - Set reasonable daily limits

### **Rate Limiting:**

Add to `src/middleware.ts`:

```typescript
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  const rateLimit = rateLimitMap.get(ip);
  
  if (rateLimit) {
    if (now < rateLimit.resetTime) {
      if (rateLimit.count >= 5) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        );
      }
      rateLimit.count++;
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    }
  } else {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
  }
  
  return NextResponse.next();
}
```

---

## 📊 Monitoring & Analytics

### **Track Claim Attempts:**

Create `src/app/api/admin/claim-logs/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import db from '@/lib/db-direct';

export async function GET(req: Request) {
  const session = await verifySession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const logs = await db.prepare(`
    SELECT 
      fingerprint,
      ipAddress,
      userAgent,
      success,
      errorReason,
      createdAt
    FROM ClaimAttempts
    ORDER BY createdAt DESC
    LIMIT 100
  `).all();

  return NextResponse.json(logs);
}
```

### **Dashboard Metrics:**

Add to admin dashboard:
- Total claim attempts
- Successful claims
- Blocked attempts (duplicate device)
- Top IP addresses
- Peak claim times
- Average time to claim

---

## 🚀 Deployment Checklist

### **Before Going Live:**

- [ ] Test captive portal on all device types (iOS, Android, Windows, Mac)
- [ ] Verify walled garden only allows voucher domain
- [ ] Test session timeout behavior
- [ ] Verify MAC address tracking works
- [ ] Test claim flow end-to-end
- [ ] Set up monitoring and alerts
- [ ] Document admin procedures
- [ ] Train staff on troubleshooting
- [ ] Prepare customer support FAQ
- [ ] Set up backup internet for staff

### **Launch Day:**

- [ ] Monitor claim attempts in real-time
- [ ] Watch for error patterns
- [ ] Be ready to adjust timeouts
- [ ] Have technical support on standby
- [ ] Collect user feedback
- [ ] Monitor router performance

---

## 🆘 Troubleshooting

### **Common Issues:**

**1. Captive Portal Not Redirecting:**
```
- Check DNS settings on router
- Verify redirect URL is correct
- Ensure HTTPS is properly configured
- Check firewall rules
- Test with http://captive.apple.com (iOS test)
```

**2. Users Can't Access Claim Page:**
```
- Verify walled garden whitelist includes your domain
- Check if SSL certificate is valid
- Ensure CDN/Vercel IPs are whitelisted
- Test DNS resolution from guest network
```

**3. Session Expires Too Quickly:**
```
- Increase idle timeout
- Adjust hard timeout settings
- Check for router memory issues
- Verify session persistence
```

**4. MAC Address Not Tracked:**
```
- Enable MAC address logging on router
- Check router firmware version
- Verify MAC filtering is enabled
- Test with known MAC address
```

---

## 📱 User Experience Flow

### **Ideal Customer Journey:**

```
1. Customer connects to "SMPI_Guest" WiFi
   ↓
2. Captive portal automatically opens
   ↓
3. Redirected to voucher claim page
   ↓
4. Customer fills form and submits
   ↓
5. Voucher code displayed instantly
   ↓
6. Customer takes screenshot/photo
   ↓
7. Session expires after 1 hour
   ↓
8. Device blocked from claiming again (24 hours)
```

### **Customer Instructions Sign:**

```
📱 FREE VOUCHER - HOW TO CLAIM:

1. Connect to WiFi: "SMPI_Guest"
2. Wait for page to open automatically
3. Fill in your details
4. Get your voucher code instantly!
5. Screenshot your code

⚠️ One voucher per device per day
⏰ Valid for 30 days from claim date

Need help? Ask our staff!
```

---

## 🎯 Best Practices

1. **Keep It Simple:** Don't over-complicate the user flow
2. **Clear Instructions:** Display signs with WiFi name and steps
3. **Fast Response:** Optimize claim page for quick loading
4. **Mobile First:** Most users will claim on phones
5. **Offline Fallback:** Have paper vouchers as backup
6. **Staff Training:** Ensure staff can troubleshoot common issues
7. **Monitor Daily:** Check logs for issues or abuse
8. **Regular Testing:** Test the flow weekly
9. **Update Firmware:** Keep router firmware up to date
10. **Backup Config:** Save router configuration regularly

---

## 📈 Scaling Considerations

### **For Multiple Locations:**

```
Location A Router → Captive Portal → Voucher System (Branch A)
Location B Router → Captive Portal → Voucher System (Branch B)
Location C Router → Captive Portal → Voucher System (Branch C)
                                            ↓
                                    Central Database
```

### **For High Traffic:**

- Use load balancer for voucher system
- Implement Redis for session caching
- Use CDN for static assets
- Monitor router capacity (max concurrent users)
- Consider multiple access points per location

---

## 💡 Alternative Solutions

### **QR Code Based:**
- Generate unique QR codes
- Print on receipts/flyers
- One-time use per QR code
- No WiFi dependency

### **SMS Verification:**
- Send voucher via SMS
- One voucher per phone number
- Requires SMS gateway integration
- Higher cost per voucher

### **Physical Voucher Cards:**
- Pre-printed voucher codes
- Hand out at counter
- Manual tracking
- No technical setup needed

---

## 📞 Support Resources

- **UniFi Documentation:** https://help.ui.com/hc/en-us/articles/115000166827
- **MikroTik Wiki:** https://wiki.mikrotik.com/wiki/Hotspot
- **pfSense Docs:** https://docs.netgate.com/pfsense/en/latest/captiveportal/
- **Cisco Captive Portal:** https://www.cisco.com/c/en/us/support/docs/wireless/

---

**Built with ❤️ for SMPI - Secure, Simple, Scalable**
