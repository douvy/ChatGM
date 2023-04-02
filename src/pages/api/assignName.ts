// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
type Message = { role: string, content: string };

export default async function (req: {
    body: {
        conversation: {
            name?: string,
            messages: any[],
            id?: number,
        };
    };
}, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: { message: string; }; conversation?: { name?: string | undefined; messages: any[]; id?: number | undefined; }; }): void; new(): any; }; }; }) {
    if (!configuration.apiKey) {
        res.status(500).json({
            error: {
                message: "OpenAI API key not configured, please follow instructions in README.md",
            }
        });
        return;
    }

    var conversation = req.body.conversation;
    if (!conversation.name) {
        var previousMessages = conversation.messages || [];
        var messages: ChatCompletionRequestMessage[] = previousMessages.map(({ role, content }) => ({ role, content }));
        var nameRequestMessage: ChatCompletionRequestMessage = {
            role: "user",
            content: "generate a name for this conversation without quotation marks "
        }
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [...messages, nameRequestMessage],
        });
        var name = completion?.data?.choices[0]?.message?.content || undefined;
        name = name?.trim().replace(/^"(.*)"$/, '$1');

        console.log("Chat name:");
        console.log(name);
        conversation.name = name;
        const updatedConversation = await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
                name: conversation.name,
            },
            include: { messages: true },
        });
    }

    res.status(200).json({
        conversation: conversation
    });
}