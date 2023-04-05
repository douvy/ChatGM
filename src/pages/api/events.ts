import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
  ],
});

export default function handler(req: any, res: any) {
  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.statusCode = 200;

  // const sendEvent = (data: any) => {
  //   res.write(`data: ${JSON.stringify(data)}\n\n`);
  // };

  // Watch the database for changes
  const onChange = async (prisma: PrismaClient) => {
    await prisma.$connect();

    // prisma.$on("query", async (e) => {
    //   console.log(`${e.query} ${e.params}`)
    // });

    // const stream = await prisma.conversation.findMany().$stream();
    // stream.on("data", (conversation: any) => {
    //   sendEvent(conversation);
    // });

    // stream.on("end", () => {
    //   console.log("Stream ended");
    //   prisma.$disconnect();
    // });
  };

  onChange(prisma);
}
