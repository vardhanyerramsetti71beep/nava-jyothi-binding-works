#!/usr/bin/env python3
"""
Nava Jyothi Binding Works - Local Web Server
Bilingual Bookbinding & Stationery Showcase
Location: Pulipativari St, One Town, Vijayawada, AP
"""

import http.server
import socketserver
import os
import sys
import webbrowser
import socket

PORT = 5000

def get_free_port(start_port):
    port = start_port
    while port < 65535:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port
        port += 1
    return start_port

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable aggressive caching for local development
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    actual_port = get_free_port(PORT)
    
    handler = CustomHandler
    with socketserver.TCPServer(("", actual_port), handler) as httpd:
        url = f"http://localhost:{actual_port}"
        print("=" * 65)
        print("   NAVA JYOTHI BINDING WORKS (నవ జ్యోతి బైండింగ్ వర్క్స్)")
        print("   Address: #11-40-54, Pulipativari St, One Town, Vijayawada")
        print("   Contact: +91 98491 40554 | 0866-2421973")
        print("=" * 65)
        print(f"   [+] Website is running live at: {url}")
        print("   [+] Press Ctrl+C to stop the server.")
        print("=" * 65)
        
        try:
            webbrowser.open(url)
        except Exception:
            pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n   [!] Server stopped by user.")
            sys.exit(0)

if __name__ == "__main__":
    run_server()
