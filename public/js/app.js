class DiscordSummaryApp {
    constructor() {
        this.user = null;
        this.servers = [];
        this.summaries = [];
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        document.getElementById('login-btn')?.addEventListener('click', () => this.login());
        document.getElementById('save-settings')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('importance-threshold')?.addEventListener('input', (e) => {
            document.getElementById('threshold-value').textContent = e.target.value;
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterSummaries(e.target.dataset.filter);
            });
        });
    }

    async checkAuthStatus() {
        const token = this.getToken();
        if (token) {
            await this.fetchUser();
        }
    }

    getToken() {
        return localStorage.getItem('discord_token');
    }

    setToken(token) {
        localStorage.setItem('discord_token', token);
    }

    loadSettings() {
        const saved = localStorage.getItem('app_settings');
        return saved ? JSON.parse(saved) : {
            topics: [],
            importanceThreshold: 5,
            openaiKey: ''
        };
    }

    saveSettings() {
        const topics = document.getElementById('topics-input').value
            .split(',')
            .map(t => t.trim())
            .filter(t => t);
        const threshold = document.getElementById('importance-threshold').value;
        const openaiKey = document.getElementById('openai-key').value;

        this.settings = {
            topics,
            importanceThreshold: parseInt(threshold),
            openaiKey
        };

        localStorage.setItem('app_settings', JSON.stringify(this.settings));
        this.showNotification('Settings saved successfully!', 'success');
    }

    login() {
        const clientId = 'YOUR_DISCORD_CLIENT_ID'; // Will be set from environment
        const redirectUri = encodeURIComponent(window.location.origin + '/api/auth/callback');
        const scope = 'identify guilds guilds.members.read messages.read';
        
        window.location.href = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    }

    async fetchUser() {
        this.showLoading('Fetching user information...');
        
        try {
            const response = await fetch('/api/discord/user', {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (response.ok) {
                this.user = await response.json();
                this.updateUI();
                await this.fetchServers();
            } else {
                this.handleAuthError();
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            this.handleAuthError();
        } finally {
            this.hideLoading();
        }
    }

    async fetchServers() {
        this.showLoading('Loading your Discord servers...');
        
        try {
            const response = await fetch('/api/discord/guilds', {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (response.ok) {
                this.servers = await response.json();
                this.displayServers();
            }
        } catch (error) {
            console.error('Error fetching servers:', error);
        } finally {
            this.hideLoading();
        }
    }

    async fetchChannelSummaries(guildId) {
        this.showLoading('Analyzing channels...');
        
        try {
            const response = await fetch(`/api/discord/guild/${guildId}/summary`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topics: this.settings.topics,
                    threshold: this.settings.importanceThreshold,
                    openaiKey: this.settings.openaiKey
                })
            });

            if (response.ok) {
                this.summaries = await response.json();
                this.displaySummaries();
            }
        } catch (error) {
            console.error('Error fetching summaries:', error);
            this.showNotification('Failed to generate summaries. Check your OpenAI key.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    updateUI() {
        if (this.user) {
            document.getElementById('login-section').classList.add('hidden');
            document.getElementById('settings-section').classList.remove('hidden');
            document.getElementById('servers-section').classList.remove('hidden');
            
            const userInfo = document.getElementById('user-info');
            userInfo.innerHTML = `
                <img src="https://cdn.discordapp.com/avatars/${this.user.id}/${this.user.avatar}.png" 
                     alt="${this.user.username}" class="user-avatar">
                <span>${this.user.username}</span>
                <button class="logout-btn" onclick="app.logout()">Logout</button>
            `;

            // Load saved settings
            document.getElementById('topics-input').value = this.settings.topics.join(', ');
            document.getElementById('importance-threshold').value = this.settings.importanceThreshold;
            document.getElementById('threshold-value').textContent = this.settings.importanceThreshold;
            document.getElementById('openai-key').value = this.settings.openaiKey;
        } else {
            document.getElementById('login-section').classList.remove('hidden');
            document.getElementById('settings-section').classList.add('hidden');
            document.getElementById('servers-section').classList.add('hidden');
            document.getElementById('summaries-section').classList.add('hidden');
            document.getElementById('user-info').innerHTML = '';
        }
    }

    displayServers() {
        const container = document.getElementById('servers-list');
        container.innerHTML = this.servers.map(server => `
            <div class="server-card" onclick="app.fetchChannelSummaries('${server.id}')">
                ${server.icon ? 
                    `<img src="https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png" 
                          alt="${server.name}" class="server-icon">` :
                    `<div class="server-icon">${server.name.charAt(0)}</div>`
                }
                <div class="server-name">${server.name}</div>
            </div>
        `).join('');
    }

    displaySummaries() {
        document.getElementById('summaries-section').classList.remove('hidden');
        const container = document.getElementById('summaries-container');
        
        container.innerHTML = this.summaries.map(summary => `
            <div class="summary-card ${summary.importance >= 7 ? 'important' : ''}" 
                 data-topics="${summary.topics.join(',')}"
                 data-importance="${summary.importance}">
                <div class="summary-header">
                    <div class="channel-name">
                        # ${summary.channelName}
                    </div>
                    <span class="importance-badge importance-${this.getImportanceLevel(summary.importance)}">
                        Importance: ${summary.importance}/10
                    </span>
                </div>
                <div class="summary-content">
                    ${summary.summary}
                </div>
                ${summary.topics.length > 0 ? `
                    <div class="summary-topics">
                        ${summary.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="summary-actions">
                    <button class="action-btn" onclick="app.openInDiscord('${summary.guildId}', '${summary.channelId}')">
                        Open in Discord
                    </button>
                    ${summary.hasThreads ? `
                        <button class="action-btn" onclick="app.showThreads('${summary.channelId}')">
                            View Threads
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    filterSummaries(filter) {
        const cards = document.querySelectorAll('.summary-card');
        cards.forEach(card => {
            let show = true;
            
            if (filter === 'important') {
                show = parseInt(card.dataset.importance) >= this.settings.importanceThreshold;
            } else if (filter === 'topics') {
                const cardTopics = card.dataset.topics.toLowerCase().split(',');
                show = this.settings.topics.some(topic => 
                    cardTopics.some(ct => ct.includes(topic.toLowerCase()))
                );
            }
            
            card.style.display = show ? 'block' : 'none';
        });
    }

    getImportanceLevel(score) {
        if (score >= 7) return 'high';
        if (score >= 4) return 'medium';
        return 'low';
    }

    openInDiscord(guildId, channelId) {
        window.open(`discord://discord.com/channels/${guildId}/${channelId}`, '_blank');
    }

    async showThreads(channelId) {
        // Fetch and display thread summaries
        // Implementation similar to channel summaries
        console.log('Showing threads for channel:', channelId);
    }

    logout() {
        localStorage.removeItem('discord_token');
        this.user = null;
        this.updateUI();
    }

    handleAuthError() {
        this.logout();
        this.showNotification('Authentication failed. Please login again.', 'error');
    }

    showLoading(message = 'Loading...') {
        document.getElementById('loading-overlay').classList.remove('hidden');
        document.getElementById('loading-message').textContent = message;
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        // Simple notification - could be enhanced with a proper notification library
        console.log(`[${type}] ${message}`);
    }
}

// Initialize app
const app = new DiscordSummaryApp();

// Handle OAuth callback
if (window.location.search.includes('code=')) {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    // Exchange code for token
    fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            app.setToken(data.token);
            window.history.replaceState({}, document.title, '/');
            app.checkAuthStatus();
        }
    })
    .catch(err => {
        console.error('Auth callback error:', err);
        app.showNotification('Login failed. Please try again.', 'error');
    });
}