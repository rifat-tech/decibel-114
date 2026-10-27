import {
  LuLaptop, LuPcCase, LuMonitor, LuSmartphone, LuTablet, LuCpu, LuRouter, LuVideo, LuProjector, LuPrinter,
  LuGamepad2, LuHeadphones, LuWatch, LuCamera, LuMouse, LuServer, LuTv, LuApple, LuLayoutGrid,
} from 'react-icons/lu';

// One outline icon set (Lucide), one stroke weight, for every category entry point.
const ICONS = {
  laptop: LuLaptop, desktop: LuPcCase, monitor: LuMonitor, phone: LuSmartphone, tablet: LuTablet,
  component: LuCpu, network: LuRouter, security: LuVideo, office: LuProjector, printer: LuPrinter,
  gaming: LuGamepad2, sound: LuHeadphones, wearable: LuWatch, gadget: LuWatch, camera: LuCamera, accessories: LuMouse,
  server: LuServer, tv: LuTv, apple: LuApple,
};
export function CatIcon({ id, ...rest }) {
  const I = ICONS[id] || LuLayoutGrid;
  return <I aria-hidden="true" {...rest} />;
}
