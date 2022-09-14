let connectBtn = document.getElementById("connect-btn");
// let connectContainer = document.getElementById("connect-container");
let connectedContainer = document.getElementById("connected-container");
let qid = document.getElementById("qid");
let qnum = document.getElementById("qnum");
let queryBtn = document.getElementById("query-queue");
let spinnerContainer = document.getElementById("spinner-container");
let queryData = document.getElementById("query-data");
let plugConnected = false;

var TxtType = function (el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 10) || 2000;
  this.txt = "";
  this.tick();
  this.isDeleting = false;
};

TxtType.prototype.tick = function () {
  var i = this.loopNum % this.toRotate.length;
  var fullTxt = this.toRotate[i];

  if (this.isDeleting) {
    this.txt = fullTxt.substring(0, this.txt.length - 1);
  } else {
    this.txt = fullTxt.substring(0, this.txt.length + 1);
  }

  this.el.innerHTML = '<span class="wrap">' + this.txt + "</span>";

  var that = this;
  var delta = 200 - Math.random() * 100;

  if (this.isDeleting) {
    delta /= 2;
  }

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === "") {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }

  setTimeout(function () {
    that.tick();
  }, delta);
};

const getActor = async (canisterId) => {
  try {
    const hasAllowed = await window.ic.plug.requestConnect({
      whitelist: [canisterId],
      host: "http://127.0.0.1:8002",
    });
    const agent = await window.ic?.plug?.createAgent({
      whitelist: [canisterId],
      host: "http://127.0.0.1:8002",
    });
    console.log("age: ", agent);
    const rootKeyFetchRes = await window.ic?.plug?.agent?.fetchRootKey();
    if (agent) {
      const actor = await window.ic.plug.createActor({
        canisterId,
        interfaceFactory: idlFactory,
      });
      console.log("actor", actor);
      await window.ic?.plug?.agent?.fetchRootKey();
      return actor;
    }
    return null;
  } catch (error) {
    console.log("ER err: ", error);
    return null;
  }
};

const connectWithPlug = async () => {
  try {
    toggleLiveSpinner(true);
    // const hasAllowed = await window.ic.plug.requestConnect();

    if (hasAllowed) {
      plugConnected = true;
      toggleLiveSpinner(false);
    } else {
      toggleLiveSpinner(false);
      alert("Please allow the connection to use the Plug wallet");
    }
  } catch (er) {
    toggleLiveSpinner(false);
    if (er.message.includes("agent creation was rejected")) {
      alert("Please allow the connection to use the Plug wallet");
    } else {
      alert("Something went wrong. Please try again later.");
    }
  }
};

const toggleLiveSpinner = (spin) => {
  spinnerContainer.style.display = spin ? "block" : "none";
  //   connectContainer.style.display = spin
  //     ? "none"
  //     : plugConnected
  //     ? "none"
  //     : "block";
  connectedContainer.style.display = spin
    ? "none"
    : plugConnected
    ? "block"
    : "none";
};

const queryQueue = async (event) => {
  event.preventDefault();
  event.stopPropagation();
  const actor = await getActor("ryjl3-tyaaa-aaaaa-aaaba-cai");
  const queue = await actor.printQueue(0, 10);
  const queueDataBlob = queue.map((q) => {
    return `<div class="queue-item">
      <div class="queue-item__id">${q.id}</div>
      <div class="queue-item__num">${q.message}</div>
    </div>`;
  });
  queryData.innerHTML = `<div>${queueDataBlob.join("")}</div>`;
  queryData.style.display = "block";
  console.log(queue);
};

window.onload = async function () {
  let elements = document.getElementsByClassName("writer");
  let connectBtn = document.getElementById("connect-btn");

  // add events
  queryBtn.addEventListener("click", queryQueue);
  //   connectBtn.addEventListener("click", connectWithPlug);

  //   toggleLiveSpinner(true);
  //   plugConnected = await window.ic.plug.isConnected();
  //   toggleLiveSpinner(false);

  for (var i = 0; i < elements.length; i++) {
    var toRotate = elements[i].getAttribute("data-type");
    var period = 1000;
    if (toRotate) {
      new TxtType(elements[i], JSON.parse(toRotate), period);
    }
  }
  // INJECT CSS
  var css = document.createElement("style");
  css.type = "text/css";
  css.innerHTML = ".writer > .wrap { border-right: 0.08em solid #EC7272}";
  document.body.appendChild(css);
};

// IDL for the Queue canister
const idlFactory = ({ IDL }) => {
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

const init = ({ IDL }) => {
  const List = IDL.Rec();
  List.fill(IDL.Opt(IDL.Tuple(IDL.Principal, List)));
  return [List];
};
