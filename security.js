/* ============================================
   FERRAGENS REIS — SECURITY LAYER
   Implementação de padrões GRASP para segurança
   ============================================ */

/**
 * INFORMATION EXPERT
 * Classe responsável por gerar e validar tokens CSRF
 * Conhece como tokens funcionam e deve gerenciá-los
 */
class CSRFTokenManager {
    constructor() {
        this.tokenKey = 'csrf_token_timestamp';
        this.tokenDuration = 3600000; // 1 hora em ms
    }

    /**
     * Gera um novo token CSRF
     */
    generateToken() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const token = btoa(`${timestamp}:${random}:${this.getUserAgent()}`);
        
        // Armazenar timestamp para validação
        sessionStorage.setItem(this.tokenKey, timestamp);
        return token;
    }

    /**
     * Valida um token CSRF
     */
    validateToken(token) {
        if (!token) return false;
        
        try {
            const storedTimestamp = parseInt(sessionStorage.getItem(this.tokenKey));
            const currentTime = Date.now();
            
            // Verificar se o token expirou
            if (currentTime - storedTimestamp > this.tokenDuration) {
                this.generateToken();
                return false;
            }
            
            // Validar token básico (decodificar e verificar)
            const decoded = atob(token);
            const [timestamp, , userAgent] = decoded.split(':');
            
            return parseInt(timestamp) === storedTimestamp && 
                   userAgent === this.getUserAgent();
        } catch (error) {
            console.error('[SECURITY] Token validation failed:', error.message);
            return false;
        }
    }

    /**
     * Retorna o User-Agent para validação de token
     */
    getUserAgent() {
        return btoa(navigator.userAgent).substr(0, 10);
    }
}

/**
 * INFORMATION EXPERT + PROTECTED VARIATIONS
 * Classe responsável por sanitização e validação de entrada
 * Protege contra XSS e injections
 */
class InputSanitizer {
    /**
     * Sanitiza strings removendo caracteres perigosos
     */
    static sanitizeString(input) {
        if (typeof input !== 'string') return '';
        
        // Remover espaços em branco excessivos
        let sanitized = input.trim();
        
        // Remover caracteres de controle
        sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
        
        // Limitar tamanho
        sanitized = sanitized.substring(0, 255);
        
        return sanitized;
    }

    /**
     * Valida username (alfanuméricos, hífen, sublinhado)
     */
    static validateUsername(username) {
        const sanitized = this.sanitizeString(username);
        const pattern = /^[a-zA-Z0-9_-]{3,20}$/;
        return pattern.test(sanitized);
    }

    /**
     * Valida força da senha
     */
    static validatePasswordStrength(password) {
        if (password.length < 8) return { valid: false, score: 0 };
        
        let score = 0;
        const feedback = [];

        // Verificar critérios
        if (/[a-z]/.test(password)) { score++; feedback.push('minúsculas'); }
        if (/[A-Z]/.test(password)) { score++; feedback.push('maiúsculas'); }
        if (/[0-9]/.test(password)) { score++; feedback.push('números'); }
        if (/[^a-zA-Z0-9]/.test(password)) { score++; feedback.push('caracteres especiais'); }

        return {
            valid: score >= 3,
            score: score,
            feedback: feedback,
            missing: this.getMissingPasswordRequirements(password)
        };
    }

    /**
     * Retorna requisitos faltantes para senha forte
     */
    static getMissingPasswordRequirements(password) {
        const missing = [];
        if (!/[a-z]/.test(password)) missing.push('letra minúscula');
        if (!/[A-Z]/.test(password)) missing.push('letra maiúscula');
        if (!/[0-9]/.test(password)) missing.push('número');
        if (!/[^a-zA-Z0-9]/.test(password)) missing.push('caractere especial');
        return missing;
    }

    /**
     * Escapa HTML para prevenir XSS
     */
    static escapeHTML(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

/**
 * PURE FABRICATION
 * Classe auxiliar para gerenciar rate limiting
 * Protege contra brute force attacks
 */
class RateLimiter {
    constructor(maxAttempts = 5, windowMs = 900000) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs; // 15 minutos
        this.attempts = {};
    }

    /**
     * Verifica se o IP/chave excedeu limite de tentativas
     */
    isLimited(key) {
        const now = Date.now();
        
        if (!this.attempts[key]) {
            this.attempts[key] = { count: 0, firstAttempt: now };
        }

        const attempt = this.attempts[key];
        
        // Resetar se passou a janela de tempo
        if (now - attempt.firstAttempt > this.windowMs) {
            this.attempts[key] = { count: 1, firstAttempt: now };
            return false;
        }

        // Verificar limite
        attempt.count++;
        return attempt.count > this.maxAttempts;
    }

    /**
     * Retorna segundos até poder fazer nova tentativa
     */
    getRetryAfter(key) {
        const attempt = this.attempts[key];
        if (!attempt) return 0;

        const elapsed = Date.now() - attempt.firstAttempt;
        const remaining = Math.max(0, this.windowMs - elapsed);
        return Math.ceil(remaining / 1000);
    }

    /**
     * Reseta o contador para uma chave
     */
    reset(key) {
        delete this.attempts[key];
    }
}

/**
 * CONTROLLER
 * Orquestrador central de segurança
 * Coordena as várias estratégias de proteção
 */
class SecurityManager {
    constructor() {
        this.csrfManager = new CSRFTokenManager();
        this.rateLimiter = new RateLimiter();
        this.securityLog = [];
        this.maxLogEntries = 100;
    }

    /**
     * Inicializa segurança da página
     */
    initialize() {
        try {
            // Gerar e injetar token CSRF
            const token = this.csrfManager.generateToken();
            const tokenInput = document.getElementById('csrf-token');
            if (tokenInput) {
                tokenInput.value = token;
            }

            // Disable autocomplete em campos sensíveis
            this.disableDangerousAutocomplete();

            // Log de inicialização
            this.log('Security initialized', 'info');
        } catch (error) {
            console.error('[SECURITY] Initialization failed:', error);
            this.log('Initialization failed: ' + error.message, 'error');
        }
    }

    /**
     * Valida requisição completa antes de envio
     */
    validateRequest(data) {
        const errors = [];

        // Validar CSRF
        if (!data.csrf_token || !this.csrfManager.validateToken(data.csrf_token)) {
            errors.push('Token CSRF inválido ou expirado');
        }

        // Validar rate limiting
        const clientKey = this.getClientIdentifier();
        if (this.rateLimiter.isLimited(clientKey)) {
            const retryAfter = this.rateLimiter.getRetryAfter(clientKey);
            errors.push(`Muitas tentativas. Tente novamente em ${retryAfter}s`);
            this.log(`Rate limit exceeded for ${clientKey}`, 'warning');
        }

        // Validar username
        if (!InputSanitizer.validateUsername(data.username)) {
            errors.push('Usuário inválido (3-20 caracteres: letras, números, hífen, sublinhado)');
        }

        // Validar senha
        if (data.password.length < 6) {
            errors.push('Senha deve ter pelo menos 6 caracteres');
        }

        if (errors.length > 0) {
            this.log(`Request validation failed: ${errors.join(' | ')}`, 'warning');
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Obtém identificador único do cliente
     */
    getClientIdentifier() {
        // Usar combinação de User-Agent + Navigator info
        const identifier = `${navigator.userAgent}:${navigator.language}`;
        return btoa(identifier).substr(0, 16);
    }

    /**
     * Desabilita autocomplete em campos sensíveis
     */
    disableDangerousAutocomplete() {
        // Alguns navegadores ignoram, mas adicionar não prejudica
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');

        if (usernameField) usernameField.setAttribute('autocomplete', 'off');
        if (passwordField) passwordField.setAttribute('autocomplete', 'off');
    }

    /**
     * Registra evento de segurança
     */
    log(message, level = 'info') {
        const entry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            userAgent: navigator.userAgent.substr(0, 50)
        };

        this.securityLog.push(entry);

        // Limitar tamanho do log
        if (this.securityLog.length > this.maxLogEntries) {
            this.securityLog.shift();
        }

        // Log em console em desenvolvimento
        if (level === 'error') {
            console.error(`[SECURITY] ${message}`);
        } else if (level === 'warning') {
            console.warn(`[SECURITY] ${message}`);
        } else if (level === 'info') {
            console.log(`[SECURITY] ${message}`);
        }
    }

    /**
     * Retorna histórico de segurança (apenas últimas tentativas)
     */
    getSecurityLog() {
        return this.securityLog.slice(-20);
    }

    /**
     * Simula ataque detectado
     */
    onSuspiciousActivity(reason) {
        this.log(`Suspicious activity detected: ${reason}`, 'warning');
        // Aqui você poderia disparar notificação ao servidor
    }
}

/**
 * Instância global de segurança
 */
const securityManager = new SecurityManager();

// Inicializar segurança quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        securityManager.initialize();
    });
} else {
    securityManager.initialize();
}
