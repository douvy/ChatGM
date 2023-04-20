import Ably from 'ably/promises';

const client = new Ably.Realtime('OwHz7g.-GJQqA:TPHXWVKOyQhNTlu-g5MY4_4kd-nXu-QctBw4Ka_m63E');

export default async function handler(req, res) {
    // const client = new Ably.Realtime(process.env.ABLY_API_KEY);
    const tokenRequestData = await client.auth.createTokenRequest({ clientId: 'ably-nextjs-demo' });
    res.status(200).json(tokenRequestData);

    // if (req.method === 'POST') {
    //     try {
    //         const body = req.body ? JSON.parse(req.body) : {};
    //         const clientId = body.clientId || 'anonymous';

    //         const tokenParams = {
    //             clientId: clientId,
    //         };

    //         const tokenRequest = await client.auth.createTokenRequest(tokenParams);
    //         res.status(200).json(tokenRequest);
    //     } catch (error) {
    //         console.error('Error creating token request:', error);
    //         res.status(500).json({ message: 'Error creating token request' });
    //     }
    // } else {
    //     res.setHeader('Allow', ['POST']);
    //     res.status(405).end(`Method ${req.method} Not Allowed`);
    // }
}
