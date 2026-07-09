/**
 * api_sync.js
 * Sincroniza o LocalStorage com o SQLite Backend e intercepta operações de escrita
 */

const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000/api' : (window.location.origin + '/api');

// Interceptadores originais do localStorage
const originalSetItem = localStorage.setItem;

// Função de sincronização inicial
async function syncFromServer() {
    try {
        console.log("Iniciando sincronização com o servidor...");
        const res = await fetch(API_BASE + '/sync');
        if (!res.ok) throw new Error('Erro na sincronização');
        
        const data = await res.json();
        
        // Atualiza localstorage silenciosamente (sem disparar gatilhos)
        originalSetItem.call(localStorage, 'produtos', JSON.stringify(data.produtos || []));
        originalSetItem.call(localStorage, 'clientes', JSON.stringify(data.clientes || []));
        originalSetItem.call(localStorage, 'fornecedores', JSON.stringify(data.fornecedores || []));
        originalSetItem.call(localStorage, 'notasFiscais', JSON.stringify(data.notas || []));
        originalSetItem.call(localStorage, 'vendas', JSON.stringify(data.vendas || []));
        originalSetItem.call(localStorage, 'despesas', JSON.stringify(data.despesas || []));
        originalSetItem.call(localStorage, 'activities', JSON.stringify(data.atividades || []));
        originalSetItem.call(localStorage, 'usuarios', JSON.stringify(data.usuarios || []));
        
        console.log("Sincronização concluída com sucesso.");
    } catch (err) {
        console.error("Falha na sincronização:", err);
    }
}

// Intercepta POST, PUT, DELETE baseando-se nos métodos do App
function setupNetworkOverrides() {
    if (!window.app) return;
    
    // Override handleProductSubmit
    const originalHandleProductSubmit = window.app.handleProductSubmit;
    window.app.handleProductSubmit = async function(e) {
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
            margem: this.calculateMarginPercent(parseFloat(formData.get('custo')), parseFloat(formData.get('precovenda'))),
            estoque: parseInt(formData.get('estoque')),
            estoque_minimo: parseInt(formData.get('estoque_minimo')),
            descricao: formData.get('descricao')?.trim(),
            imagemBase64: document.getElementById('produtoImagemBase64').value || ''
        };

        try {
            if (editId) {
                await fetch(`${API_BASE}/produtos/${editId}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(produto) });
            } else {
                await fetch(`${API_BASE}/produtos`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(produto) });
            }
            // Sincroniza e recarrega
            await syncFromServer();
            originalHandleProductSubmit.call(this, e); // Deixa o local limpar o formulário
        } catch(err) {
            this.toast.error("Erro ao salvar no servidor.");
        }
    };

    // Override deleteProduct
    const originalDeleteProduct = window.app.deleteProduct;
    window.app.deleteProduct = async function(id) {
        if(confirm('Tem certeza que deseja excluir este produto?')) {
            try {
                await fetch(`${API_BASE}/produtos/${id}`, { method: 'DELETE' });
                await syncFromServer();
                this.loadProducts();
                this.toast.success('Produto excluído com sucesso.');
            } catch(e) {
                this.toast.error("Erro ao excluir do servidor.");
            }
        }
    };
    
    // Override logActivity
    const originalLogActivity = window.app.activity.log;
    window.app.activity.log = async function(description, action) {
        try {
            await fetch(`${API_BASE}/atividades`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ action, description, date: new Date().toISOString() })
            });
            originalLogActivity.call(this, description, action);
        } catch(e) {}
    };
    
    // Override saveCliente
    const originalHandleClienteSubmit = window.app.handleClienteSubmit;
    window.app.handleClienteSubmit = async function(e) {
        e.preventDefault();
        const editId = document.getElementById('clienteId').value;
        const formData = new FormData(document.getElementById('clienteForm'));
        const cliente = {
            nome: formData.get('nome'),
            cpf: formData.get('cpf'),
            telefone: formData.get('telefone'),
            email: formData.get('email'),
            endereco: formData.get('endereco'),
            cidade: formData.get('cidade'),
            uf: formData.get('uf'),
            observacoes: formData.get('observacoes')
        };
        try {
            if (editId) {
                await fetch(`${API_BASE}/clientes/${editId}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(cliente) });
            } else {
                await fetch(`${API_BASE}/clientes`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(cliente) });
            }
            await syncFromServer();
            document.getElementById('clienteForm').reset();
            document.getElementById('clienteId').value = '';
            this.loadClientes();
            this.toast.success('Cliente salvo com sucesso!');
        } catch(e) { this.toast.error("Erro no servidor."); }
    };
    
    window.app.deleteCliente = async function(id) {
        if(confirm('Deseja excluir este cliente?')) {
            await fetch(`${API_BASE}/clientes/${id}`, { method: 'DELETE' });
            await syncFromServer();
            this.loadClientes();
            this.toast.success('Cliente excluído.');
        }
    };
    
    // Override Fornecedores
    window.app.handleFornecedorSubmit = async function(e) {
        e.preventDefault();
        const editId = document.getElementById('fornecedorId').value;
        const formData = new FormData(document.getElementById('fornecedorForm'));
        const f = {
            razao_social: formData.get('razao_social'),
            cnpj: formData.get('cnpj'),
            contato: formData.get('contato'),
            telefone: formData.get('telefone'),
            email: formData.get('email'),
            endereco: formData.get('endereco'),
            produtos_fornecidos: formData.get('produtos_fornecidos'),
            observacoes: formData.get('observacoes')
        };
        try {
            if (editId) await fetch(`${API_BASE}/fornecedores/${editId}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(f) });
            else await fetch(`${API_BASE}/fornecedores`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(f) });
            await syncFromServer();
            document.getElementById('fornecedorForm').reset();
            document.getElementById('fornecedorId').value = '';
            this.loadFornecedores();
            this.toast.success('Fornecedor salvo!');
        } catch(e) { this.toast.error("Erro no servidor."); }
    };
    
    window.app.deleteFornecedor = async function(id) {
        if(confirm('Deseja excluir este fornecedor?')) {
            await fetch(`${API_BASE}/fornecedores/${id}`, { method: 'DELETE' });
            await syncFromServer();
            this.loadFornecedores();
            this.toast.success('Fornecedor excluído.');
        }
    };
    
    // Override Despesas
    window.app.saveDespesa = async function(e) {
        e.preventDefault();
        const d = {
            descricao: document.getElementById('despesaDescricao').value,
            categoria: document.getElementById('despesaCategoria').value,
            valor: parseFloat(document.getElementById('despesaValor').value),
            data: document.getElementById('despesaData').value,
            status: 'pago'
        };
        await fetch(`${API_BASE}/despesas`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(d) });
        await syncFromServer();
        document.getElementById('despesaForm').reset();
        document.getElementById('modalDespesa').classList.remove('active');
        this.loadDespesas();
        this.updateFinanceiroCards();
        this.toast.success('Despesa lançada!');
    };
    
    window.app.deleteDespesa = async function(id) {
        if(confirm('Excluir esta despesa?')) {
            await fetch(`${API_BASE}/despesas/${id}`, { method: 'DELETE' });
            await syncFromServer();
            this.loadDespesas();
            this.updateFinanceiroCards();
        }
    };
    
    // Override Usuarios
    window.app.saveUsuario = async function(e) {
        e.preventDefault();
        const u = {
            username: document.getElementById('userUsername').value,
            nome: document.getElementById('userNome').value,
            role: document.getElementById('userRole').value,
            password: document.getElementById('userPassword').value
        };
        await fetch(`${API_BASE}/usuarios`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(u) });
        await syncFromServer();
        document.getElementById('userForm').reset();
        document.getElementById('modalUser').classList.remove('active');
        this.loadUsuarios();
        this.toast.success('Usuário criado!');
    };
    
    window.app.deleteUsuario = async function(id) {
        if(confirm('Excluir usuário?')) {
            await fetch(`${API_BASE}/usuarios/${id}`, { method: 'DELETE' });
            await syncFromServer();
            this.loadUsuarios();
        }
    };
    
    // Override gerarNota (Vendas)
    const originalGerarNota = window.app.gerarNota;
    window.app.gerarNota = async function() {
        if(this.pdv.items.length === 0) return;
        
        const nf = {
            numero: (JSON.parse(localStorage.getItem('notasFiscais')) || []).length + 1,
            data: new Date().toLocaleDateString('pt-BR'),
            dataISO: new Date().toISOString(),
            cliente: this.pdv.cliente || { nome: 'Consumidor Final', cpf: '' },
            subtotal: this.pdv.subtotal,
            descontoGeral: this.pdv.descontoGeral,
            total: this.pdv.total,
            formaPagamento: document.getElementById('pdvPagamento').value,
            observacoes: document.getElementById('pdvObservacoes').value,
            produtos: this.pdv.items
        };
        
        try {
            await fetch(`${API_BASE}/notas`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(nf) });
            await syncFromServer();
            originalGerarNota.call(this);
        } catch(e) {
            this.toast.error('Erro ao emitir nota fiscal no servidor');
        }
    };
}

// Intercepta a inicialização para rodar o Sync antes do app pintar a tela
document.addEventListener('DOMContentLoaded', async () => {
    // Bloquear a tela com um loading
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0'; overlay.style.left = '0'; overlay.style.width = '100%'; overlay.style.height = '100%';
    overlay.style.background = 'rgba(255,255,255,0.9)';
    overlay.style.zIndex = '99999';
    overlay.style.display = 'flex'; overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center';
    overlay.style.flexDirection = 'column';
    overlay.innerHTML = '<h2 style="color:var(--primary); font-family:var(--font-sans)">Sincronizando com a Nuvem...</h2><br><div class="loader" style="border: 4px solid #f3f3f3; border-top: 4px solid var(--primary); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>';
    
    const style = document.createElement('style');
    style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    await syncFromServer();
    
    // Configura os overrides do sistema
    setTimeout(() => {
        setupNetworkOverrides();
        overlay.remove();
        // Recarregar os dados na tela atual usando as funções originais (que leem do localStorage atualizado)
        if (window.app) {
            window.app.loadProducts();
            window.app.loadDashboardStats();
            window.app.updateDashboard();
        }
    }, 800);
});
