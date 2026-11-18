// Team e-visiting cards. Each one lives at decibel-114.com/card/<slug>; the QR on the printed card opens it.
export const cards = [
  {
    slug: 'ismail-hossain',
    name: 'MD Ismail Hossain',
    title: 'Team Lead, Network Architecture & Passive Infrastructure',
    phone: '+8801944422257',
    whatsapp: '8801944422257',
    email: '',
    company: 'Decibel-114',
    website: 'https://decibel-114.com',
    about: 'Designs enterprise networks end to end: structured cabling, fibre backbones, racks and Wi-Fi, from site survey to handover.',
    skills: ['Network design', 'Structured cabling', 'Fibre & racks', 'Enterprise Wi-Fi'],
  },
];
export const cardBySlug = (s) => cards.find((c) => c.slug === s);
