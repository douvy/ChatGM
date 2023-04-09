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

    const responses = users.map(async (user) => {
        return user.starredMessages.map(async ({ role, content }) => {
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
            // const response = await client.openai.queryPrompt.query({
            //     prompt: message,
            // });
            console.log(response);
            pusher.trigger('chatgoodmorning-bot', 'message', {
                message: response,
                userId: user.telegramUserId,
            });
            return response
        })
    });

    Promise.all(responses)
        .then((results) => {
            pusher.trigger('chatgoodmorning-bot', 'message', {
                message: 'Testing runPrompts endpoint finish',
                userId: '515763629',
            });
        })
        .catch((error) => {
            // Handle any errors here
        });

    res.status(200).end('Hello Cron!!');
}