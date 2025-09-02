const axios = require('axios');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code required' });
    }

    try {
        // Exchange code for token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', 
            new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.DISCORD_REDIRECT_URI
            }), 
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        // For production, you'd want to encrypt this token
        return res.status(200).json({
            token: access_token,
            expiresIn: expires_in
        });

    } catch (error) {
        console.error('OAuth error:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to authenticate with Discord' });
    }
};