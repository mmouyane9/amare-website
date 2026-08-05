/* ==========================================================================
   AMARE Store — Shared Cart Module
   Uses localStorage for persistence. No auth required.
   Exposed as window.AmareCart for use across all store pages.
   ========================================================================== */
(function(window) {
  'use strict';

  var STORAGE_KEY = 'amare_cart';

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function save(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) { /* quota exceeded */ }
  }

  var Cart = {
    /** Get all cart items */
    getItems: function() { return load(); },

    /** Get total item count */
    getCount: function() {
      var items = load(), count = 0;
      for (var i = 0; i < items.length; i++) count += items[i].quantity;
      return count;
    },

    /** Get cart totals */
    getTotals: function() {
      var items = load();
      var subtotal = 0, shipping = items.length > 0 ? 50 : 0, discount = 0;
      for (var i = 0; i < items.length; i++) {
        subtotal += (parseFloat(items[i].price) || 0) * items[i].quantity;
      }
      return {
        subtotal: Math.round(subtotal * 100) / 100,
        shipping: shipping,
        discount: discount,
        grandTotal: Math.round((subtotal + shipping - discount) * 100) / 100
      };
    },

    /** Add a product to the cart */
    add: function(product, quantity) {
      quantity = quantity || 1;
      var items = load();
      var existing = null;
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === product.id) { existing = items[i]; break; }
      }
      if (existing) {
        existing.quantity += quantity;
      } else {
        items.push({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price) || 0,
          image_url: product.image_url || null,
          category: product.category || '',
          quantity: quantity
        });
      }
      save(items);
      Cart.updateBadge();
      Cart.showToast('تمت الإضافة إلى السلة 🛍', 'success');
    },

    /** Update quantity of an item */
    updateQuantity: function(productId, quantity) {
      var items = load();
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === productId) {
          items[i].quantity = Math.max(1, Math.min(99, quantity));
          break;
        }
      }
      save(items);
      Cart.updateBadge();
    },

    /** Remove an item from the cart */
    remove: function(productId) {
      var items = load();
      for (var i = items.length - 1; i >= 0; i--) {
        if (items[i].id === productId) items.splice(i, 1);
      }
      save(items);
      Cart.updateBadge();
    },

    /** Clear the entire cart */
    clear: function() {
      localStorage.removeItem(STORAGE_KEY);
      Cart.updateBadge();
    },

    /** Check if cart is empty */
    isEmpty: function() { return load().length === 0; },

    /** Update the cart badge in all store pages */
    updateBadge: function() {
      var count = Cart.getCount();
      var badges = document.querySelectorAll('.amare-cart-count');
      for (var i = 0; i < badges.length; i++) {
        badges[i].textContent = count;
        badges[i].style.display = '';
      }
      Cart.updateMiniCart();
    },

    /** Show a toast notification */
    showToast: function(msg, type) {
      var existing = document.getElementById('amareCartToast');
      if (existing) existing.remove();
      var toast = document.createElement('div');
      toast.id = 'amareCartToast';
      toast.textContent = msg;
      Object.assign(toast.style, {
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        background: type === 'success' ? '#27ae60' : '#e74c3c',
        color: '#fff', padding: '12px 24px', borderRadius: '999px',
        fontSize: '14px', fontWeight: '700', zIndex: '99999',
        boxShadow: '0 8px 24px rgba(0,0,0,.2)', opacity: '0',
        transition: 'opacity .3s', pointerEvents: 'none', direction: 'rtl'
      });
      document.body.appendChild(toast);
      requestAnimationFrame(function() { toast.style.opacity = '1'; });
      setTimeout(function() { toast.style.opacity = '0'; setTimeout(function() { toast.remove(); }, 300); }, 2000);
    },

    /** Update the mini-cart dropdown if it exists */
    updateMiniCart: function() {
      var mc = document.getElementById('miniCart');
      if (!mc) return;
      var items = load();
      var list = document.getElementById('miniCartItems');
      var empty = document.getElementById('miniCartEmpty');
      var footer = document.getElementById('miniCartFooter');
      var totalEl = document.getElementById('miniCartTotal');

      if (!items.length) {
        if (list) list.innerHTML = '';
        if (empty) empty.style.display = '';
        if (footer) footer.style.display = 'none';
        return;
      }

      if (empty) empty.style.display = 'none';
      if (footer) footer.style.display = '';

      var html = '';
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        html += '<div class="minicart-item">' +
          '<div class="minicart-item-img">' +
            (item.image_url ? '<img src="' + item.image_url + '" alt="">' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>') +
          '</div>' +
          '<div class="minicart-item-info">' +
            '<div class="minicart-item-name">' + item.name + '</div>' +
            '<div class="minicart-item-meta">' + item.quantity + ' × ' + item.price.toLocaleString('fr-FR') + ' د.م</div>' +
          '</div>' +
          '<button class="minicart-remove" onclick="AmareCart.remove(\'' + item.id + '\'); AmareCart.updateMiniCart();" title="حذف">&times;</button>' +
        '</div>';
      }
      if (list) list.innerHTML = html;
      if (totalEl) totalEl.textContent = Cart.getTotals().grandTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' د.م';
    }
  };

  /** Toggle the mini-cart dropdown */
  Cart.toggleMiniCart = function() {
    var mc = document.getElementById('miniCart');
    if (!mc) return;
    if (mc.classList.contains('show')) {
      Cart.closeMiniCart();
    } else {
      Cart.updateMiniCart();
      // Position the dropdown near the trigger
      var trigger = document.querySelector('.minicart-trigger');
      if (trigger) {
        var rect = trigger.getBoundingClientRect();
        mc.style.top = (rect.bottom + 8) + 'px';
        mc.style.left = Math.min(rect.left, window.innerWidth - 356) + 'px';
      }
      mc.classList.add('show');
    }
  };

  /** Close the mini-cart dropdown */
  Cart.closeMiniCart = function() {
    var mc = document.getElementById('miniCart');
    if (mc) mc.classList.remove('show');
  };

  /** Check if the mini-cart is open */
  Cart.isMiniCartOpen = function() {
    var mc = document.getElementById('miniCart');
    return mc ? mc.classList.contains('show') : false;
  };

  // Initialize badge on DOM ready
  function init() {
    Cart.updateBadge();
    Cart.updateMiniCart();

    // Click on cart icon toggles the dropdown
    var triggers = document.querySelectorAll('.minicart-trigger');
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener('click', function(e) {
        e.preventDefault();
        Cart.toggleMiniCart();
      });
    }

    // Close on ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') Cart.closeMiniCart();
    });

    // Close when clicking outside
    document.addEventListener('click', function(e) {
      if (!Cart.isMiniCartOpen()) return;
      var mc = document.getElementById('miniCart');
      if (!mc) return;
      var clickedInside = mc.contains(e.target);
      var clickedTrigger = e.target.closest('.minicart-trigger');
      if (!clickedInside && !clickedTrigger) {
        Cart.closeMiniCart();
      }
    });

    // Hover open (desktop only)
    var headerMc = document.getElementById('headerMinicart');
    if (headerMc && window.matchMedia('(hover: hover)').matches) {
      headerMc.addEventListener('mouseenter', function() {
        Cart.updateMiniCart();
        document.getElementById('miniCart').classList.add('show');
      });
      headerMc.addEventListener('mouseleave', function() {
        Cart.closeMiniCart();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AmareCart = Cart;
})(window);
