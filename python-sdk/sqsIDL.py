from ic.candid import Types

List=Types.Rec()
List.fill(Types.Opt(Types.Tuple(Types.Principal, List)))

Message = Types.Record({
    'id': Types.Text,
    'message': Types.Text,
    'lastRead': Types.Int,
})

IDL={
    'addAuthorizedPrincipal': Types.Bool,
    'deleteMessage': Types.Bool,
    'deleteMessageUtil': (),
    'deleteMessagesInBatch': Types.Bool,
    'getAuthorizedPrincipals': List,
    'printQueue': Types.Vec(Message),
    'receiveMessage': Types.Vec(Message),
    'sendMessage': (),
    'sendMessagesInBatch': (),
    'setVisibilityTimeout': Types.Bool,
    'visibilityTimeout':  Types.Nat,
}

