import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function saveConversation(conversation) {
    const { id, name, messages } = conversation;

    // If conversation has an id, it already exists and we need to update it
    if (id) {
        const existingConversation = await prisma.conversation.findUnique({
            where: { id },
            include: { messages: true }
        });

        // If the conversation doesn't exist, throw an error
        if (!existingConversation) {
            throw new Error(`Conversation with id ${id} does not exist`);
        }

        // Update the conversation name if it exists in the input object
        if (name !== undefined) {
            await prisma.conversation.update({
                where: { id },
                data: { name }
            });
        }

        // Update existing messages, create new ones and delete old ones
        const existingMessageIds = existingConversation.messages.map(message => message.id);
        const inputMessageIds = messages.filter(message => message.id !== undefined).map(message => message.id);

        // Delete messages that are no longer in the input object
        const messagesToDelete = existingMessageIds.filter(id => !inputMessageIds.includes(id));
        if (messagesToDelete.length > 0) {
            await prisma.message.deleteMany({ where: { id: { in: messagesToDelete } } });
        }

        // Update existing messages
        const messagesToUpdate = messages.filter(message => message.id !== undefined);
        if (messagesToUpdate.length > 0) {
            await Promise.all(messagesToUpdate.map(async (message) => {
                await prisma.message.update({
                    where: { id: message.id },
                    data: {
                        content: message.content,
                        role: message.role,
                        sender: message.sender,
                        avatarSource: message.avatarSource,
                    }
                });
            }));
        }

        // Create new messages
        const messagesToCreate = messages.filter(message => message.id === undefined);
        if (messagesToCreate.length > 0) {
            await Promise.all(messagesToCreate.map(async (message) => {
                await prisma.message.create({
                    data: {
                        content: message.content,
                        role: message.role,
                        sender: message.sender,
                        avatarSource: message.avatarSource,
                        conversation: { connect: { id } }
                    }
                });
            }));
        }

        // Return the updated conversation with messages
        const updatedConversation = await prisma.conversation.findUnique({
            where: { id },
            include: { messages: true }
        });

        return updatedConversation;
    }
    // If conversation doesn't have an id, it's a new conversation that needs to be created
    else {
        const newConversation = await prisma.conversation.create({
            data: { name },
            include: { messages: true }
        });

        // Create new messages
        if (messages.length > 0) {
            await Promise.all(messages.map(async (message) => {
                await prisma.message.create({
                    data: {
                        content: message.content,
                        role: message.role,
                        sender: message.sender,
                        avatarSource: message.avatarSource,
                        conversation: { connect: { id: newConversation.id } }
                    }
                });
            }));
        }

        const updatedConversation = await prisma.conversation.findUnique({
            where: { id: newConversation.id },
            include: { messages: true }
        });

        return updatedConversation;
    }
}

export default saveConversation;