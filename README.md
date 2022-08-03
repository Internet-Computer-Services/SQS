# SQS

Simple queueing service built for Internet Computer

## Featurelist of AWS-SQS:

- Create queue
- Enqueue
- Dequeue
- Delete Message
- Visibility Timeout
- Enqueue in batches
- Dequeue in batches
- Delete in batches
- Autodelete after a certain period/ retain time
- Server side encryption
- Once processed only / FIFO queue
- Send & read message simultaneously
- Queue sharing
- Dead Letter Queues(DLQs)

## Featurelist of IC-SQS

- Create queue
- Enqueue
- Dequeue
- Delete Message
- Visibility Timeout
- Enqueue in batches
- Dequeue in batches
- Delete in batches
- Server side encryption
- Once processed only / FIFO queue
- Send & read message simultaneously

### <b>Note: </b> with investigation we will be following this development timeline:
#### week 1: basic Queue implementations
- Create queue
- Update queue
- Delete queue
- Enqueue
- Dequeue
- Delete Messages

#### week 2: focusing on bulk operations
- Enqueue in batches
- Dequeue in batches
- Delete in batches

### week 3: Security & Protection related changes
- Server side encryption
- Visibility Timeout

### week 4: Feature upgrades
- FIFO queue
- Send & read messages simultaneously
- Once processed only

---------

#### <b>DFX Commands for local testing</b>

```
$ dfx deploy --mode=reinstall --argument '(opt record {principal "woicf-w4c3l-ggagd-ktql2-zzwf6-xwrx7-ehupq-an62o-uvf5d-owgvw-nae"; null})' icsqs  
```

#### <b>To call methods:</b> dfx canister call <canister_id> <method_name> '(<arguments>)'
examples:
```
$ dfx canister call <canister_id> sendMessage '("<message>")'

$ dfx canister call <canister_id> printQueue '(<start_index>, <end_index>)'

```
