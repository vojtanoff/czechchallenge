#!/bin/zsh
# Rozpracovaná verze webu na GitHub Pages, aby šla zkontrolovat i z nemocničního PC:
# https://vojtanoff.github.io/czechchallenge/pexa-final-working-draft/
# Bere worktree ~/dev/czechchallenge-pexa-final tak, jak právě je – včetně věcí,
# které ještě nejsou na ostrém webu. Ostrý web se tím NEMĚNÍ, na to je
# ./pexa-final-do-korene.sh.
# Cesty k obrázkům se přepisují na ../img/, ať se fotky neduplikují (stejně jako v pexa-final-sync.sh).
set -e
Z=~/dev/czechchallenge-pexa-final; C=~/dev/czechchallenge/pexa-final-working-draft
mkdir -p "$C"
for f in index.html gallery.html style.css style-pexa.css efekty.js content.json katetr.json editor-katetr.html; do
  [ -f "$Z/$f" ] || continue
  python3 - "$Z/$f" "$C/$f" <<'PY'
import sys
src,dst=sys.argv[1],sys.argv[2]; s=open(src,encoding="utf-8").read()
if dst.endswith(".html"):
    s=s.replace('src="img/','src="../img/').replace('href="img/','href="../img/')
    s=s.replace('fetch("content.json",{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(C){',
                'fetch("content.json",{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(C){ C=JSON.parse(JSON.stringify(C).replace(/"img\\//g,\'"../img/\'));')
    # pásek, ať se rozpracovaná verze nedá splést s ostrým webem
    s=s.replace("</body>",
      '<div style="position:fixed;left:12px;bottom:12px;z-index:60;background:#4B32D0;color:#fff;'
      'font:500 12px/1 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;'
      'padding:7px 13px;border-radius:999px;pointer-events:none">working draft</div>\n</body>')
elif dst.endswith(".css"):
    s=s.replace('url(img/','url(../img/').replace('url("img/','url("../img/')
open(dst,"w",encoding="utf-8").write(s)
PY
done
rsync -a --delete "$Z/fonts/" "$C/fonts/"
echo "pexa-final-working-draft/ aktualizováno z $(cd $Z && git log --oneline -1)"
