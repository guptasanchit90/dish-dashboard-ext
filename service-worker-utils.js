export async function getOrderDetails(pageNum = 1, totalPages) {
  await delayPromise(pageNum * 1000, ""); // Throttling API calls to avoid overwhelming Zomato's servers and ensure responsible API usage.
  chrome.runtime.sendMessage({ action: "showLoader", page: pageNum, totalPages: totalPages });
  const response = await fetch(
    `https://www.zomato.com/webroutes/user/orders?page=${pageNum}`
  );
  const data = await response.json();
  const totalOrders = data.sections.SECTION_USER_ORDER_HISTORY.count;
  const orderIds =
    data.sections.SECTION_USER_ORDER_HISTORY.entities[0].entity_ids;
  const orderDetails = orderIds
    .filter((id) => data.entities.ORDER[id].paymentStatus !== 0)
    .map((id) => {
      const order = data.entities.ORDER[id];
      return {
        orderId: id,
        dishString: order.dishString,
        totalCost: order.totalCost,
        orderDate: order.orderDate,
        resturantName: order.resInfo.name,
        resturantPhone: order.resInfo.phone.phone_string,
        deliveryAddress: order.deliveryDetails.deliveryAddress
      }
    });

  return { totalOrders, orderDetails };
}

export async function getUserDetails() {
  const response = await fetch(`https://www.zomato.com/webroutes/getPage`);
  const data = await response.json();
  return data.user.basic_info;
}

export async function delayPromise(resolveAfter, value) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, resolveAfter);
  });
}
