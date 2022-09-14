import { Queue } from "../js-sdk/index.js";

const identity = process.env.IC_PEM;
const canister_id = "ryjl3-tyaaa-aaaaa-aaaba-cai"; // this should be the canister id of your queue canister
const host = "http://localhost:8002"; // host is optional here, default is  "https://ic0.app"

const main = async () => {
  const queue = new Queue(host, canister_id);
  // initialize the identity
  await queue.initIdentity(identity);
  // print the first 5 messages in the queue
  const queueMessages = await queue.printQueue(0, 5);
  console.log("queueMessages: ", queueMessages);
  // send a message to the queue
  await queue.sendMessage("Hello!");
  await queue.sendMessage("world!");
  // get the message from the queue
  const messages = await queue.receiveMessage(2);
  console.log("received messages: ", messages);
  const messageToBeDeleted = messages[0].id;
  console.log("Deleting message: ", messageToBeDeleted);
  // delete the message from the queue
  await queue.deleteMessageById(messageToBeDeleted);
  console.log("Deleted!");
  const queueState = await queue.printQueue(0, 5);
  console.log("Queue State Now: ", queueState);
};

main();
