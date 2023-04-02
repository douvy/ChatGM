import Ably from 'ably/promises';

const ably = new Ably.Rest({ apiKey: 'OwHz7g.-GJQqA:TPHXWVKOyQhNTlu-g5MY4_4kd-nXu-QctBw4Ka_m63E' });

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { event, channelName, data } = req.body;

            console.log("publishing");
            const channel = ably.channels.get(channelName);
            console.log("publishing");
            await channel.publish(event, data);

            res.status(200).json({ message: 'Event published' });
        } catch (error) {
            console.error('Error publishing event:', error);
            res.status(500).json({ message: 'Error publishing event' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
