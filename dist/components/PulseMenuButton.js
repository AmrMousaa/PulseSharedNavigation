import { jsx as _jsx } from "react/jsx-runtime";
import { IconMenu } from './icons';
/** Hamburger button to open the sidebar — place it in your app's top bar. */
export function PulseMenuButton({ className, ...props }) {
    return (_jsx("button", { type: "button", "aria-label": "Open menu", ...props, className: `psn-menu-btn${className ? ` ${className}` : ''}`, children: _jsx(IconMenu, { width: 17, height: 17 }) }));
}
