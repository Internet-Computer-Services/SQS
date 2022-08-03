import Error "mo:base/Error";
import List "mo:base/List";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import UUID "mo:uuid/UUID";
import Time "mo:base/Time";

shared (install) actor class ICSQS(authorizedPrincipals: List.List<Principal>) =
this { // Bind the optional `this` argument (any name wi

 type Message = {
   id: Text;
   message: Text;
   lastRead: Int;
 };

 // list of message objects
 stable var queueData: List.List<Message>  = List.nil();
 stable var visiblit_timeout: Nat = 30; // in seconds

 // check authorization
 private func verifyAuthorization(caller: Principal): async () {
    let authorized = List.some<Principal>(authorizedPrincipals, func (id: Principal): Bool {
      return id == caller;
    });
    if(authorized==false){
      throw Error.reject("Unauthorized");
    };
  };

  // helper method to create new message object with given text
  private func createMessage(message: Text): async Message {
    // generates unique identifier for message id
    let generator = UUID.Generator();
    let messageId: Text = UUID.toText(generator.new());
    let messageObj = {
      id = messageId;
      message = message;
      lastRead = -1;
    };
    return messageObj;
  };

 // enqueue a single message in the queue
 public shared(caller) func sendMessage(message: Text) : async () {
  await verifyAuthorization(caller.caller);
  let messageObj: Message = await createMessage(message);

  // enqueue new message to existing queue
  queueData := List.push<Message>(messageObj, queueData);
 };


 // enqueue multiple messages in the queue
 public shared(caller) func sendMessagesInBatch(messages: [Text]) : async () {
  await verifyAuthorization(caller.caller);
  var messageList = List.nil<Message>();
  // add new message to queue
  for (messageText in Array.vals(messages)) {
    let messageObj: Message = await createMessage(messageText);
    messageList := List.push<Message>(messageObj, messageList);
  };
  queueData := List.append<Message>(messageList, queueData);
 };

 // utility method to delete messages from queue
 public shared(caller) func deleteMessageUtil(messageIds: [Text]) : async () {
  queueData := List.filter<Message>(queueData, func (messageObj: Message): Bool {
    let messageIdfound: ?Text = Array.find<Text>(messageIds, func (message_id: Text): Bool {
      return message_id == messageObj.id;
    });
    switch(messageIdfound) {
      // message id does not exists in the list of messages to be deleted
      case null {
        return true;
      };
      // message id exists in the list of messages to be deleted
      case (? found) {
        return false;
      };
    };
  });
 };

 // delete a message from the queue permanently
 public shared(caller) func deleteMessage(messageId: Text) : async Bool {
  await verifyAuthorization(caller.caller);
  await deleteMessageUtil([messageId]);
  return true;
 };

 // delete a messages from queue in batch
 public shared(caller) func deleteMessagesInBatch(messageIds: [Text]) : async Bool {
  await verifyAuthorization(caller.caller);
  // filter messages
  await deleteMessageUtil(messageIds);
  return true;
 };

 // return message object to caller (dequeue operation)
 public shared(caller) func receiveMessage(count: Nat): async [Message] {
  await verifyAuthorization(caller.caller);
  // take first `count` number of messages
  var message_count: Int = count;
  var messages: List.List<Message> = List.nil();
  let current_time: Int = Time.now();

  queueData := List.map<Message, Message>(queueData, func(message: Message): Message {
    let lastReadTime: Int = (current_time - message.lastRead) / 1_000_000_000;
    if(message_count > 0 and (message.lastRead == -1 or lastReadTime > visiblit_timeout)) {
      let messageObj: Message = {
        id = message.id;
        message = message.message;
        lastRead = current_time;
      };
      messages := List.push<Message>(messageObj, messages);
      message_count-=1;
      return messageObj;
    };
    return message;
  });
  return List.toArray<Message>(messages);
 };

 // update visibility timeout
 public shared(caller) func setVisibilityTimeout(timeout: Nat): async Bool {
   await verifyAuthorization(caller.caller);
   visiblit_timeout := timeout;
   return true;
 };

 // get current visibility timeout
 public shared query(caller) func visibilityTimeout(): async Nat {
   visiblit_timeout;
 };

 // print queue data
 public shared(caller) func printQueue(startIndex: Nat, count: Nat): async [Message] {
  await verifyAuthorization(caller.caller);
  let partition: (List.List<Message>, List.List<Message>) = List.split<Message>(startIndex, queueData);
  let queue: (List.List<Message>, List.List<Message>) = List.split<Message>(count, partition.1);

  return List.toArray<Message>(queue.0);
 };

 // helper method to get authorized principals' list
 public query func getAuthorizedPrincipals() : async List.List<Principal> {
    return authorizedPrincipals;
  };
};
