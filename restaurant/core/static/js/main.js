AOS.init({
  duration: 680,
  once: true,
  offset: 55,
});

// DOM helpers to avoid errors when elements are missing on some pages
function g(id) {
  return document.getElementById(id);
}
function on(id, ev, fn) {
  var el = g(id);
  if (el) el.addEventListener(ev, fn);
}

/* NAVBAR SCROLL & ACTIVE LINK  */
window.addEventListener("scroll", function () {
  var navEl = g("nav");
  var bttEl = g("btt");
  if (navEl) navEl.classList.toggle("scrolled", window.scrollY > 60);
  if (bttEl) bttEl.classList.toggle("show", window.scrollY > 300);
  document.querySelectorAll("section[id]").forEach(function (sec) {
    var top = sec.offsetTop - 110,
      bot = top + sec.offsetHeight;
    if (window.scrollY >= top && window.scrollY < bot) {
      document.querySelectorAll(".nav-link").forEach(function (l) {
        l.classList.remove("active");
      });
      var lnk = document.querySelector('.nav-link[href="#' + sec.id + '"]');
      if (lnk) lnk.classList.add("active");
    }
  });
});

/*  SMOOTH SCROLL + MOBILE NAV CLOSE  */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener("click", function (e) {
    var href = this.getAttribute("href");
    if (href === "#") return;
    var t = document.querySelector(href);
    if (t) {
      e.preventDefault();
      // Close Bootstrap mobile navbar if open
      var navCollapse = document.getElementById("navmenu");
      if (navCollapse && navCollapse.classList.contains("show")) {
        var bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse) {
          bsCollapse.hide();
        } else {
          navCollapse.classList.remove("show");
        }
      }
      // Scroll after slight delay to let navbar close
      setTimeout(function () {
        window.scrollTo({
          top: t.offsetTop - 78,
          behavior: "smooth",
        });
      }, 50);
    }
  });
});

var searchOv = g("searchOv");

on("navSearchBtn", "click", function () {
  if (!searchOv) return;
  searchOv.classList.add("open");
  document.body.style.overflow = "hidden";
  setTimeout(function () {
    var si = g("searchInput");
    if (si) si.focus();
  }, 220);
});

on("searchClose", "click", closeSearch);

// Close when clicking backdrop
if (searchOv) {
  searchOv.addEventListener("click", function (e) {
    if (e.target === searchOv) closeSearch();
  });
}

function closeSearch() {
  searchOv.classList.remove("open");
  document.body.style.overflow = "";
}

// Category buttons inside search box
document.querySelectorAll(".sovcat").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".sovcat").forEach(function (b) {
      b.classList.remove("active");
    });
    this.classList.add("active");
    var f = this.getAttribute("data-cat");
    closeSearch();
    setTimeout(function () {
      filterMenu(f);
      document.getElementById("menu").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  });
});

// Trending tags fill the search input
document.querySelectorAll(".sovtrend .ttag").forEach(function (t) {
  t.addEventListener("click", function () {
    var si = g("searchInput");
    if (!si) return;
    si.value = this.textContent.trim();
    si.focus();
  });
});

// $(document).ready(function () {
//   $(".magnific_popup").magnificPopup({
//     type: "iframe",
//     mainClass: "mfp-fade",
//     removalDelay: 160,
//     preloader: false,
//     fixedContentPos: false,
//     disableOn: 300,
//   });
// });

function filterMenu(cat) {
  // sync filter buttons
  document.querySelectorAll(".filtbtn").forEach(function (b) {
    b.classList.toggle("active", b.getAttribute("data-f") === cat);
  });
  // sync category cards
  document.querySelectorAll(".catcard").forEach(function (c) {
    c.classList.toggle("active", c.getAttribute("data-filter") === cat);
  });
  // show/hide menu cards
  document.querySelectorAll(".mwrap").forEach(function (w) {
    var c = w.getAttribute("data-c");
    if (cat === "all" || c === cat) {
      w.classList.remove("gone");
      w.style.opacity = "0";
      w.style.transform = "translateY(16px)";
      setTimeout(function () {
        w.style.transition = "opacity .38s,transform .38s";
        w.style.opacity = "1";
        w.style.transform = "translateY(0)";
      }, 60);
    } else {
      w.classList.add("gone");
    }
  });
}

// Filter buttons
document.querySelectorAll(".filtbtn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    filterMenu(this.getAttribute("data-f"));
  });
});

// Category section cards â†’ scroll + filter
document.querySelectorAll(".catcard").forEach(function (card) {
  card.addEventListener("click", function () {
    var f = this.getAttribute("data-filter");
    window.scrollTo({
      top: document.getElementById("menu").offsetTop - 80,
      behavior: "smooth",
    });
    setTimeout(function () {
      filterMenu(f);
    }, 480);
  });
});

var menuPop = g("menuPop");
var mpQty = 1;
var currentMenuItemId = null;

function openMenuPop(card) {
  var img = card.getAttribute("data-img");
  var title = card.getAttribute("data-title");
  var cat = card.getAttribute("data-cat");
  var price = card.getAttribute("data-price");
  var old = card.getAttribute("data-old");
  var rating = parseFloat(card.getAttribute("data-rating"));
  var reviews = card.getAttribute("data-reviews");
  var cal = card.getAttribute("data-cal");
  var time = card.getAttribute("data-time");
  var desc = card.getAttribute("data-desc");
  var tags = card.getAttribute("data-tags") || "";
  var id = card.getAttribute("data-id");

  // Store the current menu item ID
  currentMenuItemId = id;

  var mpImgEl = g("mpImg"),
    mpCatEl = g("mpCat"),
    mpTitleEl = g("mpTitle");
  if (mpImgEl) mpImgEl.setAttribute("src", img);
  if (mpCatEl) mpCatEl.textContent = cat;
  if (mpTitleEl) mpTitleEl.textContent = title;

  var full = Math.round(rating),
    empty = 5 - full;
  var mpStarsEl = g("mpStars");
  if (mpStarsEl) mpStarsEl.innerHTML = '<i class="fas fa-star"></i>'.repeat(full) + "☆".repeat(empty) + ' <span style="color:#bbb;font-size:.78rem;">' + rating + " (" + reviews + " reviews)</span>";

  var mpDescEl = g("mpDesc");
  if (mpDescEl) mpDescEl.textContent = desc;

  var mpPriceEl = g("mpPrice");
  if (mpPriceEl) mpPriceEl.innerHTML = price + (old ? '<small style="color:#ccc;text-decoration:line-through;margin-left:8px;font-size:1rem;">' + old + "</small>" : "");

  var mpMetaEl = g("mpMeta");
  if (mpMetaEl)
    mpMetaEl.innerHTML =
      '<div class="mpm"><div class="mpmv">' +
      cal +
      ' kcal</div><div class="mpml">Calories</div></div>' +
      '<div class="mpm"><div class="mpmv">' +
      time +
      ' min</div><div class="mpml">Prep Time</div></div>' +
      '<div class="mpm"><div class="mpmv">' +
      rating +
      '/5</div><div class="mpml">Rating</div></div>';

  var mpTagsEl = g("mpTags");
  if (mpTagsEl)
    mpTagsEl.innerHTML = tags
      .split(",")
      .filter(Boolean)
      .map(function (t) {
        return '<span class="mptag">' + t.trim() + "</span>";
      })
      .join("");

  mpQty = 1;
  var mpQnumEl = g("mpQnum"),
    mpAddCartEl = g("mpAddCart");
  if (mpQnumEl) mpQnumEl.textContent = 1;
  if (mpAddCartEl) {
    mpAddCartEl.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
    mpAddCartEl.style.background = "";
  }

  if (menuPop) menuPop.classList.add("open");
  document.body.style.overflow = "hidden";
}

// Card click open popup
document.querySelectorAll(".mcard").forEach(function (card) {
  card.addEventListener("click", function () {
    openMenuPop(this);
  });
});

// + button  open popup (stop propagation to avoid double firing)
document.querySelectorAll(".madd").forEach(function (btn) {
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    openMenuPop(this.closest(".mcard"));
  });
});

// Heart toggle (no popup)
document.querySelectorAll(".mhrt").forEach(function (btn) {
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    var ico = this.querySelector("i");
    ico.classList.toggle("far");
    ico.classList.toggle("fas");
    this.style.color = ico.classList.contains("fas") ? "var(--primary)" : "#ccc";
  });
});

// Close popup
on("mpClose", "click", closeMenuPop);
if (menuPop) {
  menuPop.addEventListener("click", function (e) {
    if (e.target === this) closeMenuPop();
  });
}

function closeMenuPop() {
  if (menuPop) menuPop.classList.remove("open");
  document.body.style.overflow = "";
}

// Qty +/-
on("mpPlus", "click", function () {
  var q = g("mpQnum");
  if (q) q.textContent = ++mpQty;
});
on("mpMinus", "click", function () {
  var q = g("mpQnum");
  if (mpQty > 1 && q) q.textContent = --mpQty;
});

// Add to cart button
on("mpAddCart", "click", function () {
  if (!currentMenuItemId) {
    alert("Error: Menu item not found");
    return;
  }

  var self = this;

  // Send AJAX request to add item to cart
  fetch("/add-to-cart/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify({
      menu_item_id: currentMenuItemId,
      quantity: mpQty,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Update cart count
        var cartEl = g("cartCount");
        if (cartEl) {
          cartEl.textContent = data.cart_count;
        }

        // Show success message
        self.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
        self.style.background = "linear-gradient(135deg,var(--green),#1a4a35)";

        // Reset button after 1 second
        setTimeout(function () {
          closeMenuPop();
          self.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
          self.style.background = "";
        }, 1000);
      } else {
        alert("Error: " + (data.message || "Failed to add item to cart"));
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error adding to cart");
    });
});

// Get CSRF token from cookie
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

on("resBtn", "click", function () {
  var btn = this;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
  btn.disabled = true;
  setTimeout(function () {
    btn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirm Reservation';
    btn.disabled = false;
    var ok = g("resOk");
    if (ok) {
      ok.style.display = "block";
      ok.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, 1500);
});

on("ctcBtn", "click", function () {
  var btn = this;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;
  setTimeout(function () {
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    btn.disabled = false;
    var ok = g("ctcOk");
    if (ok) {
      ok.style.display = "block";
      ok.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, 1500);
});

var galPop = g("galPop");
var galData = [];
var galIdx = 0;

document.querySelectorAll(".gitem").forEach(function (item) {
  // collect gallery metadata; prefer the rendered <img>.src to avoid template-tag parsing issues
  var imgEl = item.querySelector("img");
  var gimg = imgEl && imgEl.src ? imgEl.src : item.getAttribute("data-gimg");
  var gtitle = item.getAttribute("data-gtitle") || (item.querySelector(".gover span") && item.querySelector(".gover span").textContent.trim());
  var gdesc = item.getAttribute("data-gdesc") || "";
  galData.push({ img: gimg, title: gtitle, desc: gdesc });
  // debug: log collected values
  if (typeof console !== "undefined")
    console.debug("gallery item:", {
      idx: item.getAttribute("data-gi"),
      gimg: gimg,
      gtitle: gtitle,
      gdesc: gdesc,
    });
  item.addEventListener("click", function (e) {
    // in case a child element stops propagation, ensure click still opens
    e.stopPropagation();
    var gi = this.getAttribute("data-gi");
    openGal(gi ? parseInt(gi) : 0);
  });
});

function openGal(i) {
  galIdx = i;
  var gd = galData[i];
  if (typeof console !== "undefined") console.debug("openGal() ->", gd);
  var gpImgEl = g("gpImg"),
    gpTitleEl = g("gpTitle"),
    gpDescEl = g("gpDesc");
  if (gpImgEl) gpImgEl.setAttribute("src", gd.img);
  if (gpTitleEl) gpTitleEl.textContent = gd.title;
  if (gpDescEl) gpDescEl.innerHTML = gd.desc;
  if (galPop) galPop.classList.add("open");
  document.body.style.overflow = "hidden";
}

on("gpClose", "click", closeGal);
if (galPop) {
  galPop.addEventListener("click", function (e) {
    if (e.target === this) closeGal();
  });
}

function closeGal() {
  if (galPop) galPop.classList.remove("open");
  document.body.style.overflow = "";
}

on("gpPrev", "click", function () {
  openGal((galIdx - 1 + galData.length) % galData.length);
});
on("gpNext", "click", function () {
  openGal((galIdx + 1) % galData.length);
});

/*  ESC key closes everything */
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeSearch();
    closeMenuPop();
    closeGal();
    if (typeof $.magnificPopup !== "undefined") $.magnificPopup.close();
  }
});

new Swiper(".tesSwiper", {
  slidesPerView: 1,
  spaceBetween: 22,
  loop: true,
  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  breakpoints: {
    640: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
  },
});

var cH = 8,
  cM = 45,
  cS = 30;
setInterval(function () {
  cS--;
  if (cS < 0) {
    cS = 59;
    cM--;
  }
  if (cM < 0) {
    cM = 59;
    cH--;
  }
  if (cH < 0) {
    cH = 8;
    cM = 45;
    cS = 30;
  }
  var cdHEl = g("cdH"),
    cdMEl = g("cdM"),
    cdSEl = g("cdS");
  if (cdHEl) cdHEl.textContent = String(cH).padStart(2, "0");
  if (cdMEl) cdMEl.textContent = String(cM).padStart(2, "0");
  if (cdSEl) cdSEl.textContent = String(cS).padStart(2, "0");
}, 1000);

/* â”€â”€ NEWSLETTER â”€â”€ */
// (countdown DOM update happens inside the main countdown interval below)

on("nlBtn", "click", function () {
  var emailEl = g("nlEmail");
  var email = emailEl ? emailEl.value : null;
  if (email && email.includes("@")) {
    var btn = this;
    btn.textContent = "âœ“ Subscribed!";
    btn.style.background = "#4ade80";
    btn.style.color = "#222";
    if (emailEl) emailEl.value = "";
    setTimeout(function () {
      btn.textContent = "Subscribe";
      btn.style.background = "";
      btn.style.color = "";
    }, 3000);
  }
});

/*  NUMBER COUNTER ANIMATION*/
var numAnimated = false;
window.addEventListener("scroll", function () {
  var hero = document.getElementById("hero");
  if (!numAnimated && hero && window.scrollY > hero.offsetHeight - 300) {
    numAnimated = true;
    document.querySelectorAll(".snum").forEach(function (el) {
      var txt = el.textContent;
      var num = parseInt(txt);
      var suf = txt.replace(/[0-9]/g, "");
      if (isNaN(num)) return;
      var start = 0;
      var step = Math.ceil(num / 55);
      var iv = setInterval(function () {
        start += step;
        if (start >= num) {
          start = num;
          clearInterval(iv);
        }
        el.textContent = start + suf;
      }, 1400 / 55);
    });
  }
});
