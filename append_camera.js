const fs = require('fs');
const append = `
// ==========================================
// CAMERA SCANNER (HTML5-QRCode)
// ==========================================
let html5QrcodeScanner = null;

window.startCameraScanner = function(targetInputId = null) {
    const modal = document.getElementById('cameraScannerModal');
    if(modal) modal.style.display = 'flex';
    
    // Configura o leitor para ser rápido e usar a câmera traseira
    html5QrcodeScanner = new Html5QrcodeScanner(
        "camera-reader", 
        { fps: 15, qrbox: {width: 250, height: 250}, aspectRatio: 1.0 }, 
        false
    );
    
    html5QrcodeScanner.render((decodedText, decodedResult) => {
        // Sucesso na leitura!
        
        // Tocar um bipe sonoro de sucesso (opcional)
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
        } catch(e){}

        // Se tem um input alvo (ex: Cadastrar Produto)
        if (targetInputId) {
            const input = document.getElementById(targetInputId);
            if (input) {
                input.value = decodedText;
                if(window.app && window.app.toast) window.app.toast.success('Código lido com sucesso!');
            }
        } else {
            // Leitura global (PDV)
            if (window.app) window.app.handleBarcodeScanned(decodedText);
        }
        
        closeCameraScanner();
    }, (errorMessage) => {
        // Ignora erros de frame
    });
};

window.closeCameraScanner = function() {
    const modal = document.getElementById('cameraScannerModal');
    if(modal) modal.style.display = 'none';
    
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(error => {
            console.error('Failed to clear scanner', error);
        });
        html5QrcodeScanner = null;
    }
};
`;
fs.appendFileSync('novas_funcionalidades.js', append, 'utf8');
