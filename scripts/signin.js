console.log("SignIn script attached!");
let baseUrl = "https://ishivanshgoel.herokuapp.com/";

let homeUrl = "http://127.0.0.1:5500/client/home.html";

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

  let data = { email, password };

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };

  fetch(baseUrl + "auth/signin", requestOptions).then(async (response) => {
    let res = await response.json();
    if (res.error) {
      alert(res.message);
    } else {
      let token = res.accessToken;
      localStorage.setItem("secret-chat-token", token);
      localStorage.setItem("secret-chat-id", email);
      window.location.href = homeUrl;
    }
  });
}
