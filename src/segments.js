// The three sides of Decibel-114. The entry popup and the solution pages read from here,
// so wording can be changed in one place.
export const SEGMENTS = [
  { id: 'products', to: '/', title: 'Products', sub: 'Phones, laptops, Apple, networking and electronics, delivered across Bangladesh.' },
  { id: 'it', to: '/it-solutions', title: 'IT Solutions', sub: 'Networks, security, servers and support for offices, factories and ISPs.' },
  { id: 'agri', to: '/agriculture', title: 'Agriculture', sub: 'Technology and supply for farms and agribusiness.' },
];

export const IT_SOLUTIONS = {
  id: 'it',
  eyebrow: 'Decibel-114 IT Solutions',
  title: 'Networks built for business.',
  intro: 'Tell us about the site and the people using it. We specify, supply, install and support the whole network, so one team answers for it.',
  services: [
    { art: 'ap', cat: 'wifi', t: 'Office Wi-Fi', d: 'Seamless roaming across floors with UniFi, Ruijie or Ruckus, planned from a coverage survey so there are no dead zones.' },
    { art: 'switch', cat: 'switches', t: 'Structured cabling and switching', d: 'Cat6 and fibre runs, patch panels and PoE switching for cameras, phones and access points, labelled end to end.' },
    { art: 'firewall', cat: 'security', t: 'Firewall and security', d: 'WatchGuard or Fortinet at the edge, VPN for remote staff, and Panda endpoint protection on every PC.' },
    { art: 'dish', cat: 'connectivity', t: 'Backup internet', d: 'Starlink or 5G as a second link with automatic failover, for sites that cannot go offline.' },
    { art: 'storage', cat: 'servers', t: 'Servers and storage', d: 'NAS for shared files and backups, rack servers for ERP, and UPS sized for clean shutdowns.' },
    { art: 'camera', cat: 'surveillance', t: 'Surveillance', d: 'IP cameras on their own VLAN with NVR recording and remote viewing on your phone.' },
  ],
  steps: [
    ['Survey', 'We visit, measure and listen to how the site is used.'],
    ['Design and quote', 'A clear bill of materials and a fixed price.'],
    ['Install', 'Our engineers cable, mount and configure everything.'],
    ['Support', 'One number to call after handover.'],
  ],
};

// Content for this segment is still being written; `services` stays empty until it arrives.
export const AGRICULTURE = {
  id: 'agri',
  eyebrow: 'Decibel-114 Agriculture',
  title: 'Agriculture.',
  intro: 'Technology and supply for farms and agribusiness. Full details of this service are on the way. Talk to us and we will tell you what we can do for your project today.',
  services: [],
  steps: [],
};
