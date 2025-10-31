#!/usr/bin/env python3
"""
开发服务器 - 禁用缓存
"""
import http.server
import socketserver
import os
import sys
from urllib.parse import urlparse

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加禁用缓存的HTTP头
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        # 允许跨域
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_GET(self):
        # 为JS和CSS文件添加版本参数
        if self.path.endswith(('.js', '.css')):
            parsed_path = urlparse(self.path)
            if '?' not in self.path:
                self.path = self.path + '?v=' + str(int(os.path.getmtime(self.path[1:]) if os.path.exists(self.path[1:]) else 0))
        
        # SPA路由支持 - 所有非文件请求都重定向到index.html
        if not self.path.startswith('/js/') and not self.path.startswith('/styles/') and not self.path.startswith('/locales/') and not self.path.endswith(('.js', '.css', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico')):
            # 检查是否是文件请求
            file_path = self.path[1:]  # 移除开头的 /
            if not os.path.exists(file_path) or os.path.isdir(file_path):
                # 不是文件或文件不存在，重定向到index.html
                self.path = '/index.html'
        
        super().do_GET()

if __name__ == "__main__":
    PORT = 8000
    
    # 切换到renderer目录
    os.chdir(os.path.join(os.path.dirname(__file__)))
    
    with socketserver.ThreadingTCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
        print(f"开发服务器启动在 http://localhost:{PORT}")
        print("缓存已禁用，文件修改会自动刷新")
        print("按 Ctrl+C 停止服务器")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务器已停止")
            sys.exit(0)
