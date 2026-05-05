import http.server
import os
import sys

PORT = 3456
ROOT = os.path.dirname(os.path.abspath(__file__))

os.chdir(ROOT)

handler = http.server.SimpleHTTPRequestHandler
with http.server.HTTPServer(("", PORT), handler) as httpd:
    print(f"Serving {ROOT} on port {PORT}", flush=True)
    httpd.serve_forever()
