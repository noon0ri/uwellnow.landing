type EventName = 'cta_click' | 'experience_complete'

export function track(event: EventName, params: Record<string, string>): void {
  const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag
  if (typeof gtag === 'function') gtag('event', event, params)
}
