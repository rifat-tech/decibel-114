import { FaWhatsapp } from 'react-icons/fa6';
import { waHref } from '../config';

export default function WhatsAppFloat() {
  const href = waHref('Hi Decibel-114, I need help choosing a product.');
  if (!href) return null;
  return (
    <a className="wa-float" href={href} target="_blank" rel="noreferrer" aria-label="Chat with Decibel-114 on WhatsApp">
      <FaWhatsapp />
    </a>
  );
}
