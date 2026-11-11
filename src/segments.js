// The three sides of Decibel-114. The entry popup, the solution pages and the SEO build
// all read from here, so wording can be changed in one place.

// Photos: Unsplash (free licence, commercial use allowed), served from Unsplash's image CDN.
export const unsplash = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=72`;

export const SEGMENTS = [
  { id: 'products', to: '/', title: 'Products', sub: 'Phones, laptops, Apple, networking and electronics, delivered across Bangladesh.' },
  { id: 'it', to: '/it-solutions', title: 'IT Solutions', sub: 'Networks, security, servers and support for offices, factories and ISPs.' },
  { id: 'agri', to: '/agriculture', title: 'Agriculture', sub: 'Smart farming technology: drones, irrigation, sensors and solar power.' },
];

export const IT_SOLUTIONS = {
  id: 'it',
  path: '/it-solutions',
  seoTitle: 'IT Solutions in Bangladesh: Networking, Wi-Fi, Firewall, CCTV, Servers',
  seoDescription: 'Decibel-114 IT Solutions designs, supplies, installs and supports business networks in Dhaka and across Bangladesh: enterprise Wi-Fi, switching, firewall, CCTV, structured cabling, servers, Starlink and managed IT.',
  keywords: 'IT solutions Bangladesh, network installation Dhaka, enterprise Wi-Fi Bangladesh, firewall Bangladesh, CCTV installation Dhaka, structured cabling, server installation, Starlink Bangladesh, managed IT services, IT company Dhaka',
  eyebrow: 'Decibel-114 IT Solutions',
  title: 'Enterprise IT, designed and delivered end to end.',
  intro: 'From a single office floor to a multi-site factory, we survey, design, supply, install and support the complete IT infrastructure, with one team accountable from the first visit to long after handover.',
  hero: 'photo-1584169417032-d34e8d805e8b',
  ctaImage: 'photo-1558494949-ef010cbdcc31',
  trust: ['Free site survey', 'Authorised brand products', 'Installation by our engineers', 'Corporate invoice and VAT'],
  servicesTitle: 'Solutions for every layer of your IT.',
  servicesIntro: 'Each solution is scoped to your site after a survey. Prices depend on size and equipment, so we quote every project individually.',
  services: [
    { img: 'photo-1594915440248-1e419eba6611', cat: 'network', slug: 'enterprise-networking', t: 'Enterprise networking', d: 'Core, distribution and access switching with routing, VLANs and redundancy, built to carry data, voice and video without slowdowns.',
      inc: ['Managed L2/L3 switching and routing', 'VLAN design and network segmentation', 'Multi-branch and site-to-site connectivity', 'Network documentation and labelling'] },
    { img: 'photo-1497366754035-f200968a6e72', cat: 'network', slug: 'enterprise-wifi', t: 'Enterprise Wi-Fi', d: 'Seamless coverage across floors, warehouses and campuses, planned from a heat-map survey so there are no dead zones or dropped calls.',
      inc: ['RF site survey and heat mapping', 'Controller-managed access points', 'Guest Wi-Fi with captive portal', 'Roaming for large floors and campuses'] },
    { img: 'photo-1614064641938-3bbee52942c7', cat: 'security', slug: 'network-security-firewall', t: 'Network security and firewall', d: 'Next-generation firewalls at the edge, secure remote access for staff and endpoint protection on every device.',
      inc: ['NGFW with web and application filtering', 'Site-to-site and remote-access VPN', 'Endpoint antivirus and EDR', 'Security audit and hardening'] },
    { img: 'photo-1544197150-b99a580bb7a8', slug: 'structured-cabling', t: 'Structured cabling and fibre', d: 'Standards-based Cat6, Cat6A and fibre-optic cabling, neatly dressed, labelled and tested so the network is easy to manage and grow.',
      inc: ['Cat6 / Cat6A copper cabling', 'Single-mode and multi-mode fibre', 'Racks, patch panels and cable management', 'Certification testing and as-built drawings'] },
    { img: 'photo-1557597774-9d273605dfa9', cat: 'security', slug: 'cctv-installation', t: 'CCTV and surveillance', d: 'IP camera systems with NVR recording, on their own secured network, viewable live from your phone wherever you are.',
      inc: ['IP and PoE camera design', 'NVR recording and storage planning', 'Mobile and remote viewing', 'Access control and door entry'] },
    { img: 'photo-1695668548342-c0c1ad479aee', cat: 'server', slug: 'servers-storage', t: 'Servers, storage and data centre', d: 'Rack and tower servers, NAS and backup systems, virtualisation and power protection for ERP, files and business applications.',
      inc: ['Server supply, setup and virtualisation', 'NAS, SAN and backup solutions', 'Online UPS and power planning', 'Server room and rack build-out'] },
    { img: 'photo-1526666923127-b2970f64b422', cat: 'network', slug: 'starlink-internet', t: 'Internet and Starlink connectivity', d: 'Starlink satellite, 4G/5G and fibre links with automatic failover, for sites that cannot afford to go offline, even in remote areas.',
      inc: ['Starlink supply, mounting and setup', '4G/5G backup links', 'Dual-WAN load balancing and failover', 'Point-to-point wireless links'] },
    { img: 'photo-1525182008055-f88b95ff7980', slug: 'ip-pbx', t: 'IP telephony and unified communications', d: 'IP PBX systems with desk and mobile extensions, call recording and video conferencing, replacing old analogue lines.',
      inc: ['IP PBX setup and extensions', 'IP desk phones and softphones', 'Call recording and IVR', 'Meeting-room video conferencing'] },
    { img: 'photo-1551434678-e076c223a692', slug: 'managed-it-amc', t: 'Managed IT and AMC', d: 'A dedicated support team for your business, with scheduled maintenance, monitoring and fast on-site response under an annual contract.',
      inc: ['Annual maintenance contract (AMC)', 'Remote monitoring and helpdesk', 'Preventive maintenance visits', 'Priority on-site support'] },
    { img: 'photo-1758691737124-05c5bffe46f0', slug: 'business-email', t: 'Cloud and business email', d: 'Professional email on your own domain, cloud file sharing and collaboration, migrated and secured by our team.',
      inc: ['Business email on your domain', 'Microsoft 365 and Google Workspace', 'Data migration from old systems', 'Backup and access policies'] },
  ],
  industriesTitle: 'Industries we serve.',
  industries: ['Corporate offices', 'Factories and garments', 'Banks and financial institutions', 'Hospitals and clinics', 'Schools and universities', 'Hotels and restaurants', 'ISPs and telecom', 'Retail and showrooms', 'Warehouses and logistics', 'Government and NGOs'],
  brandsTitle: 'Technology partners.',
  brands: ['Ubiquiti UniFi', 'Ruckus', 'Ruijie Reyee', 'Cambium Networks', 'Huawei eKit', 'MikroTik', 'Grandstream', 'WatchGuard', 'Panda Security', 'Starlink'],
  steps: [
    ['Consultation and survey', 'We visit your site, understand how it is used and note every requirement.'],
    ['Design and proposal', 'A clear design, bill of materials and quotation, with no hidden items.'],
    ['Supply and installation', 'Our engineers deliver, install, configure and test everything on site.'],
    ['Handover and support', 'Documentation, training for your team, and support whenever you need it.'],
  ],
  why: [
    ['One team, end to end', 'Design, supply, installation and support from a single accountable partner.'],
    ['Authorised products', 'Genuine equipment with official warranty from leading global brands.'],
    ['Built to standard', 'Clean, labelled, documented installations that are easy to maintain and expand.'],
    ['Support after handover', 'Remote help and on-site visits, with annual contracts for peace of mind.'],
  ],
  faq: [
    ['How much does an IT solution cost?', 'Every site is different, so prices are TBA until we survey. After a visit we send a detailed quotation with equipment, installation and support listed separately.'],
    ['Do you work outside Dhaka?', 'Yes. We take on projects across Bangladesh, including factories and remote sites, where Starlink and 4G/5G links keep you connected.'],
    ['Can you upgrade our existing network?', 'Yes. We audit what you already have, reuse what is still good and replace only what is needed.'],
    ['Do you provide support after installation?', 'Yes. Every project includes handover and documentation, and we offer annual maintenance contracts with priority response.'],
    ['Can we get a corporate invoice with VAT?', 'Yes. We provide corporate invoices, VAT documents and warranty papers for every project.'],
  ],
};

export const AGRICULTURE = {
  id: 'agri',
  path: '/agriculture',
  seoTitle: 'Smart Agriculture Technology in Bangladesh: Drones, Irrigation, Sensors, Solar',
  seoDescription: 'Decibel-114 Agriculture brings smart farming to Bangladesh: agricultural drones, automated irrigation, soil and weather sensors, greenhouse control, solar pumps, poultry and dairy automation, fish farm monitoring and farm connectivity.',
  keywords: 'smart agriculture Bangladesh, agriculture drone Bangladesh, smart irrigation Bangladesh, solar irrigation pump, greenhouse automation, poultry farm automation, aquaculture monitoring, agritech Bangladesh, IoT farming',
  eyebrow: 'Decibel-114 Agriculture',
  title: 'Smart farming for a stronger harvest.',
  intro: 'We bring proven agricultural technology to farms and agribusinesses in Bangladesh: precision spraying, automated irrigation, real-time sensors and clean solar power, helping you save water, labour and cost while growing more.',
  hero: 'photo-1520052203542-d3095f1b6cf0',
  ctaImage: 'photo-1728895604559-a4e16081504e',
  trust: ['Farm visit and assessment', 'Installation and training', 'Solar-powered options', 'After-sales support'],
  servicesTitle: 'Agricultural technology solutions.',
  servicesIntro: 'Every farm is different. We assess your land, crops or livestock first, then recommend and quote the right solution.',
  services: [
    { img: 'photo-1713952160156-bb59cac789a9', slug: 'agricultural-drones', t: 'Agricultural drones', d: 'Precision spraying, seeding and crop mapping by drone, covering fields quickly with less chemical, less water and less labour.',
      inc: ['Crop spraying and spreading drones', 'Field mapping and crop health imaging', 'Pilot training and operation', 'Drone spraying as a service'] },
    { img: 'photo-1738598665698-7fd7af4b5e0c', slug: 'smart-irrigation', t: 'Smart irrigation', d: 'Drip and sprinkler systems controlled by soil-moisture sensors and timers, giving crops exactly the water they need.',
      inc: ['Drip and sprinkler system design', 'Soil-moisture based automation', 'Mobile app control and schedules', 'Fertigation (fertiliser through water)'] },
    { img: 'photo-1509391366360-2e959784a276', slug: 'solar-irrigation', t: 'Solar irrigation and farm power', d: 'Solar-powered pumps and off-grid power systems that cut diesel and electricity bills and keep working where the grid does not reach.',
      inc: ['Solar water pumps', 'Off-grid and hybrid solar systems', 'Battery storage for night use', 'Remote pump monitoring'] },
    { img: 'photo-1524486361537-8ad15938e1a3', slug: 'greenhouse-automation', t: 'Greenhouse and nursery automation', d: 'Automatic control of temperature, humidity, ventilation, shading and misting for year-round, high-value production.',
      inc: ['Climate sensors and controllers', 'Automatic fans, shading and misting', 'Nutrient and hydroponic systems', 'Alerts on your phone'] },
    { img: 'photo-1773493063756-b821d463daf0', slug: 'soil-weather-monitoring', t: 'Soil and weather monitoring', d: 'IoT sensors and on-farm weather stations that show soil, rain, temperature and humidity in real time, so decisions are based on data.',
      inc: ['Soil moisture, pH and NPK sensors', 'On-farm weather stations', 'Live dashboard and history', 'Frost, heat and rain alerts'] },
    { img: 'photo-1441122456239-401e92b73c65', slug: 'poultry-dairy-automation', t: 'Poultry and dairy farm automation', d: 'Climate control, automatic feeding and drinking, and monitoring for poultry houses and dairy farms, improving animal health and output.',
      inc: ['Shed temperature and ventilation control', 'Automatic feeders and drinkers', 'Ammonia and air-quality sensors', 'CCTV for sheds and barns'] },
    { img: 'photo-1758656911249-c0f1af7dcaec', slug: 'fish-farm-monitoring', t: 'Fish farm monitoring', d: 'Water-quality sensors and automatic aerators for ponds and cages, protecting stock from oxygen drops and disease.',
      inc: ['Dissolved oxygen, pH and temperature sensors', 'Automatic aerator control', 'Instant alerts on your phone', 'Solar-powered pond systems'] },
    { img: 'photo-1684695749267-233af13276d0', slug: 'cold-storage-monitoring', t: 'Cold storage and warehouse monitoring', d: 'Round-the-clock temperature and humidity monitoring for cold rooms and stores, with alerts before produce is at risk.',
      inc: ['Temperature and humidity loggers', 'Power-failure and door alarms', 'Stock-area CCTV', 'Reports for buyers and certification'] },
    { img: 'photo-1761839257870-06874bda71b5', slug: 'farm-connectivity', t: 'Farm connectivity and security', d: 'Internet for remote farms with Starlink and long-range Wi-Fi, plus CCTV to protect fields, equipment and livestock.',
      inc: ['Starlink and 4G/5G internet', 'Long-range outdoor Wi-Fi', 'Solar-powered CCTV cameras', 'Remote viewing on your phone'] },
  ],
  industriesTitle: 'Who we work with.',
  industries: ['Crop and rice farms', 'Vegetable and fruit growers', 'Tea and plantation estates', 'Poultry farms', 'Dairy and cattle farms', 'Fish and shrimp farms', 'Greenhouses and nurseries', 'Agro-processing and cold storage', 'Cooperatives and NGOs', 'Agricultural research'],
  brandsTitle: '',
  brands: [],
  steps: [
    ['Farm assessment', 'We visit the farm and learn about your crops, livestock, water and power.'],
    ['Recommendation and quote', 'A practical plan that fits your budget, with clear costs.'],
    ['Installation', 'Our team installs and tests everything on your farm.'],
    ['Training and support', 'We train your workers and stay available after installation.'],
  ],
  why: [
    ['Save water and labour', 'Automation does routine work, so resources go where they are needed.'],
    ['Decide with data', 'Live readings from your fields, sheds and ponds, on your phone.'],
    ['Power that lasts', 'Solar options that keep running far from the grid.'],
    ['Local support', 'A team in Bangladesh to install, train and help when you need it.'],
  ],
  faq: [
    ['How much do smart farming solutions cost?', 'Prices are TBA until we assess the farm, because they depend on land size, crop or livestock type and power. After the visit we send a clear quotation.'],
    ['Do you work with small farms?', 'Yes. Many solutions, like smart irrigation, solar pumps and pond sensors, scale down to small and medium farms.'],
    ['Will my workers be able to use it?', 'Yes. We train your team on site, and most systems are controlled from a simple mobile app.'],
    ['Do the systems need internet?', 'Many work offline, and for remote alerts we can add Starlink or 4G connectivity.'],
  ],
};

/** The solution a product leads to: used for the "Need it installed?" box and the SEO pages. */
export function solutionsFor(p) {
  const text = `${p?.name || ''} ${p?.brand || ''} ${p?.subcategory || ''}`.toLowerCase();
  const it = (slug) => { const s = IT_SOLUTIONS.services.find((x) => x.slug === slug); return { ...s, href: `/it-solutions#${slug}`, area: 'IT Solutions' }; };
  const ag = (slug) => { const s = AGRICULTURE.services.find((x) => x.slug === slug); return { ...s, href: `/agriculture#${slug}`, area: 'Agriculture' }; };
  if (/starlink/.test(text)) return [it('starlink-internet'), ag('farm-connectivity')];
  if (/firewall|watchguard|fortinet|fortigate|sophos|panda|antivirus|endpoint/.test(text)) return [it('network-security-firewall')];
  if (/ip phone|pbx|voip|grandstream|telephon/.test(text)) return [it('ip-pbx')];
  if (p?.categoryId === 'security' || /cctv|camera|nvr|dvr|surveillance/.test(text)) return [it('cctv-installation')];
  if (p?.categoryId === 'server' || /\bnas\b|server|\bups\b|rack/.test(text)) return [it('servers-storage')];
  if (/drone|irrigation|solar pump|weather station/.test(text)) return [ag(/drone/.test(text) ? 'agricultural-drones' : 'smart-irrigation')];
  if (p?.categoryId === 'network') {
    if (/access point|wi-?fi|wireless|\bap\b|mesh|u6|u7|unifi ap|ruckus/.test(text)) return [it('enterprise-wifi')];
    if (/cable|fiber|fibre|patch|cat6|cat 6|connector|keystone/.test(text)) return [it('structured-cabling')];
    return [it('enterprise-networking')];
  }
  return [];
}
