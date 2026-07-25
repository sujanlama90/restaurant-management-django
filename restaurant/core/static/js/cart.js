document.addEventListener("DOMContentLoaded", function () {
  // Update cart item quantity
  document.querySelectorAll(".qty-plus").forEach((btn) => {
    btn.addEventListener("click", function () {
      const row = this.closest(".cart-item");
      const input = row.querySelector(".qty-input");
      input.value = parseInt(input.value) + 1;
      updateCartItem(row);
    });
  });

  document.querySelectorAll(".qty-minus").forEach((btn) => {
    btn.addEventListener("click", function () {
      const row = this.closest(".cart-item");
      const input = row.querySelector(".qty-input");
      if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
        updateCartItem(row);
      }
    });
  });

  document.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", function () {
      const row = this.closest(".cart-item");
      updateCartItem(row);
    });
  });

  // Remove cart item
  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", function () {
      const row = this.closest(".cart-item");
      const itemId = row.dataset.itemId;

      if (confirm("Remove this item from cart?")) {
        removeCartItem(itemId, row);
      }
    });
  });
});

function updateCartItem(row) {
  const itemId = row.dataset.itemId;
  const quantity = parseInt(row.querySelector(".qty-input").value);

  fetch('{% url "update_cart_item" %}', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")?.value || getCookie("csrftoken"),
    },
    body: JSON.stringify({
      cart_item_id: itemId,
      quantity: quantity,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        row.querySelector(".item-subtotal").textContent = "$" + data.subtotal;
        document.querySelector(".cart-subtotal").textContent = "$" + data.cart_total;
        document.querySelector(".cart-total").textContent = "$" + data.cart_total;
      }
    })
    .catch((error) => console.error("Error:", error));
}

function removeCartItem(itemId, row) {
  fetch('{% url "remove_from_cart" %}', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")?.value || getCookie("csrftoken"),
    },
    body: JSON.stringify({
      cart_item_id: itemId,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        row.remove();
        document.querySelector(".cart-subtotal").textContent = "$" + data.cart_total;
        document.querySelector(".cart-total").textContent = "$" + data.cart_total;

        // If cart is empty, reload page
        if (data.cart_count === 0) {
          setTimeout(() => location.reload(), 300);
        }
      }
    })
    .catch((error) => console.error("Error:", error));
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
