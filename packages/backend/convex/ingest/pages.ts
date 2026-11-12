import { HTMLElement, NodeType, parse, type Node } from "node-html-parser";

import { SITE_URL } from "./goatformat";

export type PageSection = { title: string; text: string; sourceUrl: string };

export type PageUrls = { notices: string[]; mechanics: string[] };

const NOTICE_PATH = /^\/articles\/ruling-notice-[a-z0-9-]+$/;
const MECHANIC_PATH = /^\/learn\/[a-z0-9-]+$/;

export function pageUrls(sitemap: string): PageUrls {
  const paths = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].flatMap(([, loc]) => {
    const url = loc ? new URL(loc, SITE_URL) : undefined;
    return url && url.origin === SITE_URL ? [url.pathname] : [];
  });
  const unique = [...new Set(paths)].toSorted();
  return {
    notices: unique.filter((path) => NOTICE_PATH.test(path)).map((path) => SITE_URL + path),
    mechanics: unique.filter((path) => MECHANIC_PATH.test(path)).map((path) => SITE_URL + path),
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
  if (node.tagName === "UL" || node.tagName === "OL") {
    return node
      .querySelectorAll("li")
      .map((item) => `- ${collapse(item.text)}`)
      .join("\n");
  }
  return node.structuredText.split("\n").map(collapse).filter(Boolean).join("\n");
}

function collapse(text: string): string {
  return text.replaceAll(/\s+/g, " ").trim();
}
