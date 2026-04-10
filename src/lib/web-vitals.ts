export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    const { name, value, id } = metric;
    
    // Log to console in development
    console.log(`[Web Vitals] ${name}:`, value);
    
    // Send to analytics endpoint if needed
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', name, {
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        event_label: id,
        non_interaction: true,
      });
    }
  }
}
