# Olia Therapy — design draft

A redesign proposal for [oliatherapy.com](https://oliatherapy.com), rebuilt from the
existing one-pager into a six-page static site.

**Live draft:** <https://yujiman85.github.io/olia-therapy/>

**This is not the live site.** The real site is already published and indexed.
Every page here carries `<meta name="robots" content="noindex, nofollow">` and
`robots.txt` disallows everything, so this draft cannot compete with the real
site in search results. Do not remove either until this becomes canonical.

## Stack

Plain HTML, CSS and JavaScript. No build step, no dependencies, no framework.

```
index.html          Home
conditions.html     Who I Help
services.html       Services
about.html          About
faq.html            FAQ & rates
contact.html        Get in touch
accessibility.html  Accessibility statement (footer link)

assets/css/site.css   Design tokens + all component styles
assets/js/site.js     Mobile menu, reader controls, FAQ accordion
assets/fonts/         Zilla Slab + Atkinson Hyperlegible Next, self-hosted woff2
```

## Hosting

Published via GitHub Pages from `main`. The repo is public because GitHub Pages
does not serve private repos on a free plan — the draft carries `noindex` and a
blanket `robots.txt` disallow so it stays out of search results.

Note the belt-and-braces caveat: `Disallow: /` means a crawler never fetches the
pages, so it never reads the `noindex` either. Nothing links here, so neither
matters in practice — but if this URL is ever shared widely, drop the
`robots.txt` disallow and let the `noindex` do the work properly.

## Run it locally

```sh
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

## Visual identity

**"Old Town"** — drawn from the Federal rowhouse architecture of the corridor the
practice actually serves: limewash walls, shutter green, oxblood doors, aged
brass. Deliberately not the cream-and-terracotta wellness palette, which is both
generic and, at this point, the signature of AI-generated design.

The `.threshold` rule between major sections is a wall with a gap in it, the way
a plan drawing marks a doorway — the object this practice is organised around,
since it is where transfers happen, where chairs do not fit, and where people
fall.

Imagery is left entirely open. Every image slot is a neutral box that reports
its own rendered size and says nothing about what the picture should be —
choosing that is the client's call, and a placeholder describing a photo quietly
makes the decision for her. The sizes update live, so the number is honest at
whatever width you are viewing rather than true only at one breakpoint.

**Zilla Slab** for display (squared terminals, reads drafted rather than
botanical) and **Atkinson Hyperlegible Next** for body — drawn by the Braille
Institute for low-vision readers, with deliberately disambiguated letterforms.
In a neutral face, capital I and lowercase l render as identical bare stems and
0 is hard to tell from O; here they are distinct. That matters when the reader
has visual field loss and the string is a phone number.

Contrast has real headroom: body text 14.7:1, headings 10.2:1, the oxblood
accent 8.6:1 as text and 10.4:1 carrying white. High-contrast mode pushes every
pairing past 12:1.

## Editing

The `<header>`, mobile menu and `<footer>` blocks are **byte-identical across all
seven pages**. A nav change is a find-and-replace across `*.html` — check all
seven, not just the one you are looking at.

Colours, spacing and type all come from custom properties in the `:root` block at
the top of `site.css`. Changing the palette is an edit to that block alone.

## Known placeholders

- **Copy** — carried over from the current site, to be rewritten. Anything in an
  italic `.draft-note` block is a prompt for the author, not final text.
- **Rates** — the FAQ has the slot but no numbers.
- **Photography** — dashed `.img-placeholder` boxes mark where images go, on
  Home (hero and mid-page), Services and About. Each reports its own rendered
  size. Deliberately no art direction attached.
- **Contact form** — validation is real and accessible (inline errors plus a
  focusable error summary that links to each field), but nothing is sent. Wire
  it to Formspree, Netlify Forms, or a real handler before launch.
- **Referral question** in the FAQ needs a real answer for DC and Virginia.

## Accessibility

Targets WCAG 2.2 AA, above minimum in places: 19px body text, 48px tap targets,
reader controls for text size and high contrast, full keyboard support, no
motion without consent. See `accessibility.html`.
