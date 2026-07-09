/* ============================================
   FERRAGENS REIS — LOGIN PAGE (JavaScript)
   Arquitetura com padrões GRASP
   ============================================ */

/**
 * CONTROLLER
 * Orquestra o fluxo de login e coordena validações
 */
class LoginController {
    constructor(formElement, securityManager) {
        this.form = formElement;
        this.securityManager = securityManager;
        this.isSubmitting = false;
        this.initializeElements();
        this.attachEventListeners();
    }

    /**
     * Inicializa referências aos elementos DOM
     */
    initializeElements() {
        this.usernameInput = this.form.querySelector('#username');
        this.passwordInput = this.form.querySelector('#password');
        this.rememberCheckbox = this.form.querySelector('#remember');
        this.submitButton = this.form.querySelector('#btnLogin');
        this.togglePasswordBtn = this.form.querySelector('#togglePassword');
        this.csrfTokenInput = this.form.querySelector('#csrf-token');

        this.usernameGroup = this.form.querySelector('#username-group');
        this.passwordGroup = this.form.querySelector('#password-group');
        this.usernameError = this.form.querySelector('#username-error');
        this.passwordError = this.form.querySelector('#password-error');
    }

    /**
     * Anexa listeners aos elementos
     */
    attachEventListeners() {
        // Validação em tempo real
        this.usernameInput.addEventListener('blur', () => this.validateUsername());
        this.usernameInput.addEventListener('input', () => this.clearUsernameError());
        
        this.passwordInput.addEventListener('input', () => this.clearPasswordError());
        
        // Toggle de visibilidade de senha
        this.togglePasswordBtn.addEventListener('click', () => this.togglePasswordVisibility());
        
        // Submissão do formulário
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Navegação por teclado
        this.form.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

        // Forgot password (se necessário)
        const forgotLink = document.getElementById('forgotPassword');
        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => this.handleForgotPassword(e));
        }
    }

    /**
     * Valida username
     */
    validateUsername() {
        const username = this.usernameInput.value;
        
        if (!username.trim()) {
            this.showError(this.usernameGroup, this.usernameError, 
                'O campo usuário é obrigatório.');
            return false;
        }

        if (!InputSanitizer.validateUsername(username)) {
            this.showError(this.usernameGroup, this.usernameError, 
                'Usuário inválido (3-20 caracteres: letras, números, hífen, sublinhado).');
            return false;
        }

        this.clearError(this.usernameGroup, this.usernameError);
        return true;
    }

    /**
     * Valida força da senha
     */
    validatePassword() {
        const password = this.passwordInput.value;

        if (!password) {
            this.showError(this.passwordGroup, this.passwordError, 
                'O campo senha é obrigatório.');
            return false;
        }

        if (password.length < 6) {
            this.showError(this.passwordGroup, this.passwordError, 
                'A senha deve ter pelo menos 6 caracteres.');
            return false;
        }

        this.clearError(this.passwordGroup, this.passwordError);
        return true;
    }

    /**
     * Mostra mensagem de erro
     */
    showError(group, errorSpan, message) {
        group.classList.add('error');
        // Sanitizar mensagem antes de exibir
        errorSpan.textContent = InputSanitizer.escapeHTML(message);
    }

    /**
     * Limpa erro do username
     */
    clearError(group, errorSpan) {
        group.classList.remove('error');
        errorSpan.textContent = '';
    }

    /**
     * Limpa erro de username
     */
    clearUsernameError() {
        if (this.usernameGroup.classList.contains('error')) {
            if (InputSanitizer.validateUsername(this.usernameInput.value)) {
                this.clearError(this.usernameGroup, this.usernameError);
            }
        }
    }

    /**
     * Limpa erro de password
     */
    clearPasswordError() {
        if (this.passwordGroup.classList.contains('error')) {
            if (this.passwordInput.value.length >= 8) {
                this.clearError(this.passwordGroup, this.passwordError);
            }
        }
    }

    /**
     * Toggle visibilidade de senha
     */
    togglePasswordVisibility() {
        const isPassword = this.passwordInput.type === 'password';
        this.passwordInput.type = isPassword ? 'text' : 'password';
        this.togglePasswordBtn.classList.toggle('active', isPassword);
        this.togglePasswordBtn.setAttribute(
            'aria-label',
            isPassword ? 'Ocultar senha' : 'Mostrar senha'
        );
        this.securityManager.log('Password visibility toggled', 'info');
    }

    /**
     * Navega entre inputs com Enter
     */
    handleKeyboardNavigation(e) {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'hidden') {
            const inputs = Array.from(this.form.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"])'));
            const currentIndex = inputs.indexOf(e.target);
            
            if (currentIndex < inputs.length - 1) {
                e.preventDefault();
                inputs[currentIndex + 1].focus();
            }
        }
    }

    /**
     * Handler para "Esqueceu a senha"
     */
    handleForgotPassword(e) {
        e.preventDefault();
        this.securityManager.log('Forgot password clicked', 'info');
        // Implementar fluxo de recuperação de senha
        alert('Funcionalidade de recuperação de senha em desenvolvimento.');
    }

    /**
     * Manipula submissão do formulário
     */
    async handleSubmit(e) {
        e.preventDefault();

        // Evitar múltiplas submissões
        if (this.isSubmitting) {
            return;
        }

        // Validar campos
        const usernameValid = this.validateUsername();
        const passwordValid = this.validatePassword();

        if (!usernameValid || !passwordValid) {
            this.securityManager.log('Form validation failed', 'warning');
            return;
        }

        // Preparar dados para envio
        const requestData = {
            username: InputSanitizer.sanitizeString(this.usernameInput.value),
            password: this.passwordInput.value,
            csrf_token: this.csrfTokenInput.value,
            remember: this.rememberCheckbox.checked
        };

        // Validar segurança geral da requisição
        const securityCheck = this.securityManager.validateRequest(requestData);
        
        if (!securityCheck.valid) {
            securityCheck.errors.forEach(error => {
                this.showError(this.usernameGroup, this.usernameError, error);
            });
            return;
        }

        // Iniciar fluxo de login
        await this.authenticate(requestData);
    }

    /**
     * Autentica o usuário
     */
    async authenticate(requestData) {
        this.isSubmitting = true;
        this.submitButton.disabled = true;
        this.submitButton.classList.add('loading');

        this.securityManager.log(
            `Login attempt for user: ${requestData.username}`, 
            'info'
        );

        try {
            // Simular chamada à API
            // Em produção: await fetch('/api/auth/login', {...})
            await this.simulateServerRequest(requestData);

            // Salvar sessão do usuário
            sessionStorage.setItem('user', requestData.username);

            // Sucesso
            this.submitButton.classList.remove('loading');
            this.submitButton.classList.add('success');

            this.securityManager.log(
                `Login successful for user: ${requestData.username}`, 
                'info'
            );

            // Redirecionar após animação
            setTimeout(() => {
                this.redirectToDashboard();
            }, 1200);

        } catch (error) {
            this.handleAuthenticationError(error);
        } finally {
            this.isSubmitting = false;
        }
    }

    /**
     * Faz requisição ao servidor real
     */
    async simulateServerRequest(data) {
        const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000/api' : (window.location.origin + '/api');
        const response = await fetch(API_BASE + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: data.username, password: data.password })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Salva dados do usuário logado vindo do banco
            localStorage.setItem('usuario', JSON.stringify(result.user));
            return result;
        } else {
            throw new Error(result.error || 'Credenciais inválidas');
        }
    }

    /**
     * Trata erros de autenticação
     */
    handleAuthenticationError(error) {
        this.submitButton.classList.remove('loading');
        this.submitButton.disabled = false;

        const errorMessage = this.sanitizeErrorMessage(error.message);
        
        this.showError(
            this.usernameGroup,
            this.usernameError,
            errorMessage || 'Erro ao autenticar. Tente novamente.'
        );

        this.securityManager.log(
            `Authentication error: ${error.message}`, 
            'warning'
        );

        // Gerar novo CSRF token após erro
        const newToken = this.securityManager.csrfManager.generateToken();
        this.csrfTokenInput.value = newToken;
    }

    /**
     * Sanitiza mensagem de erro para exibição
     */
    sanitizeErrorMessage(message) {
        // Não revelar informações sensíveis ao usuário
        const publicMessages = {
            'Credenciais inválidas': 'Usuário ou senha incorretos',
            'User not found': 'Usuário ou senha incorretos',
            'Invalid password': 'Usuário ou senha incorretos'
        };

        return publicMessages[message] || 'Erro ao processar sua solicitação';
    }

    /**
     * Redireciona para o dashboard
     */
    redirectToDashboard() {
        window.location.href = 'dashboard.html';
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm && typeof securityManager !== 'undefined') {
        new LoginController(loginForm, securityManager);
    } else {
        console.error('[LOGIN] Form or Security Manager not available');
    }
});
