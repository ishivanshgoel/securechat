console.log("home script attached!!");

let baseUrl = "https://ishivanshgoel.herokuapp.com/";

let signInUrl = window.location.origin + "/securechat/signin";

let chatListContainer = document.getElementById("chatListContainer");
let chatContainer = document.getElementById("chatMessagesContainer");
let friendRequest = document.getElementById("friend-request-button");
let loader = document.getElementById("loader-screen");
let currentChatContainerUserId = null;
let socket;
let publicKey; // publicKey of current friend

function showLoader() {
  console.log('Loader ', loader)
  loader.style.visibility = "visible";
}

function hideLoader() {
  loader.style.visibility = "hidden";
}

window.onload = function (e) {

  // showLoader()

  let token = localStorage.getItem("secret-chat-token");

  // verify access token
  if (token) {
    let data = { token };
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

    fetch(baseUrl + "auth/verify", requestOptions).then(async (response) => {
      let res = await response.json();
      if (res.error) {
        logout()
      }
    });
  } else {
    // else redirect to signin page
    window.location.href = signInUrl;
  }

  socket = io(baseUrl, {
    auth: {
      token: token,
    },
  });

  const requestOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: token,
    },
  };

  // fetch friends of user
  fetch(baseUrl + "user/friends", requestOptions).then(async (response) => {
    let res = await response.json();
    if (res.code == 200) {
      console.log("FRIENDS LIST ", res);
      let chatList = res.data.friends;
      chatList.map((id) => {
        chatListContainer.innerHTML += chatListElement(id);
      });
      hideLoader()
    } else {
      localStorage.removeItem("secret-chat-token");
      window.location.href = signInUrl;
      hideLoader()
    }
  });

  socket.on("connect", () => {
    console.log(socket.id); // "G5p5..."
  });

  let id = localStorage.getItem("secret-chat-id");

  socket.emit("register", { userId: id });

  // attempt to reconnect
  socket.on("disconnect", () => {
    socket.connect();
  });

  // receive message
  socket.on("chat:receive", (data) => {
    if (data.from == currentChatContainerUserId) {
      let messageUI = chatMessage(data.from, data.message);
      let chatHistory = document.querySelector(".chat-history-messages");
      chatHistory.innerHTML += messageUI;
      scrollToBotton()
      console.log("CHAT HISTORY ", chatHistory);
    }
  });

  let privateKey = localStorage.getItem("secret-chat-key");
  let pubKey = localStorage.getItem("secret-chat-key-1");
  if(!privateKey || !pubKey ) alert("Key Pair not found!!");
  document.getElementById("user-account").innerHTML += id

};

// function to send friend request to a user
function sendFriendRequest() {
  showLoader()
  let email = document.getElementById("friend-request-email-id").value;
  console.log("Freind Request " + email);

  let token = localStorage.getItem("secret-chat-token");
  let id = localStorage.getItem("secret-chat-id");

  let data = { to: email };
  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: token,
    },
    body: JSON.stringify(data),
  };

  // send friend request to user
  fetch(baseUrl + "user/sendRequest", requestOptions).then(
    async (response) => {
      let res = await response.json();
      if (res.code == 200) {
        alert(res.message);
        hideLoader()
      } else {
        alert(res.error.message);
        hideLoader()
      }
    }
  );

  document.getElementById("friend-request-email-id").value = ""
}

function savePrivateKey() {
  let value = document.getElementById("private-key-modal").value
  console.log("Private Key ", value)
  localStorage.setItem("secret-chat-key", value)

  let value1 = document.getElementById("public-key-modal").value
  console.log("Public Key ", value1)
  localStorage.setItem("secret-chat-key-1", value1)
}

function fetchPrivateKey() {
  let value = localStorage.getItem("secret-chat-key")
  document.getElementById("private-key-modal").value = value

  let value1 = localStorage.getItem("secret-chat-key-1")
  document.getElementById("public-key-modal").value = value1
}

// fetch friend request list
function fetchFriendRequestList() {

  showLoader()

  let token = localStorage.getItem("secret-chat-token");
  let id = localStorage.getItem("secret-chat-id");

  const requestOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: token,
    }
  };

  // fetch friend request list
  fetch(baseUrl + "user/friendRequestList", requestOptions).then(
    async (response) => {
      let res = await response.json();
      if (res.code == 200) {

        let requests = res.data;

        if(requests.length > 0){
          let uiRequest = ``;
        
          requests.map((request)=>{
            let ui = `<button type="button" class="btn btn-success" onclick="acceptFriendRequest('${request.from}')">${request.from} Accept ✅</button>`
            uiRequest += ui;
          })

          friendRequest.innerHTML = '';

          friendRequest.innerHTML += uiRequest;
        }

        hideLoader()

      } else {
        alert(res.error.message);
        hideLoader()
      }
    }
  );
}

// function to accept friend request
function acceptFriendRequest(of) {

  showLoader()

  let token = localStorage.getItem("secret-chat-token");
  let id = localStorage.getItem("secret-chat-id");
  let data = { of };
  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: token,
    },
    body: JSON.stringify(data),
  };

  // fetch friend request list
  fetch(baseUrl + "user/acceptFriendRequest", requestOptions).then(
    async (response) => {
      let res = await response.json();
      if (res.code == 200) {
        console.log(res.data);
        window.location.reload();
        hideLoader()
      } else {
        alert(res.error.message);
        hideLoader()
      }
    }
  );

}


// function to get chats with particular user
function renderChat(friendId) {

  showLoader()

  console.log("FETCH CHAT OF ID ", friendId);
  let token = localStorage.getItem("secret-chat-token");
  let id = localStorage.getItem("secret-chat-id");

  let data = { friendId };
  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: token,
    },
    body: JSON.stringify(data),
  };

  // fetch chatlist of user
  fetch(baseUrl + "chat/chatmessages", requestOptions).then(
    async (response) => {
      let res = await response.json();
      if (res.code == 200) {
        publicKey = res.key;
        chatContainer.innerHTML = chatMessages(friendId, res.data, id);
        currentChatContainerUserId = friendId;
        scrollToBotton()
        hideLoader()
      } else {
        alert("Error fetching current chat messages!!");
        hideLoader()
      }
    }
  );
}

// encrypting chat message
function encryptWithPublicKey(friendPublicKey, message) {
  // Encrypt with the public key of friend
  friendPublicKey = friendPublicKey.key
  console.log("Public Key ", friendPublicKey)
  console.log("Message ", message)
  let encrypt = new JSEncrypt();
  encrypt.setPublicKey(friendPublicKey);
  let encrypted = encrypt.encrypt(message);
  console.log('Ecrypted ', encrypted);

  // encrypt with your public key for your reference
  let encrypt1 = new JSEncrypt();
  let myPublicKey = localStorage.getItem("secret-chat-key-1");
  encrypt1.setPublicKey(myPublicKey);
  let encrypted1 = encrypt1.encrypt(message);
  console.log('Ecrypted for our reference ', encrypted1);

  return [encrypted, encrypted1];
}

// decrypt chat message
function decryptWithPrivateKey(message){
  let decrypt = new JSEncrypt();
  let privateKey = localStorage.getItem("secret-chat-key");
  console.log("Private Key ", privateKey);
  decrypt.setPrivateKey(privateKey);
  let uncrypted = decrypt.decrypt(message);
  return uncrypted;
}


var inputMessage = document.getElementById("message-input-box");

// Execute a function when the user releases a key on the keyboard
inputMessage.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    sendMessagetoFriend()
  }
});

// socket method to send message
function sendMessagetoFriend() {

  showLoader()

  let id = localStorage.getItem("secret-chat-id");
  let message = document.getElementById("message-input-box").value;

  let messages = encryptWithPublicKey(publicKey, message)
  // emit a socket event
  let data = {
    from: id,
    to: currentChatContainerUserId,
    message: messages[0],
    message1: messages[1] 
  };

  console.log("Message ", message);

  socket.emit("chat:send", data);

  // append message to UI
  let messageUI = chatMessage(id, data.message1);

  console.log("Message UI", messageUI);

  let chatHistory = document.querySelector(".chat-history-messages");
  chatHistory.innerHTML += messageUI;
  console.log("CHAT HISTORY ", chatHistory);

  document.getElementById("message-input-box").value = ""

  hideLoader()
}

// ################ UI ELEMENTS ###################

// chat list element UI generator
function chatListElement(id) {
  return `
        <li class="clearfix" onclick="renderChat(this.id)" id="${id}">
            <img
                src="https://image.shutterstock.com/image-vector/african-bearded-man-wearing-tshirt-260nw-1476685571.jpg"
                alt="avatar"
            />
            <div class="about">
                <div class="name">${id}</div>
            </div>
        </li>
    `;
}

// inject new message in chat
function chatMessage(id, message) {
  let myId = localStorage.getItem("secret-chat-id");

  console.log("ID ", id);
  console.log("My ID ", myId);
  console.log("Message ", message);

  if (myId == id) {
    return `<li class="clearfix">
      <div class="message other-message float-right" style="min-width: 200px">
        ${decryptWithPrivateKey(message)}
      </div>
    </li>`
  } else {
    return `<li class="clearfix">
      <div class="message my-message" style="min-width: 200px">
      ${decryptWithPrivateKey(message)}
      </div>
    </li>`
  }
}

function scrollToBotton() {
  let theElement = document.getElementById('chat-history');
  theElement.scroll({ top: theElement.scrollHeight, behavior: 'smooth' });
}

// chatMessages element UI generator
function chatMessages(friendId, chatMessages, id) {
  return `
    <div class="chat-header clearfix" id="chat-header">
      <div class="row">
        <div class="col-lg-6">
          <a
            href="javascript:void(0);"
            data-toggle="modal"
            data-target="#view_info"
          >
            <img
              src="https://image.shutterstock.com/image-vector/african-bearded-man-wearing-tshirt-260nw-1476685571.jpg"
              alt="avatar"
            />
          </a>
          <div class="chat-about">
            <h6 class="m-b-0">${friendId}</h6>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-history" style="min-height: 350px;" id="chat-history">
      <ul class="m-b-0 chat-history-messages">
        ${
          
          chatMessages.map((message) => {
          if (message.from == id) {
            return `<li class="clearfix">
                <div class="message other-message float-right" style="min-width: 200px">
                  ${decryptWithPrivateKey(message.message1)}
                </div>
              </li>`
          } else {
            return `<li class="clearfix">
            <div class="message my-message" style="min-width: 200px">
            ${decryptWithPrivateKey(message.message)}
            </div>
          </li>`
          }
        }).join().replace(/,/g," ")
        
      }
      </ul>
    </div>`;
}

function logout() {
  localStorage.removeItem("secret-chat-token");
  localStorage.removeItem("secret-chat-id");
  localStorage.removeItem("secret-chat-key-1");
  localStorage.removeItem("secret-chat-key");
  window.location.href = signInUrl;
}