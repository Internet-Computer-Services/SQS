import Error "mo:base/Error";
import List "mo:base/List";
import Array "mo:base/Array";
import Result "mo:base/Result";
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
 type List<Message> = ?(Message, List<Message>);
 public type ErrorCustom = {
       #NotFound;
       #Unauthorized;
       #BadRequest;
 };

 var queueData: List<Message>  = List.nil();

 public shared(msg) func testTry(): async Text {
   let t = "abc";
   try {
     throw Error.reject("Unauthorized");
     Debug.print("try");
   } catch e {
     Debug.print("catch");
   };
   return t;
 };

 // check authorization
 private func verifyAuthorization(caller: Principal): async () {
    let authorized = List.some<Principal>(authorizedPrincipals, func (id: Principal): Bool {
      return id == caller;
    });
    if(authorized==false){
      throw Error.reject("Unauthorized");
    };
  };

 public shared(caller) func sendMessage(message: Text) : async () {
  await verifyAuthorization(caller.caller);
  let generator = UUID.Generator();
  let messageId: Text = UUID.toText(generator.new());
  let messageObj = {
    id = messageId;
    message = message;
  };
  queueData := List.push<Message>(messageObj, queueData);
 };


 public shared(caller) func sendMessages(messages: [Text]) : async Result.Result<(), ErrorCustom> {
  await verifyAuthorization(caller.caller);
  let generator = UUID.Generator();
  let messageList: [Message] = Array.map<Text, Message>(messages, func (messageText: Text): Message {
    let messageId: Text = UUID.toText(generator.new());
    let messageObj = {
      id = messageId;
      message = messageText;
    };
  });
  queueData := List.append<Message>(List.fromArray<Message>(messageList), queueData);
  return #ok();
 };

 public shared(caller) func deleteMessage(messageId: Text) : async Result.Result<Bool, ErrorCustom> {
  await verifyAuthorization(caller.caller);
  queueData := List.filter<Message>(queueData, func (messageObj: Message): Bool {
    if(messageObj.id == messageId) return false;
    return true;
  });
  return #ok(true);
 };

 public shared(caller) func deleteMessagesInBulk(messageIds: [Text]) : async Result.Result<Bool, ErrorCustom> {
  await verifyAuthorization(caller.caller);
  queueData := List.filter<Message>(queueData, func (messageObj: Message): Bool {
    let messageIdfound: ?Text = Array.find<Text>(messageIds, func (message_id: Text): Bool {
      return message_id == messageObj.id;
    });
    switch(messageIdfound) {
      case null {
        return true;
      };
      case (? found) {
        return false;
      };
    };
  });
  return #ok(true);
 };

 public shared(caller) func receiveMessage(count: Nat): async Result.Result<List<Message>, ErrorCustom> {
  await verifyAuthorization(caller.caller);
  var reversedList: List<Message> = List.reverse<Message>(queueData);
  let messages: List<Message> = List.take<Message>(reversedList, count);
  queueData := List.drop<Message>(reversedList, count);
  queueData := List.append<Message>(List.reverse<Message>(messages), List.reverse<Message>(queueData));
  return #ok(messages);
 };

 public shared query(caller) func printQueue(startIndex: Nat, count: Nat): async Result.Result<[Message], ErrorCustom> {
  await verifyAuthorization(caller.caller);

  // let queueChunk: (List<Text>, List<Text>) = List.split<Text>(startIndex, queueData);
  // let messageBlock: (List<Text>, List<Text>) = List.split<Text>(startIndex+count, List.last<Text>(queueChunk));
 
   // from which index & how many elements
  return #ok(List.toArray<Message>(queueData));
 };

 public query func getAuthorizedPrincipals() : async [Principal] {
    return authorizedPrincipals;
  };
};
