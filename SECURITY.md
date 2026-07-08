# Segurança do Sistema de Login — Documentação

## 🔐 Visão Geral

Este documento descreve as implementações de segurança aplicadas ao sistema de login da Ferragens Reis, seguindo os **padrões GRASP** (General Responsibility Assignment Software Patterns) de arquitetura de software.

---

## 📋 Padrões GRASP Implementados

### 1. **Information Expert**
**Responsabilidade**: Classes que conhecem e gerenciam sua própria informação.

- **CSRFTokenManager**: Gera, valida e gerencia tokens CSRF
- **InputSanitizer**: Responsável por validar e sanitizar entrada de dados
- **RateLimiter**: Controla e valida tentativas de login

### 2. **Creator**
**Responsabilidade**: Decidir qual classe cria objetos.

- `SecurityManager` é a classe responsável por criar instâncias de validadores
- Segue um padrão centralizador para não espalharpesado de criação

### 3. **Controller**
**Responsabilidade**: Orquestrador do fluxo de aplicação.

- **SecurityManager**: Coordena todas as estratégias de segurança
- **LoginController**: Orquestra o fluxo de autenticação e validações
- Cada classe tem responsabilidade bem definida

### 4. **Protected Variations**
**Responsabilidade**: Proteger contra variações em comportamentos.

- **InputSanitizer** protege contra múltiplos tipos de ataques:
  - XSS (Cross-Site Scripting)
  - Injections
  - Caracteres inválidos
  
### 5. **Pure Fabrication**
**Responsabilidade**: Classes auxiliares criadas quando nenhuma classe natural é apropriada.

- **RateLimiter**: Classe dedicada apenas a controlar limite de tentativas
- Não teria lugar natural em outras responsabilidades

### 6. **Low Coupling** e **High Cohesion**
**Responsabilidade**: Minimizar dependências e maximizar coesão.

- Cada classe tem uma única responsabilidade bem definida
- Módulos se comunicam através de interfaces claras
- Altamente reutilizável e testável

---

## 🛡️ Proteções Implementadas

### 1. **CSRF (Cross-Site Request Forgery)**
```javascript
// Token gerado e validado em cada requisição
- Baseado em timestamp
- User-Agent validation
- Session-based storage
- Expiração automática (1 hora)
```

**Como funciona**:
- Token único é gerado quando página carrega
- Token deve ser incluído em toda requisição POST
- Token é validado antes de processar login

### 2. **Rate Limiting (Proteção contra Brute Force)**
```javascript
- Máximo de 5 tentativas em 15 minutos
- Por identificador de cliente (User-Agent + idioma)
- Mensagem informando tempo de espera
```

**Como funciona**:
- Cada tentativa é registrada com timestamp
- Se limite é excedido, requisição é rejeitada
- Contador reseta após a janela de tempo

### 3. **Input Sanitization (Validação de Entrada)**

#### Username:
- Apenas 3-20 caracteres
- Permitidos: letras, números, hífen, sublinhado
- Remove espaços em branco excessivos
- Máximo 255 caracteres

#### Senha:
- Mínimo 8 caracteres
- Validação de força:
  - Deve ter letra minúscula
  - Deve ter letra maiúscula
  - Deve ter número
  - Deve ter caractere especial (preferível)
- Remoção de caracteres de controle
- Proteção contra seleção de texto (CSS)

### 4. **XSS Prevention (Cross-Site Scripting)**
```javascript
// Escape HTML em mensagens de erro
InputSanitizer.escapeHTML(userInput);

// Remove caracteres de controle
sanitized.replace(/[\x00-\x1F\x7F]/g, '');

// Validação com regex rigoroso
pattern: /^[a-zA-Z0-9_-]{3,20}$/
```

### 5. **Security Logging**
```javascript
// Registro de todos os eventos de segurança
- Tentativas de login
- Falhas de validação
- Atividades suspeitas
- Limite de taxa excedido
- Tempo: ISO 8601 format
```

**Acessível via**: `securityManager.getSecurityLog()`

### 6. **Proteção de Dados Sensíveis**
- Senha nunca é enviada sem validação
- User-Agent mascarado em logs
- Mensagens de erro genéricas ao usuário
- Campos sensíveis sem autocomplete

### 7. **Headers de Segurança HTTP**
```html
<!-- Configurado no HTML -->
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta name="referrer" content="strict-origin-when-cross-origin">
```

---

## 🏗️ Arquitetura de Arquivos

### `security.js` (módulo de segurança)
```
CSRFTokenManager
├─ generateToken()
├─ validateToken()
└─ getUserAgent()

InputSanitizer (static)
├─ sanitizeString()
├─ validateUsername()
├─ validatePasswordStrength()
└─ escapeHTML()

RateLimiter
├─ isLimited()
├─ getRetryAfter()
└─ reset()

SecurityManager (CONTROLLER)
├─ initialize()
├─ validateRequest()
├─ log()
├─ getSecurityLog()
└─ onSuspiciousActivity()
```

### `login.js` (fluxo de autenticação)
```
LoginController
├─ initializeElements()
├─ attachEventListeners()
├─ validateUsername()
├─ validatePassword()
├─ handleSubmit()
├─ authenticate()
├─ handleAuthenticationError()
└─ redirectToDashboard()
```

---

## 🔄 Fluxo de Segurança no Login

```
1. Página carrega
   ↓
2. SecurityManager.initialize()
   - Gera token CSRF
   - Injeta no formulário
   - Desabilita autocomplete
   ↓
3. Usuário preenche formulário
   ↓
4. Validação em tempo real (blur, input)
   - InputSanitizer valida
   - Feedback visual imediato
   ↓
5. Usuário submete formulário
   ↓
6. LoginController.handleSubmit()
   - Valida campos
   - Chama SecurityManager.validateRequest()
   ↓
7. SecurityManager.validateRequest()
   - Valida token CSRF
   - Valida rate limiting
   - Valida username
   - Valida senha
   ↓
8. Se tudo OK:
   - LoginController.authenticate()
   - Log de tentativa
   - Simular requisição servidor
   ↓
9. Se sucesso:
   - Log de sucesso
   - Animação success
   - Redirecionar
   ↓
10. Se erro:
    - Log de erro
    - Gerar novo token CSRF
    - Exibir erro genérico
```

---

## 📊 Validação de Força de Senha

```javascript
Resultado: { valid, score, feedback, missing }

score = 0-4
- 0: Muito fraco
- 1: Fraco
- 2: Moderado
- 3: Forte
- 4: Muito forte

Requisitos:
✓ Letra minúscula (a-z)
✓ Letra maiúscula (A-Z)
✓ Número (0-9)
✓ Caractere especial (!@#$%...)

Mínimo necessário: score >= 3 (3 de 4 requisitos)
```

---

## 🚨 Detecção de Atividades Suspeitas

O sistema detecta:
- ❌ Múltiplas tentativas falhadas
- ❌ Token CSRF inválido
- ❌ User-Agent mudou
- ❌ Tentativas de requisição suspeita
- ❌ Inputs fora do padrão esperado

Ações:
1. Log em `securityManager.securityLog`
2. Mensagem de erro apropriada
3. Bloqueio temporário (rate limit)

---

## 🧪 Testando a Segurança

### No Console do Navegador:

```javascript
// Ver log de segurança
securityManager.getSecurityLog()

// Ver token CSRF
document.getElementById('csrf-token').value

// Testar validação de username
InputSanitizer.validateUsername('admin')           // true
InputSanitizer.validateUsername('ab')              // false (muito curto)
InputSanitizer.validateUsername('admin123_-test')  // true
InputSanitizer.validateUsername('admin@test')      // false (caractere inválido)

// Testar força de senha
InputSanitizer.validatePasswordStrength('abc123')      // fraca
InputSanitizer.validatePasswordStrength('Abc123!@#')   // forte
```

---

## 📈 Melhorias Futuras Recomendadas

1. **Backend**: Implementar validação servidor-side
2. **HTTPS**: Forçar HTTPS em produção
3. **2FA**: Autenticação de dois fatores
4. **Hashing**: Usar bcrypt/argon2 para senhas
5. **IP Whitelist**: Restringir por IP se necessário
6. **Email Verification**: Confirmar e-mail do usuário
7. **Account Lockout**: Bloquear conta após 10 tentativas
8. **Audit Logs**: Logs persistentes no servidor
9. **JWT Tokens**: Token baseado em JWT para sessões
10. **CORS**: Configurar CORS apropriadamente

---

## 📝 Conformidade e Padrões

- ✅ OWASP Top 10 (2021)
  - A01: Broken Access Control
  - A03: Injection
  - A07: Cross-Site Scripting (XSS)
  - A10: Broken Authentication
- ✅ GRASP (General Responsibility Assignment Software Patterns)
- ✅ SOLID Principles (Single Responsibility)
- ✅ Clean Code Principles

---

## 🔗 Referências

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [GRASP Design Patterns](https://refactoring.guru/design-patterns/grasp)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)

---

## 👨‍💼 Suporte

Para dúvidas ou sugestões sobre segurança, contacte o time de desenvolvimento.

**Última atualização**: 2026-07-07
