document.addEventListener('DOMContentLoaded', () => {
    // Function to generate random pastel color
    function generateRandomPastelColor() {
        const hue = Math.floor(Math.random() * 360);
        const saturation = 30 + Math.floor(Math.random() * 40); // 30-70% saturation
        const lightness = 70 + Math.floor(Math.random() * 20); // 70-90% lightness
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    // Function to apply random pastel theme
    function applyRandomPastelTheme() {
        const pastelColor = generateRandomPastelColor();
        const root = document.documentElement;
        
        // Convert HSL to RGB for alpha calculations
        const tempDiv = document.createElement('div');
        tempDiv.style.color = pastelColor;
        document.body.appendChild(tempDiv);
        const rgbColor = window.getComputedStyle(tempDiv).color;
        document.body.removeChild(tempDiv);
        
        // Extract RGB values
        const rgbMatch = rgbColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            const [, r, g, b] = rgbMatch;
            
            // Set CSS custom properties for pastel theme
            root.style.setProperty('--background', '#000000');
            root.style.setProperty('--text', `rgba(${r}, ${g}, ${b}, 0.85)`);
            root.style.setProperty('--text-muted', `rgba(${r}, ${g}, ${b}, 0.5)`);
            root.style.setProperty('--text-bright', `rgba(${r}, ${g}, ${b}, 0.95)`);
            root.style.setProperty('--card-bg', `rgba(${r}, ${g}, ${b}, 0.1)`);
            root.style.setProperty('--card-hover', `rgba(${r}, ${g}, ${b}, 0.15)`);
            root.style.setProperty('--border', `rgba(${r}, ${g}, ${b}, 0.2)`);
            root.style.setProperty('--hover-border', `rgba(${r}, ${g}, ${b}, 0.4)`);
            root.style.setProperty('--button-bg', `rgba(${r}, ${g}, ${b}, 0.15)`);
            root.style.setProperty('--button-hover', `rgba(${r}, ${g}, ${b}, 0.25)`);
            root.style.setProperty('--link-color', pastelColor);
            root.style.setProperty('--link-hover', `rgba(${r}, ${g}, ${b}, 0.8)`);
            root.style.setProperty('--notification-success-bg', 'rgba(80, 250, 123, 0.8)');
            root.style.setProperty('--notification-error-bg', 'rgba(255, 85, 85, 0.8)');
            root.style.setProperty('--notification-info-bg', `rgba(${r}, ${g}, ${b}, 0.8)`);
        }
    }

    // Randomly select between pink, white, and pastel themes
    const themes = ['pink', 'white', 'pastel'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    
    if (randomTheme === 'pastel') {
        applyRandomPastelTheme();
        document.documentElement.setAttribute('data-theme', 'pastel');
    } else {
        document.documentElement.setAttribute('data-theme', randomTheme);
    }
    
    // Add a class to the body to indicate JS is enabled
    document.body.classList.add('js-enabled');
    
    // Initialize parallax mouse tracking for cards
    initParallaxEffect();

    const notificationContainer = document.getElementById('notification-container');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalContent = document.getElementById('modal-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalQrCodeContainer = document.getElementById('modal-qr-code');
    const modalAddress = document.getElementById('modal-address');
    const modalCopyBtn = document.getElementById('modal-copy-btn');
    const modalExplorerBtn = document.getElementById('modal-explorer-btn');
    
    let currentModalData = {};

    // --- Notifications --- //
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notificationContainer.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Animate out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // --- Modal --- //
    function showModal(data) {
        currentModalData = data;
        
        // 1. Set content
        modalTitle.textContent = data.name;
        modalAddress.textContent = data.address;
        
        // 2. Determine QR code content
        let qrContent = data.address;
        if (data.name === 'PayPal' || data.name === 'Cash App') {
            qrContent = data.explorerUrl; // Use the full link for payment apps
        }
        
        // 3. Generate QR Code
        modalQrCodeContainer.innerHTML = ''; // Clear previous QR code
        new QRCode(modalQrCodeContainer, {
            text: qrContent,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // 4. Update buttons
        modalCopyBtn.textContent = (data.name === 'PayPal' || data.name === 'Cash App') ? `Copy ${data.name === 'PayPal' ? 'Username' : 'Cashtag'}` : 'Copy Address';
        modalExplorerBtn.textContent = (data.name === 'PayPal' || data.name === 'Cash App') ? `Open ${data.name}` : 'View on Explorer';

        // 5. Show modal
        modalBackdrop.classList.remove('hidden');
    }

    function hideModal() {
        modalBackdrop.classList.add('hidden');
    }

    // Modal event listeners
    modalCloseBtn.addEventListener('click', hideModal);
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            hideModal();
        }
    });
    
    modalCopyBtn.addEventListener('click', () => {
        copyToClipboard(currentModalData.address, currentModalData.name);
    });

    modalExplorerBtn.addEventListener('click', () => {
        window.open(currentModalData.explorerUrl, '_blank');
        showNotification(`Opening link for ${currentModalData.name}...`, 'info');
        hideModal();
    });


    // --- Card Interaction Logic --- //
    document.querySelectorAll('.wallet-card-link').forEach(link => {
        // This is the core of the progressive enhancement.
        // We stop the default link behavior and show our modal instead.
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent navigation
            
            const card = link.querySelector('.wallet-card, .payment-card');
            const name = card.dataset.name;
            const address = card.dataset.address;
            const explorerTemplate = card.dataset.explorer;
            const explorerUrl = explorerTemplate.replace('%a', address);

            showModal({ name, address, explorerUrl });
        });

        // Handle clicks on the small buttons inside the card
        const card = link.querySelector('.wallet-card, .payment-card');
        const copyBtn = card.querySelector('.copy-btn');
        const explorerBtn = card.querySelector('.explorer-btn');
        
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const address = card.dataset.address;
                const name = card.dataset.name;
                copyToClipboard(address, name);
            });
        }
        
        if (explorerBtn) {
            explorerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const address = card.dataset.address;
                const name = card.dataset.name;
                const explorerTemplate = card.dataset.explorer;
                const explorerUrl = explorerTemplate.replace('%a', address);
                window.open(explorerUrl, '_blank');
                showNotification(`Opening ${name} explorer...`, 'info');
            });
        }
    });

    // --- Clipboard Logic --- //
    function copyToClipboard(text, name) {
        navigator.clipboard.writeText(text).then(() => {
            const type = (name === 'PayPal' || name === 'Cash App') ? (name === 'PayPal' ? 'Username' : 'Cashtag') : 'Address';
            showNotification(`${name} ${type} copied!`, 'success');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            showNotification('Failed to copy address', 'error');
        });
    }
    
    // --- 3D Parallax Effect for Wallet Cards --- //
    function initParallaxEffect() {
        const cardLinks = document.querySelectorAll('.wallet-card-link');

        cardLinks.forEach(link => {
            const card = link.querySelector('.wallet-card, .payment-card');
            
            link.addEventListener('mousemove', (e) => {
                const rect = link.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Calculate rotation values based on mouse position inside the card
                const rotateY = -1 * ((rect.width / 2 - x) / (rect.width / 2)) * 10; // Max 8 degrees tilt
                const rotateX = ((rect.height / 2 - y) / (rect.height / 2)) * 10; // Max 8 degrees tilt
                
                // Apply the rotation to the inner card element
                card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            link.addEventListener('mouseleave', () => {
                // Reset the inner card's transform smoothly
                card.style.transform = 'rotateX(0deg) rotateY(0deg)';
            });
        });
    }
});