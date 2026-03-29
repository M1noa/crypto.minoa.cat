document.addEventListener('DOMContentLoaded', () => {
    const OPEN_IN_NEW_TAB = 'noopener,noreferrer';

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
            root.style.setProperty('--button-shadow-soft', `rgba(${r}, ${g}, ${b}, 0.12)`);
            root.style.setProperty('--button-shadow-strong', `rgba(${r}, ${g}, ${b}, 0.18)`);
            root.style.setProperty('--link-color', pastelColor);
            root.style.setProperty('--link-hover', `rgba(${r}, ${g}, ${b}, 0.8)`);
            root.style.setProperty('--notification-success-bg', 'rgba(80, 250, 123, 0.16)');
            root.style.setProperty('--notification-error-bg', 'rgba(255, 85, 85, 0.16)');
            root.style.setProperty('--notification-info-bg', `rgba(${r}, ${g}, ${b}, 0.14)`);
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
    const activeNotifications = new Map();

    function openExternal(url) {
        window.open(url, '_blank', OPEN_IN_NEW_TAB);
    }

    // --- Notifications --- //
    function showNotification(message, type = 'info') {
        const notificationKey = `${type}:${message}`;
        const existingNotification = activeNotifications.get(notificationKey);

        if (existingNotification) {
            existingNotification.count += 1;
            existingNotification.countNode.textContent = `×${existingNotification.count}`;
            existingNotification.element.classList.add('is-stacked', 'is-refreshing');

            clearTimeout(existingNotification.hideTimeout);
            clearTimeout(existingNotification.refreshTimeout);

            existingNotification.refreshTimeout = setTimeout(() => {
                existingNotification.element.classList.remove('is-refreshing');
            }, 180);

            existingNotification.hideTimeout = setTimeout(() => {
                hideNotification(notificationKey);
            }, 3200);
            return;
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const messageNode = document.createElement('span');
        messageNode.className = 'notification__message';
        messageNode.textContent = message;

        const countNode = document.createElement('span');
        countNode.className = 'notification__count';
        countNode.textContent = '×1';

        notification.append(messageNode, countNode);
        notificationContainer.appendChild(notification);

        activeNotifications.set(notificationKey, {
            element: notification,
            count: 1,
            countNode,
            hideTimeout: null,
            refreshTimeout: null
        });

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Animate out and remove
        const hideTimeout = setTimeout(() => {
            hideNotification(notificationKey);
        }, 3200);

        activeNotifications.get(notificationKey).hideTimeout = hideTimeout;
    }

    function hideNotification(notificationKey) {
        const notificationEntry = activeNotifications.get(notificationKey);

        if (!notificationEntry) {
            return;
        }

        notificationEntry.element.classList.remove('is-refreshing');
        notificationEntry.element.style.opacity = '0';
        notificationEntry.element.style.transform = 'translateX(120%)';

        clearTimeout(notificationEntry.hideTimeout);
        clearTimeout(notificationEntry.refreshTimeout);

        setTimeout(() => {
            notificationEntry.element.remove();
        }, 380);

        activeNotifications.delete(notificationKey);
    }

    function restartCopySuccessAnimation(triggerBtn) {
        if (!triggerBtn) {
            return;
        }

        triggerBtn.classList.remove('copy-success');
        void triggerBtn.offsetWidth;
        triggerBtn.classList.add('copy-success');
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
        copyToClipboard(currentModalData.address, currentModalData.name, modalCopyBtn);
    });

    modalExplorerBtn.addEventListener('click', () => {
        openExternal(currentModalData.explorerUrl);
        showNotification(`Opening ${currentModalData.name} link…`, 'info');
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
                copyToClipboard(address, name, copyBtn);
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
                openExternal(explorerUrl);
                showNotification(`Opening ${name} explorer…`, 'info');
            });
        }
    });

    // --- Clipboard Logic --- //
    function copyToClipboard(text, name, triggerBtn) {
        navigator.clipboard.writeText(text).then(() => {
            const type = (name === 'PayPal' || name === 'Cash App') ? (name === 'PayPal' ? 'Username' : 'Cashtag') : 'Address';
            showNotification(`${name} ${type} copied!`, 'success');
            restartCopySuccessAnimation(triggerBtn);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            showNotification('Failed to copy address', 'error');
        });
    }
});
