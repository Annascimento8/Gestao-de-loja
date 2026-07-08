require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db/database');

const app = express();
app.use(cors());
app.use(express.json());

// Servir os arquivos estáticos (HTML, CSS, JS) do diretório atual
app.use(express.static(path.join(__dirname)));

// ==========================================
// ROTAS DA API
// ==========================================

// --- SYNC GLOBAL ---
app.get('/api/sync', async (req, res) => {
    try {
        const produtos = await db.query('SELECT * FROM produtos');
        const clientes = await db.query('SELECT * FROM clientes');
        const fornecedores = await db.query('SELECT * FROM fornecedores');
        const notas = await db.query('SELECT * FROM notas_fiscais');
        const vendas = await db.query('SELECT * FROM vendas');
        const despesas = await db.query('SELECT * FROM despesas');
        const atividades = await db.query('SELECT * FROM atividades');
        const usuarios = await db.query('SELECT id, username, nome, role FROM usuarios');
        
        res.json({ produtos, clientes, fornecedores, notas, vendas, despesas, atividades, usuarios });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PRODUTOS ---
app.get('/api/produtos', async (req, res) => {
    try {
        const produtos = await db.query('SELECT * FROM produtos');
        res.json(produtos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/produtos', async (req, res) => {
    const p = req.body;
    try {
        const result = await db.execute(
            `INSERT INTO produtos (nome, codigo_barras, categoria, unidade, custoPor, precovenda, margem, estoque, estoque_minimo, fornecedor, descricao, imagemBase64) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [p.nome, p.codigo_barras || null, p.categoria || null, p.unidade, p.custoPor, p.precovenda, p.margem, p.estoque, p.estoque_minimo, p.fornecedor, p.descricao, p.imagemBase64 || null]
        );
        res.status(201).json({ id: result.lastID, ...p });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/produtos/:id', async (req, res) => {
    const id = req.params.id;
    const p = req.body;
    try {
        await db.execute(
            `UPDATE produtos SET nome=?, codigo_barras=?, categoria=?, unidade=?, custoPor=?, precovenda=?, margem=?, estoque=?, estoque_minimo=?, fornecedor=?, descricao=?, imagemBase64=? WHERE id=?`,
            [p.nome, p.codigo_barras || null, p.categoria || null, p.unidade, p.custoPor, p.precovenda, p.margem, p.estoque, p.estoque_minimo, p.fornecedor, p.descricao, p.imagemBase64 || null, id]
        );
        res.json({ id, ...p });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/produtos/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM produtos WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/produtos/:id/estoque', async (req, res) => {
    const { estoque } = req.body;
    try {
        await db.execute('UPDATE produtos SET estoque=? WHERE id=?', [estoque, req.params.id]);
        res.json({ success: true, estoque });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CLIENTES ---
app.get('/api/clientes', async (req, res) => {
    try {
        const clientes = await db.query('SELECT * FROM clientes');
        res.json(clientes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/clientes', async (req, res) => {
    const c = req.body;
    try {
        const result = await db.execute(
            `INSERT INTO clientes (nome, cpf, telefone, email, endereco, cidade, uf, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [c.nome, c.cpf, c.telefone, c.email, c.endereco, c.cidade, c.uf, c.observacoes]
        );
        res.status(201).json({ id: result.lastID, ...c });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/clientes/:id', async (req, res) => {
    const c = req.body;
    try {
        await db.execute(
            `UPDATE clientes SET nome=?, cpf=?, telefone=?, email=?, endereco=?, cidade=?, uf=?, observacoes=? WHERE id=?`,
            [c.nome, c.cpf, c.telefone, c.email, c.endereco, c.cidade, c.uf, c.observacoes, req.params.id]
        );
        res.json({ id: req.params.id, ...c });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/clientes/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM clientes WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- FORNECEDORES ---
app.get('/api/fornecedores', async (req, res) => {
    try {
        const fornecedores = await db.query('SELECT * FROM fornecedores');
        res.json(fornecedores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/fornecedores', async (req, res) => {
    const f = req.body;
    try {
        const result = await db.execute(
            `INSERT INTO fornecedores (razao_social, cnpj, contato, telefone, email, endereco, produtos_fornecidos, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [f.razao_social, f.cnpj, f.contato, f.telefone, f.email, f.endereco, f.produtos_fornecidos, f.observacoes]
        );
        res.status(201).json({ id: result.lastID, ...f });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/fornecedores/:id', async (req, res) => {
    const f = req.body;
    try {
        await db.execute(
            `UPDATE fornecedores SET razao_social=?, cnpj=?, contato=?, telefone=?, email=?, endereco=?, produtos_fornecidos=?, observacoes=? WHERE id=?`,
            [f.razao_social, f.cnpj, f.contato, f.telefone, f.email, f.endereco, f.produtos_fornecidos, f.observacoes, req.params.id]
        );
        res.json({ id: req.params.id, ...f });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/fornecedores/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM fornecedores WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- NOTAS FISCAIS E VENDAS ---
app.get('/api/notas', async (req, res) => {
    try {
        const notas = await db.query('SELECT * FROM notas_fiscais ORDER BY id DESC');
        for (let nf of notas) {
            nf.produtos = await db.query('SELECT * FROM itens_nota WHERE nf_id=?', [nf.id]);
        }
        res.json(notas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/notas', async (req, res) => {
    const nf = req.body;
    try {
        const result = await db.execute(
            `INSERT INTO notas_fiscais (numero, data, dataISO, cliente_nome, cliente_cpf, subtotal, descontoGeral, total, formaPagamento, observacoes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nf.numero, nf.data, nf.dataISO, nf.cliente.nome, nf.cliente.cpf, nf.subtotal, nf.descontoGeral, nf.total, nf.formaPagamento, nf.observacoes]
        );
        const nfId = result.lastID;

        if (nf.produtos && nf.produtos.length > 0) {
            for (let item of nf.produtos) {
                await db.execute(
                    `INSERT INTO itens_nota (nf_id, produto_id, nome, qtd, precoUnit, desconto, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [nfId, item.produtoId, item.nome, item.qtd, item.precoUnit, item.desconto, item.subtotal]
                );
            }
        }

        await db.execute(
            `INSERT INTO vendas (data, dataISO, nf, cliente, subtotal, desconto, valor, formaPagamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nf.data, nf.dataISO, nf.numero, nf.cliente.nome, nf.subtotal, (nf.subtotal * nf.descontoGeral)/100, nf.total, nf.formaPagamento]
        );

        res.status(201).json({ success: true, id: nfId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/vendas', async (req, res) => {
    try {
        const vendas = await db.query('SELECT * FROM vendas ORDER BY id DESC');
        res.json(vendas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- DESPESAS (Fluxo de Caixa) ---
app.get('/api/despesas', async (req, res) => {
    try {
        const despesas = await db.query('SELECT * FROM despesas ORDER BY id DESC');
        res.json(despesas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/despesas', async (req, res) => {
    const d = req.body;
    try {
        const result = await db.execute(
            `INSERT INTO despesas (descricao, categoria, valor, data, status) VALUES (?, ?, ?, ?, ?)`,
            [d.descricao, d.categoria, d.valor, d.data, d.status || 'pago']
        );
        res.status(201).json({ id: result.lastID, ...d });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/despesas/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM despesas WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ATIVIDADES (Logs) ---
app.get('/api/atividades', async (req, res) => {
    try {
        const atividades = await db.query('SELECT * FROM atividades ORDER BY id DESC LIMIT 100');
        res.json(atividades);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/atividades', async (req, res) => {
    const a = req.body;
    try {
        const result = await db.execute(
            `INSERT INTO atividades (action, description, date) VALUES (?, ?, ?)`,
            [a.action, a.description, a.date || new Date().toISOString()]
        );
        res.status(201).json({ id: result.lastID, ...a });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- USUÁRIOS ---
app.get('/api/usuarios', async (req, res) => {
    try {
        const usuarios = await db.query('SELECT id, username, nome, role FROM usuarios');
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/usuarios', async (req, res) => {
    const u = req.body;
    try {
        const result = await db.execute(
            `INSERT INTO usuarios (username, nome, password, role) VALUES (?, ?, ?, ?)`,
            [u.username, u.nome, u.password, u.role]
        );
        res.status(201).json({ id: result.lastID, ...u });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM usuarios WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- AUTHENTICATION ---
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.query('SELECT * FROM usuarios WHERE username = ? AND password = ?', [username, password]);
        if (user.length > 0) {
            res.json({ success: true, token: 'mock_token_' + Date.now(), user: { id: user[0].id, username: user[0].username, role: user[0].role } });
        } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Captura fallback para index.html (SPA)
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
const os = require('os');
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`==========================================`);
    console.log(`🚀 Servidor Ferragens Reis iniciado!`);
    console.log(`==========================================`);
    console.log(`Acesse o sistema por qualquer um dos endereços abaixo:\n`);
    
    console.log(`🏠 Neste computador:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   http://127.0.0.1:${PORT}\n`);
    
    console.log(`🌍 Em outros computadores/celulares da mesma rede (Wi-Fi/Cabo):`);
    const interfaces = os.networkInterfaces();
    let hasNetwork = false;
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                console.log(`   http://${iface.address}:${PORT}`);
                hasNetwork = true;
            }
        }
    }
    
    if (!hasNetwork) {
        console.log(`   (Nenhuma rede local detectada)`);
    }
    console.log(`==========================================`);
});
