import { getOrderDetails, getUserDetails } from "./service-worker-utils.js";

chrome.runtime.onMessage.addListener((request, sender, reply) => {
  chrome.runtime.sendMessage({ action: "showLoader" }); // Send message to show loader
  if (request.action == "getUserInfo") {
    Promise.all([
      getUserDetails(),
      getOrderDetails(1).then((res) => res.totalOrders),
    ])
      .then((response) => {
        chrome.storage.local
          .set({
            userInfo: response[0],
            totalOrders: response[1],
          })
          .then(() => {
            reply({
              action: "showUserInfo",
              data: {
                userName: response[0].name,
                totalOrders: response[1],
              },
            });
            chrome.runtime.sendMessage({ action: "hideLoader" });
          });
      })
      .catch((error) => {
        reply({
          action: "noUserInfo",
        });
        chrome.runtime.sendMessage({ action: "hideLoader" });
      });
  }

  return true;
});

chrome.runtime.onMessageExternal.addListener(async (request, sender, reply) => {
  if (request.action == "getStoredData") {
    chrome.storage.local.get(["totalOrders", "userInfo", "orders"]).then((response) => {
      reply(response);
    });
    return true;
  }

  if (request.action == "getOrders") {
    chrome.storage.local.get("isLoading").then(({isLoading})=>{
      if(!isLoading){
        chrome.storage.local.set({isLoading: true}).then(async ()=>{
          await Promise.all(
            Array.from(Array(request.pages).keys()).map((arr) =>
              getOrderDetails(arr + 1, request.pages)
            )
          ).then((res) => {
            if (res) {
              let orders = res.map((r) => r.orderDetails).flat();
              chrome.storage.local.set({orders: orders, isLoading: false}).then(()=>{
                reply(orders);
              })
            }
          });
        })
      }
    })
    return true;
  }
});
