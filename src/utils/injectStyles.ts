import { css } from './stylesText';

const STYLE_ID = 'pulse-shared-navigation-styles';

/** Adds the sidebar CSS to the page once, so consumers don't need a CSS import. */
export function injectStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  // Prepend so the host app's own CSS can still override --psn-* variables.
  document.head.prepend(style);
}
