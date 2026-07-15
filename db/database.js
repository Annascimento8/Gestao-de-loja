const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Verifica se estamos rodando na nuvem (Render/Supabase) ou localmente
const isPostgres = !!process.env.DATABASE_URL;

let pool;
let dbSqlite;

if (isPostgres) {
    const { Pool } = require('pg');
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    console.log('☁️ Conectado ao PostgreSQL (Nuvem).');
    initDatabase();
} else {
    const dbPath = path.resolve(__dirname, 'store.db');
    dbSqlite = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
        } else {
            console.log('🏠 Conectado ao banco de dados SQLite (Local).');
            initDatabase();
        }
    });
}

function initDatabase() {
    const autoInc = isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
    
    // Lista de tabelas para criar
    const tables = [
        `CREATE TABLE IF NOT EXISTS produtos (
            id ${autoInc},
            nome TEXT NOT NULL,
            codigo_barras TEXT,
            categoria TEXT,
            unidade TEXT,
            custoPor REAL,
            precovenda REAL,
            margem REAL,
            estoque INTEGER,
            estoque_minimo INTEGER,
            fornecedor TEXT,
            descricao TEXT,
            imagemBase64 TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS clientes (
            id ${autoInc},
            nome TEXT NOT NULL,
            cpf TEXT,
            telefone TEXT,
            email TEXT,
            endereco TEXT,
            cidade TEXT,
            uf TEXT,
            observacoes TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS fornecedores (
            id ${autoInc},
            razao_social TEXT NOT NULL,
            cnpj TEXT,
            contato TEXT,
            telefone TEXT,
            email TEXT,
            endereco TEXT,
            produtos_fornecidos TEXT,
            observacoes TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS notas_fiscais (
            id ${autoInc},
            numero INTEGER,
            data TEXT,
            dataISO TEXT,
            cliente_id INTEGER,
            cliente_nome TEXT,
            cliente_cpf TEXT,
            subtotal REAL,
            descontoGeral REAL,
            total REAL,
            formaPagamento TEXT,
            observacoes TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS itens_nota (
            id ${autoInc},
            nf_id INTEGER,
            produto_id INTEGER,
            nome TEXT,
            qtd INTEGER,
            precoUnit REAL,
            desconto REAL,
            subtotal REAL
        )`,
        `CREATE TABLE IF NOT EXISTS vendas (
            id ${autoInc},
            data TEXT,
            dataISO TEXT,
            nf INTEGER,
            cliente TEXT,
            subtotal REAL,
            desconto REAL,
            valor REAL,
            formaPagamento TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS despesas (
            id ${autoInc},
            descricao TEXT NOT NULL,
            categoria TEXT,
            valor REAL,
            data TEXT,
            status TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS usuarios (
            id ${autoInc},
            username TEXT UNIQUE NOT NULL,
            nome TEXT,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin'
        )`,
        `CREATE TABLE IF NOT EXISTS atividades (
            id ${autoInc},
            action TEXT,
            description TEXT,
            date TEXT
        )`
    ];

    const runQuery = async (query) => {
        if (isPostgres) {
            await pool.query(query);
        } else {
            return new Promise((resolve) => dbSqlite.run(query, resolve));
        }
    };

    const setup = async () => {
        for (let query of tables) {
            await runQuery(query);
        }
        
        // Criar usuário admin padrão
        const adminUser = process.env.ADMIN_USER;
        const adminPass = process.env.ADMIN_PASS;

        if (!adminUser || !adminPass) {
            console.warn('⚠️ AVISO: ADMIN_USER ou ADMIN_PASS não definidos no arquivo .env. O usuário admin padrão não será criado automaticamente.');
        } else {
            const hashedPass = bcrypt.hashSync(adminPass, 10);

            if (isPostgres) {
                const res = await pool.query(`SELECT id FROM usuarios WHERE username = $1`, [adminUser]);
                if (res.rowCount === 0) {
                    await pool.query(`INSERT INTO usuarios (username, nome, password, role) VALUES ($1, 'Administrador', $2, 'admin')`, [adminUser, hashedPass]);
                }
            } else {
                dbSqlite.get(`SELECT id FROM usuarios WHERE username = ?`, [adminUser], (err, row) => {
                    if (!row) {
                        dbSqlite.run(`INSERT INTO usuarios (username, nome, password, role) VALUES (?, 'Administrador', ?, 'admin')`, [adminUser, hashedPass]);
                    }
                });
            }
        }
    };

    setup().catch(console.error);
}

// Objeto DB global exportado que mascara qual banco estamos usando
const db = {};

db.query = async function (sql, params = []) {
    if (isPostgres) {
        // Converter ? para $1, $2, etc.
        let pgSql = sql;
        let i = 1;
        while(pgSql.includes('?')) {
            pgSql = pgSql.replace('?', '$' + i);
            i++;
        }
        const res = await pool.query(pgSql, params);
        return res.rows;
    } else {
        return new Promise((resolve, reject) => {
            dbSqlite.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

db.execute = async function (sql, params = []) {
    if (isPostgres) {
        let pgSql = sql;
        let i = 1;
        while(pgSql.includes('?')) {
            pgSql = pgSql.replace('?', '$' + i);
            i++;
        }
        // No Postgres, inserts não retornam o ID por padrão, precisamos forçar
        if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING ID')) {
            pgSql += ' RETURNING id';
        }
        const res = await pool.query(pgSql, params);
        return { lastID: res.rows[0]?.id, changes: res.rowCount };
    } else {
        return new Promise((resolve, reject) => {
            dbSqlite.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve(this); // this.lastID, this.changes
            });
        });
    }
};

module.exports = db;
