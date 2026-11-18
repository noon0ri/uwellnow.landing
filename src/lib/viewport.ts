/** Layout viewport without classic scrollbars — the size of the fixed canvas and the sticky photo layer. */
export function viewport() {
  const d = document.documentElement
  return { w: d.clientWidth, h: d.clientHeight }
}
