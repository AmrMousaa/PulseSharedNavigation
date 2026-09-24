interface ModuleIconProps {
    src?: string;
    alt: string;
    size?: number;
}
/**
 * Renders a module/app icon URL as a single-color mask (so it inherits the
 * text color), falling back to a generic app glyph when the URL is missing or broken.
 */
export declare function ModuleIcon({ src, alt, size }: ModuleIconProps): import("react").JSX.Element;
export {};
