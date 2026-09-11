#!/bin/zsh
# Verze webu, na kterou odkazuje interaktivní pozvánka:
# https://vojtanoff.github.io/czechchallenge/preliminary-web/
#
# POZOR: je ZAMRZLÁ na konkrétním commitu větve pexa-final, ne na jejím aktuálním
# stavu. Vojta ji rozeslal s pozvánkou, takže se nesmí měnit pod rukama, zatímco se
# ve working draftu dál pracuje. Posun na novější stav = změnit PIN níž (a ověřit,
# že nová verze je opravdu k rozeslání), nebo skript spustit s commitem jako parametrem.
#
# 11. 9. 2026: Vojta rozhodl nahradit původní zamrzlou verzi (4e4127c, staré hero
# s palcem, bez Venue) aktuálním working draftem. Od té doby se Venue NEVYŘEZÁVÁ
# a hero je to nové s katetrem – proto se kopíruje i katetr.json, bez něj by katetr
# spadl na výchozí polohu. Odznak "working draft" tady není, ten přidává jen
# pexa-final-working-draft.sh.
set -e
PIN=${1:-00f85f8}      # working draft z 11. 9. 2026: hero s katetrem, dve kotvy pro PC, Venue se ctyrmi fotkami salu
Z=~/dev/czechchallenge-pexa-final; C=~/dev/czechchallenge/preliminary-web
mkdir -p "$C"
for f in index.html gallery.html style.css style-pexa.css efekty.js content.json katetr.json; do
  git -C "$Z" cat-file -e "$PIN:$f" 2>/dev/null || continue
  git -C "$Z" show "$PIN:$f" > /tmp/prelim-$$.src
  python3 - /tmp/prelim-$$.src "$C/$f" <<'PY'
import sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()
if dst.endswith(".html"):
    s = s.replace('src="img/', 'src="../img/').replace('href="img/', 'href="../img/')
    s = s.replace('fetch("content.json",{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(C){',
                  'fetch("content.json",{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(C){ C=JSON.parse(JSON.stringify(C).replace(/"img\\//g,\'"../img/\'));')
elif dst.endswith(".css"):
    s = s.replace("url(img/", "url(../img/").replace('url("img/', 'url("../img/')
open(dst, "w", encoding="utf-8").write(s)
PY
  rm -f /tmp/prelim-$$.src
done
rsync -a --delete "$Z/fonts/" "$C/fonts/"
echo "preliminary-web/ zamrzlá na $PIN: $(git -C $Z log --oneline -1 $PIN)"
grep -q 'id="venue"' "$C/index.html" && echo "venue je uvnitr (od 11. 9. spravne)" || echo "POZOR: venue chybi"
grep -q 'working draft' "$C/index.html" && echo "POZOR: zustal odznak working draft" || echo "bez odznaku"
