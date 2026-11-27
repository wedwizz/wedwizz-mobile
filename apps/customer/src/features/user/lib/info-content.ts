// Copied from the web: features/user/lib/info-content.ts.
/**
 * The Help, Privacy and Terms pages (profile-info-page.tsx).
 * The privacy and terms texts are a plain description of how WedWizz works today, written from the code: have them
 * reviewed (and add the company's name and address) before launch.
 */

export const FAQS = [
  {
    q: "How do I contact a vendor?",
    a: "Open any venue or vendor and tap Send Enquiry. The vendor sees your name and the wedding details you send. Your phone number is shared only if you choose to share it.",
  },
  {
    q: "How do bookings work?",
    a: "When you and a vendor agree, either of you marks the enquiry as booked and the other confirms it. Your bookings are under Profile → My bookings, and after the event you can review the vendor there.",
  },
  { q: "How do I change my city?", a: "Tap the location at the top of the home screen, or edit your profile." },
  { q: "How do I delete my account?", a: "Go to Profile → Account settings → Delete account." },
];

export const LEGAL = {
  privacy: [
    "WedWizz uses your phone number to sign you in, and the details you add to your profile: your name, city and role in the wedding, and if you add them, your email, wedding date, partner’s name, guest count and budget.",
    "Your location is used only when you tap Near me, to list venues and vendors by distance. It isn’t saved with your account.",
    "You can delete your account at any time in Profile → Account settings → Delete account. Your profile, saved venues and vendors and checklist are deleted; your conversations and past bookings stay with the vendors, without your name or phone number.",
  ],
  terms: [
    "WedWizz helps you find wedding venues and vendors in Kerala and contact them. Listings, prices and availability come from the vendors: confirm the details with the vendor before you book.",
    "A booking is an agreement between you and the vendor. WedWizz records it but is not part of it, and doesn’t take payments.",
    "Reviews must be about a booking you made, and honest. Reviews that break this rule may be hidden.",
    "Don’t misuse WedWizz, for example with spam or false enquiries. Accounts that do may be suspended.",
  ],
};
