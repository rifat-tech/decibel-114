import { asset } from '../config';
// Brand logo (supplied artwork). onBlue = light wordmark for the dark masthead.
export default function Logo({ onBlue, onYellow, small }) {
  return (
    <span className={`logo ${onBlue ? 'on-blue' : ''} ${small ? 'small' : ''}`}>
      <img src={asset(onBlue ? '/brand/logo.png' : onYellow ? '/brand/logo-on-yellow.png' : '/brand/logo-dark.png')} alt="Decibel-114" width="168" height="48" />
    </span>
  );
}
