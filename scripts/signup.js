console.log("SignUp script attached!");
let baseUrl = "https://ishivanshgoel.herokuapp.com/";
let signInUrl = window.location.origin + "/securechat/signin";

let homeUrl = window.location.origin + "/securechat/home";

window.onload = function (e) {
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
      if (!res.error && res.message) {
        window.location.href = homeUrl;
      }
    });
  }
};

function onSubmit(event) {
  event.preventDefault();
  let email = document.getElementById("inputEmail").value;
  let password = document.getElementById("inputPassword").value;
  let displayName = document.getElementById("inputname").value;

  let data = { email, password, displayName };

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };

  fetch(baseUrl + "auth/signup", requestOptions).then(async (response) => {
    let res = await response.json();
    if (res.error) {
      alert(err.message);
    } else {
      let keys = res.keys;
      let dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(keys, undefined, 2).replace(/\\n/g, ''));
      localStorage.setItem("secret-chat-key", keys.privateKey); // save your private key
      localStorage.setItem("secret-chat-key-1", keys.publicKey); // save your public key
      let downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${email}_keys.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      window.location.href = signInUrl;
      alert("Registered Successfully, Keep your private key Safe!!");
    }
  });
}
