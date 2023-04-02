const { PrismaClient } = require('@prisma/client');
const { makePrismaClientClass } = require('prisma-client-lib');

const PrismaSingleton = makePrismaClientClass(PrismaClient);

let prismaInstance;

if (!prismaInstance) {
    prismaInstance = new PrismaSingleton({
        log: ['info', 'warn', 'error'],
    });
}

module.exports = prismaInstance;