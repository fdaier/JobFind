import { htmlToText } from "html-to-text";

export function mailBodyText(text: string | undefined, html: string | false | undefined): string {
  const plain = text?.trim() ?? "";
  if (plain.length >= 80 || !html) return plain;
  const converted = htmlToText(html, { wordwrap: false }).trim();
  return converted.length > plain.length ? converted : plain;
}
