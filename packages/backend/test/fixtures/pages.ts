export const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://beta.goatformat.com</loc></url>
<url><loc>https://beta.goatformat.com/cards/book-of-moon</loc></url>
<url><loc>https://beta.goatformat.com/articles/ruling-notice-mind-crush</loc></url>
<url><loc>https://beta.goatformat.com/articles/goat-format-world-championship-2026</loc></url>
<url><loc>https://beta.goatformat.com/learn/rulings</loc></url>
<url><loc>https://beta.goatformat.com/learn/how-to-play</loc></url>
<url><loc>https://beta.goatformat.com/learn/how-to-play</loc></url>
<url><loc>https://example.com/learn/elsewhere</loc></url>
</urlset>`;

const chrome = (title: string, body: string) => `<!DOCTYPE html><html><body>
<header><h2>Site navigation</h2></header>
<main><article class="px-2"><div class="flex gap-12">
<aside><nav><p>On this page</p><a href="#priority">Priority</a></nav></aside>
<div class="mx-auto max-w-3xl min-w-0 grow">
<header class="flex"><h1 class="font-display">${title}</h1><p>The rules that work differently in Goat Format.</p></header>
<div class="prose prose-lg mt-10"><div class="payload-richtext">${body}</div></div>
<div class="mt-12 max-w-3xl border-t"><p>Share this page</p></div>
</div>
<aside class="hidden w-64"><section><h3>Join the community</h3><p>Join Discord</p></section></aside>
</div></article></main>
<footer><h2>Keep reading</h2></footer>
</body></html>`;

export const learnPage = chrome(
  "Rulings",
  `<p>Goat Format is ruled the way a head judge would have ruled it in 2005.</p>
<h2 class="scroll-mt-24" id="priority">Priority</h2>
<p>After a chain or summon resolves, the turn player acts first.</p>
<ul><li>You don&#x27;t need to call priority.</li><li>Priority has nothing to do with <strong>Trigger Effects</strong>.</li></ul>
<h2 class="scroll-mt-24" id="the-damage-step">The Damage Step</h2>
<section class="not-prose my-8"><div><img alt="Book of Moon" src="/cards/book-of-moon.jpg"><p>Book of Moon</p></div></section>
<p>Only Counter Traps and cards that change ATK or DEF can be activated.</p>
<h3>Flip effects</h3>
<p>A flipped monster&#x27;s effect resolves after damage calculation.</p>
<h2 class="scroll-mt-24" id="empty-section">Empty section</h2>`,
);

export const noticePage = chrome(
  "Ruling Notice: Mind Crush",
  `<p>The Judge Corps has issued a ruling update for Mind Crush.</p>
<blockquote><p>&quot;Hand verification only occurs when the opponent has no copies.&quot;</p></blockquote>
<p>This applies to paper events only.</p>`,
);

export const pageWithoutBody = "<html><body><article><h1>Moved</h1></article></body></html>";
