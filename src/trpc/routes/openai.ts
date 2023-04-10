import { prisma } from '@utils/prismaSingleton';
import { trpc } from '../instance'
import { router } from '../../server/trpc';
// import { z } from 'zod';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import pusher from '../../server/lib/pusher';
import { Message } from '../../interfaces';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

interface Conversation {
    name?: string,
    messages: any[],
    id?: number,
    isActive?: boolean,
}

export const query = trpc.procedure.input((req: any) => {
    console.log("requesting response from assistant");
    return req;
}).query(async ({ input }) => {
    try {
        const conversation = input as Conversation;
        const messages: ChatCompletionRequestMessage[] = conversation.messages.map(({ role, content }) => ({ role, content }));
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
        });

        const response = completion?.data?.choices[0]?.message?.content || undefined;
        const responseMessage = {
            role: "assistant",
            content: response || "",
            avatarSource: "avatar-chat.png",
            // sender: "ChatGPT-3.5",
            // conversationId: conversation.id,
        };
        // const inserted = await prisma.message.create({ data: responseMessage });
        const updatedConversation = await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
                messages: {
                    create: responseMessage,
                },
            },
            include: {
                messages: { orderBy: { id: 'asc' }, },
                participants: true,
            },
        });
        console.log("updatedConversation", updatedConversation);
        pusher.trigger(`conversation-${updatedConversation.id}`, "new-message", {
            conversation: updatedConversation
        });
        return updatedConversation;
    } catch (e) {
        console.log("openai error:", e);
    }
});

export const queryPrompt = trpc.procedure.input((req: any) => {
    return req;
}).query(async ({ input }) => {
    let { role, content } = input;
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: role,
                    content: content,
                }
            ],
        });

        const response = completion?.data?.choices[0]?.message?.content || undefined;
        return response;
    } catch (e) {
        console.log("openai error:", e);
    }
});

export const queryPromptedPrompt = trpc.procedure.input((req: any) => {
    return req;
}).query(async ({ input }) => {
    let messages = input;
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages
        });

        const response = completion?.data?.choices[0]?.message?.content || undefined;
        return response;
    } catch (e) {
        console.log("openai error:", e);
    }
});

export const generateName = trpc.procedure.input((req: any) => {
    console.log("attempting to name");
    return req;
}).query(async ({ input }) => {
    try {
        const prompt = input as Message;
        const messages: ChatCompletionRequestMessage[] = conversation.messages.map(({ role, content }) => ({ role, content }));
        const nameRequestMessage: ChatCompletionRequestMessage = {
            role: "user",
            content: "generate a name for this conversation without quotation marks "
        }
        console.log("previous messages:", messages);
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [...messages, nameRequestMessage],
        });
        console.log("ccompletion:", completion.data);
        let name = completion?.data?.choices[0]?.message?.content || undefined;
        name = name?.trim().replace(/^"(.*)"$/, '$1');
        console.log("New name:", name);
        const updatedConversation = await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
                name: name,
            },
            include: {
                messages: { orderBy: { id: 'asc' }, },
                participants: true,
            },
        });
        return updatedConversation;
    } catch (e) {
        console.log("error in naming", e);
    }
})

export const openaiRouter = router({
    query: query,
    queryPrompt: queryPrompt,
    queryPromptedPrompt: queryPromptedPrompt,
    generateName: generateName,
});