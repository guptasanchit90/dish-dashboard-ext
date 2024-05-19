chrome.runtime.sendMessage(
  { action: "getUserInfo" },
  function (response) {
    if (response.action == "showUserInfo") {
      showIntroAfterLogin(true, response.data.userName, response.data.totalOrders)
    } else if(response.action == "noUserInfo"){
      showIntroBeforeLogin(true)
    }
  }
);

const showLoading = (show) => {
  if(show){
    showIntroBeforeLogin(false)
    showIntroAfterLogin(false)
  }
  document.getElementById("loading").style.display = show ? "block" : "none";
}

const showIntroBeforeLogin = (show) => {
  if(show){
    showLoading(false)
    showIntroAfterLogin(false)
  }
  document.getElementById("intro-before-login").style.display = show ? "block" : "none";
}

const showIntroAfterLogin = (show, name, numberOfOrders) => {
  if(show){
    showLoading(false)
    showIntroBeforeLogin(false)
  }
  document.getElementById("intro-after-login").style.display = show ? "block" : "none";
  document.getElementById("header-sub-title").innerHTML = `Hello<br/>${name || ""}<br/>${numberOfOrders ? "Looks like you have " + numberOfOrders + " Orders" : ""}`
}

showLoading(true)