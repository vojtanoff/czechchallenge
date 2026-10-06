# Program a Faculty 2026 – komponenty pro web

Dvě samostatné komponenty (Program s přepínáním dnů a sessions, Faculty s řediteli a seznamem
členů), postavené podle návrhu Miloše Pexy a testovacího webu kodéra. Žádný build, žádný
framework – tři soubory a jeden datový JSON, dají se přenést na jakýkoli web.

```
program-2026.json    data – VEŘEJNÁ, generovaná, ručně se needitují
program-2026.js      vykreslení obou komponent (vanilla JS, ~200 řádků)
program-2026.css     vzhled (rozměry z testovacího webu, zlom 861 px jako zbytek stránky)
faculty-fotky.json   mapa id → portrét, který už v repu leží jinde (čte generátor, ne web)
```

## Zapojení do stránky

```html
<link rel="stylesheet" href="program-2026.css">
…
<div data-cc-program data-src="program-2026.json" data-day="fri"></div>
<div data-cc-faculty data-src="program-2026.json"></div>
…
<script src="program-2026.js"></script>
```

- `data-src` – cesta k JSONu (výchozí `program-2026.json`).
- `data-day` – který den je vybraný po načtení (`thu` / `fri`, výchozí `fri`).
- CSS bere z okolí proměnné `--violet`, `--ground`, `--lime`, `--violet-soft`, `--font-display`;
  když chybí, má vlastní náhrady (fialová #4B32D0, podklad #F9F8F6, limetka #F2FF9F, Safiro).
- Stránka musí běžet přes HTTP (fetch JSONu), z `file://` to nepojede.

## Odkud se berou data

Zdroj pravdy je **Czech Challenge Desk** (artefakt s databází programu a faculty). Z jeho
exportu dělá generátor `~/dev/brain-tools/czech-challenge-program-a-commitmenty.py` kromě
PDF programu a commitmentů i tenhle JSON:

```
python3 ~/dev/brain-tools/czech-challenge-program-a-commitmenty.py <složka-exportu> --web <složka-repa-webu> --jen-web
```

`--jen-web` přeskočí PDF a udělá jen `program-2026.json`. Co generátor hlídá:

- na web jdou **jen potvrzení lidé s rolí** v programu (stav `ok` nebo `tym`);
- z faculty jde jen jméno, země, role, fotka a štítek (Course director); pole
  `instituce`, `comments`, hotel a kontakty z Desku **nikdy**;
- **témata Session 4 jsou skrytá** (`SKRYTA_TEMATA` v generátoru) – na webu je
  „Topic to be announced“, řečníci se ukazují;
- místa live casů překládá `MISTA_WEB` (Desk má „remote přenos, Portoriko“ → web
  „Remote transmission from Puerto Rico“) a doplňuje zemi do pilulky;
- fotka: `img/faculty/<id>.jpg|webp|png` v repu webu, jinak `faculty-fotky.json`, jinak
  `null` a web ukáže monogram. Kdo fotku nemá, vypíše generátor na konzoli.

## Tvar JSONu (zkráceně)

```json
{
 "generated": "2026-10-06",
 "event": {"name": "...", "date": "2026-10-23", "venue": "..."},
 "days": [
  {"id": "thu", "label": "Thursday", "date": "22 October 2026",
   "blocks": [{"type": "social", "time": "Evening", "title": "Welcome dinner", "location": "...", "url": "..."}]},
  {"id": "fri", "label": "Friday", "date": "23 October 2026",
   "blocks": [
    {"type": "break", "from": "08:15", "to": "08:30", "title": "Registration & Welcome Coffee"},
    {"type": "session", "number": 1, "label": "Session 1", "title": "CTO Techniques", "from": "08:30", "to": "10:30",
     "chairs": ["will"], "panel": ["kala"], "provokers": ["avramovic"], "coordinators": ["novotny"],
     "liveCases": [{"title": "Live Case 1", "location": "...", "country": "Australia", "remote": true, "operators": ["dautov"], "ivus": null}],
     "lectures": [{"title": "Road 1: Fellowship", "speakers": ["achim"], "minutes": 5}],
     "topicsHidden": false}
   ]}
 ],
 "faculty": [
  {"id": "achim", "name": "Alexandru Achim", "country": "Romania", "countryCode": "ROU", "photo": null,
   "tags": [], "affiliation": null, "roles": [{"role": "Speaker", "session": 1}, {"role": "Chair", "session": 2}]}
 ]
}
```

Všechny odkazy na lidi jsou `id` z pole `faculty`; `affiliation` je vyplněné jen u lidí
v `PRACOVISTE_WEB` generátoru (text, který už na webu byl), ne z Desku.

## Co komponenty dělají

**Program** – pilulky dnů (čtvrtek / pátek), pod nimi pilulky sessions; vybraná session má
čas a název vlevo, Chairs / Panel / Provoker / Session coordinator vpravo, pak karty live
casů (pilulka se zemí, místo, operatéři, IVUS), vodorovný pás přednášek (první fialová, šipky
pod ním) a limetkovou kartu přestávky, která po session následuje. Čtvrtek ukáže jen kartu
večeře. Na telefonu se po přepnutí session stránka posune k detailu.

**Faculty** – nahoře Course directors jako dvě velké karty s fotkou, pod tím „N faculty
members“: kolečko s fotkou nebo monogramem, jméno, role v programu, země. Na telefonu
prvních šest a tlačítko Load more.

Respektuje `prefers-reduced-motion`; bez JS zůstane v HTML prázdný prvek (sekce je
dokreslovaná), stejně jako zbytek webu z `content.json`.
