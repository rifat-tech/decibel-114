"""Builds public/catalog.json from the distributor price-list crawl (gb_rows.json).
Row: [slug, name, top, group, img, price, old, specs 'a|b|c', status]
Run: python3 scripts/build-catalog.py <rows.json> <curated-names.json>"""
import json, re, sys
rows = json.load(open(sys.argv[1]))
curated = json.load(open(sys.argv[2]))  # [[name, categoryId, brand]]

CDN = 'https://e4b4vq9ke3.tenbytecdn.com/image/cache/catalog/'
SUB_RENAME = {
  'All Laptop': 'Laptop', 'Budget Laptop': 'Everyday laptop', 'Business Laptop': 'Business laptop', 'Gaming Laptop': 'Gaming laptop', 'Premium Laptop': 'Premium laptop',
  'All Desktop': 'Brand PC', 'ASUS Agent PC': 'Brand PC', 'Brand PC': 'Brand PC', 'All in one PC': 'All-in-one PC', 'ASUS NUC': 'Mini PC', 'Asus mini PC': 'Mini PC',
  'Gaming PC': 'Gaming PC', 'NZXT PC': 'Gaming PC', 'Budget PC': 'Budget PC', 'Apple iMac': 'iMac',
  'All Monitor': 'Monitor', '4K Monitor': '4K monitor', 'Budget Monitor': 'Everyday monitor', 'Business Monitor': 'Business monitor', 'Curved Monitor': 'Curved monitor',
  'Gaming Monitor': 'Gaming monitor', 'Portable Monitor': 'Portable monitor', 'Professional Monitor': 'Professional monitor', 'Android TV': 'TV',
  'UPS': 'UPS', 'UPS Battery': 'UPS battery', 'Mini DC UPS': 'UPS', 'Power Station': 'Power station', 'Portable HDD': 'Portable HDD', 'Portable SSD': 'Portable SSD',
  'Converter & Cable': 'Converter & cable', 'Mobile Accessories': 'Mobile accessories', 'Keyboard & Mouse Combos': 'Keyboard & mouse combo', 'HDD and SSD Enclosure': 'HDD & SSD enclosure',
  'Speaker & Home Theater': 'Speaker & home theatre', 'Bluetooth Speaker': 'Bluetooth speaker', 'Studio Equipment': 'Studio equipment',
  'Access Point & Extender': 'Access point & extender', 'LAN Card & WiFi Adapter': 'LAN card & Wi-Fi adapter', 'Network Cables': 'Network cable', 'Network Cables Accessories': 'Cable accessories',
  'Network Rack': 'Network rack', 'Network Rack Accessories': 'Rack accessories', 'Network Tools': 'Network tools', 'Starlink Accessories': 'Starlink accessories', 'Gateway Router': 'Gateway router',
  'Ruijie': 'Ruijie Reyee', 'HUAWEI eKit': 'Huawei eKit', 'Grandstream': 'Grandstream', 'Cote': 'Cote',
  'CCTV Camera': 'CCTV camera', 'DVR, NVR & XVR': 'DVR, NVR & XVR', 'Access Control': 'Access control',
  'Book Scanner/ Document Camera Scanner': 'Book scanner', 'Scanners': 'Scanner', 'Interactive Flat Panel': 'Interactive flat panel', 'Conference Systems': 'Conference system',
  'Office Supplies': 'Office supplies', 'Visualizer and Document Camera': 'Document camera',
  'All Printer': 'Printer', 'Ink Tank Printers': 'Ink tank printer', 'InkJet Printers': 'Inkjet printer', 'Laser Printers': 'Laser printer', 'Label Printers': 'Label printer',
  'Large Format Printers': 'Large format printer', 'ID Card Printers': 'ID card printer', 'POS Printer': 'POS printer', 'Dot Matrix Printer': 'Dot matrix printer',
  'Toner, Drum & Cartridge': 'Toner & cartridge', 'Printer Accessories': 'Printer accessories',
  'Laptop Accessories': 'Laptop accessories', 'External Graphics Docks': 'Laptop accessories', 'Action Camera': 'Action camera',
}
def place(top, group):
    if top == 'Laptop':
        return ('accessories', 'Laptop accessories') if group in ('Laptop Accessories', 'External Graphics Docks') else ('laptop', group)
    if top == 'Desktop': return 'desktop', group
    if top == 'Monitor' or top == 'TV': return 'monitor', group
    if top == 'Component': return 'component', group
    if top == 'Accessories':
        if group in ('Headphone', 'Earphone', 'Speaker & Home Theater', 'Microphone'): return 'sound', group
        return 'accessories', group
    if top == 'Gadget':
        if group in ('Bluetooth Speaker', 'Earbuds', 'Studio Equipment'): return 'sound', group
        return 'gadget', group
    if top == 'Gaming': return 'gaming', group
    if top in ('Networking', 'SME Networking'): return 'network', group
    if top == 'Office Equipment':
        if group in ('CCTV Camera', 'DVR, NVR & XVR', 'Access Control'): return 'security', group
        if group in ('Scanners', 'Book Scanner/ Document Camera Scanner'): return 'printer', group
        return 'office', group
    if top == 'Printer': return 'printer', group
    if top == 'Server & Storage': return 'server', group
    return 'accessories', group

BRANDS = """Adata Acer A4Tech Akitio Apple Aresze Arktek Asus Audac Avision Belden BDCOM Bitdefender Blisbond Bloody Boya Brother Cambium Check-Point Cisco Cote Cooler-Master Cougar Cudy Dahua Dell Epson Evolis Golden-Field Grandstream HID Hikvision Hohem HPE HP Huawei Huntkey iBoard Jovision Juniper Kodak Lenovo Leoch LG Lexar Maipu Micronet Microlab Microsoft MikroTik Newline NZXT Nvidia Panda PNY Phanteks Philips Planet Power-Guard PROCAB QNAP Rapoo Realview Ruijie Seagate Sewoo Sharp SPRT Suprema Televic Tiandy Tipsoi Thonet-&-Vander Totolink Toshiba Tysso Ubiquiti UniFi Ugreen Uniview upHere Vention Vertiv Viisan ViewSonic Vivitek Voltan VPRO WatchGuard Wi-Tek Weofly Xigmatek XPG ZTE Zebex AMD Intel JYAUDIO Starlink Samsung Xiaomi TP-Link Logitech Corsair Gigabyte MSI Kingston Transcend SanDisk Western-Digital WD Baseus Anker Joyroom Havit Fantech Redragon Edifier JBL Sony Canon DJI Insta360 Remax Hoco Orico Lexmark Ricoh Canon Kyocera Optoma BenQ Zebra Honeywell Xprinter Imou EZVIZ Tenda Mercusys D-Link Netis Reyee Vigi Cudy Gtech Sophos Fortinet Kaspersky ESET Norton Avast Lenovo ROG TUF""".split()
BMAP = {b.replace('-', ' ').lower(): b.replace('-', ' ') for b in BRANDS}
FIX = {'asus': 'ASUS', 'rog': 'ASUS', 'tuf': 'ASUS', 'hp': 'HP', 'hpe': 'HPE', 'lg': 'LG', 'nzxt': 'NZXT', 'pny': 'PNY', 'qnap': 'QNAP', 'zte': 'ZTE', 'xpg': 'XPG', 'amd': 'AMD', 'hid': 'HID', 'sprt': 'SPRT', 'vpro': 'VPRO',
       'bdcom': 'BDCOM', 'jyaudio': 'JYAUDIO', 'procab': 'PROCAB', 'ugreen': 'UGREEN', 'adata': 'ADATA', 'reyee': 'Ruijie', 'unifi': 'Ubiquiti', 'wd': 'Western Digital', 'tp-link': 'TP-Link', 'mikrotik': 'MikroTik', 'a4tech': 'A4Tech', 'dji': 'DJI', 'jbl': 'JBL', 'msi': 'MSI', 'ezviz': 'EZVIZ', 'imou': 'Imou', 'iboard': 'iBoard', 'upHere'.lower(): 'upHere'}
def brand_of(name):
    low = name.lower()
    for k in sorted(BMAP, key=len, reverse=True):
        if low.startswith(k + ' ') or low == k:
            return FIX.get(k, BMAP[k])
    w = re.split(r'[\s/]+', name.strip())[0]
    return FIX.get(w.lower(), w[:1].upper() + w[1:].lower() if w.isupper() and len(w) > 4 else w)

def specs_of(s):
    out = []
    for x in [t.strip() for t in s.split('|') if t.strip()]:
        i = x.find(':')
        out.append({'key': x[:i].strip(), 'value': x[i + 1:].strip()} if 0 < i < 30 else {'key': '', 'value': x})
    return out

norm = lambda s: ' '.join(re.findall(r'[a-z0-9]+', s.lower()))
cur = {norm(n) for n, _, _ in curated}
products, skipped = [], 0
for slug, name, top, group, img, price, old, spec, stat in rows:
    name = re.sub(r'\s+', ' ', name).strip()
    if norm(name) in cur: skipped += 1; continue
    cat, g = place(top, group)
    sub = SUB_RENAME.get(g, g) if g != '*' else None
    sp = specs_of(spec)
    warranty = next((x['value'] for x in sp if x['key'].lower().startswith('warranty')), '')
    sp = [x for x in sp if not x['key'].lower().startswith('warranty')]
    soon = stat == 'Upcoming'
    image = img  # '~' = distributor CDN prefix, expanded in the browser
    p = {'id': slug, 'slug': slug, 'name': name, 'brand': brand_of(name), 'categoryId': cat, 'subcategory': sub or '',
         'price': int(price) if not soon else 0, 'originalPrice': int(old) if old and old > price else 0,
         'stock': 5 if price and not soon else 0, 'images': [image], 'specs': sp}
    if warranty: p['warranty'] = warranty
    if soon: p['soon'] = 1
    if stat in ('New Arrival',): p['newArrival'] = 1
    if stat in ('Hot Deal Model', 'Best Deal Offer', 'New Price') or p['originalPrice']: p['deal'] = 1
    products.append(p)
json.dump({'v': 1, 'products': products}, open('public/catalog.json', 'w'), ensure_ascii=False, separators=(',', ':'))
import collections
print('products', len(products), 'skipped dup', skipped)
print(collections.Counter(p['categoryId'] for p in products))
print(collections.Counter(p['brand'] for p in products).most_common(60))
