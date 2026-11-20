/**
 * Plain TS, so the mobile app can open the same links (React Native `Linking.openURL`). Numbers are the 10-digit
 * Indian mobile numbers the API returns.
 */

/** `https://wa.me/919123456789?text=…`: opens a WhatsApp chat with the business, the message prefilled. */
export function whatsappLink(phoneNumber: string, text: string): string {
  const link = `https://wa.me/91${phoneNumber}`;
  return text ? `${link}?text=${encodeURIComponent(text)}` : link;
}

/** `tel:+919123456789`: starts a phone call. */
export function callLink(phoneNumber: string): string {
  return `tel:+91${phoneNumber}`;
}
