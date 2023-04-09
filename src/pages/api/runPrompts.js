import pusher from '../../server/lib/pusher';
import { client } from '../../trpc/client';
import { prisma } from '@utils/prismaSingleton';
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
    const users = await prisma.user.findMany({
        where: {
            enableChatGMBot: true,
            telegramUserId: {
                not: null,
            },
        },
        include: {
            starredMessages: {
                where: {
                    role: 'user',
                },
            },
        },
    });

    for (let i = 0; i < users.length; i++) {
        const user = users[i];

        // Loop through the user's messages
        const messages = user.starredMessages;
        for (let j = 0; j < messages.length; j++) {
            const { role, content } = messages[j];

            // Make the API request
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role,
                        content,
                    }
                ],
            });

            const response = completion?.data?.choices[0]?.message?.content || undefined;

            await pusher.trigger('chatgoodmorning-bot', 'message', {
                message: response + new Date().toLocaleTimeString(),
                userId: user.telegramUserId,
            });
        }
    }

    pusher.trigger('chatgoodmorning-bot', 'message', {
        message: 'Testing runPrompts endpoint finish' + new Date().toLocaleTimeString(),
        userId: '515763629',
    });

    res.status(200).json({ message: 'All messages processed successfully, ' + new Date().toLocaleTimeString() });
}