# Czech Challenge 2026 – přehled kódu

Krátký průvodce pro Miloše (pexxa) a kodéra, aby se dalo rychle zorientovat.
Větev **`pexa-final`** je rozpracovaná verze, na které se pracuje.

## Živé adresy

| adresa | co to je |
|---|---|
| https://vojtanoff.github.io/czechchallenge/ | ostrý web |
| https://vojtanoff.github.io/czechchallenge/preliminary-web/ | verze rozesílaná s pozvánkou, **zamrzlá na pevném commitu** |
| https://vojtanoff.github.io/czechchallenge/pexa-final-working-draft/ | rozpracovaná verze ke kontrole (tahle větev) |

## Čím to je

Statické HTML, CSS a vanilla JS. **Žádný build, žádný framework, žádné npm** – co je
v repu, to běží. Hostuje to GitHub Pages. Stačí otevřít `index.html` přes libovolný
lokální server (kvůli `fetch` na JSON, ze souboru `file://` to nepojede).

```
index.html          hlavní stránka – markup i veškerý skript stránky (594 ř.)
gallery.html        samostatná galerie
style-pexa.css      vzhled podle Figmy: barvy, typografie, hero, sekce (446 ř.)
style.css           starší základ, pořád se z něj bere část galerie a mřížek
efekty.js           nabíhání textu při scrollu + „dojezd" nadpisů
content.json        veškerý obsah – program, faculty, partneři, fotky, venue
katetr.json         poloha 3D katetru v heru (píše ji editor, viz níže)
editor-katetr.html  nástroj na nastavení katetru, není součást webu
fonts/              Safiro jako WOFF2 + DM Sans se tahá z Google Fonts
img/                fotky a grafika
serve.py            lokální náhledový server (jen pro vývoj, na Pages neběží)
```

## Kde se co mění

- **Obsah** (program, jména, fotky, partneři, venue) → `content.json`. HTML se z něj
  vyrenderuje za běhu, do markupu není potřeba sahat.
- **Vzhled** → `style-pexa.css`. Barvy a poloměry jsou nahoře jako CSS proměnné
  (`--violet`, `--ground`, `--radius`).
- **Texty v hlavičce a patičce** → přímo v `index.html`.

## Dvě věci, které stojí za vysvětlení

### Hero a 3D katetr

Zlom mezi telefonní a desktopovou kompozicí je **861 px** – v CSS i ve skriptu na
jednom místě, nesmí se to rozejít. Katetr má tři uložená nastavení v `katetr.json`:

```json
{"pcSiroky":{"x":-14,"y":1,"zoom":106,"uhel":40},
 "pcUzky":  {"x":-46,"y":-20,"zoom":140,"uhel":40},
 "mobil":   {"x":-14,"y":-18,"zoom":187,"uhel":41}}
```

`pcUzky` platí na 861 px, `pcSiroky` na 1440 px, mezi tím se **interpoluje ve
skutečných pixelech**, ne v procentech: CSS šířka katetru je `min(900px, 100vw - 380px)`,
tedy roste s oknem jen do 1280 px. Kdyby se míchala procenta, ta křivka by se
s interpolací nasčítala a katetr by byl uprostřed rozsahu větší než na obou krajích.

Nastavuje se to v `editor-katetr.html` – tři náhledy (1440 / 861 / 390 px) vedle
ovládání, katetrem jde i táhnout myší. Na lokálním serveru se uloží rovnou do
`katetr.json`, na Pages se hodnoty jen zkopírují do schránky.

Pozor na pořadí transformací: `translate → scale → scaleX(-1) → rotate`. Po `scaleX(-1)`
se **obrací smysl otáčení**, kladný úhel točí proti směru hodin.

### Nabíhání textu

`efekty.js` dělá dvě věci: text se při scrollu přebarvuje ze šedé do fialové po řádcích
(`.nabih`) a nadpisy „dojíždějí" zdola (`.dojezd`). Řádky se měří přes Range API nad
syrovým textovým uzlem a až po `document.fonts.ready` – kdyby se měřilo dřív nebo přes
inline-blocky, přestane platit `text-wrap:balance` a zalomení vyjde jinak.

## Na co si dát pozor

- `style.css` má `.grid img{opacity:0}` a viditelné jsou až obrázky s třídou `on`.
  Kdo staví novou stránku na téhle mřížce, musí `on` doplnit, jinak zůstane prázdná.
- `content.json` drží CDN GitHub Pages asi 10 minut, po pushi se změna neprojeví hned.
- Sekce Venue v `preliminary-web/` schválně není – ta verze je zamrzlá.
