export type UnknownHTMLElementTagNameFunction = (tagName: string) => boolean;

const unknownHTMLElementCache: Record<string, boolean> = {};
export const isUnknownHTMLElementTagName: UnknownHTMLElementTagNameFunction = (tagName) => {
  const cache = unknownHTMLElementCache[tagName];
  if (cache !== undefined) return cache;

  unknownHTMLElementCache[tagName] = global.document.createElement(tagName) instanceof global.window.HTMLUnknownElement;
  return !!unknownHTMLElementCache[tagName];
};
