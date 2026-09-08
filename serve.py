#!/usr/bin/env python3
"""serve.py – náhled nového webu czechchallenge.com z jiného zařízení.

Statický web (index.html, gallery.html, content.json, img/). Až bude schválený,
nahraje se na hosting; tenhle server je jen pro náhled a ladění.

Poslouchá na 127.0.0.1 a na adrese Tailscale (vlastní zařízení odkudkoli), NE na
0.0.0.0 – na nemocniční wifi by to bylo vidět komukoli v síti.

launchd: com.vojtanoff.czechchallenge · http://127.0.0.1:8790
"""
import functools
import http.server
import json
import os
import socketserver
import subprocess
import threading
from pathlib import Path

KOREN = Path(__file__).resolve().parent
PORT = int(os.environ.get("CC_PORT", "8790"))
OBSAH = KOREN / "content.json"


def tailscale_ip():
    for cesta in ("/usr/local/bin/tailscale",
                  "/Applications/Tailscale.app/Contents/MacOS/Tailscale"):
        try:
            r = subprocess.run([cesta, "ip", "-4"], capture_output=True, text=True, timeout=10)
            ip = (r.stdout or "").strip().splitlines()[0].strip()
            if ip.startswith("100."):
                return ip
        except Exception:  # noqa: BLE001
            continue
    return None


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # formulář se po každém přegenerování mění, ať prohlížeč nedrží starý
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *a):
        pass

    # editor kompozice (_vyber/kompozice.html): uloží ohnisko a zoom fotek do content.json,
    # případně rovnou commitne a pushne (GitHub Pages). Hlavička X-Vyber brání zápisu z cizí stránky.
    def _json(self, kod, data):
        telo = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(kod)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(telo)))
        self.end_headers()
        self.wfile.write(telo)

    def do_POST(self):
        if self.headers.get("X-Vyber") != "1":
            return self._json(403, {"chyba": "jen z editoru"})
        try:
            delka = int(self.headers.get("Content-Length") or 0)
            data = json.loads(self.rfile.read(delka) or b"{}")
            if self.path == "/kompozice":
                return self._json(200, uloz_kompozici(data.get("kompozice") or {}))
            if self.path == "/publikuj":
                return self._json(200, publikuj())
            return self._json(404, {"chyba": "neznámá cesta"})
        except Exception as e:  # noqa: BLE001
            return self._json(500, {"chyba": str(e)})


def uloz_kompozici(komp):
    """komp = {src: {x,y,z[,mx,my,mz]}}; pos[src] se drží v souladu (galerie, směřování výřezu)."""
    obsah = json.loads(OBSAH.read_text(encoding="utf-8"))
    cisty = {}
    for src, k in komp.items():
        if not isinstance(k, dict):
            continue
        z = {}
        for kl in ("x", "y", "z", "mx", "my", "mz"):
            if kl in k and k[kl] is not None:
                z[kl] = round(float(k[kl]), 2)
        if "x" in z and "y" in z:
            cisty[src] = z
            obsah.setdefault("pos", {})[src] = f"{z['x']:g}% {z['y']:g}%"
    obsah["kompozice"] = cisty
    tmp = OBSAH.with_suffix(".tmp")
    tmp.write_text(json.dumps(obsah, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    tmp.replace(OBSAH)
    return {"ok": True, "pocet": len(cisty)}


def publikuj():
    def git(*a):
        r = subprocess.run(["git", *a], cwd=KOREN, capture_output=True, text=True, timeout=60)
        if r.returncode:
            raise RuntimeError((r.stderr or r.stdout).strip())
        return r.stdout.strip()
    git("add", "content.json")
    if not git("status", "--porcelain", "content.json"):
        return {"ok": True, "zprava": "nic nového k publikování"}
    git("commit", "-q", "-m", "Kompozice fotek v hero (editor)")
    git("push", "-q", "origin", "HEAD")
    return {"ok": True, "zprava": "pushnuto – Pages se obnoví do pár minut", "commit": git("rev-parse", "--short", "HEAD")}


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    KOREN.mkdir(parents=True, exist_ok=True)
    h = functools.partial(Handler, directory=str(KOREN))
    adresy = ["127.0.0.1"]
    ip = tailscale_ip()
    if ip:
        adresy.append(ip)
    servery = []
    for a in adresy:
        try:
            servery.append(Server((a, PORT), h))
            print(f"náhled webu Czech Challenge na http://{a}:{PORT}"
                  + ("  (i z mobilu v tailnetu)" if a.startswith("100.") else ""))
        except OSError as e:
            print(f"na {a} se nedá poslouchat: {e}")
    if not servery:
        raise SystemExit("žádnou adresu se nepodařilo obsadit")
    for s in servery[1:]:
        threading.Thread(target=s.serve_forever, daemon=True).start()
    servery[0].serve_forever()
