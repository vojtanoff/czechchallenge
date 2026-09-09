#!/bin/zsh
# Zkopíruje větev pexa-final-2 (worktree ~/dev/czechchallenge-pexa-final-2) do složky pexa-final-2/ na main,
# aby byla vidět na GitHub Pages: https://vojtanoff.github.io/czechchallenge/pexa-final-2/
# Stejný princip jako pexa-sync.sh (viz ten pro komentáře) – navíc kopíruje fonts/ (Safiro, jen tahle
# varianta) a HD ruku, kterou přidává do sdíleného img/brand/ (odtud ji používá i sama tahle stránka
# přes přepsanou cestu ../img/brand/…, stejně jako ruka-3d.png).
set -e
Z=~/dev/czechchallenge-pexa-final-2; C=~/dev/czechchallenge/pexa-final-2
mkdir -p "$C"
for f in index.html gallery.html style.css style-pexa.css content.json; do
  python3 - "$Z/$f" "$C/$f" <<'PY'
import sys,re
src,dst=sys.argv[1],sys.argv[2]; s=open(src,encoding="utf-8").read()
if dst.endswith(".html"):
    s=s.replace('src="img/','src="../img/').replace('href="img/','href="../img/')
    s=s.replace('fetch("content.json",{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(C){',
                'fetch("content.json",{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(C){ C=JSON.parse(JSON.stringify(C).replace(/"img\\//g,\'"../img/\'));')
elif dst.endswith(".css"):
    s=s.replace('url(img/','url(../img/').replace('url("img/','url("../img/')
open(dst,"w",encoding="utf-8").write(s)
PY
done
rsync -a --delete "$Z/fonts/" "$C/fonts/"
echo "pexa-final-2/ aktualizováno z $(cd $Z && git log --oneline -1)"
