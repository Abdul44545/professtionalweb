document.addEventListener('DOMContentLoaded', function () {
  // Initialize cart from localStorage or create empty cart
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Update cart count
  updateCartCount();

  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu');

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      menu.classList.toggle('active');
    });
  }

  // Handle featured products on homepage
  const featuredProductsContainer = document.getElementById('featured-products');
  if (featuredProductsContainer) {
    const featuredProducts = products.filter(product => product.featured);

    featuredProducts.forEach(product => {
      const productCard = createProductCard(product);
      featuredProductsContainer.appendChild(productCard);
    });
  }

  // Handle all products on products page
  const allProductsContainer = document.getElementById('all-products');
  if (allProductsContainer) {
    products.forEach(product => {
      const productCard = createProductCard(product);
      allProductsContainer.appendChild(productCard);
    });

    // Set up filter functionality
    setupFilters();
  }

  // Handle product detail page
  const productDetailContainer = document.getElementById('product-detail-container');
  if (productDetailContainer) {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    if (productId) {
      const product = products.find(p => p.id === productId);

      if (product) {
        // Update page title
        document.title = `${product.name} - E-Shop`;

        // Update breadcrumb
        const breadcrumbTitle = document.getElementById('product-title-breadcrumb');
        if (breadcrumbTitle) {
          breadcrumbTitle.textContent = product.name;
        }

        // Render product detail
        productDetailContainer.innerHTML = `
            <div class="product-gallery">
              <div class="product-thumbnails">
                ${product.images.map((img, index) => `
                  <div class="product-thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <img src="${img}" alt="${product.name}">
                  </div>
                `).join('')}
              </div>
              <div class="product-main-image">
                <img src="${product.images[0]}" alt="${product.name}" id="main-product-image">
              </div>
            </div>
            
            <div class="product-info">
              <h1>${product.name}</h1>
              
              <div class="product-meta">
                <span>Category: ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
                <span>|</span>
                <span>SKU: PROD-${product.id.toString().padStart(4, '0')}</span>
              </div>
              
              <div class="product-rating-detail">
                ${generateStarRating(product.rating)}
                <span>(${(product.rating * 10).toFixed(0)} reviews)</span>
              </div>
              
              <div class="product-price-detail">$${product.price.toFixed(2)}</div>
              
              <div class="product-description">
                ${product.description}
              </div>
              
              <div class="product-colors">
                <h3>Colors</h3>
                <div class="color-options">
                  ${product.colors.map((color, index) => `
                    <div class="color-option ${index === 0 ? 'active' : ''}" style="background-color: ${color};" data-color="${color}"></div>
                  `).join('')}
                </div>
              </div>
              
              <div class="product-quantity">
                <label for="quantity">Quantity:</label>
                <div class="quantity-selector">
                  <button class="quantity-btn" id="decrease-quantity">-</button>
                  <input type="number" id="quantity" class="quantity-input" value="1" min="1" max="10">
                  <button class="quantity-btn" id="increase-quantity">+</button>
                </div>
              </div>
              
              <div class="product-actions">
                <button class="btn add-to-cart-detail" data-id="${product.id}">Add to Cart</button>
                <button class="btn buy-now" data-id="${product.id}">Buy Now</button>
              </div>
              
              <div class="product-meta-info">
                <div class="meta-item">
                  <strong>Availability:</strong>
                  <span>${product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                </div>
                <div class="meta-item">
                  <strong>Shipping:</strong>
                  <span>Free shipping on orders over $50</span>
                </div>
                <div class="meta-item">
                  <strong>Returns:</strong>
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          `;

        // Set up thumbnail gallery
        setupThumbnailGallery();

        // Set up quantity controls
        setupQuantityControls();

        // Set up color selection
        setupColorSelection();

        // Set up add to cart button
        const addToCartBtn = document.querySelector('.add-to-cart-detail');
        if (addToCartBtn) {
          addToCartBtn.addEventListener('click', function () {
            const productId = parseInt(this.getAttribute('data-id'));
            const quantity = parseInt(document.getElementById('quantity').value);
            const color = document.querySelector('.color-option.active').getAttribute('data-color');

            addToCart(productId, quantity, color);
          });
        }

        // Set up buy now button
        const buyNowBtn = document.querySelector('.buy-now');
        if (buyNowBtn) {
          buyNowBtn.addEventListener('click', function () {
            const productId = parseInt(this.getAttribute('data-id'));
            const quantity = parseInt(document.getElementById('quantity').value);
            const color = document.querySelector('.color-option.active').getAttribute('data-color');

            addToCart(productId, quantity, color);
            window.location.href = 'cart.html';
          });
        }

        // Load related products
        loadRelatedProducts(product);
      }
    }
  }

  // Handle cart page
  const cartItemsContainer = document.getElementById('cart-items');
  if (cartItemsContainer) {
    if (cart.length > 0) {
      // Show cart items
      document.getElementById('empty-cart').classList.add('hidden');
      renderCartItems();
      updateCartSummary();

      // Set up checkout button
      const checkoutBtn = document.getElementById('checkout-btn');
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
          const paymentModal = document.getElementById('payment-modal');
          paymentModal.style.display = 'block';
        });
      }

      // Set up coupon application
      const applyCouponBtn = document.getElementById('apply-coupon');
      if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', function () {
          const couponCode = document.getElementById('coupon-code').value;
          if (couponCode === 'FIRST20') {
            alert('Coupon applied successfully! 20% discount applied.');
            updateCartSummary(0.2); // 20% discount
          } else {
            alert('Invalid coupon code.');
          }
        });
      }
    } else {
      // Show empty cart message
      document.getElementById('empty-cart').classList.remove('hidden');
      document.querySelector('.cart-container').classList.add('hidden');
    }
  }

  // Set up payment modal
  setupPaymentModal();

  // Functions

  // Create product card
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}">
          ${product.featured ? '<span class="product-tag">Featured</span>' : ''}
        </div>
        <div class="product-details">
          <h3 class="product-title product-detail" data-id="${product.id}">${product.name}</h3>
          <div class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</div>
          <div class="product-bottom">
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-rating">
              ${generateStarRating(product.rating)}
            </div>
          </div>
          <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
        </div>
      `;

    const productTitle = card.querySelector('.product-detail');
    productTitle.addEventListener('click', function () {
      const productId = this.getAttribute('data-id');
      window.location.href = `product-detail.html?id=${productId}`;
    });

    // Add event listener to add to cart button
    const addToCartBtn = card.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const productId = parseInt(this.getAttribute('data-id'));
      addToCart(productId, 1);
    });

    return card;
  }

  // Generate star rating HTML
  function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let stars = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star"></i>';
    }

    // Half star
    if (halfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star"></i>';
    }

    return stars;
  }

  // Add to cart function
  function addToCart(productId, quantity, color = null) {
    const product = products.find(p => p.id === productId);

    if (product) {
      // Check if product already in cart
      const existingItemIndex = cart.findIndex(item => item.id === productId && (!color || item.color === color));

      if (existingItemIndex !== -1) {
        // Update quantity if already in cart
        cart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        cart.push({
          id: productId,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity,
          color: color
        });
      }

      // Save cart to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));

      // Update cart count
      updateCartCount();

      // Show confirmation message
      alert(`${product.name} added to cart!`);
    }
  }

  // Update cart count
  function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      cartCount.textContent = totalItems;
    }
  }

  // Render cart items
  function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';

    cart.forEach((item, index) => {
      const product = products.find(p => p.id === item.id);
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';

      cartItem.innerHTML = `
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <h3>${item.name}</h3>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            ${item.color ? `<div class="cart-item-color">Color: ${item.color}</div>` : ''}
            <div class="cart-item-quantity">
              <button class="cart-quantity-btn decrease" data-index="${index}">-</button>
              <input type="number" class="cart-quantity-input" value="${item.quantity}" min="1" data-index="${index}">
              <button class="cart-quantity-btn increase" data-index="${index}">+</button>
            </div>
            <button class="cart-item-remove" data-index="${index}">
              <i class="fas fa-trash"></i> Remove
            </button>
          </div>
          <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
        `;

      cartItemsContainer.appendChild(cartItem);
    });

    // Add event listeners to cart item buttons
    setupCartItemControls();
  }

  // Setup cart item controls
  function setupCartItemControls() {
    // Decrease quantity buttons
    const decreaseButtons = document.querySelectorAll('.cart-quantity-btn.decrease');
    decreaseButtons.forEach(button => {
      button.addEventListener('click', function () {
        const index = parseInt(this.getAttribute('data-index'));
        if (cart[index].quantity > 1) {
          cart[index].quantity--;
          updateCart();
        }
      });
    });

    // Increase quantity buttons
    const increaseButtons = document.querySelectorAll('.cart-quantity-btn.increase');
    increaseButtons.forEach(button => {
      button.addEventListener('click', function () {
        const index = parseInt(this.getAttribute('data-index'));
        cart[index].quantity++;
        updateCart();
      });
    });

    // Quantity input fields
    const quantityInputs = document.querySelectorAll('.cart-quantity-input');
    quantityInputs.forEach(input => {
      input.addEventListener('change', function () {
        const index = parseInt(this.getAttribute('data-index'));
        const quantity = parseInt(this.value);

        if (quantity > 0) {
          cart[index].quantity = quantity;
          updateCart();
        } else {
          this.value = cart[index].quantity;
        }
      });
    });

    // Remove buttons
    const removeButtons = document.querySelectorAll('.cart-item-remove');
    removeButtons.forEach(button => {
      button.addEventListener('click', function () {
        const index = parseInt(this.getAttribute('data-index'));
        cart.splice(index, 1);
        updateCart();

        // Show empty cart message if cart is empty
        if (cart.length === 0) {
          document.getElementById('empty-cart').classList.remove('hidden');
          document.querySelector('.cart-container').classList.add('hidden');
        }
      });
    });
  }

  // Update cart
  function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
    updateCartSummary();
  }

  // Update cart summary
  function updateCartSummary(discountRate = 0) {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const discount = subtotal * discountRate;
    const tax = (subtotal - discount) * 0.08; // 8% tax
    const total = subtotal - discount + shipping + tax;

    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
  }

  // Setup filters for products page
  function setupFilters() {
    const applyFiltersButton = document.getElementById('apply-filters');

    if (applyFiltersButton) {
      applyFiltersButton.addEventListener('click', function () {
        const categoryCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]:checked');
        const priceRange = parseInt(document.getElementById('price-range').value);
        const sortBy = document.getElementById('sort-by').value;

        // Get selected categories
        const selectedCategories = Array.from(categoryCheckboxes).map(checkbox => checkbox.value);

        // Filter products by category and price
        let filteredProducts = products;

        // Filter by category (if "all" is not selected)
        if (!selectedCategories.includes('all')) {
          filteredProducts = filteredProducts.filter(product =>
            selectedCategories.includes(product.category)
          );
        }

        // Filter by price
        filteredProducts = filteredProducts.filter(product => product.price <= priceRange);

        // Sort products
        switch (sortBy) {
          case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
          case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
          default:
            // Default is 'recommended', no special sorting
            break;
        }

        // Display filtered products
        const productsContainer = document.getElementById('all-products');
        productsContainer.innerHTML = '';

        if (filteredProducts.length > 0) {
          filteredProducts.forEach(product => {
            const productCard = createProductCard(product);
            productsContainer.appendChild(productCard);
          });
        } else {
          productsContainer.innerHTML = '<p class="no-products">No products match your filters. Please try different criteria.</p>';
        }
      });
    }

    // Update price range display
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');

    if (priceRange && priceValue) {
      priceRange.addEventListener('input', function () {
        priceValue.textContent = `$${this.value}`;
      });
    }
  }

  // Setup thumbnail gallery for product detail page
  function setupThumbnailGallery() {
    const thumbnails = document.querySelectorAll('.product-thumbnail');
    const mainImage = document.getElementById('main-product-image');

    if (thumbnails.length > 0 && mainImage) {
      thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function () {
          // Remove active class from all thumbnails
          thumbnails.forEach(t => t.classList.remove('active'));

          // Add active class to clicked thumbnail
          this.classList.add('active');

          // Update main image
          const imageIndex = parseInt(this.getAttribute('data-index'));
          const product = products.find(p => p.id === parseInt(new URLSearchParams(window.location.search).get('id')));
          mainImage.src = product.images[imageIndex];
        });
      });
    }
  }

  // Setup quantity controls for product detail page
  function setupQuantityControls() {
    const decreaseBtn = document.getElementById('decrease-quantity');
    const increaseBtn = document.getElementById('increase-quantity');
    const quantityInput = document.getElementById('quantity');

    if (decreaseBtn && increaseBtn && quantityInput) {
      decreaseBtn.addEventListener('click', function () {
        let quantity = parseInt(quantityInput.value);
        if (quantity > 1) {
          quantityInput.value = quantity - 1;
        }
      });

      increaseBtn.addEventListener('click', function () {
        let quantity = parseInt(quantityInput.value);
        if (quantity < 10) {
          quantityInput.value = quantity + 1;
        }
      });

      quantityInput.addEventListener('change', function () {
        let quantity = parseInt(this.value);
        if (quantity < 1) {
          this.value = 1;
        } else if (quantity > 10) {
          this.value = 10;
        }
      });
    }
  }

  // Setup color selection for product detail page
  function setupColorSelection() {
    const colorOptions = document.querySelectorAll('.color-option');

    if (colorOptions.length > 0) {
      colorOptions.forEach(option => {
        option.addEventListener('click', function () {
          // Remove active class from all options
          colorOptions.forEach(o => o.classList.remove('active'));

          // Add active class to clicked option
          this.classList.add('active');
        });
      });
    }
  }

  // Load related products on product detail page
  function loadRelatedProducts(currentProduct) {
    const relatedProductsContainer = document.getElementById('related-products');

    if (relatedProductsContainer) {
      // Get products from the same category, excluding current product
      const relatedProducts = products
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
        .slice(0, 4); // Limit to 4 related products

      if (relatedProducts.length > 0) {
        relatedProducts.forEach(product => {
          const productCard = createProductCard(product);
          relatedProductsContainer.appendChild(productCard);
        });
      } else {
        // If no related products in same category, show other popular products
        const popularProducts = products
          .filter(p => p.id !== currentProduct.id)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);

        popularProducts.forEach(product => {
          const productCard = createProductCard(product);
          relatedProductsContainer.appendChild(productCard);
        });
      }
    }
  }

  // Setup payment modal
  function setupPaymentModal() {
    const modal = document.getElementById('payment-modal');
    const confirmationModal = document.getElementById('confirmation-modal');
    const closeButtons = document.querySelectorAll('.close');

    if (modal) {
      // Close modal when clicking close button
      closeButtons.forEach(button => {
        button.addEventListener('click', function () {
          modal.style.display = 'none';
          if (confirmationModal) {
            confirmationModal.style.display = 'none';
          }
        });
      });

      // Close modal when clicking outside of modal content
      window.addEventListener('click', function (event) {
        if (event.target === modal) {
          modal.style.display = 'none';
        }
        if (confirmationModal && event.target === confirmationModal) {
          confirmationModal.style.display = 'none';
        }
      });

      // Setup payment tabs
      const paymentTabs = document.querySelectorAll('.payment-tab');
      const paymentContents = document.querySelectorAll('.payment-tab-content');

      paymentTabs.forEach(tab => {
        tab.addEventListener('click', function () {
          const tabName = this.getAttribute('data-tab');

          // Remove active class from all tabs and contents
          paymentTabs.forEach(t => t.classList.remove('active'));
          paymentContents.forEach(c => c.classList.remove('active'));

          // Add active class to clicked tab and corresponding content
          this.classList.add('active');
          document.getElementById(tabName).classList.add('active');
        });
      });

      // Credit card form submission
      const creditCardForm = document.getElementById('credit-card-form');
      if (creditCardForm) {
        creditCardForm.addEventListener('submit', function (e) {
          e.preventDefault();
          processPayment();
        });
      }

      // PayPal payment
      const paypalButton = document.getElementById('paypal-button');
      if (paypalButton) {
        paypalButton.addEventListener('click', function () {
          processPayment();
        });
      }

      // Bank transfer confirmation
      const confirmTransferButton = document.getElementById('confirm-transfer');
      if (confirmTransferButton) {
        confirmTransferButton.addEventListener('click', function () {
          processPayment();
        });
      }
    }
  }

  // Process payment and show confirmation
  function processPayment() {
    // Generate random order number
    const orderNumber = 'ORD' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('order-number').textContent = orderNumber;

    // Hide payment modal and show confirmation
    document.getElementById('payment-modal').style.display = 'none';
    document.getElementById('confirmation-modal').style.display = 'block';

    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
  }
});


