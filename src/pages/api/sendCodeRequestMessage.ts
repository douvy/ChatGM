// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function (req: {
    headers: any;
    body: {
        prompt: string
    };
}, res: {
    status: (arg0: number) => {
        (): any; new(): any; json: {
            (arg0: {
                error?: { message: string; } | { message: string; } | { message: string; }; result?: {
                    response?: string
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

    const prompt = req.body.prompt || '';
    if (prompt.trim().length === 0) {
        res.status(400).json({
            error: {
                message: "Please enter a valid prompt",
            }
        });
        return;
    }

    const messages: ChatCompletionRequestMessage[] = [{
        role: 'system',
        content: "You are a code producer and only send responses which are full HTML blocks no matter what the query is",
    },
    {
        role: 'user',
        content: prompt,
    }]

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
        });

        const response = completion?.data?.choices[0]?.message?.content || undefined;

        res.status(200).json({
            result: {
                response: response,
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