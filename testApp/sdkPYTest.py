import os
import sys

sys.path.insert(1, '../python-sdk')
from index import ICSQS

pemString = os.environ['IC_PEM']
canisterId = "b5nbv-6aaaa-aaaap-aak4a-cai"
host = "https://ic0.app" # or "https://ic0.app"
# host is optional here, if not provided, the default is "https://ic0.app"

# Create a new instance of the SDK
instance = ICSQS(pemString, canisterId, host)
queueMessages = instance.printQueue(0, 5)
print(f"queueMessages: {queueMessages}")
# send a message to the queue
instance.sendMessage("Hello!")
instance.sendMessage("World!")
# get the message from the queue
messages = instance.receiveMessage(2)
print(f"messages: {messages}")
messageToBeDeleted = messages[0]['value'][0]['id']
print(f"deleting... {messageToBeDeleted}")
# delete the message from the queue
instance.deleteMessage(messageToBeDeleted)
print("Deleted!")
queueState = instance.printQueue(0, 5)
print(f"queueState: {queueState}")
