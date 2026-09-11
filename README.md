# Olia Therapy — design draft

A redesign proposal for [oliatherapy.com](https://oliatherapy.com), rebuilt from the
existing one-pager into a six-page static site.

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
assets/fonts/         Fraunces + Work Sans, self-hosted woff2 (latin subset)
```

## Run it locally

```sh
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

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
- **Photography** — dashed `.photo-slot` blocks mark where real images go. The
  headshot on the About page matters most.
- **Contact form** — renders and validates visually but sends nothing. Wire it to
  Formspree, Netlify Forms, or a real handler before launch.
- **Referral question** in the FAQ needs a real answer for DC and Virginia.

## Accessibility

Targets WCAG 2.2 AA, above minimum in places: 19px body text, 48px tap targets,
reader controls for text size and high contrast, full keyboard support, no
motion without consent. See `accessibility.html`.
