# MangoMagic podcast experiences

A standalone React, Vite and Three.js prototype with three visual experiences:

- **Eco Editorial:** an editorial episode page with rounded square episode tiles with hover play controls, arrow navigation and alternating muted B-roll rows, quotes, host information and sponsors.
- **Executive Interview:** a briefing-style page with takeaways and transcript navigation.
- **Mango Jukebox:** a continuous 3D sleeve journey through the hero, episode, crate, podcast notes, host, sponsors and turntable.

## Run locally

Use Node.js 20.19 or newer.

```sh
npm install
npm run dev
```

The development server uses port 3000. `npm run lint` checks TypeScript; `npm run build` creates the production bundle in `dist`.

## Current implementation

The Jukebox sleeve overlaps the hero from the right and releases its vinyl to the left. Scrolling moves across a single printed back cover from podcast notes into the smaller host panel, before separating the vinyl onto the final deck. Motion-off mode provides an ordinary page with alternating artwork and text; mobile stacks the content. Eco has a topic ribbon between its host and sponsors, with pause and reduced-motion support. Jukebox keeps its uninterrupted sleeve journey without a ribbon.

Episode content lives in `src/data/podcastData.ts`. All three experiences share selection and playback state through `src/App.tsx` and `src/utils/audioEngine.ts`.

## Prototype boundaries

Playback currently synthesizes ambient sound and vinyl effects; it does not play podcast recordings. Sponsors are sample identities, and listening links go to platform homepages. The Executive dossier button shows a demo success state, and its email form has no submission integration. There is no chat, database, authentication or publishing backend wired into this prototype. No Gemini API key is required by the current source.

Original AI Studio project: https://ai.studio/apps/4c4d391a-69d4-4bf7-b084-875ca84e1b0f

## Clip and profile content

Eco chapter rows loop muted B-roll while visible and pause off-screen or when the tab is hidden. Reduced-motion preferences disable automatic playback; each clip has a manual play/pause control. Sample footage and source credits live in `public/assets/eco/CREDITS.md`. Set a chapter's `videoUrl` and optional `videoPoster` to use actual footage.

Guest and host sections include LinkedIn CTAs. Until verified profile URLs are supplied, the buttons say "Find on LinkedIn" and search the person's name. Set `guestLinkedInUrl` on an episode to link directly to a guest profile; the shared CTA also accepts a host `profileUrl`.

## Publish to GitHub

This prototype is published from the `main` branch to [rivaldo56/prototype](https://github.com/rivaldo56/prototype).

```sh
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/rivaldo56/prototype.git
git push -u origin main
```
