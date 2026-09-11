#!/bin/zsh
# Předběžná verze webu, kterou Vojta sdílí s pozvánkou:
# https://vojtanoff.github.io/czechchallenge/preliminary-web/
#
# POZOR: tahle verze je ZAMRZLÁ na konkrétním commitu větve pexa-final, ne na jejím
# aktuálním stavu. Vojta ji rozesílá s pozvánkou, takže se nesmí měnit pod rukama,
# zatímco se ve working draftu dodělává hero a venue. Vyřízne se z ní jen sekce Venue.
# Posun na novější stav = změnit PIN (a ověřit, že nová verze je opravdu k rozeslání).
set -e
PIN=${1:-4e4127c}      # poslední stav s původním hero (palec v nadpisu, fotka jako karta)
Z=~/dev/czechchallenge-pexa-final; C=~/dev/czechchallenge/preliminary-web
mkdir -p "$C"
for f in index.html gallery.html style.css style-pexa.css efekty.js content.json; do
  git -C "$Z" cat-file -e "$PIN:$f" 2>/dev/null || continue
  git -C "$Z" show "$PIN:$f" > /tmp/prelim-$$.src
  python3 - /tmp/prelim-$$.src "$C/$f" <<'PY'
import re, sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()
if dst.endswith(".html"):
    s = re.sub(r"\n<!-- VENUE -->\n<section id=\"venue\".*?</section>\n", "\n", s, flags=re.S)
    s = re.sub(r"\s*<li><a href=\"#venue\">Venue</a></li>", "", s)
    s = s.replace('<a href="#venue">Venue</a>', "")
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
grep -q 'id="venue"' "$C/index.html" && echo "POZOR: venue se nevyřízla" || echo "venue vyříznuta"
