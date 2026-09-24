import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { IconAppWindow } from './icons';
/**
 * Renders a module/app icon URL as a single-color mask (so it inherits the
 * text color), falling back to a generic app glyph when the URL is missing or broken.
 */
export function ModuleIcon({ src, alt, size = 20 }) {
    const [hasError, setHasError] = useState(false);
    const [lastSrc, setLastSrc] = useState(src);
    // Re-arm the fallback whenever the URL changes, so a previously broken
    // icon retries once it's edited to a working one.
    if (src !== lastSrc) {
        setLastSrc(src);
        setHasError(false);
    }
    if (src && !hasError) {
        return (_jsx("span", { role: "img", "aria-label": alt, className: "psn-icon-mono", style: { width: size, height: size, maskImage: `url(${src})`, WebkitMaskImage: `url(${src})` }, children: _jsx("img", { src: src, alt: "", "aria-hidden": "true", style: { display: 'none' }, onError: () => setHasError(true) }) }));
    }
    return _jsx(IconAppWindow, { width: size, height: size, strokeWidth: 1.6, "aria-label": alt });
}
