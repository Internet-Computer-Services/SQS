import fetch from "node-fetch";
import * as crypto from "crypto";
import * as agent from "@dfinity/agent";
import Secp256k1KeyIdentity from "@dfinity/identity";

import { idlFactory } from "./queue.did.js";

global.fetch = fetch;

const { Actor, HttpAgent } = agent;

class Queue {
  constructor(host = "https://ic0.app", canisterId) {
    if (!canisterId) throw new Error("Canister id is required!");
    (this.canisterId = canisterId), (this.actor = null);
    this.agent = null;
    this.identity = null;
    this.host = host;
  }

  async initIdentity(key) {
    const privateKey = crypto.createHash("sha256").update(key).digest("base64");
    const identity = Secp256k1KeyIdentity.Secp256k1KeyIdentity.fromSecretKey(
      Buffer.from(privateKey, "base64")
    );
    const agent = new HttpAgent({
      host: this.host,
      identity: identity,
    });
    await agent.fetchRootKey();
    const actor = Actor.createActor(idlFactory, {
      canisterId: this.canisterId,
      agent,
    });

    console.log("Calling from Principal: ", identity.getPrincipal().toText());

    this.identity = identity;
    this.agent = agent;
    this.actor = actor;
  }

  addAuthorizedPrincipal(principal) {
    return this.actor.addAuthorizedPrincipal(principal);
  }

  getAuthorizedPrincipals() {
    return this.actor.getAuthorizedPrincipals();
  }

  printQueue(startIndex, count) {
    return this.actor.printQueue(startIndex, count);
  }

  receiveMessage(count) {
    return this.actor.receiveMessage(count);
  }

  sendMessage(message) {
    return this.actor.sendMessage(message);
  }

  sendMessagesInBatch(messages) {
    return this.actor.sendMessagesInBatch(messages);
  }

  deleteMessageById(message_id) {
    return this.actor.deleteMessage(message_id);
  }

  deleteMessagesInBatch(messageIds) {
    return this.actor.deleteMessagesInBatch(messageIds);
  }

  setVisibilityTimeout(timeout) {
    return this.actor.setVisibilityTimeout(timeout);
  }

  getVisibilityTimeout() {
    return this.actor.visibilityTimeout();
  }
}

export { Queue };
