import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export default function handler(req, res) {
  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.statusCode = 200;

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Watch the database for changes
  const onChange = async (prisma: PrismaClient) => {
    await prisma.$connect();

    prisma.$on("query", (event: Prisma.QueryEvent) => {
      console.log(event);
    });

    const stream = await prisma.conversation.findMany().$stream();
    stream.on("data", (conversation) => {
      sendEvent(conversation);
    });

    stream.on("end", () => {
      console.log("Stream ended");
      prisma.$disconnect();
    });
  };

  onChange(prisma);
}
