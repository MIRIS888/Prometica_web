class StaggeredMenu {
  constructor(options = {}) {
    this.position = options.position || 'right';
    this.colors = options.colors || ['#000000', '#1a1a1a'];
    this.items = options.items || [];
    this.socialItems = options.socialItems || [];
    this.displaySocials = options.displaySocials !== false;
    this.displayItemNumbering = options.displayItemNumbering !== false;
    this.logoUrl = options.logoUrl || '';
    this.menuButtonColor = options.menuButtonColor || '#ffffff';
    this.openMenuButtonColor = options.openMenuButtonColor || '#000000';
    this.accentColor = options.accentColor || '#ffffff';
    this.changeMenuColorOnOpen = options.changeMenuColorOnOpen !== false;
    this.onMenuOpen = options.onMenuOpen;
    this.onMenuClose = options.onMenuClose;

    this.open = false;
    this.openRef = false;
    this.busyRef = false;
    this.textLines = ['Menu', 'Close'];

    // Animation references
    this.openTl = null;
    this.closeTween = null;
    this.spinTween = null;
    this.textCycleAnim = null;
    this.colorTween = null;
    this.itemEntranceTween = null;

    this.init();
  }

  init() {
    this.createHTML();
    this.cacheElements();
    this.setupInitialStates();
    this.bindEvents();
  }

  createHTML() {
    const container = document.createElement('div');
    container.className = 'staggered-menu-wrapper';
    container.setAttribute('data-position', this.position);
    if (this.accentColor) {
      container.style.setProperty('--sm-accent', this.accentColor);
    }

    // Create prelayers
    const prelayersHTML = this.colors.slice(0, 4).map((color, i) => {
      if (this.colors.length >= 3 && i === Math.floor(this.colors.length / 2)) {
        return '';
      }
      return `<div class="sm-prelayer" style="background: ${color}"></div>`;
    }).join('');

    // Create navigation items
    const itemsHTML = this.items.length > 0
      ? this.items.map((item, idx) => `
          <li class="sm-panel-itemWrap">
            <a class="sm-panel-item" href="${item.link}" aria-label="${item.ariaLabel || item.label}" data-index="${idx + 1}">
              <span class="sm-panel-itemLabel">${item.label}</span>
            </a>
          </li>
        `).join('')
      : `<li class="sm-panel-itemWrap" aria-hidden="true">
           <span class="sm-panel-item">
             <span class="sm-panel-itemLabel">No items</span>
           </span>
         </li>`;

    // Create social items
    const socialsHTML = this.displaySocials && this.socialItems.length > 0
      ? `<div class="sm-socials" aria-label="Social links">
           <h3 class="sm-socials-title">Socials</h3>
           <ul class="sm-socials-list" role="list">
             ${this.socialItems.map((social, i) => `
               <li class="sm-socials-item">
                 <a href="${social.link}" target="_blank" rel="noopener noreferrer" class="sm-socials-link">
                   ${social.label}
                 </a>
               </li>
             `).join('')}
           </ul>
         </div>`
      : '';

    container.innerHTML = `
      <div class="sm-prelayers" aria-hidden="true">
        ${prelayersHTML}
      </div>
      <header class="staggered-menu-header" aria-label="Main navigation header">
        <div class="sm-logo" aria-label="Logo">
          ${this.logoUrl ? `<img src="${this.logoUrl}" alt="Logo" class="sm-logo-img" draggable="false" width="110" height="24">` : '<span class="sm-logo-text">PROMETICA</span>'}
        </div>
        <button class="sm-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="staggered-menu-panel" type="button">
          <span class="sm-toggle-textWrap" aria-hidden="true">
            <span class="sm-toggle-textInner">
              ${this.textLines.map(line => `<span class="sm-toggle-line">${line}</span>`).join('')}
            </span>
          </span>
          <span class="sm-icon" aria-hidden="true">
            <span class="sm-icon-line"></span>
            <span class="sm-icon-line sm-icon-line-v"></span>
          </span>
        </button>
      </header>
      <aside id="staggered-menu-panel" class="staggered-menu-panel" aria-hidden="true">
        <div class="sm-panel-inner">
          <ul class="sm-panel-list" role="list" ${this.displayItemNumbering ? 'data-numbering' : ''}>
            ${itemsHTML}
          </ul>
          ${socialsHTML}
        </div>
      </aside>
    `;

    // Insert into DOM
    document.body.appendChild(container);
    this.wrapper = container;
  }

  cacheElements() {
    this.panel = this.wrapper.querySelector('.staggered-menu-panel');
    this.preLayersContainer = this.wrapper.querySelector('.sm-prelayers');
    this.preLayerEls = Array.from(this.preLayersContainer.querySelectorAll('.sm-prelayer'));
    this.plusH = this.wrapper.querySelector('.sm-icon-line:not(.sm-icon-line-v)');
    this.plusV = this.wrapper.querySelector('.sm-icon-line-v');
    this.icon = this.wrapper.querySelector('.sm-icon');
    this.textInner = this.wrapper.querySelector('.sm-toggle-textInner');
    this.textWrap = this.wrapper.querySelector('.sm-toggle-textWrap');
    this.toggleBtn = this.wrapper.querySelector('.sm-toggle');
  }

  setupInitialStates() {
    const offscreen = this.position === 'left' ? -100 : 100;

    gsap.set([this.panel, ...this.preLayerEls], { xPercent: offscreen });
    gsap.set(this.plusH, { transformOrigin: '50% 50%', rotate: 0 });
    gsap.set(this.plusV, { transformOrigin: '50% 50%', rotate: 90 });
    gsap.set(this.icon, { rotate: 0, transformOrigin: '50% 50%' });
    gsap.set(this.textInner, { yPercent: 0 });
    gsap.set(this.toggleBtn, { color: this.menuButtonColor });
  }

  bindEvents() {
    this.toggleBtn.addEventListener('click', () => this.toggleMenu());
  }

  buildOpenTimeline() {
    if (this.openTl) this.openTl.kill();
    if (this.closeTween) {
      this.closeTween.kill();
      this.closeTween = null;
    }
    if (this.itemEntranceTween) this.itemEntranceTween.kill();

    const itemEls = Array.from(this.panel.querySelectorAll('.sm-panel-itemLabel'));
    const numberEls = Array.from(this.panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
    const socialTitle = this.panel.querySelector('.sm-socials-title');
    const socialLinks = Array.from(this.panel.querySelectorAll('.sm-socials-link'));

    const layerStates = this.preLayerEls.map(el => ({
      el,
      start: Number(gsap.getProperty(el, 'xPercent'))
    }));
    const panelStart = Number(gsap.getProperty(this.panel, 'xPercent'));

    // Reset states
    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    }
    if (numberEls.length) {
      gsap.set(numberEls, { '--sm-num-opacity': 0 });
    }
    if (socialTitle) {
      gsap.set(socialTitle, { opacity: 0 });
    }
    if (socialLinks.length) {
      gsap.set(socialLinks, { y: 25, opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });

    // Animate prelayers
    layerStates.forEach((ls, i) => {
      tl.fromTo(
        ls.el,
        { xPercent: ls.start },
        { xPercent: 0, duration: 0.5, ease: 'power4.out' },
        i * 0.07
      );
    });

    // Animate main panel
    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;

    tl.fromTo(
      this.panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    // Animate menu items
    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;

      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: 'power4.out',
          stagger: { each: 0.1, from: 'start' }
        },
        itemsStart
      );

      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: 'power2.out',
            '--sm-num-opacity': 1,
            stagger: { each: 0.08, from: 'start' }
          },
          itemsStart + 0.1
        );
      }
    }

    // Animate socials
    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;

      if (socialTitle) {
        tl.to(socialTitle, {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out'
        }, socialsStart);
      }

      if (socialLinks.length) {
        tl.to(socialLinks, {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power3.out',
          stagger: { each: 0.08, from: 'start' },
          onComplete: () => {
            gsap.set(socialLinks, { clearProps: 'opacity' });
          }
        }, socialsStart + 0.04);
      }
    }

    this.openTl = tl;
    return tl;
  }

  playOpen() {
    if (this.busyRef) return;
    this.busyRef = true;

    const tl = this.buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        this.busyRef = false;
      });
      tl.play(0);
    } else {
      this.busyRef = false;
    }
  }

  playClose() {
    if (this.openTl) {
      this.openTl.kill();
      this.openTl = null;
    }
    if (this.itemEntranceTween) this.itemEntranceTween.kill();

    const all = [...this.preLayerEls, this.panel];
    if (this.closeTween) this.closeTween.kill();

    const offscreen = this.position === 'left' ? -100 : 100;

    this.closeTween = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        // Reset states
        const itemEls = Array.from(this.panel.querySelectorAll('.sm-panel-itemLabel'));
        if (itemEls.length) {
          gsap.set(itemEls, { yPercent: 140, rotate: 10 });
        }

        const numberEls = Array.from(this.panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
        if (numberEls.length) {
          gsap.set(numberEls, { '--sm-num-opacity': 0 });
        }

        const socialTitle = this.panel.querySelector('.sm-socials-title');
        const socialLinks = Array.from(this.panel.querySelectorAll('.sm-socials-link'));

        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

        this.busyRef = false;
      }
    });
  }

  animateIcon(opening) {
    if (this.spinTween) this.spinTween.kill();

    if (opening) {
      this.spinTween = gsap.to(this.icon, {
        rotate: 225,
        duration: 0.8,
        ease: 'power4.out',
        overwrite: 'auto'
      });
    } else {
      this.spinTween = gsap.to(this.icon, {
        rotate: 0,
        duration: 0.35,
        ease: 'power3.inOut',
        overwrite: 'auto'
      });
    }
  }

  animateColor(opening) {
    if (this.colorTween) this.colorTween.kill();

    if (this.changeMenuColorOnOpen) {
      const targetColor = opening ? this.openMenuButtonColor : this.menuButtonColor;
      this.colorTween = gsap.to(this.toggleBtn, {
        color: targetColor,
        delay: 0.18,
        duration: 0.3,
        ease: 'power2.out'
      });
    } else {
      gsap.set(this.toggleBtn, { color: this.menuButtonColor });
    }
  }

  animateText(opening) {
    if (this.textCycleAnim) this.textCycleAnim.kill();

    const currentLabel = opening ? 'Menu' : 'Close';
    const targetLabel = opening ? 'Close' : 'Menu';
    const cycles = 3;
    const seq = [currentLabel];
    let last = currentLabel;

    for (let i = 0; i < cycles; i++) {
      last = last === 'Menu' ? 'Close' : 'Menu';
      seq.push(last);
    }

    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);

    this.textLines = seq;

    // Update DOM
    this.textInner.innerHTML = seq.map(line => `<span class="sm-toggle-line">${line}</span>`).join('');

    gsap.set(this.textInner, { yPercent: 0 });

    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;

    this.textCycleAnim = gsap.to(this.textInner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: 'power4.out'
    });
  }

  toggleMenu() {
    const target = !this.openRef;
    this.openRef = target;
    this.open = target;

    // Update attributes
    this.wrapper.setAttribute('data-open', target || undefined);
    this.toggleBtn.setAttribute('aria-expanded', target);
    this.toggleBtn.setAttribute('aria-label', target ? 'Close menu' : 'Open menu');
    this.panel.setAttribute('aria-hidden', !target);

    if (target) {
      if (this.onMenuOpen) this.onMenuOpen();
      this.playOpen();
    } else {
      if (this.onMenuClose) this.onMenuClose();
      this.playClose();
    }

    this.animateIcon(target);
    this.animateColor(target);
    this.animateText(target);
  }

  destroy() {
    if (this.openTl) this.openTl.kill();
    if (this.closeTween) this.closeTween.kill();
    if (this.spinTween) this.spinTween.kill();
    if (this.textCycleAnim) this.textCycleAnim.kill();
    if (this.colorTween) this.colorTween.kill();
    if (this.itemEntranceTween) this.itemEntranceTween.kill();

    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
  }
}

// Export for use
window.StaggeredMenu = StaggeredMenu;