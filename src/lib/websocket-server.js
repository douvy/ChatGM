const WebSocket = require('ws')
const MongoClient = require('mongodb').MongoClient

const url = "mongodb+srv://chatgm:chatgmiscool@chatgm.aqaulgo.mongodb.net/ChatGM?retryWrites=true&w=majority";

console.group("Running WebSocket server on port 8080");

// console.log(dbo);
async function doCall() {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  const dbo = client.db('ChatGM');
  console.log("TEST");

  const wss = new WebSocket.Server({ port: 8080 })

  wss.on('connection', function connection(ws) {
    console.log('Client connected')

    const changeStream = dbo.collection('conversations').watch()
    changeStream.on('change', async function (change) {
      console.log('Database collection modified:', change)

      const db = client.db('ChatGM');
      const conversations = dbo.collection('conversations');
      var cursor = await conversations.find();
      const result = await cursor.toArray();
      console.log("Websocket update result:", result);
      ws.send(JSON.stringify(result))

      // dbo
      //   .collection('conversations')
      //   .find()
      //   .toArray(function (err, result) {
      //     console.log("result:", result);
      //     console.log(err);
      //     if (err) throw err

      //     ws.send(JSON.stringify(result))
      //   })
    })

    ws.on('close', function close() {
      console.log('Client disconnected')
      changeStream.close()
    })
  })


  // await MongoClient.connect(url, function (err, db) {
  //   if (err) console.log(err)
  //   const dbo = db.db('ChatGM')
  //   console.log("TEST");

  //   const wss = new WebSocket.Server({ port: 8080 })

  //   wss.on('connection', function connection(ws) {
  //     console.log('Client connected')

  //     const changeStream = dbo.collection('conversations').watch()
  //     changeStream.on('change', function (change) {
  //       console.log('Database collection modified:', change)

  //       dbo
  //         .collection('conversations')
  //         .find()
  //         .toArray(function (err, result) {
  //           if (err) throw err

  //           ws.send(JSON.stringify(result))
  //         })
  //     })

  //     ws.on('close', function close() {
  //       console.log('Client disconnected')
  //       changeStream.close()
  //     })
  //   })
  // })
}

doCall();