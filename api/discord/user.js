const axios = require('axios');

module.exports = async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const response = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching user:', error.response?.data || error.message);
        return res.status(401).json({ error: 'Invalid token' });
    }
};