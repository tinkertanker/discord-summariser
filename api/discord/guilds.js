const axios = require('axios');

module.exports = async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const response = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Filter to only servers where user has message read permissions
        const guilds = response.data.filter(guild => {
            const permissions = BigInt(guild.permissions);
            const READ_MESSAGES = BigInt(0x400);
            return (permissions & READ_MESSAGES) === READ_MESSAGES;
        });

        return res.status(200).json(guilds);
    } catch (error) {
        console.error('Error fetching guilds:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to fetch guilds' });
    }
};