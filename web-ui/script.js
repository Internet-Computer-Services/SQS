let connectBtn = document.getElementById("connect-btn");
let connectedContainer = document.getElementById("connected-container");
let qid = document.getElementById("qid");
let qnum = document.getElementById("qnum");
let queryBtn = document.getElementById("query-queue");
let addBtn = document.getElementById("add-queue");
let deleteBtn = document.getElementById("delete-queue");
let spinnerContainer = document.getElementById("spinner-container");
let queryData = document.getElementById("query-data");
let addCallBtn = document.getElementById("add-call-btn");
let queryCallBtn = document.getElementById("query-call-btn");
let deleteCallBtn = document.getElementById("delete-call-btn");
const liveOpMessage = document.getElementById("live-op-message");
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

const setActiveTab = (index) => {
  if (!index) return;
  let tabs = document.getElementsByClassName("tab-item");
  let tabsContent = document.getElementsByClassName("tab-content");
  Object.keys(tabs).forEach((key) => {
    const tab = tabs[key];
    tab.classList.remove("active-tab");
    const tabId = tab.getAttribute("data-index");
    if (tabId === index) {
      tab.classList.add("active-tab");
    }
  });
  Object.keys(tabsContent).forEach((key) => {
    const tab = tabsContent[key];
    tab.classList.add("hidethis");
    const tabId = tab.getAttribute("data-index");
    if (tabId === index) {
      tab.classList.remove("hidethis");
    }
  });
};

const liveTabSelect = async (event) => {
  const selectedElem = event.target || event.srcElement;
  const index = selectedElem.getAttribute("data-index");
  setActiveTab(index);
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
    const rootKeyFetchRes = await window.ic?.plug?.agent?.fetchRootKey();
    if (agent) {
      const actor = await window.ic.plug.createActor({
        canisterId,
        interfaceFactory: idlFactory,
      });
      await window.ic?.plug?.agent?.fetchRootKey();
      return actor;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const connectWithPlug = async () => {
  try {
    toggleLiveSpinner(true);

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

const spinnerBtn = (btn) => {
  btn.innerText = "Loading...";
  btn.disabled = true;
};

const disabledSpinner = (btn, text) => {
  btn.innerText = text;
  btn.disabled = false;
};

const toggleLiveSpinner = (spin) => {
  spinnerContainer.style.display = spin ? "block" : "none";
  connectedContainer.style.display = spin
    ? "none"
    : plugConnected
    ? "block"
    : "none";
};

const queryQueue = async (event) => {
  event.preventDefault();
  event.stopPropagation();
  const queueId = event.target[0].value;
  const count = parseInt(event.target[1].value || "");
  if (!queueId || !count) return;
  spinnerBtn(queryCallBtn);

  const actor = await getActor(queueId);
  const queue = await actor.printQueue(0, count);

  const queueDataBlob = queue.map((q) => {
    return `<div class="queue-item">
      <div class="queue-item__id">${q.id}</div>
      <div class="queue-item__num">${q.message}</div>
    </div>`;
  });
  queryData.innerHTML = `<div>${queueDataBlob.join("")}</div>`;
  queryData.style.display = "block";
  disabledSpinner(queryCallBtn, "Query");
};

const addQueue = async (event) => {
  event.preventDefault();
  event.stopPropagation();
  const queueId = event.target[0].value;
  const message = event.target[1].value;
  if (!queueId || !message) return;
  spinnerBtn(addCallBtn);

  const actor = await getActor(queueId);
  await actor.sendMessage(message);
  disabledSpinner(addCallBtn, "Add Message");
  alert("Added");
};

const deleteQueue = async (event) => {
  event.preventDefault();
  event.stopPropagation();
  const queueId = event.target[0].value;
  const messageId = event.target[1].value;
  if (!queueId || !messageId) return;
  spinnerBtn(deleteCallBtn);

  const actor = await getActor(queueId);
  await actor.deleteMessage(messageId);
  disabledSpinner(deleteCallBtn, "Delete");
  alert("Deleted!");
};

window.onload = async function () {
  let elements = document.getElementsByClassName("writer");
  let connectBtn = document.getElementById("connect-btn");
  const liveTabs = document.getElementById("live-tabs");

  liveTabs.addEventListener("click", liveTabSelect);

  // add events
  queryBtn.addEventListener("submit", queryQueue);
  addBtn.addEventListener("submit", addQueue);
  deleteBtn.addEventListener("submit", deleteQueue);

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
