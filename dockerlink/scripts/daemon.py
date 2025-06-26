#!/usr/bin/env python3
from flask import Flask, send_from_directory, jsonify, request
import os
import json

# 修正路径获取方式
pkg_root = "/var/packages/dockerlink"
ui_folder = os.path.join(pkg_root, "ui")
data_folder = os.path.join(pkg_root, "var")

# 确保数据目录存在
os.makedirs(data_folder, exist_ok=True)

app = Flask(__name__)

# 数据存储文件
DATA_FILE = os.path.join(data_folder, "shortcuts.json")

def load_shortcuts():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def save_shortcuts(shortcuts):
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(shortcuts, f)
    except Exception as e:
        print(f"Error saving shortcuts: {e}")

@app.route('/')
def index():
    return send_from_directory(ui_folder, 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(ui_folder, filename)

@app.route('/api/shortcuts')
def get_shortcuts():
    return jsonify(load_shortcuts())

@app.route('/api/shortcut', methods=['POST'])
def add_shortcut():
    try:
        data = request.json
        shortcuts = load_shortcuts()
        shortcuts.append(data)
        save_shortcuts(shortcuts)
        return jsonify({'status': 'ok'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/shortcut/<int:shortcut_id>', methods=['DELETE'])
def delete_shortcut(shortcut_id):
    try:
        shortcuts = load_shortcuts()
        shortcuts = [s for s in shortcuts if s.get('id') != shortcut_id]
        save_shortcuts(shortcuts)
        return jsonify({'status': 'ok'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=40234, debug=False)
