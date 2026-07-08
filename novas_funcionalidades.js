/**
 * Módulos adicionais (Clientes e Fornecedores)
 * Estendem a funcionalidade da DashboardApp
 */

// ==========================================
// CLIENTES
// ==========================================

DashboardApp.prototype.loadClientes = function(searchTerm = '') {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const tbody = document.getElementById('clientesTable');
    
    let filtered = clientes;
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = clientes.filter(c => 
            c.nome.toLowerCase().includes(term) || 
            (c.cpf && c.cpf.includes(term))
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Nenhum cliente encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(c => `
        <tr>
            <td><strong>${this.escapeHtml(c.nome)}</strong></td>
            <td>${c.cpf || '-'}</td>
            <td>${c.telefone || '-'}</td>
            <td>${c.cidade || '-'}/${c.uf || '-'}</td>
            <td>
                <div class="td-actions">
                    <button class="btn-edit" onclick="app.editCliente(${c.id})">Editar</button>
                    <button class="btn-delete" onclick="app.deleteCliente(${c.id})">Excluir</button>
                </div>
            </td>
        </tr>
    `).join('');
};

DashboardApp.prototype.handleClienteSubmit = function(e) {
    e.preventDefault();
    const id = document.getElementById('clienteId').value;
    
    const cliente = {
        id: id ? parseInt(id) : Date.now(),
        nome: document.getElementById('cadClienteNome').value.trim(),
        cpf: document.getElementById('cadClienteCPF').value.trim(),
        telefone: document.getElementById('cadClienteTel').value.trim(),
        email: document.getElementById('cadClienteEmail').value.trim(),
        endereco: document.getElementById('cadClienteEndereco').value.trim(),
        cidade: document.getElementById('cadClienteCidade').value.trim(),
        uf: document.getElementById('cadClienteUF').value,
        observacoes: document.getElementById('cadClienteObs').value.trim()
    };

    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];

    if (id) {
        const index = clientes.findIndex(c => c.id === parseInt(id));
        if (index !== -1) clientes[index] = cliente;
        this.toast.success('Cliente atualizado!');
    } else {
        clientes.push(cliente);
        this.toast.success('Cliente cadastrado!');
    }

    localStorage.setItem('clientes', JSON.stringify(clientes));
    this.resetClienteForm();
    this.loadClientes();
};

DashboardApp.prototype.editCliente = function(id) {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;

    document.getElementById('clienteId').value = cliente.id;
    document.getElementById('cadClienteNome').value = cliente.nome;
    document.getElementById('cadClienteCPF').value = cliente.cpf;
    document.getElementById('cadClienteTel').value = cliente.telefone;
    document.getElementById('cadClienteEmail').value = cliente.email || '';
    document.getElementById('cadClienteEndereco').value = cliente.endereco || '';
    document.getElementById('cadClienteCidade').value = cliente.cidade || '';
    document.getElementById('cadClienteUF').value = cliente.uf || '';
    document.getElementById('cadClienteObs').value = cliente.observacoes || '';

    document.getElementById('clienteFormTitle').textContent = 'Editar Cliente';
    document.getElementById('clienteFormSection').style.display = 'block';
    document.getElementById('clienteFormSection').scrollIntoView({ behavior: 'smooth' });
};

DashboardApp.prototype.deleteCliente = function(id) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        const filtered = clientes.filter(c => c.id !== id);
        localStorage.setItem('clientes', JSON.stringify(filtered));
        this.toast.success('Cliente excluído');
        this.loadClientes();
    }
};

DashboardApp.prototype.resetClienteForm = function() {
    document.getElementById('clienteForm').reset();
    document.getElementById('clienteId').value = '';
    document.getElementById('clienteFormTitle').textContent = 'Cadastrar Novo Cliente';
    document.getElementById('clienteFormSection').style.display = 'none';
};

// ==========================================
// FORNECEDORES
// ==========================================

DashboardApp.prototype.loadFornecedores = function(searchTerm = '') {
    const fornecedores = JSON.parse(localStorage.getItem('fornecedores')) || [];
    const tbody = document.getElementById('fornecedoresTable');
    
    let filtered = fornecedores;
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = fornecedores.filter(f => 
            f.razao_social.toLowerCase().includes(term) || 
            (f.cnpj && f.cnpj.includes(term))
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Nenhum fornecedor encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(f => `
        <tr>
            <td><strong>${this.escapeHtml(f.razao_social)}</strong></td>
            <td>${f.cnpj || '-'}</td>
            <td>${f.contato || '-'}</td>
            <td>${f.telefone || '-'}</td>
            <td>${f.produtos_fornecidos || '-'}</td>
            <td>
                <div class="td-actions">
                    <button class="btn-edit" onclick="app.editFornecedor(${f.id})">Editar</button>
                    <button class="btn-delete" onclick="app.deleteFornecedor(${f.id})">Excluir</button>
                </div>
            </td>
        </tr>
    `).join('');
};

DashboardApp.prototype.handleFornecedorSubmit = function(e) {
    e.preventDefault();
    const id = document.getElementById('fornecedorId').value;
    
    const fornecedor = {
        id: id ? parseInt(id) : Date.now(),
        razao_social: document.getElementById('cadFornRazao').value.trim(),
        cnpj: document.getElementById('cadFornCNPJ').value.trim(),
        contato: document.getElementById('cadFornContato').value.trim(),
        telefone: document.getElementById('cadFornTel').value.trim(),
        email: document.getElementById('cadFornEmail').value.trim(),
        produtos_fornecidos: document.getElementById('cadFornProdutos').value.trim(),
        observacoes: document.getElementById('cadFornObs').value.trim()
    };

    const fornecedores = JSON.parse(localStorage.getItem('fornecedores')) || [];

    if (id) {
        const index = fornecedores.findIndex(f => f.id === parseInt(id));
        if (index !== -1) fornecedores[index] = fornecedor;
        this.toast.success('Fornecedor atualizado!');
    } else {
        fornecedores.push(fornecedor);
        this.toast.success('Fornecedor cadastrado!');
    }

    localStorage.setItem('fornecedores', JSON.stringify(fornecedores));
    this.resetFornecedorForm();
    this.loadFornecedores();
};

DashboardApp.prototype.editFornecedor = function(id) {
    const fornecedores = JSON.parse(localStorage.getItem('fornecedores')) || [];
    const f = fornecedores.find(c => c.id === id);
    if (!f) return;

    document.getElementById('fornecedorId').value = f.id;
    document.getElementById('cadFornRazao').value = f.razao_social;
    document.getElementById('cadFornCNPJ').value = f.cnpj;
    document.getElementById('cadFornContato').value = f.contato || '';
    document.getElementById('cadFornTel').value = f.telefone || '';
    document.getElementById('cadFornEmail').value = f.email || '';
    document.getElementById('cadFornProdutos').value = f.produtos_fornecidos || '';
    document.getElementById('cadFornObs').value = f.observacoes || '';

    document.getElementById('fornecedorFormTitle').textContent = 'Editar Fornecedor';
    document.getElementById('fornecedorFormSection').style.display = 'block';
    document.getElementById('fornecedorFormSection').scrollIntoView({ behavior: 'smooth' });
};

DashboardApp.prototype.deleteFornecedor = function(id) {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
        const fornecedores = JSON.parse(localStorage.getItem('fornecedores')) || [];
        const filtered = fornecedores.filter(f => f.id !== id);
        localStorage.setItem('fornecedores', JSON.stringify(filtered));
        this.toast.success('Fornecedor excluído');
        this.loadFornecedores();
    }
};

DashboardApp.prototype.resetFornecedorForm = function() {
    document.getElementById('fornecedorForm').reset();
    document.getElementById('fornecedorId').value = '';
    document.getElementById('fornecedorFormTitle').textContent = 'Cadastrar Novo Fornecedor';
    document.getElementById('fornecedorFormSection').style.display = 'none';
};

// ==========================================
// EVENT LISTENERS DE INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Delay para garantir que o 'app' foi instanciado no dashboard.js
    setTimeout(() => {
        if (!window.app) return;

        // Máscaras Clientes
        InputMasks.apply('cadClienteCPF', InputMasks.cpfCnpj);
        InputMasks.apply('cadClienteTel', InputMasks.telefone);
        
        // Máscaras Fornecedores
        InputMasks.apply('cadFornCNPJ', InputMasks.cpfCnpj);
        InputMasks.apply('cadFornTel', InputMasks.telefone);

        // Listeners Clientes
        document.getElementById('btnNewCliente')?.addEventListener('click', () => {
            app.resetClienteForm();
            document.getElementById('clienteFormSection').style.display = 'block';
        });
        document.getElementById('btnCancelCliente')?.addEventListener('click', () => app.resetClienteForm());
        document.getElementById('clienteForm')?.addEventListener('submit', (e) => app.handleClienteSubmit(e));
        document.getElementById('searchClientes')?.addEventListener('input', (e) => app.loadClientes(e.target.value));

        // Listeners Fornecedores
        document.getElementById('btnNewFornecedor')?.addEventListener('click', () => {
            app.resetFornecedorForm();
            document.getElementById('fornecedorFormSection').style.display = 'block';
        });
        document.getElementById('btnCancelFornecedor')?.addEventListener('click', () => app.resetFornecedorForm());
        document.getElementById('fornecedorForm')?.addEventListener('submit', (e) => app.handleFornecedorSubmit(e));
        document.getElementById('searchFornecedores')?.addEventListener('input', (e) => app.loadFornecedores(e.target.value));
        
    }, 100);
});

// ==========================================
// EXPORTAÇÃO EXCEL E PDF
// ==========================================

DashboardApp.prototype.exportToExcel = function(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;

    // Use SheetJS to generate Excel
    if (typeof XLSX === 'undefined') {
        this.toast.error('Biblioteca Excel não carregada');
        return;
    }

    const wb = XLSX.utils.table_to_book(table, {sheet: "Planilha 1"});
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    this.toast.success('Excel exportado com sucesso!');
};

DashboardApp.prototype.generateNFPDF = function(nf) {
    if (typeof window.jspdf === 'undefined') {
        this.toast.error('Biblioteca PDF não carregada');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('FERRAGENS REIS', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Nota Fiscal 🛒 #${nf.numero}`, 105, 30, { align: 'center' });
    doc.text(`Data: ${nf.data}`, 105, 38, { align: 'center' });

    // Client Info
    doc.setFontSize(11);
    doc.text(`Cliente: ${nf.cliente.nome}`, 14, 55);
    if (nf.cliente.cpf) doc.text(`CPF/CNPJ: ${nf.cliente.cpf}`, 14, 62);
    
    // Table
    const bodyData = nf.produtos.map(p => [
        p.nome,
        p.qtd.toString(),
        `R$ ${p.precoUnit.toFixed(2)}`,
        `R$ ${p.desconto.toFixed(2)}`,
        `R$ ${p.subtotal.toFixed(2)}`
    ]);

    doc.autoTable({
        startY: 75,
        head: [['Produto', 'Qtd', 'Preço Unit.', 'Desc.', 'Subtotal']],
        body: bodyData,
        theme: 'grid',
        headStyles: { fillColor: [245, 158, 11] } // gold-500
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY || 75;
    doc.text(`Subtotal: R$ ${nf.subtotal.toFixed(2)}`, 140, finalY + 15);
    doc.text(`Desconto: ${nf.descontoGeral}%`, 140, finalY + 22);
    doc.setFontSize(14);
    doc.text(`TOTAL: R$ ${nf.total.toFixed(2)}`, 140, finalY + 32);

    doc.save(`NF_${nf.numero}_${nf.cliente.nome}.pdf`);
    this.toast.success('PDF gerado com sucesso!');
};

DashboardApp.prototype.viewNF = function(id) {
    const notas = JSON.parse(localStorage.getItem('notasFiscais')) || [];
    const nf = notas.find(n => n.id === id);
    if (!nf) {
        this.toast.error('Nota Fiscal não encontrada');
        return;
    }
    
    if (confirm(`Deseja gerar o PDF da Nota Fiscal #${nf.numero}?`)) {
        this.generateNFPDF(nf);
    } else {
        alert(`Detalhes da NF #${nf.numero}:\nCliente: ${nf.cliente.nome}\nTotal: R$ ${nf.total.toFixed(2)}`);
    }
};

// ==========================================
// LEITURA DE CÓDIGO DE BARRAS (Scanner USB)
// ==========================================
let barcodeBuffer = '';
let barcodeTimeout = null;

document.addEventListener('keypress', (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.type === 'date') return;

    if (e.key === 'Enter') {
        if (barcodeBuffer.length > 5) {
            if (window.app) window.app.handleBarcodeScanned(barcodeBuffer);
            barcodeBuffer = '';
            e.preventDefault();
        }
    } else {
        barcodeBuffer += e.key;
        if (barcodeTimeout) clearTimeout(barcodeTimeout);
        barcodeTimeout = setTimeout(() => { barcodeBuffer = ''; }, 50);
    }
});

DashboardApp.prototype.handleBarcodeScanned = function(code) {
    this.toast.info(`Código lido: ${code}`);
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const produto = produtos.find(p => p.id.toString() === code || p.codigo_barras === code);
    
    if (produto) {
        const currentPage = document.querySelector('.page.active');
        if (currentPage && currentPage.id === 'nf-page') {
            const select = document.getElementById('selectProduto');
            if (select) {
                select.value = produto.id;
                document.getElementById('precoProduto').value = produto.precovenda;
                document.getElementById('qtdProduto').value = 1;
                document.getElementById('btnAddProduto').click();
                this.toast.success(`${produto.nome} adicionado à nota!`);
            }
        } else {
            this.toast.success(`Encontrado: ${produto.nome} - Estoque: ${produto.estoque}`);
        }
    } else {
        this.toast.error('Produto não encontrado no sistema.');
    }
};

// ==========================================
// FLUXO DE CAIXA COMPLETO
// ==========================================
DashboardApp.prototype.loadFinanceiro = function(days = 'todos') {
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    const despesas = JSON.parse(localStorage.getItem('despesas')) || [];
    const tbody = document.getElementById('fluxoCaixaTable');
    if (!tbody) return; // Se não carregou a página

    // Merge e ordenar transações por data
    const transacoes = [
        ...vendas.map(v => ({...v, tipo: 'entrada', dataOriginal: v.dataISO || v.data})),
        ...despesas.map(d => ({...d, tipo: 'saida', dataOriginal: d.data}))
    ].sort((a, b) => new Date(b.dataOriginal) - new Date(a.dataOriginal));

    // Filtrar por dias
    let filtered = transacoes;
    if (days !== 'todos') {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - parseInt(days));
        filtered = transacoes.filter(t => new Date(t.dataOriginal) >= cutoff);
    }

    let totalReceitas = 0;
    let totalDespesas = 0;

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Nenhuma transação no período</td></tr>';
    } else {
        tbody.innerHTML = filtered.map(t => {
            if (t.tipo === 'entrada') {
                totalReceitas += t.valor;
                return `
                    <tr>
                        <td>${new Date(t.dataOriginal).toLocaleDateString('pt-BR')}</td>
                        <td><span style="color:var(--success); font-weight:bold;">Entrada</span></td>
                        <td>Venda NF #${t.nf} - ${t.cliente}</td>
                        <td style="color:var(--success)">+ R$ ${t.valor.toFixed(2)}</td>
                        <td>-</td>
                    </tr>
                `;
            } else {
                totalDespesas += t.valor;
                return `
                    <tr>
                        <td>${new Date(t.dataOriginal).toLocaleDateString('pt-BR')}</td>
                        <td><span style="color:var(--error); font-weight:bold;">Saída</span></td>
                        <td>${t.descricao}</td>
                        <td style="color:var(--error)">- R$ ${t.valor.toFixed(2)}</td>
                        <td>
                            <button class="btn-delete" onclick="app.deleteDespesa(${t.id})">Excluir</button>
                        </td>
                    </tr>
                `;
            }
        }).join('');
    }

    const saldo = totalReceitas - totalDespesas;
    
    document.getElementById('finReceitas').textContent = `R$ ${totalReceitas.toFixed(2)}`;
    document.getElementById('finDespesas').textContent = `R$ ${totalDespesas.toFixed(2)}`;
    document.getElementById('finSaldo').textContent = `R$ ${saldo.toFixed(2)}`;
    document.getElementById('finSaldo').style.color = saldo >= 0 ? 'var(--success)' : 'var(--error)';

    this.drawFinanceChart(filtered);
};

DashboardApp.prototype.drawFinanceChart = function(transacoes) {
    const canvas = document.getElementById('financeChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Simples desenho de barras para Receitas x Despesas
    let receitas = 0;
    let despesas = 0;
    transacoes.forEach(t => {
        if (t.tipo === 'entrada') receitas += t.valor;
        if (t.tipo === 'saida') despesas += t.valor;
    });

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 250 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '250px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, 250);
    const maxVal = Math.max(receitas, despesas, 1);
    
    const drawBar = (x, val, color, label) => {
        const height = (val / maxVal) * 150;
        ctx.fillStyle = color;
        ctx.fillRect(x, 200 - height, 60, height);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Inter';
        ctx.fillText(label, x + 5, 220);
        ctx.fillText(`R$ ${val.toFixed(0)}`, x, 190 - height);
    };

    drawBar(rect.width/2 - 100, receitas, '#22c55e', 'Receitas');
    drawBar(rect.width/2 + 40, despesas, '#ef4444', 'Despesas');
};

DashboardApp.prototype.handleDespesaSubmit = function(e) {
    e.preventDefault();
    const despesas = JSON.parse(localStorage.getItem('despesas')) || [];
    
    const despesa = {
        id: Date.now(),
        descricao: document.getElementById('cadDespesaDesc').value.trim(),
        valor: parseFloat(document.getElementById('cadDespesaValor').value),
        data: document.getElementById('cadDespesaData').value
    };

    despesas.push(despesa);
    localStorage.setItem('despesas', JSON.stringify(despesas));
    
    this.toast.success('Despesa registrada!');
    document.getElementById('despesaForm').reset();
    document.getElementById('despesaFormSection').style.display = 'none';
    this.loadFinanceiro(document.getElementById('filterFinanceiro').value);
};

DashboardApp.prototype.deleteDespesa = function(id) {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
        const despesas = JSON.parse(localStorage.getItem('despesas')) || [];
        const filtered = despesas.filter(d => d.id !== id);
        localStorage.setItem('despesas', JSON.stringify(filtered));
        this.toast.success('Despesa excluída');
        this.loadFinanceiro(document.getElementById('filterFinanceiro').value);
    }
};

// Adiciona Listeners de Fluxo de Caixa no DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!window.app) return;
        
        document.getElementById('btnNovaDespesa')?.addEventListener('click', () => {
            document.getElementById('despesaFormSection').style.display = 'block';
            document.getElementById('cadDespesaData').value = new Date().toISOString().split('T')[0];
        });
        document.getElementById('btnCancelDespesa')?.addEventListener('click', () => {
            document.getElementById('despesaFormSection').style.display = 'none';
        });
        document.getElementById('despesaForm')?.addEventListener('submit', (e) => app.handleDespesaSubmit(e));
        document.getElementById('filterFinanceiro')?.addEventListener('change', (e) => app.loadFinanceiro(e.target.value));
    }, 200);
});

// ==========================================
// CONTROLE DE PERMISSÕES E USUÁRIOS
// ==========================================

DashboardApp.prototype.applyRoleRestrictions = function() {
    const usuario = JSON.parse(localStorage.getItem('usuario')) || { username: 'admin', role: 'admin' };
    
    // Atualiza nome/badge na sidebar e na página de usuário
    const roleMap = {
        'admin': 'Administrador',
        'gerente': 'Gerente',
        'caixa': 'Caixa',
        'estoquista': 'Estoquista'
    };
    
    const roleName = roleMap[usuario.role] || 'Administrador';
    document.querySelectorAll('.profile-badge').forEach(b => b.textContent = roleName);
    
    // Mostra/Oculta painel de gerenciamento no Usuário Page
    const adminPanel = document.getElementById('adminUsersSection');
    if (adminPanel) {
        adminPanel.style.display = usuario.role === 'admin' ? 'block' : 'none';
        if (usuario.role === 'admin') this.loadUsuarios();
    }

    // Regras de Ocultação de Menus
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const page = link.getAttribute('data-page');
        let allowed = true;

        if (usuario.role === 'caixa') {
            // Caixa só acessa Emissão de NF, Notas Fiscais e Clientes
            if (!['nf', 'notas', 'clientes', 'dashboard', 'usuario'].includes(page)) allowed = false;
        } else if (usuario.role === 'estoquista') {
            // Estoquista só acessa Produtos, Estoque, Fornecedores
            if (!['produtos', 'estoque', 'fornecedores', 'dashboard', 'usuario'].includes(page)) allowed = false;
        } else if (usuario.role === 'gerente') {
            // Gerente acessa tudo
            allowed = true;
        }

        if (!allowed) {
            link.parentElement.style.display = 'none';
        } else {
            link.parentElement.style.display = 'block';
        }
    });

    // Patch no showPage para bloquear acesso forçado
    const originalShowPage = this.showPage;
    this.showPage = function(pageId) {
        let allowed = true;
        if (usuario.role === 'caixa' && !['nf', 'notas', 'clientes', 'dashboard', 'usuario'].includes(pageId)) allowed = false;
        if (usuario.role === 'estoquista' && !['produtos', 'estoque', 'fornecedores', 'dashboard', 'usuario'].includes(pageId)) allowed = false;

        if (!allowed) {
            this.toast.error('Acesso Negado: Seu perfil não tem permissão.');
            return;
        }
        originalShowPage.call(this, pageId);
    };
};

DashboardApp.prototype.loadUsuarios = function() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
        { id: 1, username: 'admin', nome: 'Administrador', role: 'admin' }
    ];
    // Salvar o admin padrão se for a primeira vez
    if (!localStorage.getItem('usuarios')) localStorage.setItem('usuarios', JSON.stringify(usuarios));

    const tbody = document.getElementById('usuariosTable');
    if (!tbody) return;

    tbody.innerHTML = usuarios.map(u => `
        <tr>
            <td><strong>${u.username}</strong></td>
            <td>${u.nome}</td>
            <td><span class="profile-badge">${u.role}</span></td>
            <td>
                ${u.username === 'admin' ? '-' : `
                    <button class="btn-delete" onclick="app.deleteUsuario(${u.id})">Excluir</button>
                `}
            </td>
        </tr>
    `).join('');
};

DashboardApp.prototype.showNewUserModal = function() {
    const username = prompt('Nome de usuário (login):');
    if (!username) return;
    const nome = prompt('Nome completo:');
    if (!nome) return;
    const password = prompt('Senha (padrão: 123456):') || '123456';
    const rolePrompt = prompt('Perfil (admin, gerente, caixa, estoquista):');
    const role = rolePrompt ? rolePrompt.toLowerCase() : 'caixa';
    
    if (!['admin', 'gerente', 'caixa', 'estoquista'].includes(role)) {
        this.toast.error('Perfil inválido!');
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    if (usuarios.find(u => u.username === username)) {
        this.toast.error('Usuário já existe!');
        return;
    }

    usuarios.push({
        id: Date.now(),
        username,
        nome,
        password,
        role
    });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    this.toast.success('Usuário criado com sucesso!');
    this.loadUsuarios();
};

DashboardApp.prototype.deleteUsuario = function(id) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const index = usuarios.findIndex(u => u.id === id);
    if (index === -1) return;
    
    if (usuarios[index].username === 'admin') {
        this.toast.error('O Administrador principal não pode ser excluído.');
        return;
    }

    if (confirm(`Deseja excluir o usuário ${usuarios[index].username}?`)) {
        usuarios.splice(index, 1);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        this.toast.success('Usuário excluído.');
        this.loadUsuarios();
    }
};

// Executar após carregar
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.app) window.app.applyRoleRestrictions();
    }, 300);
});

// ==========================================
// PRODUTOS MAIS VENDIDOS & ALERTAS
// ==========================================

DashboardApp.prototype.updateTopProdutos = function() {
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    const produtoVendas = {};

    vendas.forEach(v => {
        if (!v.produtos) return;
        v.produtos.forEach(p => {
            if (!produtoVendas[p.nome]) {
                produtoVendas[p.nome] = { qtd: 0, faturamento: 0 };
            }
            produtoVendas[p.nome].qtd += parseInt(p.qtd);
            produtoVendas[p.nome].faturamento += parseFloat(p.subtotal);
        });
    });

    const topProdutos = Object.keys(produtoVendas)
        .map(nome => ({ nome, ...produtoVendas[nome] }))
        .sort((a, b) => b.qtd - a.qtd)
        .slice(0, 5); // Top 5

    const tbody = document.getElementById('topProdutosTable');
    if (tbody) {
        if (topProdutos.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="3">Nenhuma venda registrada</td></tr>';
        } else {
            tbody.innerHTML = topProdutos.map(p => `
                <tr>
                    <td><strong>${p.nome}</strong></td>
                    <td>${p.qtd} un.</td>
                    <td style="color:var(--success)">R$ ${p.faturamento.toFixed(2)}</td>
                </tr>
            `).join('');
        }
    }
};

DashboardApp.prototype.checkEstoqueAlertas = function() {
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const settings = JSON.parse(localStorage.getItem('sys_settings')) || { notificacoes: true };
    
    if (!settings.notificacoes) return;

    let alertasExibidos = JSON.parse(sessionStorage.getItem('alertasExibidos')) || [];

    produtos.forEach(p => {
        if (p.estoque <= p.estoqueminimo && !alertasExibidos.includes(p.id)) {
            setTimeout(() => {
                if(this.toast) this.toast.warning(`Estoque baixo: ${p.nome} (${p.estoque} un)`);
            }, 1000);
            alertasExibidos.push(p.id);
        }
    });

    sessionStorage.setItem('alertasExibidos', JSON.stringify(alertasExibidos));
};

// Hooks no ciclo de vida
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.app) {
            // Hook para atualizar top produtos sempre que o dashboard for atualizado
            const originalUpdateDashboard = window.app.updateDashboard;
            window.app.updateDashboard = function() {
                originalUpdateDashboard.call(this);
                this.updateTopProdutos();
                this.checkEstoqueAlertas();
            };
            
            // Força execução inicial se estiver no dashboard
            if (document.getElementById('dashboard-page') && document.getElementById('dashboard-page').classList.contains('active')) {
                window.app.updateTopProdutos();
                window.app.checkEstoqueAlertas();
            }
        }
    }, 500);
});

// ==========================================
// HISTÓRICO DE ESTOQUE E PESQUISA AVANÇADA
// ==========================================

DashboardApp.prototype.loadHistoricoEstoque = function() {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    // Filtra apenas atividades relacionadas a estoque ou venda de produtos
    const estoqueActs = activities.filter(a => a.action === 'estoque' || a.action === 'venda');
    
    const tbody = document.getElementById('historicoEstoqueTable');
    if (!tbody) return;

    if (estoqueActs.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="3">Nenhum registro encontrado</td></tr>';
    } else {
        tbody.innerHTML = estoqueActs.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 50).map(a => `
            <tr>
                <td>${new Date(a.date).toLocaleString('pt-BR')}</td>
                <td><span class="profile-badge" style="background:var(--${a.action === 'venda' ? 'success' : 'primary'})">${a.action.toUpperCase()}</span></td>
                <td>${a.description}</td>
            </tr>
        `).join('');
    }
};

window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.app) {
            const originalLoadEstoque = window.app.loadEstoque;
            window.app.loadEstoque = function() {
                originalLoadEstoque.call(this);
                this.loadHistoricoEstoque();
            };
            if (document.getElementById('estoque-page') && document.getElementById('estoque-page').classList.contains('active')) {
                window.app.loadHistoricoEstoque();
            }
        }
    }, 500);
});

// ==========================================
// CADASTRO DE PRODUTO (NOVO LAYOUT)
// ==========================================

DashboardApp.prototype.handleProductSubmit = function(e) {
    e.preventDefault();

    const editId = document.getElementById('produtoId').value;
    const formData = new FormData(document.getElementById('produtoForm'));

    const produto = {
        id: editId ? parseInt(editId) : Date.now(),
        nome: formData.get('nome')?.trim(),
        codigo_barras: formData.get('codigo_barras')?.trim() || '',
        categoria: formData.get('categoria'),
        unidade: formData.get('unidade'),
        fornecedor: formData.get('fornecedor'),
        custoPor: parseFloat(formData.get('custo')),
        precovenda: parseFloat(formData.get('precovenda')),
        margem: this.calculateMarginPercent(
            parseFloat(formData.get('custo')),
            parseFloat(formData.get('precovenda'))
        ),
        estoque: parseInt(formData.get('estoque')),
        estoque_minimo: parseInt(formData.get('estoque_minimo')),
        descricao: formData.get('descricao')?.trim(),
        imagemBase64: document.getElementById('produtoImagemBase64').value || ''
    };

    if (!produto.nome || !produto.unidade || isNaN(produto.custoPor) || isNaN(produto.precovenda)) {
        this.toast.warning('Por favor, preencha todos os campos obrigatórios');
        return;
    }

    if (produto.precovenda < produto.custoPor) {
        this.toast.warning('Aviso: O preço de venda está abaixo do custo!');
    }

    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];

    if (editId) {
        const index = produtos.findIndex(p => p.id === parseInt(editId));
        if (index !== -1) {
            produtos[index] = produto;
            this.toast.success(`Produto "${produto.nome}" atualizado com sucesso!`);
        }
    } else {
        produtos.push(produto);
        this.toast.success(`Produto "${produto.nome}" cadastrado com sucesso!`);
    }

    localStorage.setItem('produtos', JSON.stringify(produtos));

    document.getElementById('produtoForm').reset();
    document.getElementById('produtoId').value = '';
    document.getElementById('produtoImagemBase64').value = '';
    
    const imgPreview = document.getElementById('produtoImagemPreview');
    const imgText = document.getElementById('produtoImagemText');
    if(imgPreview && imgText) {
        imgPreview.style.display = 'none';
        imgPreview.src = '';
        imgText.style.display = 'block';
    }
    
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
};

DashboardApp.prototype.editProduct = function(id) {
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const produto = produtos.find(p => p.id === id);

    if (!produto) return;

    document.getElementById('produtoId').value = produto.id;
    document.getElementById('produtoNome').value = produto.nome;
    document.getElementById('produtoCodigoBarras').value = produto.codigo_barras || '';
    document.getElementById('produtoCategoria').value = produto.categoria || '';
    document.getElementById('produtoUnidade').value = produto.unidade;
    document.getElementById('produtoFornecedor').value = produto.fornecedor || '';
    document.getElementById('produtoCusto').value = produto.custoPor || produto.custo || 0;
    document.getElementById('produtoVenda').value = produto.precovenda;
    document.getElementById('produtoEstoque').value = produto.estoque;
    document.getElementById('produtoEstoqueMin').value = produto.estoque_minimo || 0;
    document.getElementById('produtoDescricao').value = produto.descricao || '';
    
    const imgPreview = document.getElementById('produtoImagemPreview');
    const imgText = document.getElementById('produtoImagemText');
    if (produto.imagemBase64 && imgPreview) {
        imgPreview.src = produto.imagemBase64;
        imgPreview.style.display = 'block';
        if(imgText) imgText.style.display = 'none';
        document.getElementById('produtoImagemBase64').value = produto.imagemBase64;
    } else if(imgPreview) {
        imgPreview.src = '';
        imgPreview.style.display = 'none';
        if(imgText) imgText.style.display = 'block';
        document.getElementById('produtoImagemBase64').value = '';
    }

    const margemEvent = new Event('input');
    document.getElementById('produtoCusto').dispatchEvent(margemEvent);

    document.getElementById('productFormTitle').textContent = `Editar Produto: ${produto.nome}`;
    document.getElementById('btnSaveProduto').innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Salvar Alterações
    `;
    document.getElementById('btnCancelEdit').style.display = 'inline-flex';
    document.getElementById('productFormSection').scrollIntoView({ behavior: 'smooth' });
};

DashboardApp.prototype.populateFornecedoresSelect = function() {
    const select = document.getElementById('produtoFornecedor');
    if(!select) return;
    const fornecedores = JSON.parse(localStorage.getItem('fornecedores')) || [];
    
    let options = '<option value="">Selecione o Fornecedor</option>';
    fornecedores.forEach(f => {
        options += `<option value="${f.nome}">${f.nome}</option>`;
    });
    // Salvar o valor atual se estiver editando
    const currentValue = select.value;
    select.innerHTML = options;
    if(currentValue) select.value = currentValue;
};

window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.app) return;

        const origShowPage = window.app.showPage;
        window.app.showPage = function(pageId) {
            origShowPage.call(this, pageId);
            if(pageId === 'produtos') {
                this.populateFornecedoresSelect();
            }
        };

        const inputCusto = document.getElementById('produtoCusto');
        const inputVenda = document.getElementById('produtoVenda');
        const inputMargem = document.getElementById('produtoMargem');

        const updateMargem = () => {
            const custo = parseFloat(inputCusto.value) || 0;
            const venda = parseFloat(inputVenda.value) || 0;
            if (custo > 0) {
                const margem = window.app.calculateMarginPercent(custo, venda);
                inputMargem.value = `${margem.toFixed(2)}%`;
                inputMargem.style.color = margem < 0 ? 'var(--error)' : 'var(--success)';
            } else {
                inputMargem.value = '';
            }
        };

        inputCusto?.addEventListener('input', updateMargem);
        inputVenda?.addEventListener('input', updateMargem);

        const fileInput = document.getElementById('produtoImagem');
        const imgPreview = document.getElementById('produtoImagemPreview');
        const imgText = document.getElementById('produtoImagemText');
        const base64Input = document.getElementById('produtoImagemBase64');

        if(fileInput) {
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;

                const maxSize = 5 * 1024 * 1024;
                if (file.size > maxSize) {
                    window.app.toast.error('A imagem excede o limite de 5 MB.');
                    this.value = '';
                    return;
                }

                if (!file.type.match('image.*')) {
                    window.app.toast.error('Formato inválido. Use JPG, PNG ou WEBP.');
                    this.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64String = event.target.result;
                    imgPreview.src = base64String;
                    imgPreview.style.display = 'block';
                    imgText.style.display = 'none';
                    base64Input.value = base64String;
                };
                reader.readAsDataURL(file);
            });
        }
    }, 600);
});
