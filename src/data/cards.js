// Team e-visiting cards. Each one lives at decibel-114.com/card/<slug>.
// The QR on the card holds the contact itself (vCard), so a phone camera offers "Add contact" straight away.
export const cards = [
  {
    slug: 'ismail-hossain',
    name: 'MD Ismail Hossain',
    title: 'Head of Infrastructure & Security',
    focus: ['Network infrastructure', 'Cabling', 'CCTV & security'],
    phone: '+8801944422257',
    whatsapp: '8801944422257',
    email: '',
    company: 'Decibel-114',
    website: 'https://decibel-114.com',
  },
];
export const cardBySlug = (s) => cards.find((c) => c.slug === s);
