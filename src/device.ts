function testUA(pattern: RegExp) {
  return pattern.test(navigator.userAgent);
};
export function isiOS() {
  return testUA(/iPad|iPhone|iPod/) && !(window as any).MSStream;
};

export function isiOSSafari() {
  return isiOS() && !testUA(/ CriOS\/[.0-9]*/);
};

export function isAndroid() { return testUA(/Android/); };

export type MobileOS = 'ios' | 'android';

export function getMobileOS() : MobileOS | null {
  if (isiOS()) return 'ios';
  if (isAndroid()) return 'android';

  return null;
}