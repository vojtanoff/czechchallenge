# Program a Faculty 2026 – komponenty pro web

Dvě samostatné komponenty (Program s přepínáním dnů a sessions, Faculty s řediteli a seznamem
členů), postavené podle návrhu Miloše Pexy a testovacího webu kodéra. Žádný build, žádný
framework – tři soubory a jeden datový JSON, dají se přenést na jakýkoli web.

```
program-2026.json    data – VEŘEJNÁ, generovaná, ručně se needitují
Scientific_Program_2026.pdf  program ke stažení – kopíruje ho generátor spolu s JSONem (stejný export Desku)
program-2026.js      vykreslení obou komponent (vanilla JS, ~200 řádků)
program-2026.css     vzhled (rozměry z testovacího webu, zlom 861 px jako zbytek stránky)
img/ikony/           Milošovy ikony z návrhu (kava.svg, sipka-vlevo/vpravo.svg převzaté z testovacího webu)
                     + obed.svg dokreslený stejným tahem
```

## Zapojení do stránky

```html
<link rel="stylesheet" href="program-2026.css">
…
<div data-cc-program data-src="program-2026.json" data-day="fri"></div>
<div data-cc-faculty data-src="program-2026.json" data-flags="1"></div>
…
<script src="program-2026.js"></script>
```

- `data-src` – cesta k JSONu (výchozí `program-2026.json`).
- `data-day` – který den je vybraný po načtení (`thu` / `fri`, výchozí `fri`).
- `data-flags="1"` – u států v seznamu faculty ukázat vlajku (vlastní zjednodušené SVG v JS,
  bez emoji a bez CDN). Pro náhled přebije `?vlajky=1` / `?vlajky=0` v adrese.
- Ikony se hledají v `img/ikony/`; jinou cestu dá `data-ikony="…/"` na značce `<script>`.
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

`--jen-web` přeskočí commitmenty; `program-2026.json` i `Scientific_Program_2026.pdf` vzniknou vždy
a jdou do repa spolu (web a PDF tak odpovídají stejnému exportu). PDF se před kopií zkontroluje,
že neobsahuje interní pole, cizí e-maily ani telefony. Co generátor hlídá:

- na web jdou **jen potvrzení lidé s rolí** v programu (stav `ok` nebo `tym`);
- z faculty jde jen jméno, země, role, fotka a štítek (Course director); pracoviště se
  neukazuje vůbec, pole `instituce`, `comments`, hotel a kontakty z Desku **nikdy**;
- role pro celou akci (pole `role` na kartě osoby v Desku, např. „Cath lab coordinator“)
  je v `roles` se `session: null`;
- místa live casů překládá `MISTA_WEB` (Desk má „remote přenos, Portoriko“ → web
  „Remote transmission from Puerto Rico“) a doplňuje zemi do pilulky;
- `photo` generátor dál plní z `img/faculty/<id>.jpg|webp|png`, ale web fotky ani zástupné
  neukazuje (Vojta 6. 10.) – pole je připravené pro případ, že se fotky vrátí.

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
     "chairs": ["will"], "discussants": ["kala"], "provokers": ["avramovic"], "coordinators": ["novotny"],
     "liveCases": [{"title": "Live Case 1", "location": "...", "country": "Australia", "remote": true, "operators": ["dautov"], "ivus": null}],
     "lectures": [{"title": "Road 1: Fellowship", "speakers": ["achim"], "minutes": 5}]}
   ]}
 ],
 "faculty": [
  {"id": "achim", "name": "Alexandru Achim", "country": "Romania", "countryCode": "ROU", "photo": null,
   "tags": [], "roles": [{"role": "Speaker", "session": 1}, {"role": "Chair", "session": 2}]},
  {"id": "41umzeal6gmv1tj40t7o", "name": "Tomáš Lazarák", "country": "Czechia", "countryCode": "CZE", "photo": null,
   "tags": [], "roles": [{"role": "Cath lab coordinator", "session": null}]}
 ]
}
```

Všechny odkazy na lidi jsou `id` z pole `faculty`.

## Co komponenty dělají

**Program** – pilulky dnů (čtvrtek / pátek), pod nimi pilulky sessions; vybraná session má
čas a název vlevo, Chairs / Discussants / Provoker / Session coordinator vpravo, pak karty live
casů (pilulka se zemí, místo, operatéři, IVUS), vodorovný pás přednášek (první fialová, šipky
pod ním) a limetkovou kartu přestávky, která po session následuje (hrnek u kávy, příbor u
oběda, u závěru nic). Čtvrtek ukáže jen kartu večeře. Pod programem je pilulkové tlačítko
„Download program (PDF)“ (`.pr-pdf` v index.html, soubor `Scientific_Program_2026.pdf`). Na telefonu se po přepnutí session stránka posune k detailu.

**Faculty** – jeden seznam „N faculty members“: jméno, role v programu, stát (volitelně
s vlajkou). Course directors nemají vlastní blok (jsou na hlavní straně), v seznamu jsou,
protože mají roli v programu. Bez fotek. Na telefonu prvních šest a tlačítko Load more.
Stát je podle pole `zeme` v Desku – má znamenat zemi, kde člověk pracuje.

Respektuje `prefers-reduced-motion`; bez JS zůstane v HTML prázdný prvek (sekce je
dokreslovaná), stejně jako zbytek webu z `content.json`.
