#!/bin/zsh
# Předběžná verze webu na GitHub Pages, kterou Vojta sdílí s pozvánkou:
# https://vojtanoff.github.io/czechchallenge/preliminary-web/
# Je to současný stav větve pexa-final BEZ sekce Venue – ta se dodělává
# v pexa-final-working-draft (čeká na vlastní fotku exteriéru a potvrzení adresy).
# Ostrý web v kořeni se tím nemění.
set -e
Z=~/dev/czechchallenge-pexa-final; C=~/dev/czechchallenge/preliminary-web
mkdir -p "$C"
for f in index.html gallery.html style.css style-pexa.css efekty.js content.json; do
  [ -f "$Z/$f" ] || continue
  python3 - "$Z/$f" "$C/$f" <<'PY'
import re, sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()
if dst.endswith(".html"):
    # sekce Venue ven i s komentářem nad ní
    s = re.sub(r"\n<!-- VENUE -->\n<section id=\"venue\".*?</section>\n", "\n", s, flags=re.S)
    # a odkazy na ni ve všech nabídkách
    s = re.sub(r"\s*<li><a href=\"#venue\">Venue</a></li>", "", s)
    s = s.replace('<a href="#venue">Venue</a>', "")
    s = s.replace('src="img/', 'src="../img/').replace('href="img/', 'href="../img/')
    s = s.replace('fetch("content.json",{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(C){',
                  'fetch("content.json",{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(C){ C=JSON.parse(JSON.stringify(C).replace(/"img\\//g,\'"../img/\'));')
elif dst.endswith(".css"):
    s = s.replace("url(img/", "url(../img/").replace('url("img/', 'url("../img/')
open(dst, "w", encoding="utf-8").write(s)
PY
done
rsync -a --delete "$Z/fonts/" "$C/fonts/"
echo "preliminary-web/ aktualizováno z $(cd $Z && git log --oneline -1)"
grep -c 'id="venue"' "$C/index.html" >/dev/null && echo "POZOR: venue se nevyřízla" || echo "venue vyříznuta"
