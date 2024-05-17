// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.
// Importing and using functionality from external files is also possible.
import { getOrderDetails, getUserDetails } from "./service-worker-utils.js";

chrome.runtime.onMessage.addListener((request, sender, reply) => {
  chrome.runtime.sendMessage({ action: "showLoader" }); // Send message to show loader

  if (request.action == "getZomatoOrders") {
    // Get First page
    getOrderDetails(1).then(({ totalOrders }) => {
      const totalPages = Math.ceil(totalOrders / 10);

      // Get all pages
      Promise.all(
        Array.from(Array(totalPages).keys()).map((arr) =>
          getOrderDetails(arr + 1, totalPages)
        )
      ).then((res) => {
        if (res) {
          let mergedData = res.map((r) => r.orderDetails).flat();
          
          chrome.storage.local
            .set({
              totalOrders: res[0].totalOrders,
              orderDetails: mergedData,
            })
            .then(() => {
              reply({ action: "showData" });
              chrome.runtime.sendMessage({ action: "hideLoader" }); // Send message to hide loader
            });
        }
      });
    });
  } else if (request.action == "getZomatoUserInfo") {
    getUserDetails().then((res) => {
      if (res) {
        chrome.storage.local
          .set({
            userInfo: res,
          })
          .then(() => {
            reply({ action: "showUser" });
            chrome.runtime.sendMessage({ action: "hideLoader" }); // Send message to hide loader
          });
      }
    });
  }

  return true;
});

chrome.runtime.onMessageExternal.addListener(function (request, sender, reply) {
  if (request.action == "getStoredData") {
    chrome.storage.local
      .get(["totalOrders", "orderDetails", "userInfo"])
      .then((res) => {
        reply({ data: res });
      });
  }
});
