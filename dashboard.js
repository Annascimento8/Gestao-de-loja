/* ============================================
   FERRAGENS REIS — DASHBOARD
   Sistema de gestão de loja completo
   ============================================ */

/**
 * SISTEMA DE TOAST NOTIFICATIONS
 * Substitui alerts nativos por notificações elegantes
 */
class ToastManager {
    constructor(containerId = 'toastContainer') {
        this.container = document.getElementById(containerId);
    }

    show(message, type = 'info', duration = 3000) {
        // Verificar preferência de notificações (se estiver false, só mostra erros/avisos graves)
        const notificationsEnabled = localStorage.getItem('notificationsEnabled');
        if (notificationsEnabled === 'false' && (type === 'success' || type === 'info')) {
            return null; // Silencia mensagens não críticas
        }

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Fechar">&times;</button>
            <div class="toast-progress"></div>
        `;

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.dismiss(toast);
        });

        this.container.appendChild(toast);

        // Auto dismiss
        setTimeout(() => this.dismiss(toast), duration);

        return toast;
    }

    dismiss(toast) {
        if (!toast || !toast.parentElement) return;
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }

    success(msg) { return this.show(msg, 'success'); }
    error(msg) { return this.show(msg, 'error', 4000); }
    warning(msg) { return this.show(msg, 'warning', 3500); }
    info(msg) { return this.show(msg, 'info'); }
}

/**
 * SISTEMA DE MODAIS
 */
class ModalManager {
    constructor() {
        this.overlay = document.getElementById('modalOverlay');
        this.content = document.getElementById('modalContent');
        this.titleEl = document.getElementById('modalTitle');
        this.bodyEl = document.getElementById('modalBody');
        this.footerEl = document.getElementById('modalFooter');
        this.closeBtn = document.getElementById('modalClose');

        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    }

    open(title, bodyHTML, footerHTML = '') {
        this.titleEl.textContent = title;
        this.bodyEl.innerHTML = bodyHTML;
        this.footerEl.innerHTML = footerHTML;
        this.footerEl.style.display = footerHTML ? 'flex' : 'none';
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * SISTEMA DE ATIVIDADES RECENTES
 */
class ActivityLogger {
    constructor() {
        this.key = 'activities';
        this.maxEntries = 50;
    }

    log(text, type = 'info') {
        const activities = this.getAll();
        activities.unshift({
            text,
            type,
            time: new Date().toISOString()
        });

        // Limitar quantidade
        if (activities.length > this.maxEntries) {
            activities.pop();
        }

        localStorage.setItem(this.key, JSON.stringify(activities));
    }

    getAll() {
        return JSON.parse(localStorage.getItem(this.key)) || [];
    }

    getRecent(count = 10) {
        return this.getAll().slice(0, count);
    }

    formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Agora';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        return date.toLocaleDateString('pt-BR');
    }
}

/**
 * MÁSCARAS DE INPUT
 */
class InputMasks {
    static cpfCnpj(value) {
        value = value.replace(/\D/g, '');
        if (value.length <= 11) {
            // CPF: 000.000.000-00
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        } else {
            // CNPJ: 00.000.000/0000-00
            value = value.substring(0, 14);
            value = value.replace(/(\d{2})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1/$2');
            value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
        }
        return value;
    }

    static telefone(value) {
        value = value.replace(/\D/g, '');
        value = value.substring(0, 11);
        if (value.length > 6) {
            value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        }
        return value;
    }

    static apply(inputId, maskFn) {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.addEventListener('input', (e) => {
            const pos = e.target.selectionStart;
            const oldLen = e.target.value.length;
            e.target.value = maskFn(e.target.value);
            const newLen = e.target.value.length;
            e.target.setSelectionRange(pos + (newLen - oldLen), pos + (newLen - oldLen));
        });
    }
}

/**
 * GRÁFICOS SIMPLES COM CANVAS
 */
class SimpleChart {
    static drawBar(canvasId, labels, data, color = '#fbbf24') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // Ajustar para retina
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = 250 * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = '250px';
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = 250;
        const padding = { top: 20, right: 20, bottom: 40, left: 60 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        ctx.clearRect(0, 0, w, h);

        const maxVal = Math.max(...data, 1);

        // Grid lines
        const gridLines = 5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'right';

        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartH / gridLines) * i;
            const val = maxVal - (maxVal / gridLines) * i;

            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.stroke();

            ctx.fillText(`R$ ${val.toFixed(0)}`, padding.left - 8, y + 4);
        }

        // Bars
        const barWidth = Math.min(40, (chartW / labels.length) * 0.6);
        const barGap = chartW / labels.length;

        labels.forEach((label, i) => {
            const barH = (data[i] / maxVal) * chartH;
            const x = padding.left + barGap * i + (barGap - barWidth) / 2;
            const y = padding.top + chartH - barH;

            // Bar gradient
            const grad = ctx.createLinearGradient(x, y, x, y + barH);
            grad.addColorStop(0, color);
            grad.addColorStop(1, color + '66');
            ctx.fillStyle = grad;

            // Rounded top
            const radius = Math.min(4, barWidth / 2);
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + barWidth - radius, y);
            ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
            ctx.lineTo(x + barWidth, y + barH);
            ctx.lineTo(x, y + barH);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.fill();

            // Bar glow
            ctx.shadowColor = color + '40';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Label
            ctx.fillStyle = '#6b7280';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + barWidth / 2, h - padding.bottom + 20);

            // Value on top
            if (data[i] > 0) {
                ctx.fillStyle = '#9ca3af';
                ctx.font = '10px Inter, sans-serif';
                ctx.fillText(`R$${data[i].toFixed(0)}`, x + barWidth / 2, y - 6);
            }
        });

        // No data message
        if (data.every(v => v === 0)) {
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Nenhuma venda registrada', w / 2, h / 2);
        }
    }
}

/**
 * APLICAÇÃO PRINCIPAL
 */
class DashboardApp {
    constructor() {
        this.toast = new ToastManager();
        this.modal = new ModalManager();
        this.activity = new ActivityLogger();

        this.checkAuthentication();
        this.initializeData();
        this.attachEventListeners();
        this.applyInputMasks();
        this.loadInitialPage();
        this.updateHeaderDate();
    }

    /**
     * Valida se o usuário está autenticado
     */
    checkAuthentication() {
        if (!sessionStorage.getItem('user')) {
            window.location.href = 'login.html';
        }
    }

    /**
     * Inicializa dados da aplicação
     */
    initializeData() {
        if (!localStorage.getItem('produtos')) {
            localStorage.setItem('produtos', JSON.stringify([]));
        }
        if (!localStorage.getItem('notasFiscais')) {
            localStorage.setItem('notasFiscais', JSON.stringify([]));
        }
        if (!localStorage.getItem('vendas')) {
            localStorage.setItem('vendas', JSON.stringify([]));
        }
        if (!localStorage.getItem('usuario')) {
            localStorage.setItem('usuario', JSON.stringify({
                username: 'admin',
                email: ''
            }));
        }
    }

    /**
     * Atualiza data no header
     */
    updateHeaderDate() {
        const dateEl = document.getElementById('headerDate');
        if (dateEl) {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateEl.textContent = now.toLocaleDateString('pt-BR', options);
        }
    }

    /**
     * Aplica máscaras de input
     */
    applyInputMasks() {
        InputMasks.apply('clienteCPF', InputMasks.cpfCnpj);
        InputMasks.apply('clienteTel', InputMasks.telefone);
    }

    /**
     * Anexa listeners aos elementos principais
     */
    attachEventListeners() {
        // Navegação do sidebar
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Sidebar toggle
        document.getElementById('sidebarToggle')?.addEventListener('click', () => {
            this.toggleSidebar(false);
        });
        document.getElementById('headerToggle')?.addEventListener('click', () => {
            this.toggleSidebar(true);
        });
        document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
            this.toggleSidebar(false);
        });

        // Logout
        document.getElementById('btnLogout')?.addEventListener('click', () => this.logout());

        // Formulário de produtos
        document.getElementById('produtoForm')?.addEventListener('submit', (e) => this.handleProductSubmit(e));
        document.getElementById('produtoCusto')?.addEventListener('input', () => this.calculateMargin());
        document.getElementById('produtoVenda')?.addEventListener('input', () => this.calculateMargin());
        document.getElementById('btnCancelEdit')?.addEventListener('click', () => this.cancelProductEdit());
        document.getElementById('searchProdutos')?.addEventListener('input', (e) => this.searchProducts(e.target.value));

        // Nota Fiscal
        document.getElementById('btnAddProduto')?.addEventListener('click', () => this.addProductToNF());
        document.getElementById('nfDescontoGeral')?.addEventListener('input', () => this.updateNFTotal());
        document.getElementById('btnEmitirNF')?.addEventListener('click', () => this.emitNF());
        document.getElementById('btnLimparNF')?.addEventListener('click', () => this.clearNF());

        // Notas Fiscais - busca
        document.getElementById('searchNotas')?.addEventListener('input', () => this.loadNotas());
        document.getElementById('filterDataNotas')?.addEventListener('change', () => this.loadNotas());

        // Estoque
        document.getElementById('filterEstoque')?.addEventListener('change', () => this.loadEstoque());
        document.getElementById('searchEstoque')?.addEventListener('input', () => this.loadEstoque());

        // Financeiro
        document.getElementById('filterFinanceiro')?.addEventListener('change', () => this.loadFinanceiro());

        // Mudar senha
        document.getElementById('btnMudarSenha')?.addEventListener('click', () => this.changePassword());
        document.getElementById('senhaNova')?.addEventListener('input', () => this.updatePasswordStrength());

        // Salvar dados do usuário
        document.getElementById('btnSalvarDados')?.addEventListener('click', () => this.saveUserData());

        // Quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                this.navigateToPage(action);
            });
        });

        // Stat cards - clicáveis
        document.querySelectorAll('.stat-card[data-page-link]').forEach(card => {
            card.addEventListener('click', () => {
                const page = card.getAttribute('data-page-link');
                this.navigateToPage(page);
            });
        });

        // Populando select de produtos na NF
        this.populateProductSelect();
    }

    /**
     * Toggle sidebar (mobile)
     */
    toggleSidebar(open) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (open) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        } else {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    }

    /**
     * Carrega a página inicial
     */
    loadInitialPage() {
        this.showPage('dashboard');
        this.updateDashboard();
    }

    /**
     * Navega para uma página programaticamente
     */
    navigateToPage(pageId) {
        // Atualizar links ativos
        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.remove('active');
            if (l.getAttribute('data-page') === pageId) {
                l.classList.add('active');
            }
        });

        this.showPage(pageId);
        this.updatePageTitle(pageId);

        // Fechar sidebar em mobile
        if (window.innerWidth < 768) {
            this.toggleSidebar(false);
        }
    }

    /**
     * Navega entre páginas via link
     */
    handleNavigation(e) {
        e.preventDefault();
        const link = e.currentTarget;
        const pageId = link.getAttribute('data-page');

        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        this.showPage(pageId);
        this.updatePageTitle(pageId);

        if (window.innerWidth < 768) {
            this.toggleSidebar(false);
        }
    }

    /**
     * Atualiza título da página
     */
    updatePageTitle(pageId) {
        const titles = {
            'dashboard': '📊 Dashboard',
            'produtos': '📦 Gestão de Produtos',
            'nf': '🧾 Emissão de NF',
            'notas': '📑 Notas Fiscais',
            'estoque': '⚠ Controle de Estoque',
            'financeiro': '💰 Financeiro',
            'usuario': '👤 Administrador',
            'clientes': '👥 Clientes',
            'fornecedores': '🚚 Fornecedores'
        };
        document.getElementById('page-title').textContent = titles[pageId] || 'Dashboard';
    }

    /**
     * Mostra uma página e oculta as demais
     */
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        
        // Sempre fecha o scanner da câmera ao trocar de tela
        if (window.closeCameraScanner) {
            window.closeCameraScanner();
        }

        const page = document.getElementById(`${pageId}-page`);
        if (page) {
            page.classList.add('active');

            // Carregar dados específicos
            switch (pageId) {
                case 'dashboard': this.updateDashboard(); break;
                case 'produtos': this.loadProducts(); break;
                case 'notas': this.loadNotas(); break;
                case 'estoque': this.loadEstoque(); break;
                case 'financeiro': this.loadFinanceiro(); break;
                case 'usuario': this.loadUserPage(); break;
                case 'nf': this.populateProductSelect(); break;
                case 'clientes': this.loadClientes(); break;
                case 'fornecedores': this.loadFornecedores(); break;
            }
        }
    }

    /* =============================================
       GESTÃO DE PRODUTOS
       ============================================= */

    handleProductSubmit(e) {
        e.preventDefault();

        const editId = document.getElementById('produtoId').value;
        const formData = new FormData(document.getElementById('produtoForm'));

        const produto = {
            id: editId ? parseInt(editId) : Date.now(),
            nome: formData.get('nome')?.trim(),
            unidade: formData.get('unidade'),
            custoPor: parseFloat(formData.get('custoPor')),
            precovenda: parseFloat(formData.get('precovenda')),
            margem: this.calculateMarginPercent(
                parseFloat(formData.get('custoPor')),
                parseFloat(formData.get('precovenda'))
            ),
            estoque: parseInt(formData.get('estoque')),
            estoque_minimo: parseInt(formData.get('estoque_minimo')),
            fornecedor: formData.get('fornecedor')?.trim(),
            descricao: formData.get('descricao')?.trim()
        };

        // Validações
        if (!produto.nome || !produto.unidade || isNaN(produto.custoPor) || isNaN(produto.precovenda)) {
            this.toast.warning('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        if (produto.precovenda < produto.custoPor) {
            this.toast.warning('O preço de venda está abaixo do custo!');
        }

        // Salvar
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];

        if (editId) {
            // Editar existente
            const index = produtos.findIndex(p => p.id === parseInt(editId));
            if (index !== -1) {
                produtos[index] = produto;
                this.toast.success(`Produto "${produto.nome}" atualizado com sucesso!`);
                this.activity.log(`Produto <strong>${produto.nome}</strong> editado`, 'edit');
            }
        } else {
            // Novo produto
            produtos.push(produto);
            this.toast.success(`Produto "${produto.nome}" cadastrado com sucesso!`);
            this.activity.log(`Produto <strong>${produto.nome}</strong> cadastrado`, 'create');
        }

        localStorage.setItem('produtos', JSON.stringify(produtos));

        // Limpar formulário
        document.getElementById('produtoForm').reset();
        document.getElementById('produtoId').value = '';
        document.getElementById('productFormTitle').textContent = 'Cadastrar Novo Produto';
        document.getElementById('btnSaveProduto').innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
            </svg>
            Salvar Produto
        `;
        document.getElementById('btnCancelEdit').style.display = 'none';

        this.loadProducts();
        this.populateProductSelect();
    }

    loadProducts(searchTerm = '') {
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const tbody = document.getElementById('produtosTable');

        let filtered = produtos;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = produtos.filter(p =>
                p.nome.toLowerCase().includes(term) ||
                (p.fornecedor && p.fornecedor.toLowerCase().includes(term))
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="8">Nenhum produto encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(p => {
            const margemClass = p.margem < 0 ? 'style="color: var(--error)"' : p.margem > 50 ? 'style="color: var(--success)"' : '';
            const estoqueClass = p.estoque <= p.estoque_minimo ? 'style="color: var(--error); font-weight: 700"' : '';

            return `
                <tr>
                    <td><strong>${this.escapeHtml(p.nome)}</strong></td>
                    <td>${p.unidade.toUpperCase()}</td>
                    <td>R$ ${p.custoPor.toFixed(2)}</td>
                    <td>R$ ${p.precovenda.toFixed(2)}</td>
                    <td ${margemClass}>${p.margem.toFixed(1)}%</td>
                    <td ${estoqueClass}>${p.estoque}</td>
                    <td>${this.escapeHtml(p.fornecedor || '-')}</td>
                    <td>
                        <div class="td-actions">
                            <button class="btn-edit" onclick="app.editProduct(${p.id})">Editar</button>
                            <button class="btn-delete" onclick="app.deleteProduct(${p.id})">Excluir</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    searchProducts(term) {
        this.loadProducts(term);
    }

    editProduct(id) {
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const produto = produtos.find(p => p.id === id);
        if (!produto) return;

        // Preencher formulário
        document.getElementById('produtoId').value = produto.id;
        document.getElementById('produtoNome').value = produto.nome;
        document.getElementById('produtoUnidade').value = produto.unidade;
        document.getElementById('produtoCusto').value = produto.custoPor;
        document.getElementById('produtoVenda').value = produto.precovenda;
        document.getElementById('produtoEstoque').value = produto.estoque;
        document.getElementById('produtoEstoqueMin').value = produto.estoque_minimo;
        document.getElementById('produtoFornecedor').value = produto.fornecedor || '';
        document.getElementById('produtoDescricao').value = produto.descricao || '';

        this.calculateMargin();

        // Atualizar UI
        document.getElementById('productFormTitle').textContent = `Editando: ${produto.nome}`;
        document.getElementById('btnSaveProduto').innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
            </svg>
            Atualizar Produto
        `;
        document.getElementById('btnCancelEdit').style.display = 'inline-flex';

        // Scroll para o formulário
        document.getElementById('productFormSection').scrollIntoView({ behavior: 'smooth' });

        this.toast.info(`Editando produto: ${produto.nome}`);
    }

    cancelProductEdit() {
        document.getElementById('produtoForm').reset();
        document.getElementById('produtoId').value = '';
        document.getElementById('productFormTitle').textContent = 'Cadastrar Novo Produto';
        document.getElementById('btnSaveProduto').innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
            </svg>
            Salvar Produto
        `;
        document.getElementById('btnCancelEdit').style.display = 'none';
    }

    calculateMargin() {
        const custo = parseFloat(document.getElementById('produtoCusto').value) || 0;
        const venda = parseFloat(document.getElementById('produtoVenda').value) || 0;
        const margem = this.calculateMarginPercent(custo, venda);
        const margemEl = document.getElementById('produtoMargem');
        margemEl.value = `${margem.toFixed(1)}%`;

        // Cor visual
        if (margem < 0) {
            margemEl.style.color = 'var(--error)';
        } else if (margem > 50) {
            margemEl.style.color = 'var(--success)';
        } else {
            margemEl.style.color = 'var(--gold-400)';
        }
    }

    calculateMarginPercent(custo, venda) {
        if (custo === 0) return 0;
        return ((venda - custo) / custo) * 100;
    }

    deleteProduct(id) {
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const produto = produtos.find(p => p.id === id);
        if (!produto) return;

        this.modal.open(
            'Excluir Produto',
            `<p style="color: var(--text-secondary); line-height: 1.6;">
                Tem certeza que deseja excluir o produto <strong style="color: var(--text-primary);">"${this.escapeHtml(produto.nome)}"</strong>?
                <br><br>Esta ação não pode ser desfeita.
            </p>`,
            `<button class="btn-secondary" onclick="app.modal.close()">Cancelar</button>
             <button class="btn-delete" onclick="app.confirmDeleteProduct(${id})" style="padding: 0.75rem 1.5rem;">Excluir</button>`
        );
    }

    confirmDeleteProduct(id) {
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const produto = produtos.find(p => p.id === id);
        const filtered = produtos.filter(p => p.id !== id);
        localStorage.setItem('produtos', JSON.stringify(filtered));

        this.modal.close();
        this.toast.success(`Produto "${produto?.nome}" excluído`);
        this.activity.log(`Produto <strong>${produto?.nome}</strong> excluído`, 'delete');

        this.loadProducts();
        this.populateProductSelect();
    }

    populateProductSelect() {
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const select = document.getElementById('selectProduto');
        if (!select) return;

        const currentValue = select.value;
        select.innerHTML = '<option value="">Selecione um produto</option>' +
            produtos.map(p => `<option value="${p.id}" data-preco="${p.precovenda}" data-estoque="${p.estoque}">${p.nome} (Est: ${p.estoque})</option>`).join('');

        if (currentValue) select.value = currentValue;

        // Evento de seleção
        select.onchange = () => {
            const option = select.options[select.selectedIndex];
            const preco = option.getAttribute('data-preco');
            if (preco) {
                document.getElementById('precoProduto').value = preco;
            }
        };
    }

    /* =============================================
       NOTA FISCAL
       ============================================= */

    addProductToNF() {
        const selectProduto = document.getElementById('selectProduto');
        const qtd = parseInt(document.getElementById('qtdProduto').value) || 0;
        const preco = parseFloat(document.getElementById('precoProduto').value) || 0;
        const desc = parseFloat(document.getElementById('descProduto').value) || 0;

        if (!selectProduto.value || qtd <= 0 || preco <= 0) {
            this.toast.warning('Selecione um produto, quantidade e preço');
            return;
        }

        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const produto = produtos.find(p => p.id === parseInt(selectProduto.value));
        if (!produto) {
            this.toast.error('Produto não encontrado');
            return;
        }

        // Verificar estoque
        if (qtd > produto.estoque) {
            this.toast.warning(`Estoque insuficiente! Disponível: ${produto.estoque}`);
            return;
        }

        const subtotal = (qtd * preco) - desc;

        const tbody = document.getElementById('nfProdutosTable');
        const tr = document.createElement('tr');
        tr.setAttribute('data-produto-id', produto.id);
        tr.setAttribute('data-qtd', qtd);
        tr.innerHTML = `
            <td><strong>${this.escapeHtml(produto.nome)}</strong></td>
            <td>${qtd}</td>
            <td>R$ ${preco.toFixed(2)}</td>
            <td>R$ ${desc.toFixed(2)}</td>
            <td>R$ ${subtotal.toFixed(2)}</td>
            <td><button class="btn-delete" onclick="this.closest('tr').remove(); app.updateNFTotal();">Remover</button></td>
        `;
        tbody.appendChild(tr);

        // Limpar inputs
        selectProduto.value = '';
        document.getElementById('qtdProduto').value = '1';
        document.getElementById('precoProduto').value = '';
        document.getElementById('descProduto').value = '0';

        this.updateNFTotal();
        this.toast.info(`${produto.nome} adicionado à nota`);
    }

    updateNFTotal() {
        const tbody = document.getElementById('nfProdutosTable');
        let subtotal = 0;

        tbody.querySelectorAll('tr').forEach(tr => {
            const subtotalCell = tr.querySelector('td:nth-child(5)');
            if (subtotalCell) {
                const valor = parseFloat(subtotalCell.textContent.replace('R$ ', '').replace(',', '.')) || 0;
                subtotal += valor;
            }
        });

        const descontoGeral = parseFloat(document.getElementById('nfDescontoGeral').value) || 0;
        const desconto = (subtotal * descontoGeral) / 100;
        const total = subtotal - desconto;

        document.getElementById('nfSubtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
        document.getElementById('nfTotal').textContent = `R$ ${total.toFixed(2)}`;
    }

    emitNF() {
        const cliente = {
            nome: document.getElementById('clienteNome').value.trim(),
            cpf: document.getElementById('clienteCPF').value.trim(),
            telefone: document.getElementById('clienteTel').value.trim(),
            email: document.getElementById('clienteEmail').value.trim(),
            endereco: document.getElementById('clienteEndereco').value.trim(),
            cidade: document.getElementById('clienteCidade').value.trim(),
            uf: document.getElementById('clienteUF').value
        };

        if (!cliente.nome) {
            this.toast.warning('Preencha o nome do cliente');
            return;
        }
        if (!cliente.cpf) {
            this.toast.warning('Preencha o CPF/CNPJ do cliente');
            return;
        }

        const tbody = document.getElementById('nfProdutosTable');
        if (tbody.children.length === 0) {
            this.toast.warning('Adicione pelo menos um produto');
            return;
        }

        const formaPagamento = document.getElementById('nfFormaPagamento').value;
        if (!formaPagamento) {
            this.toast.warning('Selecione a forma de pagamento');
            return;
        }

        const subtotal = parseFloat(document.getElementById('nfSubtotal').textContent.replace('R$ ', '')) || 0;
        const total = parseFloat(document.getElementById('nfTotal').textContent.replace('R$ ', '')) || 0;
        const descontoGeral = parseFloat(document.getElementById('nfDescontoGeral').value) || 0;
        const observacoes = document.getElementById('nfObservacoes').value.trim();

        // Coletar produtos da tabela
        const nfProdutos = [];
        tbody.querySelectorAll('tr').forEach(tr => {
            const cells = tr.querySelectorAll('td');
            nfProdutos.push({
                produtoId: tr.getAttribute('data-produto-id'),
                nome: cells[0]?.textContent,
                qtd: parseInt(cells[1]?.textContent) || 0,
                precoUnit: parseFloat(cells[2]?.textContent.replace('R$ ', '')) || 0,
                desconto: parseFloat(cells[3]?.textContent.replace('R$ ', '')) || 0,
                subtotal: parseFloat(cells[4]?.textContent.replace('R$ ', '')) || 0
            });
        });

        // Atualizar estoque
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        nfProdutos.forEach(nfp => {
            const prod = produtos.find(p => p.id === parseInt(nfp.produtoId));
            if (prod) {
                prod.estoque = Math.max(0, prod.estoque - nfp.qtd);
            }
        });
        localStorage.setItem('produtos', JSON.stringify(produtos));

        // Criar NF
        const nfNumber = (JSON.parse(localStorage.getItem('notasFiscais')) || []).length + 1;
        const nf = {
            numero: nfNumber,
            id: Date.now(),
            data: new Date().toLocaleDateString('pt-BR'),
            dataISO: new Date().toISOString(),
            cliente,
            subtotal,
            descontoGeral,
            total,
            formaPagamento,
            observacoes,
            produtos: nfProdutos
        };

        // Salvar NF
        const notasFiscais = JSON.parse(localStorage.getItem('notasFiscais')) || [];
        notasFiscais.push(nf);
        localStorage.setItem('notasFiscais', JSON.stringify(notasFiscais));

        // Salvar venda no financeiro
        const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
        vendas.push({
            data: nf.data,
            dataISO: nf.dataISO,
            nf: nf.numero,
            cliente: nf.cliente.nome,
            subtotal: nf.subtotal,
            desconto: (nf.subtotal * nf.descontoGeral) / 100,
            valor: nf.total,
            formaPagamento: nf.formaPagamento
        });
        localStorage.setItem('vendas', JSON.stringify(vendas));

        // Log
        this.activity.log(`NF #${nf.numero} emitida para <strong>${cliente.nome}</strong> — R$ ${total.toFixed(2)}`, 'sale');
        this.toast.success(`Nota Fiscal #${nf.numero} emitida com sucesso!`);
        this.clearNF();
        this.populateProductSelect();
    }

    clearNF() {
        document.getElementById('clienteNome').value = '';
        document.getElementById('clienteCPF').value = '';
        document.getElementById('clienteTel').value = '';
        document.getElementById('clienteEmail').value = '';
        document.getElementById('clienteEndereco').value = '';
        document.getElementById('clienteCidade').value = '';
        document.getElementById('clienteUF').value = '';
        document.getElementById('nfDescontoGeral').value = '0';
        document.getElementById('nfFormaPagamento').value = '';
        document.getElementById('nfObservacoes').value = '';
        document.getElementById('nfProdutosTable').innerHTML = '';
        this.updateNFTotal();
    }

    /* =============================================
       NOTAS FISCAIS (consulta)
       ============================================= */

    loadNotas() {
        const notas = JSON.parse(localStorage.getItem('notasFiscais')) || [];
        const tbody = document.getElementById('notasTable');
        const searchTerm = document.getElementById('searchNotas')?.value.toLowerCase() || '';
        const filterData = document.getElementById('filterDataNotas')?.value || '';

        let filtered = notas;

        if (searchTerm) {
            filtered = filtered.filter(nf =>
                nf.cliente.nome.toLowerCase().includes(searchTerm) ||
                String(nf.numero).includes(searchTerm) ||
                (nf.cliente.cpf && nf.cliente.cpf.includes(searchTerm))
            );
        }

        if (filterData) {
            const filterDate = new Date(filterData).toLocaleDateString('pt-BR');
            filtered = filtered.filter(nf => nf.data === filterDate);
        }

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="8">Nenhuma nota fiscal encontrada</td></tr>';
            return;
        }

        const pagamentoLabels = {
            'dinheiro': '💵 Dinheiro',
            'pix': '📱 Pix',
            'cartao_credito': '💳 Crédito',
            'cartao_debito': '💳 Débito',
            'boleto': '📄 Boleto',
            'transferencia': '🏦 Transf.'
        };

        tbody.innerHTML = filtered.map(nf => `
            <tr>
                <td><strong>#${nf.numero}</strong></td>
                <td>${nf.data}</td>
                <td>${this.escapeHtml(nf.cliente.nome)}</td>
                <td>${nf.cliente.cpf || '-'}</td>
                <td><strong>R$ ${nf.total.toFixed(2)}</strong></td>
                <td>${pagamentoLabels[nf.formaPagamento] || nf.formaPagamento}</td>
                <td><span class="status-badge emitida">Emitida</span></td>
                <td>
                    <div class="td-actions">
                        <button class="btn-view" onclick="app.viewNF(${nf.id})">Visualizar</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    viewNF(id) {
        const notas = JSON.parse(localStorage.getItem('notasFiscais')) || [];
        const nf = notas.find(n => n.id === id);
        if (!nf) return;

        const pagamentoLabels = {
            'dinheiro': '💵 Dinheiro',
            'pix': '📱 Pix',
            'cartao_credito': '💳 Cartão de Crédito',
            'cartao_debito': '💳 Cartão de Débito',
            'boleto': '📄 Boleto',
            'transferencia': '🏦 Transferência'
        };

        let produtosHTML = '';
        if (nf.produtos && nf.produtos.length > 0) {
            produtosHTML = `
                <h4 style="margin: 1.5rem 0 0.75rem; color: var(--gold-400);">📦 Produtos</h4>
                <table class="data-table" style="margin-bottom: 1rem;">
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Qtd</th>
                            <th>Unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${nf.produtos.map(p => `
                            <tr>
                                <td>${p.nome}</td>
                                <td>${p.qtd}</td>
                                <td>R$ ${p.precoUnit?.toFixed(2) || '0.00'}</td>
                                <td>R$ ${p.subtotal?.toFixed(2) || '0.00'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        this.modal.open(
            `Nota Fiscal #${nf.numero}`,
            `
            <div style="display: flex; flex-direction: column; gap: 0;">
                <h4 style="margin-bottom: 0.75rem; color: var(--gold-400);">👤 Cliente</h4>
                <div class="nf-detail-row">
                    <span class="nf-detail-label">Nome</span>
                    <span class="nf-detail-value">${this.escapeHtml(nf.cliente.nome)}</span>
                </div>
                <div class="nf-detail-row">
                    <span class="nf-detail-label">CPF/CNPJ</span>
                    <span class="nf-detail-value">${nf.cliente.cpf || '-'}</span>
                </div>
                <div class="nf-detail-row">
                    <span class="nf-detail-label">Telefone</span>
                    <span class="nf-detail-value">${nf.cliente.telefone || '-'}</span>
                </div>
                <div class="nf-detail-row">
                    <span class="nf-detail-label">E-mail</span>
                    <span class="nf-detail-value">${nf.cliente.email || '-'}</span>
                </div>
                <div class="nf-detail-row">
                    <span class="nf-detail-label">Endereço</span>
                    <span class="nf-detail-value">${nf.cliente.endereco || '-'} — ${nf.cliente.cidade || ''} ${nf.cliente.uf || ''}</span>
                </div>

                ${produtosHTML}

                <h4 style="margin: 1.5rem 0 0.75rem; color: var(--gold-400);">💳 Pagamento</h4>
                <div class="nf-detail-row">
                    <span class="nf-detail-label">Data</span>
                    <span class="nf-detail-value">${nf.data}</span>
                </div>
                <div class="nf-detail-row">
                    <span class="nf-detail-label">Forma de Pagamento</span>
                    <span class="nf-detail-value">${pagamentoLabels[nf.formaPagamento] || nf.formaPagamento}</span>
                </div>
                <div class="nf-detail-row">
                    <span class="nf-detail-label">Subtotal</span>
                    <span class="nf-detail-value">R$ ${(nf.subtotal || nf.total).toFixed(2)}</span>
                </div>
                <div class="nf-detail-row">
                    <span class="nf-detail-label">Desconto</span>
                    <span class="nf-detail-value">${nf.descontoGeral || 0}%</span>
                </div>
                <div class="nf-detail-row" style="border-bottom: none;">
                    <span class="nf-detail-label" style="font-size: 1rem;">Total</span>
                    <span class="nf-detail-total">R$ ${nf.total.toFixed(2)}</span>
                </div>
                ${nf.observacoes ? `
                    <div style="margin-top: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: var(--r-md); border: 1px solid var(--border-color);">
                        <strong style="color: var(--text-secondary); font-size: 0.8125rem;">Observações:</strong>
                        <p style="color: var(--text-primary); margin-top: 0.5rem; font-size: 0.875rem;">${this.escapeHtml(nf.observacoes)}</p>
                    </div>
                ` : ''}
            </div>
            `,
            `<button class="btn-secondary" onclick="app.modal.close()">Fechar</button>
             <button class="btn-primary" onclick="window.print()">🖨️ Imprimir</button>`
        );
    }

    /* =============================================
       CONTROLE DE ESTOQUE
       ============================================= */

    loadEstoque() {
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const filter = document.getElementById('filterEstoque')?.value || 'todos';
        const search = document.getElementById('searchEstoque')?.value.toLowerCase() || '';
        const tbody = document.getElementById('estoqueTable');

        let filtered = produtos;

        if (search) {
            filtered = filtered.filter(p => p.nome.toLowerCase().includes(search));
        }

        if (filter === 'baixo') {
            filtered = filtered.filter(p => p.estoque <= p.estoque_minimo);
        } else if (filter === 'critico') {
            filtered = filtered.filter(p => p.estoque < p.estoque_minimo * 0.5);
        }

        // Atualizar contadores
        let normalCount = 0, baixoCount = 0, criticoCount = 0;
        produtos.forEach(p => {
            if (p.estoque < p.estoque_minimo * 0.5) criticoCount++;
            else if (p.estoque <= p.estoque_minimo) baixoCount++;
            else normalCount++;
        });

        document.getElementById('estoqueNormal').textContent = normalCount;
        document.getElementById('estoqueBaixo').textContent = baixoCount;
        document.getElementById('estoqueCritico').textContent = criticoCount;

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Nenhum produto encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(p => {
            let status = 'Normal';
            let statusClass = 'status-normal';
            if (p.estoque < p.estoque_minimo * 0.5) {
                status = 'Crítico';
                statusClass = 'status-critico';
            } else if (p.estoque <= p.estoque_minimo) {
                status = 'Baixo';
                statusClass = 'status-baixo';
            }

            return `
                <tr>
                    <td><strong>${this.escapeHtml(p.nome)}</strong></td>
                    <td>${p.estoque}</td>
                    <td>${p.estoque_minimo}</td>
                    <td><span class="${statusClass}">${status}</span></td>
                    <td>
                        <button class="btn-adjust" onclick="app.adjustStock(${p.id})">Ajustar</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    adjustStock(id) {
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const produto = produtos.find(p => p.id === id);
        if (!produto) return;

        this.modal.open(
            `Ajustar Estoque — ${produto.nome}`,
            `
            <div>
                <div class="nf-detail-row">
                    <span class="nf-detail-label">Estoque Atual</span>
                    <span class="nf-detail-value" style="font-size: 1.25rem; font-weight: 700;">${produto.estoque}</span>
                </div>
                <div class="nf-detail-row">
                    <span class="nf-detail-label">Estoque Mínimo</span>
                    <span class="nf-detail-value">${produto.estoque_minimo}</span>
                </div>
                <div class="modal-form-group" style="margin-top: 1.5rem;">
                    <label for="novoEstoque">Nova Quantidade</label>
                    <input type="number" id="novoEstoque" value="${produto.estoque}" min="0" autofocus>
                </div>
            </div>
            `,
            `<button class="btn-secondary" onclick="app.modal.close()">Cancelar</button>
             <button class="btn-primary" onclick="app.confirmAdjustStock(${id})">Confirmar</button>`
        );

        // Focar no input
        setTimeout(() => {
            document.getElementById('novoEstoque')?.focus();
            document.getElementById('novoEstoque')?.select();
        }, 300);
    }

    confirmAdjustStock(id) {
        const novoEstoque = parseInt(document.getElementById('novoEstoque').value);
        if (isNaN(novoEstoque) || novoEstoque < 0) {
            this.toast.warning('Informe uma quantidade válida');
            return;
        }

        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const produto = produtos.find(p => p.id === id);
        if (!produto) return;

        const antigo = produto.estoque;
        produto.estoque = novoEstoque;
        localStorage.setItem('produtos', JSON.stringify(produtos));

        this.modal.close();
        this.toast.success(`Estoque de "${produto.nome}" atualizado: ${antigo} → ${novoEstoque}`);
        this.activity.log(`Estoque de <strong>${produto.nome}</strong> ajustado: ${antigo} → ${novoEstoque}`, 'stock');
        this.loadEstoque();
    }

    /* =============================================
       FINANCEIRO
       ============================================= */

    loadFinanceiro() {
        const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
        const filterDias = document.getElementById('filterFinanceiro')?.value || 'todos';

        let filtered = vendas;

        if (filterDias !== 'todos') {
            const dias = parseInt(filterDias);
            const limite = new Date();
            limite.setDate(limite.getDate() - dias);
            filtered = vendas.filter(v => {
                const dataVenda = v.dataISO ? new Date(v.dataISO) : this.parseBRDate(v.data);
                return dataVenda >= limite;
            });
        }

        let subtotal = 0;
        let descontos = 0;

        filtered.forEach(v => {
            subtotal += v.subtotal || v.valor;
            descontos += v.desconto || 0;
        });

        const total = subtotal - descontos;

        document.getElementById('finSubtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
        document.getElementById('finDescontos').textContent = `R$ ${descontos.toFixed(2)}`;
        document.getElementById('finTotal').textContent = `R$ ${total.toFixed(2)}`;

        // Tabela
        const tbody = document.getElementById('financeiroTable');
        const pagamentoLabels = {
            'dinheiro': '💵 Dinheiro',
            'pix': '📱 Pix',
            'cartao_credito': '💳 Crédito',
            'cartao_debito': '💳 Débito',
            'boleto': '📄 Boleto',
            'transferencia': '🏦 Transf.'
        };

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Nenhuma venda registrada</td></tr>';
        } else {
            tbody.innerHTML = filtered.map(v => `
                <tr>
                    <td>${v.data}</td>
                    <td><strong>#${v.nf}</strong></td>
                    <td>${this.escapeHtml(v.cliente)}</td>
                    <td><strong>R$ ${v.valor.toFixed(2)}</strong></td>
                    <td>${pagamentoLabels[v.formaPagamento] || v.formaPagamento}</td>
                </tr>
            `).join('');
        }

        // Gráfico financeiro
        this.drawFinanceChart(filtered);
    }

    drawFinanceChart(vendas) {
        // Agrupar por dia (últimos 7 dias)
        const labels = [];
        const data = [];
        const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('pt-BR');
            labels.push(diasNomes[date.getDay()]);

            const totalDia = vendas
                .filter(v => v.data === dateStr)
                .reduce((sum, v) => sum + v.valor, 0);

            data.push(totalDia);
        }

        SimpleChart.drawBar('financeChart', labels, data, '#22c55e');
    }

    parseBRDate(dateStr) {
        const [day, month, year] = dateStr.split('/');
        return new Date(year, month - 1, day);
    }

    /* =============================================
       DASHBOARD
       ============================================= */

    updateDashboard() {
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const notas = JSON.parse(localStorage.getItem('notasFiscais')) || [];
        const vendas = JSON.parse(localStorage.getItem('vendas')) || [];

        let estoqueBaixo = 0;
        let faturamento = 0;

        produtos.forEach(p => {
            if (p.estoque <= p.estoque_minimo) estoqueBaixo++;
        });

        vendas.forEach(v => {
            faturamento += v.valor;
        });

        // Animar contadores
        this.animateValue('statProdutos', produtos.length);
        this.animateValue('statNotas', notas.length);
        this.animateValue('statEstoqueBaixo', estoqueBaixo);
        document.getElementById('statFaturamento').textContent = `R$ ${faturamento.toFixed(2)}`;

        // Gráfico de vendas
        this.drawSalesChart(vendas);

        // Atividades recentes
        this.renderActivities();
    }

    animateValue(elementId, endValue) {
        const el = document.getElementById(elementId);
        if (!el) return;

        const start = parseInt(el.textContent) || 0;
        if (start === endValue) { el.textContent = endValue; return; }

        const duration = 600;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = Math.round(start + (endValue - start) * eased);
            el.textContent = current;
            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    drawSalesChart(vendas) {
        const labels = [];
        const data = [];
        const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('pt-BR');
            labels.push(diasNomes[date.getDay()]);

            const totalDia = vendas
                .filter(v => v.data === dateStr)
                .reduce((sum, v) => sum + v.valor, 0);

            data.push(totalDia);
        }

        SimpleChart.drawBar('salesChart', labels, data);
    }

    renderActivities() {
        const activities = this.activity.getRecent(8);
        const list = document.getElementById('activityList');

        if (activities.length === 0) {
            list.innerHTML = '<div class="activity-empty"><p>Nenhuma atividade registrada</p></div>';
            return;
        }

        const dotColors = {
            'create': 'green',
            'edit': 'blue',
            'sale': 'gold',
            'delete': 'red',
            'stock': 'blue',
            'info': 'blue'
        };

        list.innerHTML = activities.map(a => `
            <div class="activity-item">
                <div class="activity-dot ${dotColors[a.type] || 'blue'}"></div>
                <span class="activity-text">${a.text}</span>
                <span class="activity-time">${this.activity.formatTime(a.time)}</span>
            </div>
        `).join('');
    }

    /* =============================================
       USUÁRIO / ADMINISTRADOR
       ============================================= */

    loadUserPage() {
        const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        const notas = JSON.parse(localStorage.getItem('notasFiscais')) || [];

        document.getElementById('userEmail').value = usuario.email || '';
        document.getElementById('sysInfoProdutos').textContent = produtos.length;
        document.getElementById('sysInfoNotas').textContent = notas.length;
    }

    saveUserData() {
        const email = document.getElementById('userEmail').value.trim();
        const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
        usuario.email = email;
        localStorage.setItem('usuario', JSON.stringify(usuario));
        this.toast.success('Dados salvos com sucesso!');
    }

    changePassword() {
        const senhaAtual = document.getElementById('senhaAtual').value;
        const senhaNova = document.getElementById('senhaNova').value;
        const senhaConfirm = document.getElementById('senhaConfirm').value;

        if (!senhaAtual || !senhaNova || !senhaConfirm) {
            this.toast.warning('Preencha todos os campos');
            return;
        }

        // Verificar senha atual (dinâmica)
        const storedPassword = localStorage.getItem('userPassword') || 'reis2024';
        if (senhaAtual !== storedPassword) {
            this.toast.error('Senha atual incorreta');
            return;
        }

        if (senhaNova !== senhaConfirm) {
            this.toast.error('As senhas não conferem');
            return;
        }

        if (senhaNova.length < 6) {
            this.toast.warning('A nova senha deve ter pelo menos 6 caracteres');
            return;
        }

        // Salvar nova senha
        localStorage.setItem('userPassword', senhaNova);

        this.toast.success('Senha alterada com sucesso!');
        this.activity.log('Senha do administrador alterada', 'info');

        // Limpar campos
        document.getElementById('senhaAtual').value = '';
        document.getElementById('senhaNova').value = '';
        document.getElementById('senhaConfirm').value = '';
        document.getElementById('strengthFill').style.width = '0';
        document.getElementById('strengthLabel').textContent = '';
    }

    updatePasswordStrength() {
        const senha = document.getElementById('senhaNova').value;
        const fill = document.getElementById('strengthFill');
        const label = document.getElementById('strengthLabel');

        if (!senha) {
            fill.style.width = '0';
            label.textContent = '';
            return;
        }

        let score = 0;
        if (senha.length >= 6) score++;
        if (senha.length >= 8) score++;
        if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) score++;
        if (/[0-9]/.test(senha)) score++;
        if (/[^a-zA-Z0-9]/.test(senha)) score++;

        const levels = [
            { width: '20%', color: 'var(--error)', text: 'Muito fraca' },
            { width: '40%', color: 'var(--error)', text: 'Fraca' },
            { width: '60%', color: 'var(--warning)', text: 'Razoável' },
            { width: '80%', color: 'var(--gold-400)', text: 'Boa' },
            { width: '100%', color: 'var(--success)', text: 'Forte' }
        ];

        const level = levels[Math.min(score, levels.length - 1)];
        fill.style.width = level.width;
        fill.style.background = level.color;
        label.textContent = level.text;
        label.style.color = level.color;
    }

    /* =============================================
       UTILITÁRIOS
       ============================================= */

    escapeHtml(text) {
        if (!text) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    logout() {
        this.modal.open(
            'Sair do Sistema',
            '<p style="color: var(--text-secondary); line-height: 1.6;">Tem certeza que deseja sair do sistema?</p>',
            `<button class="btn-secondary" onclick="app.modal.close()">Cancelar</button>
             <button class="btn-delete" onclick="app.confirmLogout()" style="padding: 0.75rem 1.5rem;">Sair</button>`
        );
    }

    confirmLogout() {
        sessionStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

// Inicializar aplicação quando DOM estiver pronto
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new DashboardApp();
    window.app = app; // Expõe globalmente para outros scripts
});
