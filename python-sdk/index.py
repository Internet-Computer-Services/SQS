from datetime import datetime
from ic.client import Client
from ic.identity import Identity
from ic.candid import encode, Types
from ic.agent import Agent
from sqsIDL import IDL

class ICSQS:
    def __init__(self, pem, canisterId, host="https://ic0.app"):
        self.pem=pem
        self.host=host
        self.identity=Identity.from_pem(pem)
        self.client=Client(host)
        self.agent=Agent(self.identity, self.client)
        self.canisterId=canisterId

    def getIdentity(self):
        return self.identity.sender()
    
    def addAuthorizedPrincipal(self, principal):
        params = [{'type': Types.Principal, 'value': principal}]
        return self.agent.update_raw(self.canisterId, "addAuthorizedPrincipal", encode(params), IDL["addAuthorizedPrincipal"])
    
    def printQueue(self, startFrom, count):
        params = [{'type': Types.Nat, 'value': startFrom}, {'type': Types.Nat, 'value': count}]
        return self.agent.update_raw(self.canisterId, "printQueue", encode(params), IDL["printQueue"])
    
    def getAuthorizedPrincipals(self):
        return self.agent.query_raw(self.canisterId, "getAuthorizedPrincipals", encode([]), IDL["getAuthorizedPrincipals"])
    
    def receiveMessage(self, count):
        params = [{'type': Types.Nat, 'value': count}]
        return self.agent.update_raw(self.canisterId, "receiveMessage", encode(params), IDL["receiveMessage"])
    
    def sendMessage(self, message):
        params = [{'type': Types.Text, 'value': message}]
        return self.agent.update_raw(self.canisterId, "sendMessage", encode(params), IDL["sendMessage"])
    
    def sendMessagesInBatch(self, messages):
        params = [{'type': Types.Vec(Types.Text), 'value': messages}]
        return self.agent.update_raw(self.canisterId, "sendMessagesInBatch", encode(params), IDL["sendMessagesInBatch"])
    
    def deleteMessage(self, messageId):
        params = [{'type': Types.Text, 'value': messageId}]
        return self.agent.update_raw(self.canisterId, "deleteMessage", encode(params), IDL["deleteMessage"])
    
    def deleteMessagesInBatch(self, messageIds):
        params = [{'type': Types.Vec(Types.Text), 'value': messageIds}]
        return self.agent.update_raw(self.canisterId, "deleteMessagesInBatch", encode(params), IDL["deleteMessagesInBatch"])
    
    def setVisibilityTimeout(self, timeout):
        params = [{'type': Types.Nat, 'value': timeout}]
        return self.agent.update_raw(self.canisterId, "setVisibilityTimeout", encode(params), IDL["setVisibilityTimeout"])
    
    def visibilityTimeout(self):
        return self.agent.query_raw(self.canisterId, "visibilityTimeout", encode([]), IDL["visibilityTimeout"])
