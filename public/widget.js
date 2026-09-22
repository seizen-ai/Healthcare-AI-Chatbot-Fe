(function () {
    // Prevent multiple initializations
    if (window.SeizenChatWidget) return;
    window.SeizenChatWidget = true;

    // Extract public key from script tag
    const currentScript = document.currentScript;
    const publicKey = currentScript ? currentScript.getAttribute('data-public-key') : null;

    if (!publicKey) {
        console.error('[SeizenWidget] Missing data-public-key attribute on script tag.');
        return;
    }

    const API_URL = 'https://healthcare-ai-chatbot-be.onrender.com/api'; // In production, this should point to your real backend URL
    const GREETING_TEXT = 'Have a query? Chat with us';
    const GREETING_DELAY_MS = 4000;
    const GREETING_STORAGE_KEY = `seizen_greeting_dismissed_${publicKey}`;

    // Inject styles
    // Colors are exposed as CSS variables scoped to the widget container so a
    // future "custom theme" feature can override them per hospital without
    // touching this file (e.g. by injecting a small style block that sets
    // --seizen-primary, --seizen-bg, etc. before this script runs).
    const styles = document.createElement('style');
    styles.innerHTML = `
        #seizen-widget-container {
            --seizen-primary: #14b8a6;
            --seizen-primary-dark: #0d9488;
            --seizen-bg: #0b0f1a;
            --seizen-surface: #111827;
            --seizen-surface-hover: #1a2333;
            --seizen-border: #1e293b;
            --seizen-text: #f1f5f9;
            --seizen-text-muted: #94a3b8;

            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        #seizen-widget-btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: var(--seizen-primary);
            color: #05221e;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(20, 184, 166, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        #seizen-widget-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(20, 184, 166, 0.45);
        }
        #seizen-widget-btn svg {
            width: 26px;
            height: 26px;
            fill: currentColor;
        }
        #seizen-widget-greeting {
            position: absolute;
            bottom: 74px;
            right: 0;
            width: max-content;
            white-space: nowrap;
            max-width: 280px;
            box-sizing: border-box;
            background: var(--seizen-surface);
            border: 1px solid var(--seizen-border);
            border-radius: 14px 14px 2px 14px;
            padding: 10px 32px 10px 14px;
            font-size: 13px;
            font-weight: 500;
            line-height: 1.4;
            color: var(--seizen-text);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
            opacity: 0;
            pointer-events: none;
            transform: translateY(8px);
            transition: opacity 0.3s, transform 0.3s;
            cursor: pointer;
        }
        #seizen-widget-greeting.seizen-visible {
            opacity: 1;
            pointer-events: all;
            transform: translateY(0);
        }
        #seizen-widget-greeting-close {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: transparent;
            border: none;
            color: var(--seizen-text-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            transition: color 0.2s, background 0.2s;
        }
        #seizen-widget-greeting-close:hover {
            color: var(--seizen-text);
            background: var(--seizen-surface-hover);
        }
        #seizen-widget-greeting-close svg {
            width: 12px;
            height: 12px;
        }
        #seizen-widget-panel {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            max-height: calc(100vh - 120px);
            background: var(--seizen-bg);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            pointer-events: none;
            transform: translateY(10px);
            transition: opacity 0.3s, transform 0.3s;
            border: 1px solid var(--seizen-border);
        }
        #seizen-widget-panel.seizen-open {
            opacity: 1;
            pointer-events: all;
            transform: translateY(0);
        }
        #seizen-widget-header {
            background: var(--seizen-bg);
            color: var(--seizen-text);
            padding: 16px;
            font-weight: 500;
            font-size: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--seizen-border);
        }
        #seizen-widget-header span {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        #seizen-widget-header span::before {
            content: '';
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--seizen-primary);
            box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.2);
        }
        #seizen-widget-close {
            background: transparent;
            border: none;
            color: var(--seizen-text-muted);
            cursor: pointer;
            padding: 4px;
            display: flex;
            transition: color 0.2s;
        }
        #seizen-widget-close:hover {
            color: var(--seizen-text);
        }
        #seizen-widget-close svg {
            width: 20px;
            height: 20px;
        }
        #seizen-widget-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background: var(--seizen-bg);
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .seizen-msg {
            max-width: 85%;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.4;
            word-wrap: break-word;
        }
        .seizen-msg-user {
            background: var(--seizen-primary);
            color: #05221e;
            align-self: flex-end;
            border-bottom-right-radius: 2px;
        }
        .seizen-msg-bot {
            background: var(--seizen-surface);
            color: var(--seizen-text);
            align-self: flex-start;
            border-bottom-left-radius: 2px;
            border: 1px solid var(--seizen-border);
        }
        #seizen-widget-input-area {
            padding: 12px;
            background: var(--seizen-bg);
            border-top: 1px solid var(--seizen-border);
            display: flex;
            gap: 8px;
        }
        #seizen-widget-input {
            flex: 1;
            padding: 10px 12px;
            background: var(--seizen-surface);
            color: var(--seizen-text);
            border: 1px solid var(--seizen-border);
            border-radius: 20px;
            outline: none;
            font-size: 14px;
            transition: border-color 0.2s;
        }
        #seizen-widget-input::placeholder {
            color: var(--seizen-text-muted);
        }
        #seizen-widget-input:focus {
            border-color: var(--seizen-primary);
        }
        #seizen-widget-send {
            background: var(--seizen-primary);
            color: #05221e;
            border: none;
            border-radius: 20px;
            padding: 0 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
        }
        #seizen-widget-send:hover {
            background: var(--seizen-primary-dark);
        }
        #seizen-widget-send:disabled {
            background: var(--seizen-surface-hover);
            color: var(--seizen-text-muted);
            cursor: not-allowed;
        }
        #seizen-widget-footer {
            text-align: center;
            font-size: 11px;
            color: var(--seizen-text-muted);
            padding: 6px 0 10px;
            background: var(--seizen-bg);
        }
        .seizen-typing {
            display: flex;
            gap: 4px;
            padding: 12px 14px;
            background: var(--seizen-surface);
            border-radius: 12px;
            align-self: flex-start;
            border: 1px solid var(--seizen-border);
        }
        .seizen-dot {
            width: 6px;
            height: 6px;
            background: var(--seizen-text-muted);
            border-radius: 50%;
            animation: seizen-bounce 1.4s infinite ease-in-out both;
        }
        .seizen-dot:nth-child(1) { animation-delay: -0.32s; }
        .seizen-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes seizen-bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }

        @media (max-width: 480px) {
            #seizen-widget-panel {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                height: 100%;
                max-height: 100%;
                border-radius: 0;
            }
            #seizen-widget-greeting {
                max-width: calc(100vw - 96px);
            }
            #seizen-widget-container {
                bottom: 16px;
                right: 16px;
            }
        }
    `;
    document.head.appendChild(styles);

    // Create DOM structure
    const container = document.createElement('div');
    container.id = 'seizen-widget-container';

    container.innerHTML = `
        <div id="seizen-widget-panel">
            <div id="seizen-widget-header">
                <span>AI Assistant</span>
                <button id="seizen-widget-close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div id="seizen-widget-messages">
                <div class="seizen-msg seizen-msg-bot">Hello! How can I help you today?</div>
            </div>
            <div id="seizen-widget-input-area">
                <input type="text" id="seizen-widget-input" placeholder="Type your message..." autocomplete="off">
                <button id="seizen-widget-send">Send</button>
            </div>
            <div id="seizen-widget-footer">Powered by Seizen AI</div>
        </div>
        <div id="seizen-widget-greeting">
            <button id="seizen-widget-greeting-close" aria-label="Dismiss">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <span id="seizen-widget-greeting-text"></span>
        </div>
        <button id="seizen-widget-btn" aria-label="Open chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
    `;

    document.body.appendChild(container);

    // Elements
    const btn = document.getElementById('seizen-widget-btn');
    const panel = document.getElementById('seizen-widget-panel');
    const closeBtn = document.getElementById('seizen-widget-close');
    const messages = document.getElementById('seizen-widget-messages');
    const input = document.getElementById('seizen-widget-input');
    const sendBtn = document.getElementById('seizen-widget-send');
    const greeting = document.getElementById('seizen-widget-greeting');
    const greetingText = document.getElementById('seizen-widget-greeting-text');
    const greetingClose = document.getElementById('seizen-widget-greeting-close');

    // State
    let isOpen = false;
    let isWaiting = false;
    let greetingTimer = null;

    // Toggle panel
    const togglePanel = () => {
        isOpen = !isOpen;
        if (isOpen) {
            panel.classList.add('seizen-open');
            hideGreeting();
            input.focus();
        } else {
            panel.classList.remove('seizen-open');
        }
    };

    btn.addEventListener('click', togglePanel);
    closeBtn.addEventListener('click', togglePanel);

    // Proactive greeting bubble
    const isGreetingDismissed = () => {
        try {
            return localStorage.getItem(GREETING_STORAGE_KEY) === '1';
        } catch (err) {
            return false; // If storage is unavailable, just allow the greeting to show
        }
    };

    const dismissGreetingForFuture = () => {
        try {
            localStorage.setItem(GREETING_STORAGE_KEY, '1');
        } catch (err) {
            // Ignore storage errors (e.g. private browsing) - greeting may reappear next visit
        }
    };

    const hideGreeting = () => {
        greeting.classList.remove('seizen-visible');
    };

    const showGreeting = () => {
        if (isOpen || isGreetingDismissed()) return;
        greetingText.textContent = GREETING_TEXT;
        greeting.classList.add('seizen-visible');
    };

    greetingTimer = setTimeout(showGreeting, GREETING_DELAY_MS);

    greeting.addEventListener('click', () => {
        hideGreeting();
        if (!isOpen) togglePanel();
    });

    greetingClose.addEventListener('click', (e) => {
        e.stopPropagation(); // Don't also trigger the greeting's own click-to-open handler
        hideGreeting();
        dismissGreetingForFuture();
        if (greetingTimer) clearTimeout(greetingTimer);
    });

    // Add message to UI
    const addMessage = (text, isUser = false) => {
        const div = document.createElement('div');
        div.className = `seizen-msg ${isUser ? 'seizen-msg-user' : 'seizen-msg-bot'}`;
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    };

    // Show/hide typing indicator
    let typingIndicator = null;
    const showTyping = () => {
        typingIndicator = document.createElement('div');
        typingIndicator.className = 'seizen-typing';
        typingIndicator.innerHTML = '<div class="seizen-dot"></div><div class="seizen-dot"></div><div class="seizen-dot"></div>';
        messages.appendChild(typingIndicator);
        messages.scrollTop = messages.scrollHeight;
    };
    const hideTyping = () => {
        if (typingIndicator) {
            typingIndicator.remove();
            typingIndicator = null;
        }
    };

    // Send message to API
    const sendMessage = async () => {
        const text = input.value.trim();
        if (!text || isWaiting) return;

        input.value = '';
        addMessage(text, true);
        isWaiting = true;
        sendBtn.disabled = true;
        showTyping();

        try {
            // NOTE: The endpoint below should match your backend chat endpoint
            const res = await fetch(`${API_URL}/chat/${publicKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await res.json();

            if (res.ok && data.reply) {
                addMessage(data.reply);
            } else {
                addMessage('Sorry, I encountered an error processing your request.');
            }
        } catch (err) {
            console.error('[SeizenWidget] Error:', err);
            addMessage('Sorry, I am unable to connect to the server right now.');
        } finally {
            hideTyping();
            isWaiting = false;
            sendBtn.disabled = false;
            input.focus();
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

})();