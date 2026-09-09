#!/bin/zsh
# Přenese variantu pexa-final z větve do KOŘENE repa = ostrý web na
# https://vojtanoff.github.io/czechchallenge/ (a později czechchallenge.com).
# Cesty se z ../img/ vrací na img/, fonty se kopírují celé.
set -e
Z=~/dev/czechchallenge-pexa-final; C=~/dev/czechchallenge
for f in index.html gallery.html style.css style-pexa.css content.json; do
  python3 - "$Z/$f" "$C/$f" <<'PY'
import sys
src,dst=sys.argv[1],sys.argv[2]; s=open(src,encoding="utf-8").read()
open(dst,"w",encoding="utf-8").write(s)   # ve větvi jsou cesty už relativní ke kořeni (img/, fonts/)
PY
done
rsync -a --delete "$Z/fonts/" "$C/fonts/"
echo "kořen aktualizován z $(cd $Z && git log --oneline -1)"
echo "→ zkontroluj http://127.0.0.1:8790/ a pak: git -C $C add -A && git commit && git push"
