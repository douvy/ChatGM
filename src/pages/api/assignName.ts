// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { saveConversation } from '../../utils/db'
import { ObjectId } from 'mongodb';

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
            _id?: ObjectId,
        };
    };
}, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: { message: string; }; conversation?: { name?: string | undefined; messages: any[]; _id?: ObjectId | undefined; }; }): void; new(): any; }; }; }) {
    if (!configuration.apiKey) {
        res.status(500).json({
            error: {
                message: "OpenAI API key not configured, please follow instructions in README.md",
            }
        });
        return;
    }

    var conversation = req.body.conversation;
    if (conversation.name) {
    } else {
        var previousMessages = conversation.messages || [];
        var messages: ChatCompletionRequestMessage[] = previousMessages.map(({ role, content }) => ({ role, content }));
        console.log("generating name....");
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

        console.log("Conversation ID:", conversation._id);
        console.log(conversation);
        await saveConversation(conversation);
    }

    res.status(200).json({
        conversation: conversation
    });
}