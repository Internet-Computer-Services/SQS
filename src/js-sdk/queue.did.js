export const idlFactory = ({ IDL }) => {
  const List = IDL.Rec();
  List.fill(IDL.Opt(IDL.Tuple(IDL.Principal, List)));
  const Message = IDL.Record({
    id: IDL.Text,
    message: IDL.Text,
    lastRead: IDL.Int,
  });
  const ICSQS = IDL.Service({
    addAuthorizedPrincipal: IDL.Func([IDL.Principal], [IDL.Bool], []),
    deleteMessage: IDL.Func([IDL.Text], [IDL.Bool], []),
    deleteMessageUtil: IDL.Func([IDL.Vec(IDL.Text)], [], []),
    deleteMessagesInBatch: IDL.Func([IDL.Vec(IDL.Text)], [IDL.Bool], []),
    getAuthorizedPrincipals: IDL.Func([], [List], ["query"]),
    printQueue: IDL.Func([IDL.Nat, IDL.Nat], [IDL.Vec(Message)], []),
    receiveMessage: IDL.Func([IDL.Nat], [IDL.Vec(Message)], []),
    sendMessage: IDL.Func([IDL.Text], [], []),
    sendMessagesInBatch: IDL.Func([IDL.Vec(IDL.Text)], [], []),
    setVisibilityTimeout: IDL.Func([IDL.Nat], [IDL.Bool], []),
    visibilityTimeout: IDL.Func([], [IDL.Nat], ["query"]),
  });
  return ICSQS;
};
export const init = ({ IDL }) => {
  const List = IDL.Rec();
  List.fill(IDL.Opt(IDL.Tuple(IDL.Principal, List)));
  return [List];
};
