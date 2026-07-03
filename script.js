// script.js — basic interactivity: nav toggle, scroll spy, contact form client-side validation
// plus Bora Mobility LLP product explorer (client-side only)

document.addEventListener('DOMContentLoaded', function () {
  // Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      if (!nav) return;
      nav.classList.toggle('open');
      navToggle.classList.toggle('open');
    });
  }

  // Close mobile nav after clicking a link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 980 && nav && navToggle) {
        nav.classList.remove('open');
        navToggle.classList.remove('open');
      }
    });
  });

  // Scroll spy: highlight nav links for visible sections
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function onScroll() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      const id = sec.getAttribute('id');
      const link = document.querySelector('.nav-link[href="#' + id + '"]');
      if (!link) return;
      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  // Simple contact form handling (frontend only). Sends a mailto if user wants or just validates.
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const clearBtn = document.getElementById('clearBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = (document.getElementById('name') || {}).value || '';
      const email = (document.getElementById('email') || {}).value || '';
      const company = (document.getElementById('company') || {}).value || '';
      const message = (document.getElementById('message') || {}).value || '';

      // Basic validation
      if (!name.trim() || !email.trim() || !message.trim()) {
        if (formStatus) {
          formStatus.textContent = 'Please complete name, email and message.';
          formStatus.style.color = '#d9534f';
        }
        return;
      }

      // Compose a mailto so user can send via their email client (frontend-only solution)
      const subject = encodeURIComponent('Enquiry from Bandhar Enterprises website — ' + (company || name));
      const body = encodeURIComponent(
        'Name: ' + name + '\n' +
        (company ? ('Company: ' + company + '\n') : '') +
        'Email: ' + email + '\n\n' +
        'Message:\n' + message
      );

      // Show status and open mailto
      if (formStatus) {
        formStatus.textContent = 'Opening your email client to send enquiry...';
        formStatus.style.color = '#0b66b2';
      }

      // Using setTimeout briefly to show message then open mailto
      setTimeout(function () {
        window.location.href = 'mailto:purchase@bandharenterprises.com?subject=' + subject + '&body=' + body;
      }, 500);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      ['name', 'email', 'company', 'message'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      if (formStatus) formStatus.textContent = '';
    });
  }

  // --- Theme Switching Logic ---
  const themeToggleBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  
  // Set theme from local storage or default to system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      updateThemeIcon(theme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'dark') {
      themeIcon.className = 'bx bx-sun';
    } else {
      themeIcon.className = 'bx bx-moon';
    }
  }

  // --- Sourcing Estimator Calculator ---
  const estCategory = document.getElementById('estCategory');
  const estBrand = document.getElementById('estBrand');
  const estQuantity = document.getElementById('estQuantity');
  const qtyVal = document.getElementById('qtyVal');
  const shipAir = document.getElementById('shipAir');
  const shipSea = document.getElementById('shipSea');
  
  const discountTier = document.getElementById('discountTier');
  const discountPercent = document.getElementById('discountPercent');
  const estDeliveryTime = document.getElementById('estDeliveryTime');
  const estimatorQuoteBtn = document.getElementById('estimatorQuoteBtn');

  const brandOptions = {
    mobiles: ['iPhone', 'Samsung', 'Xiaomi', 'OnePlus'],
    laptops: ['Apple', 'Dell', 'Lenovo', 'HP'],
    printers: ['Canon', 'HP', 'Epson', 'Brother']
  };

  function populateBrands() {
    if (!estCategory || !estBrand) return;
    const cat = estCategory.value;
    const brands = brandOptions[cat] || [];
    estBrand.innerHTML = '';
    brands.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.toLowerCase();
      opt.textContent = b;
      estBrand.appendChild(opt);
    });
  }

  function runCalculator() {
    if (!estCategory || !estQuantity || !qtyVal || !discountTier || !discountPercent || !estDeliveryTime) return;
    
    const cat = estCategory.value;
    const qty = parseInt(estQuantity.value, 10);
    qtyVal.textContent = qty;

    // Check selected shipping radio
    let shipping = 'air';
    const activeShipCard = document.querySelector('.ship-card.active input');
    if (activeShipCard) {
      shipping = activeShipCard.value;
    }

    // Discount calculations based on wholesale MOQ tiers
    let tier = 'Bronze Sourcing Tier';
    let pct = '5%';
    if (qty >= 250) {
      tier = 'Enterprise Negotiated Tier';
      pct = '20%';
    } else if (qty >= 100) {
      tier = 'Gold Sourcing Tier';
      pct = '15%';
    } else if (qty >= 20) {
      tier = 'Silver Sourcing Tier';
      pct = '10%';
    }

    // Lead times calculations
    let lead = '5 - 7 days';
    if (shipping === 'air') {
      if (cat === 'mobiles') lead = '1 - 2 days';
      else if (cat === 'laptops') lead = '1 - 3 days';
      else lead = '2 - 3 days';
    } else {
      if (cat === 'mobiles') lead = '3 - 5 days';
      else if (cat === 'laptops') lead = '4 - 6 days';
      else lead = '5 - 7 days';
    }

    discountTier.textContent = tier;
    discountPercent.textContent = pct;
    estDeliveryTime.textContent = lead;
  }

  if (estCategory) {
    estCategory.addEventListener('change', () => {
      populateBrands();
      runCalculator();
    });
  }

  if (estQuantity) {
    estQuantity.addEventListener('input', runCalculator);
  }

  // Handle shipping card clicks
  [shipAir, shipSea].forEach(card => {
    if (!card) return;
    card.addEventListener('click', (e) => {
      e.preventDefault();
      [shipAir, shipSea].forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      runCalculator();
    });
  });

  // Prefill quote query to contact form
  if (estimatorQuoteBtn) {
    estimatorQuoteBtn.addEventListener('click', () => {
      const catText = estCategory.options[estCategory.selectedIndex].text;
      const brandText = estBrand.options[estBrand.selectedIndex] ? estBrand.options[estBrand.selectedIndex].text : '';
      const qty = estQuantity.value;
      const shippingText = document.querySelector('.ship-card.active span').textContent;
      const lead = estDeliveryTime.textContent;
      const discount = discountPercent.textContent;
      const tier = discountTier.textContent;

      const messageArea = document.getElementById('message');

      if (messageArea) {
        messageArea.value = `Hello Sourcing & Procurement Team,\n\nWe would like to request a bulk quote for the following B2B requirements:\n` +
          `- Sourced Category: ${catText}\n` +
          `- Target Brand: ${brandText}\n` +
          `- Quantity Required: ${qty} units\n` +
          `- Shipping Method Sourced: ${shippingText}\n` +
          `- Estimated Delivery Transit: ${lead}\n` +
          `- Applied Discount Indicator: ${tier} (${discount})\n\n` +
          `Please check state e-way bill compliance and advise bulk GST tariffs.`;
      }

      // Smooth scroll to contact
      const contactSec = document.getElementById('contact');
      if (contactSec) {
        contactSec.scrollIntoView({ behavior: 'smooth' });
      }

      // Focus message field
      setTimeout(() => {
        if (messageArea) messageArea.focus();
      }, 800);
    });
  }

  // Initialize Calculator
  populateBrands();
  runCalculator();


  // --- FAQ Accordion Logic ---
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      // Close all other items for a clean accordion experience
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        i.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        if (answer) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      }
    });
  });


  // --- Scroll Reveal Logic ---
  const reveals = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, {
    threshold: 0.15
  });

  reveals.forEach(el => revealObserver.observe(el));


  // --- Scroll to Top Button ---
  const scrollToTopBtn = document.getElementById('scrollToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      if (scrollToTopBtn) scrollToTopBtn.classList.add('visible');
    } else {
      if (scrollToTopBtn) scrollToTopBtn.classList.remove('visible');
    }
  });

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* Bandhar Enterprises — Product Explorer */
  (function bandharProductSectionInit() {
    const productDataBandhar = {
      mobiles: {
        title: 'Mobiles',
        note: 'Bandhar Enterprises: curated mobile sourcing for retail & B2B channel partners.',
        subcategories: [
          { brand: 'iPhone', desc: 'Apple iPhones with local manufacturer warranties.', types: ['iPhone 14', 'iPhone 13'] },
          { brand: 'Samsung', desc: 'Galaxy series sourced for varied consumer segments.', types: ['Galaxy S23', 'Galaxy A54'] },
          { brand: 'Xiaomi', desc: 'Value and performance phones for mass-market.', types: ['Redmi Note 12', 'Poco X5'] },
          { brand: 'OnePlus', desc: 'High-performance Android phones for power users.', types: ['OnePlus 11', 'Nord 3'] }
        ]
      },
      laptops: {
        title: 'Laptops & Tablets',
        note: 'Sourced laptops and tablets for office and consumer needs.',
        subcategories: [
          { brand: 'Apple', desc: 'iPad and Mac devices sourced locally for resellers.', types: ['iPad Air', 'MacBook Air'] },
          { brand: 'Dell', desc: 'Business-focused notebooks and workstations.', types: ['Dell XPS', 'Dell Latitude'] },
          { brand: 'Lenovo', desc: 'Durable ThinkPad and IdeaPad local stocks.', types: ['ThinkPad T14', 'IdeaPad 3'] },
          { brand: 'HP', desc: 'Commercial and consumer HP laptops.', types: ['HP Spectre', 'HP Pavilion'] }
        ]
      },
      printers: {
        title: 'Printers',
        note: 'Bandhar sources home, office and industrial printers with GST billing documentation.',
        subcategories: [
          { brand: 'Canon', desc: 'Photo-quality and office multifunction devices.', types: ['Canon PIXMA', 'imageRUNNER'] },
          { brand: 'HP', desc: 'Laser and inkjet printers with wide service network.', types: ['HP LaserJet', 'HP OfficeJet'] },
          { brand: 'Epson', desc: 'EcoTank and commercial inkjet solutions.', types: ['Epson EcoTank', 'Epson WorkForce'] },
          { brand: 'Brother', desc: 'Reliable office printers and label printers.', types: ['Brother HL Series', 'Brother MFC'] }
        ]
      }
    };
    

    // Helper to build Bandhar cards
    function elB(tag, attrs = {}, children = []) {
      const node = document.createElement(tag);
      Object.keys(attrs).forEach(k => {
        if (k === 'class') node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
      (Array.isArray(children) ? children : [children]).forEach(c => {
        if (!c) return;
        if (typeof c === 'string') node.appendChild(document.createTextNode(c));
        else node.appendChild(c);
      });
      return node;
    }

    function renderCategoryCreativeBandhar(key) {
      const container = document.getElementById('productContentBandhar');
      if (!container) return;
      container.innerHTML = '';

      const data = productDataBandhar[key];
      if (!data) return;

      const note = elB('div', { class: 'product-note' }, data.note);
      container.appendChild(note);

      const grid = elB('div', { class: 'subcategory-grid' });

      data.subcategories.forEach(sub => {
        const card = elB('article', { class: 'subcard', tabindex: '0' });
        const title = elB('h4', {}, sub.brand);
        const desc = elB('p', {}, sub.desc);
        const typesWrapper = elB('div', { class: 'types' });

        sub.types.forEach(type => {
          const chip = elB('span', { class: 'chip' }, type);
          typesWrapper.appendChild(chip);
        });

        const view = elB('div', { style: 'margin-top:8px' });
        const detailBtn = elB('button', { class: 'btn btn-outline' }, 'View Details');
        detailBtn.style.fontWeight = 700;
        detailBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          openProductModalBandhar(sub);
        });
        view.appendChild(detailBtn);

        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(typesWrapper);
        card.appendChild(view);

        card.addEventListener('click', () => openProductModalBandhar(sub));
        card.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') openProductModalBandhar(sub); });

        grid.appendChild(card);
      });

      container.appendChild(grid);
    }

    // Bandhar modal helpers
    function openProductModalBandhar(sub) {
      const modal = document.getElementById('productModalBandhar');
      const title = document.getElementById('modalTitleBandhar');
      const desc = document.getElementById('modalDescBandhar');
      const typesContainer = document.getElementById('modalTypesBandhar');
      if (!modal || !title || !desc || !typesContainer) return;

      title.textContent = sub.brand;
      desc.textContent = sub.desc;
      typesContainer.innerHTML = '';
      sub.types.forEach(t => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = t;
        typesContainer.appendChild(chip);
      });

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      const close = document.getElementById('modalCloseBandhar');
      if (close) close.focus();
    }

    function closeProductModalBandhar() {
      const modal = document.getElementById('productModalBandhar');
      if (!modal) return;
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }

    // Wire Bandhar modal events and tabs
    const modalBackdropBandhar = document.getElementById('modalBackdropBandhar');
    const modalCloseBandhar = document.getElementById('modalCloseBandhar');
    if (modalBackdropBandhar) modalBackdropBandhar.addEventListener('click', closeProductModalBandhar);
    if (modalCloseBandhar) modalCloseBandhar.addEventListener('click', closeProductModalBandhar);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeProductModalBandhar();
        if (typeof closeProductModal === 'function') {
          try { closeProductModal(); } catch (err) { /* ignore if not available */ }
        }
      }
    });

    const tabsBandhar = document.querySelectorAll('.product-tabs-bandhar .tab-bandhar');
    if (tabsBandhar && tabsBandhar.length) {
      tabsBandhar.forEach(t => {
        t.addEventListener('click', () => {
          tabsBandhar.forEach(x => { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
          t.classList.add('active'); t.setAttribute('aria-selected', 'true');
          renderCategoryCreativeBandhar(t.dataset.category);
        });
      });

      // initial render
      const activeTabB = document.querySelector('.product-tabs-bandhar .tab-bandhar.active');
      const defB = activeTabB ? activeTabB.dataset.category : 'mobiles';
      renderCategoryCreativeBandhar(defB);
    }
  })();

}); // end DOMContentLoaded
