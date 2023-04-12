import UAParser from 'ua-parser-js';

function testUA(userAgent: string, pattern: RegExp) {
  return pattern.test(navigator.userAgent);
};
export function isiOS(userAgent: string) {
  return testUA(userAgent, /iPad|iPhone|iPod/) && !(window as any).MSStream;
};

export function isiOSSafari(userAgent: string) {
  return isiOS(userAgent) && !testUA(userAgent, / CriOS\/[.0-9]*/);
};

export function isAndroid(userAgent: string) {
  return testUA(userAgent, /Android/);
};

export type MobileOS = 'ios' | 'android';

export function getMobileOS(userAgent: string) : MobileOS | null {
  if (isiOS(userAgent)) return 'ios';
  if (isAndroid(userAgent)) return 'android';

  return null;
}

export function getUserAgent(userAgent?: string) {
  if (!userAgent) return null;
  return UAParser(userAgent);
}