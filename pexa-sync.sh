#!/bin/zsh
# Zkopíruje větev design-pexa (worktree ~/dev/czechchallenge-pexa) do složky pexa/ na main,
# aby byla 2. a 3. verze webu vidět na GitHub Pages: https://vojtanoff.github.io/czechchallenge/pexa/
# Obrázky se neduplikují – stránky v pexa/ ukazují na ../img/ (cesty se přepíšou při kopírování).
set -e
Z=~/dev/czechchallenge-pexa; C=~/dev/czechchallenge/pexa
mkdir -p "$C"
for f in index.html gallery.html style.css style-pexa.css content.json; do
  python3 - "$Z/$f" "$C/$f" <<'PY'
import sys,re
src,dst=sys.argv[1],sys.argv[2]; s=open(src,encoding="utf-8").read()
if dst.endswith(".html"):
    s=s.replace('src="img/','src="../img/').replace('href="img/','href="../img/')
    # cesty z content.json (img/…) se po načtení přepíšou na ../img/… – jednou pro celý JSON, včetně klíčů (pos, kompozice)
    s=s.replace('fetch("content.json",{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(C){',
                'fetch("content.json",{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(C){ C=JSON.parse(JSON.stringify(C).replace(/"img\\//g,\'"../img/\'));')
elif dst.endswith(".css"):
    s=s.replace('url(img/','url(../img/').replace('url("img/','url("../img/')
open(dst,"w",encoding="utf-8").write(s)
PY
done
# obrázky: pexa/ používá jen ../img/ z main (ruka-3d.png, palec-3d.png a fotky tam jsou); větvové navíc se nekopírují
echo "pexa/ aktualizováno z $(cd $Z && git log --oneline -1)"
