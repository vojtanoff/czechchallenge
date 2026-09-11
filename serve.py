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
    def do_POST(self):
        """Uložení polohy katetru z editoru. Hlavička X-Katetr brání tomu, aby to
        šlo vyvolat formulářem z cizí stránky; editor ji posílá."""
        telo = self.rfile.read(int(self.headers.get("Content-Length") or 0))
        if self.path.split("?")[0] != "/katetr.json":
            return self.send_error(404)
        if self.headers.get("X-Katetr") != "1":
            return self.send_error(403, "missing X-Katetr header")
        try:
            data = json.loads(telo.decode("utf-8"))
            assert isinstance(data, dict) and "pc" in data and "mobil" in data
        except Exception:
            return self.send_error(400, "not a katetr payload")
        cil = KOREN / "katetr.json"
        docasny = cil.with_suffix(".tmp")
        docasny.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        docasny.replace(cil)
        odpoved = json.dumps({"ok": True}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(odpoved)))
        self.end_headers()
        self.wfile.write(odpoved)

    def end_headers(self):
        # formulář se po každém přegenerování mění, ať prohlížeč nedrží starý
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *a):
        pass


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
