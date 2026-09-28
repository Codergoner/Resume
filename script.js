/* Chetan Reddy portfolio
   Plain JavaScript, no framework or build step.
   To publish project links, replace the null values in PROJECTS below with real HTTPS URLs. */
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // 1. Theme preference: dark is the default; the visitor can choose light.
  const themeButton = document.getElementById('theme-toggle');
  function applyTheme(theme) {
    const next = theme === 'light' ? 'light' : 'dark';
    root.dataset.theme = next;
    themeButton.setAttribute('aria-label', `Switch to ${next === 'dark' ? 'light' : 'dark'} theme`);
    document.querySelector('meta[name="theme-color"]').content = next === 'dark' ? '#0b1525' : '#ffffff';
  }
  try { applyTheme(localStorage.getItem('chetan-portfolio-theme')); } catch (_) { applyTheme('dark'); }
  themeButton.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    try { localStorage.setItem('chetan-portfolio-theme', root.dataset.theme); } catch (_) { /* Private browsing may block storage. */ }
  });

  // 2. Mobile menu: Escape, an outside click, or a navigation link closes it.
  const menuButton = document.getElementById('menu-toggle');
  const navigation = document.getElementById('main-navigation');
  const header = document.querySelector('.site-header');
  const mobileLayout = window.matchMedia('(max-width: 960px)');
  function setMenu(open, restoreFocus = false) {
    navigation.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('click', event => { if (!header.contains(event.target)) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  mobileLayout.addEventListener('change', () => setMenu(false));

  // 3. A slow typing effect, with a pause control and a static reduced-motion alternative.
  const roles = ['Software Engineering Intern', 'Data Analytics Intern', 'AI Product Builder', 'Full-Stack Developer'];
  const roleText = document.getElementById('typed-role');
  const typingButton = document.getElementById('typing-toggle');
  let typingTimer;
  let roleIndex = 0;
  let characterIndex = roles[0].length;
  let deleting = true;
  let typingPaused = false;
  function queueTyping(delay) { typingTimer = setTimeout(typeNext, delay); }
  function typeNext() {
    if (typingPaused || reducedMotion.matches || document.hidden) return;
    const phrase = roles[roleIndex];
    characterIndex += deleting ? -1 : 1;
    roleText.textContent = phrase.slice(0, characterIndex);
    if (!deleting && characterIndex === phrase.length) { deleting = true; queueTyping(2600); }
    else if (deleting && characterIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; queueTyping(450); }
    else queueTyping(deleting ? 45 : 85);
  }
  function restartTyping() {
    clearTimeout(typingTimer);
    typingButton.hidden = reducedMotion.matches;
    root.classList.toggle('typing-paused', typingPaused || reducedMotion.matches);
    if (reducedMotion.matches) { roleText.textContent = 'Software · Data · AI · Full-Stack'; return; }
    if (!typingPaused && !document.hidden) {
      roleText.textContent = roles[roleIndex];
      characterIndex = roles[roleIndex].length;
      deleting = true;
      queueTyping(2800);
    }
  }
  typingButton.addEventListener('click', () => {
    typingPaused = !typingPaused;
    typingButton.textContent = typingPaused ? 'Resume' : 'Pause';
    typingButton.setAttribute('aria-pressed', String(typingPaused));
    typingButton.setAttribute('aria-label', `${typingPaused ? 'Resume' : 'Pause'} rotating role titles`);
    if (typingPaused) roleText.textContent = roles[roleIndex];
    restartTyping();
  });
  reducedMotion.addEventListener('change', restartTyping);
  document.addEventListener('visibilitychange', restartTyping);
  restartTyping();

  // 4. Scroll reveals. Content stays visible when JavaScript or observers are unavailable.
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    root.classList.add('js-reveal');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    revealElements.forEach(element => revealObserver.observe(element));
  } else revealElements.forEach(element => element.classList.add('is-visible'));

  // 5. Active navigation and back-to-top visibility are updated once per animation frame.
  const navLinks = [...navigation.querySelectorAll('a')];
  const navSections = navLinks.map(link => document.querySelector(link.getAttribute('href')));
  const backToTop = document.getElementById('back-to-top');
  let scrollQueued = false;
  function updateNavigation() {
    const offset = header.offsetHeight + 100;
    let active = -1;
    navSections.forEach((section, index) => { if (section.getBoundingClientRect().top <= offset) active = index; });
    if (window.scrollY + window.innerHeight >= root.scrollHeight - 12) active = navLinks.length - 1;
    navLinks.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    backToTop.hidden = window.scrollY < 650;
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateNavigation); }
  }, { passive: true });
  window.addEventListener('resize', updateNavigation);
  updateNavigation();

  // 6. Filters. A Data empty state is intentional: no standalone analytics project was supplied.
  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-project-card]')];
  const filterStatus = document.getElementById('filter-status');
  const emptyState = document.getElementById('project-empty');
  const linkNote = document.getElementById('project-links-note');
  filters.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filters.forEach(item => {
      const selected = item === button;
      item.setAttribute('aria-pressed', String(selected));
      item.classList.toggle('active', selected);
    });
    let count = 0;
    cards.forEach(card => {
      const show = filter === 'all' || card.dataset.categories.split(' ').includes(filter);
      card.hidden = !show;
      if (show) { card.classList.add('is-visible'); count += 1; }
    });
    emptyState.hidden = count !== 0;
    linkNote.hidden = count === 0;
    filterStatus.textContent = `${count} ${count === 1 ? 'project' : 'projects'}${filter === 'all' ? '' : ` · ${button.textContent}`}`;
    requestAnimationFrame(updateNavigation);
  }));

  // 7. Project information. Keep planned architecture separate from completed work.
  const PROJECTS = {
    tradegrid: {
      title: 'TradeGrid — AI Export Documentation Prototype',
      category: 'Prototype venture',
      role: 'Product Lead & Technical Builder',
      problem: 'Malaysian SMEs exporting into ASEAN face repetitive form-filling, document rework, and uncertainty about country-specific export documentation.',
      solution: 'Designed a guided product prototype connecting shipment details, document generation, country-aware checklists, and AI-assisted export documentation Q&A.',
      features: ['Shipment creation workflow', 'Country-aware compliance checklist', 'Commercial invoice and packing-list generation', 'Professional PDF export', 'AI assistant for export documentation questions', 'Secure data-handling and audit-trail concepts for further development'],
      stack: 'Planned architecture: React front end, FastAPI backend, JSON country rules, document-generation endpoints, and SQLite or in-memory storage. This describes the mapped prototype system, not a deployed production stack.',
      learning: 'Breaking a business workflow into focused product modules, structuring country rules, planning document generation, and identifying where AI assistance can support a user’s task.',
      codeUrl: null,
      demoUrl: null
    },
    grocery: {
      title: 'Grocery Website',
      category: 'Academic project · Sunway University',
      role: 'October–December 2024 · Team project',
      problem: 'A grocery storefront needs clear product organization and a straightforward path from browsing to the shopping cart.',
      solution: 'Built a responsive e-commerce front end with category layouts, navigation, and shopping-cart interactions. Collaborated with a three-member team on backend database integration.',
      features: ['Product category layout across 20+ categories', 'Responsive interfaces for different screen sizes', 'Product browsing and clear navigation', 'Shopping-cart interaction flow', 'Front-end pages connected to database functionality through teamwork'],
      stack: 'HTML, CSS, and JavaScript. Backend database integration was part of the team project; the backend technology is not specified in the resume.',
      learning: 'Responsive layout design, DOM interactions, organizing an e-commerce interface, and coordinating front-end integration with a team.',
      codeUrl: null,
      demoUrl: null
    },
    pokemon: {
      title: 'Pokémon Ga-Ole Mini Game',
      category: 'Academic project · Sunway University',
      role: 'April–August 2024 · Java and database project',
      problem: 'Game mechanics need a structured way to store and retrieve Pokémon attributes, power levels, and evolution information.',
      solution: 'Developed a Java mini game with MySQL database integration, connecting object-oriented game logic to query-based mechanics.',
      features: ['Pokémon attributes, power-level, and evolution data storage', 'MySQL database integration', 'Object-oriented game logic', 'Queries that support game mechanics', 'Schema and query optimization'],
      stack: 'Java, MySQL, and SQL.',
      learning: 'Object-oriented design, relational schemas, connecting application logic to a database, and writing queries that support game behavior.',
      codeUrl: null,
      demoUrl: null
    }
  };

  // Only real HTTP(S) links are enabled. Missing links remain clearly marked placeholders.
  function projectLink(label, url) {
    let validUrl = null;
    try { const parsed = new URL(url); if (['https:', 'http:'].includes(parsed.protocol)) validUrl = parsed.href; } catch (_) {}
    const element = document.createElement(validUrl ? 'a' : 'button');
    element.textContent = `${label} ↗`;
    if (validUrl) { element.href = validUrl; element.target = '_blank'; element.rel = 'noopener noreferrer'; }
    else { element.type = 'button'; element.disabled = true; element.title = 'Link not yet available'; }
    return element;
  }
  document.querySelectorAll('[data-project-links]').forEach(container => {
    const project = PROJECTS[container.dataset.projectLinks];
    container.replaceChildren(projectLink('View Code', project.codeUrl), projectLink('View Demo', project.demoUrl));
    container.querySelectorAll('button').forEach(button => button.setAttribute('aria-describedby', 'project-links-note'));
  });

  // 8. Native dialog: focus stays within the open dialog; Escape closes it.
  const dialog = document.getElementById('project-dialog');
  const dialogTitle = document.getElementById('dialog-title');
  const dialogContent = document.getElementById('dialog-content');
  const dialogLinks = document.getElementById('dialog-links');
  const closeDialog = document.getElementById('dialog-close');
  let previousFocus;
  function addDialogSection(title, content) {
    const section = document.createElement('section');
    section.className = 'dialog-section';
    const heading = document.createElement('h3');
    heading.textContent = title;
    section.append(heading);
    if (Array.isArray(content)) {
      const list = document.createElement('ul');
      content.forEach(text => { const item = document.createElement('li'); item.textContent = text; list.append(item); });
      section.append(list);
    } else { const paragraph = document.createElement('p'); paragraph.textContent = content; section.append(paragraph); }
    dialogContent.append(section);
  }
  document.querySelectorAll('.detail-trigger').forEach(button => button.addEventListener('click', () => {
    const project = PROJECTS[button.dataset.project];
    previousFocus = button;
    dialogTitle.textContent = project.title;
    document.getElementById('dialog-category').textContent = project.category;
    document.getElementById('dialog-role').textContent = project.role;
    dialogContent.replaceChildren();
    addDialogSection('The problem', project.problem);
    addDialogSection('The solution', project.solution);
    addDialogSection('Key features', project.features);
    addDialogSection('Tech stack & implementation', project.stack);
    addDialogSection('What I learned', project.learning);
    const links = [projectLink('View Code', project.codeUrl), projectLink('View Demo', project.demoUrl)];
    links.forEach(link => { link.className = 'button secondary'; if (link.disabled) link.setAttribute('aria-describedby', 'dialog-links-note'); });
    dialogLinks.replaceChildren(...links);
    document.getElementById('dialog-links-note').hidden = Boolean(project.codeUrl && project.demoUrl);
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('modal-open');
    closeDialog.focus();
  }));
  closeDialog.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (previousFocus?.isConnected) previousFocus.focus();
  });

  // 9. Real resume download, with brief visual feedback (no analytics or tracking).
  document.querySelectorAll('.resume-download').forEach(link => {
    const label = link.querySelector('.button-label');
    const originalLabel = label.textContent;
    let feedbackTimer;
    link.addEventListener('click', () => {
      clearTimeout(feedbackTimer);
      label.textContent = 'Downloading…';
      feedbackTimer = setTimeout(() => { label.textContent = originalLabel; }, 1600);
    });
  });

  // 10. Clipboard feedback. The email remains selectable if clipboard access is blocked.
  const copyButton = document.getElementById('copy-email');
  const copyStatus = document.getElementById('copy-status');
  let copyTimer;
  copyButton.addEventListener('click', async () => {
    clearTimeout(copyTimer);
    try { await navigator.clipboard.writeText('reddychetan179@gmail.com'); copyStatus.textContent = 'Email copied'; }
    catch (_) { copyStatus.textContent = 'Select the email above to copy it.'; }
    copyTimer = setTimeout(() => { copyStatus.textContent = ''; }, 4500);
  });
})();
