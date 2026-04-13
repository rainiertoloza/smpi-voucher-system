// List of allowed email domains
const allowedDomains = [
  'gmail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.co.jp',
  'yahoo.fr',
  'yahoo.de',
  'yahoo.ca',
  'yahoo.com.au',
  'yahoo.in'
];

export function validateEmail(email: string): { valid: boolean; error?: string } {
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check if domain is allowed
  const domain = email.split('@')[1]?.toLowerCase();
  if (!allowedDomains.includes(domain)) {
    return { valid: false, error: 'Only Gmail and Yahoo email addresses are accepted' };
  }

  // Check for common typos in Gmail and Yahoo
  const commonTypos: { [key: string]: string } = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'yhoo.com': 'yahoo.com'
  };

  if (commonTypos[domain]) {
    return { 
      valid: false, 
      error: `Did you mean ${email.split('@')[0]}@${commonTypos[domain]}?` 
    };
  }

  return { valid: true };
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
