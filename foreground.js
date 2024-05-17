chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "showLoader") {
    // Show loader code here
    document.getElementById("loader").style.display = "block";
    if(request.page && request.totalPages){
      document.getElementById("loading-text").innerText = `Loading Page ${request.page} of ${request.totalPages}`;
    }
  } else if (request.action === "hideLoader") {
    // Hide loader code here
    document.getElementById("loader").style.display = "none";
  }
  else if (request.action === "showData") {
    showData();
  }
});

const showIntro = () => {
  chrome.storage.local.get("userInfo").then((result) => {
    if (!result || !result.userInfo || !result.userInfo.name) {
      // Not logged In
      document.getElementById("intro").innerHTML = `
      <span>Hello, you must <b>login</b> to you Zomato Account <br/>in this browser to continue</span>
        <ol id="steps">
        <span>Please follow these steps:</span>
        <li>Navigate to <a href="https://www.zomato.com/login" target="_blank">Zomato</a> and log in to your account.</li>
        <li>Once logged in, come back to this popup and click OK to continue.</li>
      </ol>`;
    } else {
      // User is logged In
      document.getElementById("actionButton").innerText = "Load Data";
      document.getElementById(
        "intro"
      ).innerHTML = `<span>Welcome <b>${result.userInfo.name}</b></span>`;
      showData();
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("actionButton")
    .addEventListener("click", async () => {
      chrome.storage.local.get("userInfo").then((result) => {
        if (!result || !result.userInfo || !result.userInfo.name) {
          // Not logged In
          chrome.runtime.sendMessage(
            { action: "getZomatoUserInfo" },
            function (response) {
              if (response.action == "showUser") {
                showIntro();
              }
            }
          );
        } else {
          // User is logged In
          chrome.runtime.sendMessage(
            { action: "getZomatoOrders" },
            function (response) {
              if (response.action == "showData") {
                showData();
              }
            }
          );
        }
      });
    });
});

const showData = () => {
  chrome.storage.local.get(["totalOrders", "orderDetails"]).then((result) => {
    if (!result.totalOrders) {
      document.getElementById("actionButton").innerText = "Load Data";
      document.getElementById("data-container").innerHTML = `
      <span>No Orders found, if this is the first time you are using this plugin try Loading your Orders using the <b>Load Data</b> Button</span>`;
    } else {
      document.getElementById("actionButton").innerText = "Refresh Data";
      document.getElementById("data-container").innerHTML = `
      <h3 class="text-3xl font-bold underline">You have placed ${result.totalOrders} Orders on Zomato</h3>
      <div id="year-accordions"></div>`;

      const orders = result.orderDetails?.map((order) => ({
        ...order,
        orderDate: new Date(order.orderDate.split("at")[0].trim()),
      }));
      if (orders) {
        const ordersByYear = Object.groupBy(orders, ({ orderDate }) =>
          orderDate.getFullYear()
        );
        document.getElementById("year-accordions").innerHTML = "";

        Object.keys(ordersByYear)
          .sort()
          .reverse()
          .forEach((year) => renderTableView(ordersByYear, year));
      }
    }
  });
};

const renderTableView = (data, year) => {
  const yearAccordions = document.getElementById("year-accordions");

  const button = document.createElement("button");
  button.classList.add("accordion");

  const total = data[year].reduce(
    (x, y) =>
      x + parseFloat(y.totalCost.replace("\u20b9", "").replace(",", "")),
    0
  );
  button.textContent = `In ${year} you have Spent ${~~total} and placed ${
    data[year].length
  } Orders`;

  const panel = document.createElement("div");
  panel.classList.add("panel");

  const table = document.createElement("table");
  table.id = "orderDetails";

  data[year].forEach((order) => {
    const tr = table.insertRow();
    const td1 = tr.insertCell();
    td1.appendChild(
      document.createTextNode(
        `${order.orderDate.getDate()} ${order.orderDate.toLocaleString(
          "default",
          {
            month: "long",
          }
        )}, ${order.orderDate.getFullYear()}`
      )
    );
    const td2 = tr.insertCell();
    td2.appendChild(document.createTextNode(order.resturantName));
    const td = tr.insertCell();
    td.appendChild(
      document.createTextNode(
        order.totalCost.replace("\u20b9", "").replace(",", "")
      )
    );
  });

  panel.appendChild(table);

  button.addEventListener("click", () => {
    panel.classList.toggle("active");
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });

  yearAccordions.appendChild(button);
  yearAccordions.appendChild(panel);
};

showIntro();
