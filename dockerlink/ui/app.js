class DockerLink {
    constructor() {
        this.shortcuts = [];
        this.init();
    }

    async init() {
        await this.loadShortcuts();
        this.render();
        this.bindEvents();
    }

    async loadShortcuts() {
        try {
            const response = await fetch('/api/shortcuts');
            this.shortcuts = await response.json();
        } catch (error) {
            console.error('Failed to load shortcuts:', error);
            this.shortcuts = [];
        }
    }

    render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="container">
                <div class="toolbar">
                    <button id="addBtn">➕ 添加应用</button>
                </div>
                <div id="shortcuts" class="shortcuts-container">
                    ${this.shortcuts.length > 0 ? 
                        this.shortcuts.map(shortcut => this.renderShortcut(shortcut)).join('') :
                        '<div class="empty-state"><h3>暂无应用</h3><p>点击上方按钮添加第一个应用</p></div>'
                    }
                </div>
            </div>
            <div id="addModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <h3>添加新应用</h3>
                    <input type="text" id="nameInput" placeholder="应用名称 (如: Jellyfin)" />
                    <input type="text" id="urlInput" placeholder="完整URL (如: http://192.168.1.100:8096)" />
                    <input type="text" id="iconInput" placeholder="图标URL (可选)" />
                    <div class="modal-buttons">
                        <button id="saveBtn">保存</button>
                        <button id="cancelBtn">取消</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderShortcut(shortcut) {
        const defaultIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzY2N2VlYSIvPgo8cGF0aCBkPSJNMTYgMTZIMzJWMzJIMTZWMTZaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
        
        return `
            <div class="shortcut" data-id="${shortcut.id}">
                <button class="delete-btn" onclick="dockerLink.deleteShortcut(${shortcut.id}); event.stopPropagation();">×</button>
                <img src="${shortcut.icon || defaultIcon}" alt="${shortcut.name}" 
                     onerror="this.src='${defaultIcon}'" />
                <span>${shortcut.name}</span>
            </div>
        `;
    }

    bindEvents() {
        // 添加按钮事件
        const addBtn = document.getElementById('addBtn');
        if (addBtn) {
            addBtn.onclick = () => this.showAddModal();
        }

        // 模态框按钮事件
        const saveBtn = document.getElementById('saveBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (saveBtn) saveBtn.onclick = () => this.saveShortcut();
        if (cancelBtn) cancelBtn.onclick = () => this.hideAddModal();
        
        // 快捷方式点击事件
        document.querySelectorAll('.shortcut').forEach(el => {
            el.onclick = () => {
                const id = parseInt(el.dataset.id);
                const shortcut = this.shortcuts.find(s => s.id === id);
                if (shortcut) {
                    window.open(shortcut.url, '_blank');
                }
            };
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAddModal();
            }
        });
    }

    showAddModal() {
        document.getElementById('addModal').style.display = 'flex';
        document.getElementById('nameInput').focus();
    }

    hideAddModal() {
        document.getElementById('addModal').style.display = 'none';
        // 清空表单
        document.getElementById('nameInput').value = '';
        document.getElementById('urlInput').value = '';
        document.getElementById('iconInput').value = '';
    }

    async saveShortcut() {
        const name = document.getElementById('nameInput').value.trim();
        const url = document.getElementById('urlInput').value.trim();
        const icon = document.getElementById('iconInput').value.trim();

        if (!name || !url) {
            alert('请填写应用名称和URL');
            return;
        }

        // 简单的URL验证
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            alert('URL必须以 http:// 或 https:// 开头');
            return;
        }

        const shortcut = {
            id: Date.now(),
            name: name,
            url: url,
            icon: icon || null
        };

        try {
            const response = await fetch('/api/shortcut', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shortcut)
            });

            if (response.ok) {
                this.shortcuts.push(shortcut);
                this.render();
                this.bindEvents();
                this.hideAddModal();
            } else {
                throw new Error('保存失败');
            }
        } catch (error) {
            console.error('Failed to save shortcut:', error);
            alert('保存失败，请重试');
        }
    }

    async deleteShortcut(id) {
        if (!confirm('确定要删除这个应用吗？')) {
            return;
        }

        try {
            const response = await fetch(`/api/shortcut/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.shortcuts = this.shortcuts.filter(s => s.id !== id);
                this.render();
                this.bindEvents();
            } else {
                throw new Error('删除失败');
            }
        } catch (error) {
            console.error('Failed to delete shortcut:', error);
            alert('删除失败，请重试');
        }
    }
}

// 全局变量以便删除按钮调用
let dockerLink;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    dockerLink = new DockerLink();
});
