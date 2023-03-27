// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
// const messages: ChatCompletionRequestMessage[] = [];
type Message = { role: string, content: string };

export default async function (req: { body: { prompt: string, previousMessages: []; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: { message: string; } | { message: string; } | { message: string; }; result?: string; }): void; new(): any; }; }; }) {
    if (!configuration.apiKey) {
        res.status(500).json({
            error: {
                message: "OpenAI API key not configured, please follow instructions in README.md",
            }
        });
        return;
    }

    var previousMessages = req.body.previousMessages || [];
    console.log(previousMessages);

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
    messages.push({ role: "user", content: prompt })
    console.log(messages);

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
        });
        var result = completion?.data?.choices[0]?.message?.content || undefined;
        res.status(200).json({ result: result });
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