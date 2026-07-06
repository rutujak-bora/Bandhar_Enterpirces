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
    laptops: ['Apple', 'Dell', 'Lenovo', 'HP'],
    printers: ['Canon', 'HP', 'Epson', 'Brother'],
    storage: ['Samsung', 'WD', 'Seagate', 'Crucial'],
    memory: ['Kingston', 'Corsair', 'G.Skill', 'Crucial']
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
      if (cat === 'storage' || cat === 'memory') lead = '1 - 2 days';
      else if (cat === 'laptops') lead = '1 - 3 days';
      else lead = '2 - 3 days';
    } else {
      if (cat === 'storage' || cat === 'memory') lead = '2 - 4 days';
      else if (cat === 'laptops') lead = '3 - 5 days';
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
      laptops: {
        title: 'Laptops & Notebooks',
        note: 'Bandhar Enterprises: Sources business laptops, ultrabooks, and notebooks from verified brand distributors inside India.',
        subcategories: [
          { brand: 'Dell', desc: 'Enterprise Latitude series, XPS ultrabooks, and Vostro notebooks for daily business operations.', types: ['Latitude 5440', 'XPS 13', 'Vostro 3520'] },
          { brand: 'HP', desc: 'ProBook, EliteBook, and commercial HP laptops with local vendor warranties.', types: ['ProBook 445', 'EliteBook 840', 'Pavilion 15'] },
          { brand: 'Lenovo', desc: 'Industry-standard ThinkPad series, ThinkBook, and IdeaPad models for office staffing.', types: ['ThinkPad T14', 'ThinkBook 14', 'IdeaPad 3'] },
          { brand: 'Apple', desc: 'MacBook Air and MacBook Pro workstations for designers and developers.', types: ['MacBook Air M2', 'MacBook Pro M3'] }
        ]
      },
      printers: {
        title: 'Printers & Imaging',
        note: 'Bandhar Enterprises: Direct domestic channels for commercial office printers, multifunction systems, and inkjets.',
        subcategories: [
          { brand: 'Canon', desc: 'High-speed imageRUNNER copiers, digital production systems, and office inkjets.', types: ['imageRUNNER 2206', 'PIXMA G3010', 'LBP6030w'] },
          { brand: 'HP', desc: 'LaserJet enterprise printers, smart tank models, and multi-function printers with nationwide services.', types: ['LaserJet Pro M126nw', 'Smart Tank 580', 'OfficeJet Pro'] },
          { brand: 'Epson', desc: 'EcoTank monochrome and color ink tank printers for high-yield, low-cost office printing.', types: ['EcoTank L3250', 'EcoTank M100', 'WorkForce Pro'] },
          { brand: 'Brother', desc: 'Heavy-duty monochrome lasers, color multi-functions, and industrial label printers.', types: ['DCP-L2520D', 'MFC-L2701DW', 'QL-800'] }
        ]
      },
      storage: {
        title: 'Storage Solutions (HDD & SSD)',
        note: 'Bandhar Enterprises: Premium internal and external SSDs, high-capacity HDDs, and enterprise storage arrays.',
        subcategories: [
          { brand: 'Samsung', desc: 'High-speed SATA and NVMe PCIe M.2 SSDs for server boot drives and PC upgrades.', types: ['980 PRO NVMe', '870 EVO SATA', 'T7 Shield External'] },
          { brand: 'WD', desc: 'Western Digital HDDs for surveillance (Purple), NAS (Red), and enterprise servers (Gold/Black).', types: ['WD Purple 4TB', 'WD Red 8TB', 'WD Blue 2TB'] },
          { brand: 'Seagate', desc: 'IronWolf NAS hard drives, BarraCuda consumer drives, and Exos enterprise storage systems.', types: ['BarraCuda 2TB', 'IronWolf 6TB', 'Exos 16TB'] },
          { brand: 'Crucial', desc: 'Affordable SATA and PCIe solid state drives for corporate bulk PC fleet refreshes.', types: ['Crucial BX500', 'Crucial P3 Plus', 'Crucial MX500'] }
        ]
      },
      memory: {
        title: 'RAM & System Memory',
        note: 'Bandhar Enterprises: Desktop, laptop, and enterprise server memory upgrades from major DRAM manufacturers.',
        subcategories: [
          { brand: 'Kingston', desc: 'ValueRAM and high-performance Fury DDR4/DDR5 desktop and laptop SO-DIMM modules.', types: ['Fury Beast DDR4 16GB', 'ValueRAM DDR5 8GB', 'Kingston Server Premier'] },
          { brand: 'Corsair', desc: 'High-performance Vengeance series DDR4 and DDR5 memory modules for workstations and power users.', types: ['Vengeance LPX 16GB', 'Vengeance DDR5 32GB'] },
          { brand: 'G.Skill', desc: 'High-frequency Ripjaws and Trident Z memory modules optimized for custom computing setups.', types: ['Ripjaws V DDR4', 'Trident Z5 Neo DDR5'] },
          { brand: 'Crucial', desc: 'Standard OEM-grade DDR4 and DDR5 RAM modules for office computer memory upgrades.', types: ['Crucial DDR4 8GB', 'Crucial DDR5 16GB'] }
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
      const defB = activeTabB ? activeTabB.dataset.category : 'laptops';
      renderCategoryCreativeBandhar(defB);
    }
  })();

}); // end DOMContentLoaded
