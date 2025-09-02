const axios = require('axios');
const OpenAI = require('openai');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { guildId } = req.query;
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { topics, threshold, openaiKey } = req.body;

    if (!token || !guildId || !openaiKey) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const openai = new OpenAI({
        apiKey: openaiKey
    });

    try {
        // Fetch channels from Discord
        const channelsResponse = await axios.get(
            `https://discord.com/api/guilds/${guildId}/channels`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const textChannels = channelsResponse.data.filter(
            channel => channel.type === 0 // Text channels only
        );

        const summaries = [];

        // Process each channel (limited to first 5 for demo)
        for (const channel of textChannels.slice(0, 5)) {
            try {
                // Fetch recent messages
                const messagesResponse = await axios.get(
                    `https://discord.com/api/channels/${channel.id}/messages?limit=50`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (messagesResponse.data.length === 0) {
                    continue;
                }

                // Prepare messages for AI analysis
                const messageContent = messagesResponse.data
                    .map(msg => `${msg.author.username}: ${msg.content}`)
                    .join('\n');

                // Generate summary using OpenAI
                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: `You are analyzing Discord channel messages. 
                            Provide a concise summary and identify key topics.
                            Rate the importance from 1-10 based on:
                            - Announcements or important updates (high)
                            - Active discussions (medium-high)
                            - Technical problems or issues (high)
                            - General chat (low)
                            User is interested in topics: ${topics.join(', ')}
                            
                            Respond in JSON format:
                            {
                                "summary": "brief summary of channel activity",
                                "topics": ["identified", "topics"],
                                "importance": 7,
                                "hasImportantInfo": true
                            }`
                        },
                        {
                            role: "user",
                            content: `Analyze these messages from #${channel.name}:\n\n${messageContent.slice(0, 2000)}`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 200
                });

                const analysis = JSON.parse(completion.choices[0].message.content);

                // Check for threads
                let hasThreads = false;
                try {
                    const threadsResponse = await axios.get(
                        `https://discord.com/api/channels/${channel.id}/threads/archived/public`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );
                    hasThreads = threadsResponse.data.threads?.length > 0;
                } catch (e) {
                    // Ignore thread fetch errors
                }

                summaries.push({
                    channelId: channel.id,
                    channelName: channel.name,
                    guildId: guildId,
                    summary: analysis.summary,
                    topics: analysis.topics || [],
                    importance: analysis.importance || 5,
                    hasThreads: hasThreads,
                    messageCount: messagesResponse.data.length,
                    lastActivity: messagesResponse.data[0]?.timestamp
                });

            } catch (error) {
                console.error(`Error processing channel ${channel.name}:`, error.message);
                // Continue with next channel
            }
        }

        // Sort by importance
        summaries.sort((a, b) => b.importance - a.importance);

        return res.status(200).json(summaries);

    } catch (error) {
        console.error('Error generating summaries:', error.response?.data || error.message);
        return res.status(500).json({ 
            error: 'Failed to generate summaries',
            details: error.message 
        });
    }
};