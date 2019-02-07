// I return app, but there's no API...
let app = (function(doc) {  
  // Ask for a username
  let user = prompt('What\'s your name?').trim();
  if (!user) {
    alert('F5 and try a better username');
    doc.querySelector('.chat').remove();
    return;
  }

  // Cache elements
  let dom = {
    messages: doc.querySelector('.messages'),
    inputMessage: doc.querySelector('.input-message')
  };

  // Chat stuff
  function getColor(x) {
    let s = 0;
    for (let i in x) s += x.charCodeAt(i);
    return `hsl(${(s % 72) * 5}deg, 70%, 60%)`;
  }

  let isFixedToBottom = true;
  function onScroll() {
    isFixedToBottom = Math.abs(-dom.messages.scrollHeight + dom.messages.scrollTop + dom.messages.offsetHeight) <= 1;
  }
  function scrollToBot() {
    if (!isFixedToBottom) return;
    dom.messages.scrollTo(0,dom.messages.scrollHeight);
  }

  function chatAppend(data) {
    // If only VueJS existed...
    // or mustachesjs
    // even jquery
    let node = doc.createElement('div');
    node.className = 'msg';
    let nameNode = doc.createElement('span');
    nameNode.style.color = getColor(data.user);
    nameNode.appendChild(doc.createTextNode(data.user + ': '));
    node.appendChild(nameNode);
    let contentNode = doc.createElement('span');
    contentNode.appendChild(doc.createTextNode(data.content));
    node.appendChild(contentNode);
    dom.messages.appendChild(node);
    scrollToBot();
  }

  function chatLog(msg) {
    let node = doc.createElement('div');
    node.className = 'msg';
    let infoNode = doc.createElement('i');
    infoNode.className = 'info-icon';
    node.appendChild(infoNode);
    let contentNode = doc.createElement('span');
    contentNode.className = 'info-message';
    contentNode.appendChild(doc.createTextNode(msg));
    node.appendChild(contentNode);
    dom.messages.appendChild(node);
    scrollToBot();
  }
  
  // Websocket stuff
  let conn;
  
  function sendMessage() {
    // if (conn.readyStatus === undefined || conn.readyStatus === conn.CLOSED || conn.readyStatus === conn.CONNECTING) 
    //   return chatLog('[WS] Connection is closed');

    let msg = dom.inputMessage.value.trim();
    dom.inputMessage.value = '';
    conn.send(JSON.stringify({
      user: user,
      msg: msg
    }));
  }

  
  // Events
  function onKeyup(e) {
    if (e.key == 'Enter' && !e.shiftKey) {
      sendMessage();
    } 
  }

  doc.querySelector('.send-button').addEventListener('click', sendMessage);
  dom.inputMessage.addEventListener('keyup', onKeyup);
  dom.messages.addEventListener('scroll', onScroll);

  // Open websocket connection & bind events
  conn = (function openSocket() {
    let c = new WebSocket(`wss://${window.location.host}/ws`);
    c.onopen = function () {
      chatLog("[WS] Connection is now open");
    };
    c.onmessage = function (res) {
      let data = JSON.parse(res.data);
      if (data)
        chatAppend(data);
    };
    c.onclose = function () {
      chatLog("[WS] Connection closed!");
    };
    return c;
  })();

})(document);