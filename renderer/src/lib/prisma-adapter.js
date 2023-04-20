import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

// Extend the PrismaAdapter class
class ChatGMPrismaAdapter extends PrismaAdapter {
    constructor() {
        // Call the parent constructor with the Prisma client instance
        super({ PrismaClient() });
    }

    // Override the createUser method to add custom logic
    async createUser(profile) {
        // Call the parent createUser method to create the user in the database
        const user = await super.createUser(profile);

        // Add any custom logic here

        return user;
    }

    // Override the getUser method to add custom logic
    async getUser(id) {
        // Call the parent getUser method to retrieve the user from the database
        const user = await super.getUser(id);

        // Add any custom logic here

        return user;
    }

    // Override the updateUser method to add custom logic
    async updateUser(id, profile) {
        // Call the parent updateUser method to update the user in the database
        const user = await super.updateUser(id, profile);

        // Add any custom logic here

        return user;
    }

    // Override the deleteUser method to add custom logic
    async deleteUser(id) {
        // Call the parent deleteUser method to delete the user from the database
        await super.deleteUser(id);

        // Add any custom logic here
    }
}

export default ChatGMPrismaAdapter;
