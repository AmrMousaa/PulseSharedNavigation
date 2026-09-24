import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const base = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};
export function IconSearch(props) {
    return (_jsxs("svg", { ...base, ...props, children: [_jsx("circle", { cx: "11", cy: "11", r: "7" }), _jsx("path", { d: "m21 21-4.3-4.3" })] }));
}
export function IconMenu(props) {
    return (_jsx("svg", { ...base, ...props, children: _jsx("path", { d: "M4 6h16M4 12h16M4 18h16" }) }));
}
export function IconAppWindow(props) {
    return (_jsxs("svg", { ...base, ...props, children: [_jsx("rect", { x: "3", y: "4.5", width: "18", height: "15", rx: "2" }), _jsx("path", { d: "M3 9h18" }), _jsx("path", { d: "M7 6.7h.01M10 6.7h.01" })] }));
}
export function IconChevronRight(props) {
    return (_jsx("svg", { ...base, ...props, children: _jsx("path", { d: "m9 6 6 6-6 6" }) }));
}
export function IconChevronLeft(props) {
    return (_jsx("svg", { ...base, ...props, children: _jsx("path", { d: "m15 6-6 6 6 6" }) }));
}
export function IconLayers(props) {
    return (_jsxs("svg", { ...base, ...props, children: [_jsx("path", { d: "m12 3 8.5 4.6L12 12.2 3.5 7.6 12 3Z" }), _jsx("path", { d: "m3.5 12 8.5 4.6L20.5 12" }), _jsx("path", { d: "m3.5 16.4 8.5 4.6 8.5-4.6" })] }));
}
export function IconStar({ filled, ...props }) {
    return (_jsx("svg", { ...base, fill: filled ? 'currentColor' : 'none', ...props, children: _jsx("path", { d: "M12 3.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6z" }) }));
}
