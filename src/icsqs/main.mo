import Error "mo:base/Error";
import List "mo:base/List";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import UUID "mo:uuid/UUID";

shared (install) actor class ICSQS(authorizedPrincipals: List.List<Principal>) =
this { // Bind the optional `this` argument (any name wi

 type Message = {
   id: Text;
   message: Text;
 };

 // list of message objects
 var queueData: List.List<Message>  = List.nil();

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
 public shared(caller) func sendMessages(messages: [Text]) : async () {
  await verifyAuthorization(caller.caller);
  var messageList = List.nil<Message>();
  // add new message to queue
  for (messageText in Array.vals(messages)) {
    let messageObj: Message = await createMessage(messageText);
    messageList := List.push<Message>(messageObj, messageList);
  };
  queueData := List.append<Message>(messageList, queueData);
 };

 // delete a message from the queue permanently
 public shared(caller) func deleteMessage(messageId: Text) : async Bool {
  await verifyAuthorization(caller.caller);
  queueData := List.filter<Message>(queueData, func (messageObj: Message): Bool {
    if(messageObj.id == messageId) return false;
    return true;
  });
  return true;
 };

 // delete a messages from queue in bulk
 public shared(caller) func deleteMessagesInBulk(messageIds: [Text]) : async Bool {
  await verifyAuthorization(caller.caller);
  // filter messages
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
  return true;
 };

 // return message object to caller (dequeue operation)
 public shared(caller) func receiveMessage(count: Nat): async List.List<Message> {
  await verifyAuthorization(caller.caller);
  // take first `count` number of messages
  let messages: List.List<Message> = List.take<Message>(queueData, count);
  // remove first `count` number of messages from the list
  queueData := List.drop<Message>(queueData, count);
  return messages;
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
