// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { saveConversation } from '../../utils/db'
import { ObjectId } from 'mongodb';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
// const messages: ChatCompletionRequestMessage[] = [];
type Message = { role: string, content: string };

export default async function (req: {
    body: {
        prompt: string, conversation: {
            name?: string,
            messages: any[],
            _id?: ObjectId,
        };
    };
}, res: {
    status: (arg0: number) => {
        (): any; new(): any; json: {
            (arg0: {
                error?: { message: string; } | { message: string; } | { message: string; }; result?: {
                    response?: string,
                    conversation: {},
                }
            }): void; new(): any;
        };
    };
}) {
    if (!configuration.apiKey) {
        res.status(500).json({
            error: {
                message: "OpenAI API key not configured, please follow instructions in README.md",
            }
        });
        return;
    }

    var conversation = req.body.conversation;
    console.log(conversation);
    var previousMessages = conversation.messages || [];

    const prompt = req.body.prompt || '';
    if (prompt.trim().length === 0) {
        res.status(400).json({
            error: {
                message: "Please enter a valid prompt",
            }
        });
        return;
    }

    var messages: ChatCompletionRequestMessage[] = previousMessages.map(({ role, content }) => ({ role, content }));
    console.log(messages);

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
        });

        var response = completion?.data?.choices[0]?.message?.content || undefined;
        conversation.messages.push({
            role: "assistant",
            content: response || "",
            avatarSource: "avatar-chat.png",
            sender: "ChatGPT-3.5",
        });
        console.log(conversation.messages);

        console.log("Maybe generating name...");
        console.log(conversation._id);
        if (typeof conversation._id !== "undefined") {
            console.log("updating");
            conversation._id = new ObjectId(conversation._id);
        } else {
            // generate a name for a new conversation
            console.log("generating name....");
            var nameRequestMessage: ChatCompletionRequestMessage = {
                role: "user",
                content: "generate a name for this conversation without quotation marks"
            }
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [...messages, nameRequestMessage],
            });
            var name = completion?.data?.choices[0]?.message?.content || undefined;
            console.log("Chat name:");
            console.log(name);
            conversation.name = name;
        }
        console.log(typeof conversation._id);
        var _id = await saveConversation(conversation);
        conversation._id = new ObjectId(_id);

        res.status(200).json({
            result: {
                response: response,
                conversation: conversation,
            }
        });
        return res;
    } catch (error: any) {
        // Consider adjusting the error handling logic for your use case
        if (error.response) {
            console.error(error.response.status, error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error(`Error with OpenAI API request: ${error.message}`);
            res.status(500).json({
                error: {
                    message: 'An error occurred during your request.',
                }
            });
        }
    }
}