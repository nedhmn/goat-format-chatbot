import { HTMLElement, NodeType, parse, type Node } from "node-html-parser";

import { SITE_URL } from "./goatformat";

export type PageSection = { title: string; text: string; sourceUrl: string };

export type PageUrls = { notices: string[]; mechanics: string[] };

const NOTICE_PATH = /^\/articles\/ruling-notice-[a-z0-9-]+$/;
const GAMEPLAY_LEARN_PATHS = new Set(["/learn/rulings", "/learn/goat-format-history"]);

export function pageUrls(sitemap: string): PageUrls {
  const paths = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].flatMap(([, loc]) => {
    const url = loc ? new URL(loc, SITE_URL) : undefined;
    return url && url.origin === SITE_URL ? [url.pathname] : [];
  });
  const unique = [...new Set(paths)].toSorted();
  return {
    notices: unique.filter((path) => NOTICE_PATH.test(path)).map((path) => SITE_URL + path),
    mechanics: unique
      .filter((path) => GAMEPLAY_LEARN_PATHS.has(path))
      .map((path) => SITE_URL + path),
  };
}

export function parseSections(html: string, pageUrl: string): PageSection[] {
  const root = parse(html);
  const pageTitle = root.querySelector("article h1")?.text.trim();
  const body = root.querySelector("article .payload-richtext");
  if (!pageTitle || !body) throw new Error(`no article title or body on ${pageUrl}`);
  for (const widget of body.querySelectorAll(".not-prose")) widget.remove();

  const sections: { title: string; sourceUrl: string; blocks: string[] }[] = [
    { title: pageTitle, sourceUrl: pageUrl, blocks: [] },
  ];
  for (const node of body.childNodes) {
    const anchor = sectionAnchor(node);
    if (anchor) {
      sections.push({
        title: `${pageTitle}: ${anchor.heading}`,
        sourceUrl: `${pageUrl}#${anchor.id}`,
        blocks: [],
      });
      continue;
    }
    const block = blockText(node);
    if (block) sections.at(-1)?.blocks.push(block);
  }

  return sections.flatMap(({ title, sourceUrl, blocks }) =>
    blocks.length > 0 ? [{ title, sourceUrl, text: blocks.join("\n\n") }] : [],
  );
}

function sectionAnchor(node: Node): { id: string; heading: string } | undefined {
  if (!(node instanceof HTMLElement) || node.tagName !== "H2") return undefined;
  const id = node.getAttribute("id");
  const heading = node.text.trim();
  return id && heading ? { id, heading } : undefined;
}

function blockText(node: Node): string {
  if (node.nodeType === NodeType.TEXT_NODE) return collapse(node.text);
  if (!(node instanceof HTMLElement)) return "";
  switch (node.tagName) {
    case "UL":
      return listItems(node)
        .map((item) => `- ${item}`)
        .join("\n");
    case "OL":
      return listItems(node)
        .map((item, index) => `${index + 1}. ${item}`)
        .join("\n");
    case "BLOCKQUOTE":
      return blockLines(node)
        .flatMap((block) => block.split("\n"))
        .map((line) => `> ${line}`)
        .join("\n");
    case "H3":
    case "H4":
    case "H5":
    case "H6":
      return `### ${inlineText(node)}`;
    case "P":
      return inlineText(node);
    default:
      return blockLines(node).join("\n\n");
  }
}

function blockLines(node: HTMLElement): string[] {
  const blocks = node.childNodes.map(blockText).filter(Boolean);
  return blocks.length > 0 ? blocks : [inlineText(node)].filter(Boolean);
}

function listItems(list: HTMLElement): string[] {
  return list.childNodes.flatMap((item) =>
    item instanceof HTMLElement && item.tagName === "LI" ? [inlineText(item)] : [],
  );
}

function inlineText(node: Node): string {
  return collapse(inlineMarkdown(node));
}

function inlineMarkdown(node: Node): string {
  if (node.nodeType === NodeType.TEXT_NODE) return node.text;
  if (!(node instanceof HTMLElement)) return "";
  const inner = node.childNodes.map(inlineMarkdown).join("");
  if (node.tagName === "BR") return " ";
  if (!inner.trim()) return inner;
  if (node.tagName === "STRONG" || node.tagName === "B") return emphasize(inner, "**");
  if (node.tagName === "EM" || node.tagName === "I") return emphasize(inner, "*");
  return inner;
}

function emphasize(text: string, marker: string): string {
  const [, lead = "", core = "", trail = ""] = /^(\s*)(.*?)(\s*)$/s.exec(text) ?? [];
  return `${lead}${marker}${core}${marker}${trail}`;
}

function collapse(text: string): string {
  return text
    .replaceAll(/[\u201c\u201d]/g, '"')
    .replaceAll(/[\u2018\u2019]/g, "'")
    .replaceAll(/\s+/g, " ")
    .trim();
}
