# **IC-SQS SDK**

Use this SDK to interact with ic-sqs.

IC-SQS is a **blockchain based decentralized simple queue service**. IC-SQS uses [Internet Computer Protocol](https://dfinity.org/) as platform to host and store queue messages.

#### Project status & support

- Status: **in active development**

**_NOTE!_** _IC-SQS and IC-SQS-SDK is **alpha-stage** software. It means IC-SQS hasn't been security audited and programming APIs and data formats can still change. We encourage you to reach out to the maintainers, if you plan to use IC-SQS in mission critical systems._

**Installation:**

```
yarn add @icsqs/sdk-js
```

or

```
npm install @icsqs/sdk-js
```

**Basic Usage:**

```js
import Queue from "@icsqs/sdk-js";
const ICQueueInstance = new Queue();
//use async function for this:
await ICQueueInstance.initIdentity("----Private-key----");

ICQueueInstance.receiveMessage(10); //to fetch 10 messages from queue
```

## Example:

```js
import Queue from "@icsqs/sdk-js";

const identity = "---Private key here ----";

const ICQueueInstance = new Queue();
const canisterId = "qgxzx-lqaaa-aaaaj-aaltq-cai";

const main = async () => {
  await ICQueueInstance.initIdentity(identity, canisterId);
  const messages = await ICQueueInstance.printQueue(0, 5);
  console.log(messages); //print recent 5 messages from queue
};

main();
```
