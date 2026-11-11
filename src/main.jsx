import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { startTranslator } from './components/LangSwitch';

// Page translation swaps text nodes under React. Keep React from crashing when a node it
// expects has been moved by the translator.
if (typeof Node === 'function' && Node.prototype) {
  const remove = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) { return child.parentNode === this ? remove.call(this, child) : child; };
  const insert = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (node, ref) { return ref && ref.parentNode !== this ? node : insert.call(this, node, ref); };
}
startTranslator();

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
