/** A web-font stylesheet that doesn't hold up the first paint: text shows in the fallback face, then swaps. */
export function lazyCss(href: string) {
  const url = href.replace(/&/g, "&amp;");
  return `<link rel="stylesheet" href="${url}" media="print" onload="this.media='all'" /><noscript><link rel="stylesheet" href="${url}" /></noscript>`;
}

