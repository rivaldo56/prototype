# Huyml reference analysis

Inspected 2026-09-16. Source: https://huyml.co/ and its public sitemap. Scope: the 22 sitemap URLs (Work, About, Playground, 19 project pages), plus shared navigation and overlays. External client sites are linked destinations, not additional pages of this portfolio.

## Shared visual system

- Pale gray canvas, approximately #ececec; black text; bright coral-red display lettering on About and project pages.
- A narrow vertical wordmark at the upper left. Persistent navigation begins around 14% of the desktop width. Small audio, location/time, and inquiry controls occupy the top row.
- Small neutral sans-serif labels, compact editorial serif titles, and exceptionally large counters/headings. The site's credits identify BT Grotesk and BT Glyphius. The replica should use the project's available fonts unless those font licenses/assets are supplied.
- Content occupies an asymmetric grid with extensive whitespace. Images generally have square corners. Rounded translucent cards and decorative drop shadows are not the primary visual language.
- Route entrances pass through a black cover and a blurred reveal. The initial browser inspection logged a WebGL `uvs` error; later captures rendered successfully. A replica should not depend on a successful WebGL initialization to reveal navigation/content.

## Work: /

An image collection moves diagonally through a perspective stack. The selected image sits near the center, with preceding images above/right and following images below/left. Left-side metadata changes with selection. A vertically moving list on the right fades away from the selected item, with three small color swatches farther right. A large two-digit counter and total sit near the lower left. Scrolling changes selection; projects open into dedicated detail views.

Replica mapping: episode covers, guest/role/date/topic metadata, episode index and count. Keep this composition separate from Jukebox's record sleeves.

## About: /about

The first composition pairs giant white year numerals with coral serif personal details and a coral statement. Lower columns contain recognitions, publications, capabilities, and trusted clients. Process & Approach is an additional interactive surface, not simply a generic card grid. Personal imagery and personality are part of the page.

Replica mapping: podcast history, host profile, editorial approach, topics and genuine show facts. Do not carry the scaffold's invented design awards or ratings into a podcast template.

## Playground: /playground

An archive of visual experiments, distinct from commissioned case studies. The longer capture shows a giant white count (83), a short statement at the lower left, and four dense masonry columns of images filling the right three quarters of the viewport. The images have varied heights and square corners, separated by narrow gray gutters.

Replica mapping: a separate collection of episode moments/quotes or experimental artwork; use existing episode data rather than creating fake published clips.

## Project-page system

All 19 routes returned HTTP 200 and were inspected individually. Their shared shell has compact fixed metadata on the left, a central long-form image gallery beginning around 27% of the viewport width, a narrow thumbnail rail at the far right, and enormous coral serif project titles overlaying the lower portion of the viewport. Titles wrap for long names. Metadata varies: team is optional, role may contain multiple lines, recognition counts vary, and outbound CTA labels/destinations are not uniform. The next-project sequence links the collection in a loop.

| Route | Distinct visual content observed | Next project |
|---|---|---|
| [/project/district2-studio](https://huyml.co/project/district2-studio) | White studio layouts, monochrome masked portrait; two-line title | Fromanother |
| [/project/dafi](https://huyml.co/project/dafi) | Furniture and pastel Scandinavian layouts | District2 |
| [/project/est-populo](https://huyml.co/project/est-populo) | Beige editorial layouts, large black typography, red sculptural accent | DAFI |
| [/project/bison-studio](https://huyml.co/project/bison-studio) | Black canvas with tall red lettering | Est Populo |
| [/project/huyml-2022](https://huyml.co/project/huyml-2022) | Earlier monochrome portfolio and illustration | Bison |
| [/project/rly-network](https://huyml.co/project/rly-network) | Dark spherical graphics and lime accents | Huyml Vol.1 |
| [/project/mathijs-hanenkamp](https://huyml.co/project/mathijs-hanenkamp) | Photography and camera-focus framing | RLY |
| [/project/ascon-system](https://huyml.co/project/ascon-system) | Orange dimensional forms and white corporate sections | Mathijs |
| [/project/uncommon-studio](https://huyml.co/project/uncommon-studio) | Dark blue abstract imagery and large inverted wordmark | ASCon |
| [/project/serious-business](https://huyml.co/project/serious-business) | Pink, cream and pastel layouts with dimensional smiley | Uncommon |
| [/project/by-kin](https://huyml.co/project/by-kin) | Cream/orange identity, illustrations and alternate layouts | Serious Business |
| [/project/defiant](https://huyml.co/project/defiant) | Restrained gray/white typography and particle landscapes | By 'kin |
| [/project/mat-voyce](https://huyml.co/project/mat-voyce) | Cyan display type and vivid animated-work imagery | Defiant |
| [/project/eislab](https://huyml.co/project/eislab) | Ice cream photography, purple typography, playful motifs | Mat Voyce |
| [/project/markwoodland](https://huyml.co/project/markwoodland) | Cinematic portrait photography and dark-blue branding | Eislab |
| [/project/miuxstudio](https://huyml.co/project/miuxstudio) | Warm beige interior photography and editorial layouts | Mark Woodland |
| [/project/wonjyou](https://huyml.co/project/wonjyou) | Black/coral oversized typography and portrait imagery | MIUX |
| [/project/iventions](https://huyml.co/project/iventions) | Purple spotlight shapes, lime accents, event photography | Won J. You |
| [/project/fromanother](https://huyml.co/project/fromanother) | Navy/cream art direction and luminous abstract forms | Iventions |

Replica mapping: episode detail pages with synopsis and guest metadata to the left, artwork/editorial chapters in the center, chapter navigation to the right, a large guest title, working playback and next-episode navigation.

## Shared interactions to preserve

Menu, Contact, Credits, audio switch, project/episode navigation, collection scrolling, thumbnail/chapter jumps, and responsive layout. Contact is present across route DOMs but is absent from the sitemap: it is an overlay rather than a separate URL. Platform/email links must use the podcast's destinations, not the reference designer's accounts.

## Evidence and limits

Desktop browser captures were taken at 1440×900. `/tmp/huy-all-pages.json` records the 21 additional routes, their HTTP status, body text, image counts and links. `/tmp/huy-reference-top.png` and `/tmp/huy-reference-scroll.png` record the Work layout. Project captures are `/tmp/huy-project-<slug>-end.png`; the suffix reflects capture order, not proof of having reached the final gallery item. Initial heights were measured during route entrances and must not be used as final document heights.

The follow-up pass captured Playground, About and Fromanother after longer loading waits and scrolling. Contact opens a slightly tilted dark card over the current page, with compact link columns and a close control; a smaller Credits card appears behind it. Mobile About at 390×844 uses a compact top bar, coral text first, then giant white numerals. These observations are recorded in `/tmp/huy-interactions.json` and `/tmp/huy-detail-*.png`.

## Local implementation

Open `http://localhost:3000/?variant=atelier`. The Atelier option renders `AtelierReplicaWorld.tsx` with scoped styles. Following the user's September 17 correction, the hero, collection, Moments and About now remain mounted in one continuous document. About now contains the selected episode synopsis, guest details, artwork and playback. At the user's request, the introductory About composition, process block, chapter panels and numbered chapter navigation were removed. Navigation scrolls to sections; legacy query links still resolve to their sections. The shared demo audio engine and existing episode data are reused.

`AtelierMotion.tsx` adds the missing opening: an original monochrome illustrated character pushes a dark panel sideways to reveal the large coral MangoMagic wordmark. The settled hero remains until the visitor scrolls to the collection. A four-sided identity mark rotates around its vertical axis according to scroll distance, reversing on upward scrolling. Reduced-motion mode reveals the hero immediately and keeps the identity static. `continuous.css` confines episode display typography and navigation to the episode section rather than allowing fixed elements to leak into subsequent sections.

The source's proprietary typefaces, client artwork and personal claims are replaced with available typography and podcast data. The character artwork is drawn locally for this adaptation, rather than reusing the reference's Rive asset. Contact uses demonstration destinations; this is a local prototype, not a deployed site.
