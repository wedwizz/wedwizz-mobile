/**
 * The WedWizz website, for pages the customer app links out to (the vendor login, which lives on the website and later
 * in the vendor app). Unset: those links are hidden.
 */
const WEB_BASE_URL = process.env.EXPO_PUBLIC_WEB_BASE_URL?.trim().replace(/\/+$/, "") || null;

/** The website's vendor login (web welcome page: "Are you a vendor? Log in here" → /login), or null. */
export const VENDOR_LOGIN_URL = WEB_BASE_URL ? `${WEB_BASE_URL}/login` : null;

/** Where Help & support sends customers ("Still stuck? Email …"), or null: the line is hidden. */
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() || null;
