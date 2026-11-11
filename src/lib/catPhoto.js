// A real product photo to represent each category (home tiles, menus).
const local = (p) => p.images?.[0] && !/^https?:/.test(p.images[0]);
const RULE = {
  network: (p) => /router|mikrotik|ruijie|unifi|access point/i.test(p.name),
  server: (p) => /server|\bnas\b|synology|poweredge|proliant|thinksystem|ups\b/i.test(p.name),
  component: (p) => /graphics|rtx|radeon|processor|ryzen|core i|ram|ssd/i.test(p.name),
};
export function categoryPhoto(products, id) {
  const ok = (p) => p.categoryId === id && p.images?.[0] && !/cable|adapter|converter|stand|bracket/i.test(p.name);
  const best = (p) => ok(p) && (!RULE[id] || RULE[id](p));
  return (products.find((p) => best(p) && local(p) && p.price) || products.find(best) || products.find((p) => ok(p) && local(p)) || products.find(ok))?.images?.[0];
}
