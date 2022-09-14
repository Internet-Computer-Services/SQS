# sdk-python

PythonSDK to access ICSQS on the internet computer

# Installation:

You'll need ic-py module to use sdk. First git clone sdk-python repo. cd into it & then run:

```
git clone git@github.com:rocklabs-io/ic-py.git
cd ic-py
pip3 install ./
```

```py
from index import ICSQS

pemString = """
-----BEGIN PRIVATE KEY-----
        *** Your Secret Key ****
-----END PRIVATE KEY-----
"""

canisterId="ryjl3-tyaaa-aaaaa-aaaba-cai"

#create instance of ic sqs
instance = ICSQS(pemString, canisterId, host)
# host here is optional, Default host is "https://ic0.app"
print(instance.printQueue(0, 3))
```

# Other available methods:

- addAuthorizedPrincipals
- getAuthorizedPrincipals
- receiveMessage
- sendMessage
- sendMessagesInBatch
- deleteMessage
- deleteMessagesInBatch
- setVisibilityTimeout
- visibilityTimeout
