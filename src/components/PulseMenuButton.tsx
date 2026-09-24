import type { ButtonHTMLAttributes } from 'react';
import { IconMenu } from './icons';

/** Hamburger button to open the sidebar — place it in your app's top bar. */
export function PulseMenuButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" aria-label="Open menu" {...props} className={`psn-menu-btn${className ? ` ${className}` : ''}`}>
      <IconMenu width={17} height={17} />
    </button>
  );
}
