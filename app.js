// Presentation JavaScript - Mobile-first slide navigation with quote management

const INPUT = {
  caseMedium: "Instagram Stories HUD",
  quotes: [
    { 
      author: "Bolter & Grusin", 
      work: "Remediation", 
      year: 1999, 
      cite: "p. 24", 
      text: "a transparent interface would be one that erases itself, so that the user is no longer aware of confronting a medium, but instead stands in an immediate relationship to the contents of that medium"
    },
    { 
      author: "Bolter & Grusin", 
      work: "Remediation", 
      year: 1999, 
      cite: "p. 5", 
      text: "Our culture wants both to multiply its media and to erase all traces of mediation: ideally, it wants to erase its media in the very act of multiplying them"
    },
    { 
      author: "Bolter & Grusin", 
      work: "Remediation", 
      year: 1999, 
      cite: "p. 45", 
      text: "the representation of one medium in another, a defining characteristic of the new digital media"
    },
    { 
      author: "McCloud", 
      work: "Understanding Comics", 
      year: 1993, 
      cite: "p. 63", 
      text: "This phenomenon of observing the parts but perceiving the whole has a name. It's called closure"
    },
    { 
      author: "McCloud", 
      work: "Understanding Comics", 
      year: 1993, 
      cite: "p. 67", 
      text: "Comics panels fracture both time and space, offering a jagged, staccato rhythm of unconnected moments"
    },
    { 
      author: "McCloud", 
      work: "Understanding Comics", 
      year: 1993, 
      cite: "p. 63", 
      text: "In our daily lives, we often commit closure, mentally completing that which is incomplete based on past experience"
    }
  ],
  keyArguments: {
    bgThroughline: "Bolter and Grusin reveal that our pursuit of immediacy paradoxically requires hypermediacy - we multiply media technologies precisely to hide their mediation. This double logic drives remediation as each new medium promises greater transparency while building upon older forms.",
    mcBridge: "McCloud's closure demonstrates how users actively construct continuity from fragments, making immediacy an effect of perceptual completion rather than technical transparency."
  },
  microEvidence: [
    "Tap-to-advance full-screen image removes chrome (immediacy)",
    "Ring timer & stickers reintroduce UI seams (hypermediacy)", 
    "Story format remediates slideshow & zine pages (remediation)",
    "User infers motion across frames (closure)"
  ],
  definitions: {
    immediacy: "The desire for transparent interfaces that erase themselves to create direct contact with content",
    hypermediacy: "The multiplication and foregrounding of media to achieve a sense of fullness and reality",
    remediation: "The representation of one medium in another; how new media refashion older forms",
    closure: "Observing parts but perceiving wholes; mentally completing incomplete information"
  }
};

class PresentationController {
  constructor() {
    this.currentSlide = 0;
    this.totalSlides = 12;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.quotesUsed = new Set();
    this.slideTitle = [
      "Windows & Mirrors: The Special Effect of Immediacy",
      "Today's Map", 
      "Key Terms",
      "Reading Anchors — Bolter & Grusin",
      "Reading Anchors — McCloud",
      "Synthesis: Windows vs Mirrors",
      "Case Study: Instagram Stories HUD",
      "Design Teardown",
      "Counter-Case: When Immediacy Breaks",
      "Q&A with Jay Bolter",
      "Discussion Prompts",
      "References"
    ];

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.generateProgressDots();
    this.populateReferences();
    this.updateGroundingBadge();
    this.loadFromHash();
    this.announceSlide();
    this.updateNavButtons();
  }

  setupEventListeners() {
    // Navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.prevSlide();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.nextSlide();
      });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Touch/swipe navigation - using passive listeners where appropriate
    const slidesContainer = document.querySelector('.slides-container');
    if (slidesContainer) {
      slidesContainer.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
      slidesContainer.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      slidesContainer.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }
    
    // Quote chips - delegate from document
    document.addEventListener('click', this.handleQuoteClick.bind(this));
    
    // Copy citations button
    const copyBtn = document.getElementById('copy-citations');
    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.copyCitations();
      });
    }
    
    // Hash change for direct navigation
    window.addEventListener('hashchange', this.loadFromHash.bind(this));
  }

  generateProgressDots() {
    const dotsContainer = document.getElementById('progress-dots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'progress-dot';
      dot.setAttribute('data-slide', i);
      dot.setAttribute('aria-label', `Go to slide ${i + 1}: ${this.slideTitle[i]}`);
      if (i === this.currentSlide) {
        dot.classList.add('active');
      }
      
      // Add click listener directly to each dot
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const slideIndex = parseInt(e.target.getAttribute('data-slide'));
        this.goToSlide(slideIndex);
      });
      
      dotsContainer.appendChild(dot);
    }
  }

  handleKeydown(e) {
    switch(e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        this.prevSlide();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
        e.preventDefault();
        this.nextSlide();
        break;
      case 'Home':
        e.preventDefault();
        this.goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        this.goToSlide(this.totalSlides - 1);
        break;
    }
  }

  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  }

  handleTouchMove(e) {
    if (!this.touchStartX || !this.touchStartY) return;
    
    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    
    const deltaX = this.touchStartX - touchCurrentX;
    const deltaY = this.touchStartY - touchCurrentY;
    
    // Prevent default only for horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault();
    }
  }

  handleTouchEnd(e) {
    if (!this.touchStartX || !this.touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = this.touchStartX - touchEndX;
    const deltaY = this.touchStartY - touchEndY;
    
    const minSwipeDistance = 50;
    
    // Only process horizontal swipes with sufficient distance
    if (Math.abs(deltaX) < minSwipeDistance || Math.abs(deltaY) > Math.abs(deltaX)) {
      this.touchStartX = 0;
      this.touchStartY = 0;
      return;
    }
    
    if (deltaX > 0) {
      // Swiped left - next slide
      this.nextSlide();
    } else {
      // Swiped right - previous slide  
      this.prevSlide();
    }
    
    this.touchStartX = 0;
    this.touchStartY = 0;
  }

  handleQuoteClick(e) {
    if (!e.target.classList.contains('quote-chip')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const quoteId = e.target.getAttribute('data-quote-id');
    
    if (quoteId !== null && quoteId !== undefined) {
      this.toggleQuote(e.target, parseInt(quoteId));
    }
  }

  toggleQuote(chip, quoteId) {
    const quote = INPUT.quotes[quoteId];
    if (!quote) return;
    
    // Track quote usage
    this.quotesUsed.add(quoteId);
    this.updateGroundingBadge();
    
    if (chip.classList.contains('expanded')) {
      // For expanded quote chips (on reading slides)
      chip.classList.toggle('show-full');
    } else {
      // For mini quote chips - show tooltip
      this.showQuoteTooltip(chip, quote);
    }
  }

  showQuoteTooltip(chip, quote) {
    // Remove any existing tooltip
    const existingTooltip = document.querySelector('.quote-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }
    
    const tooltip = document.createElement('div');
    tooltip.className = 'quote-tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-content">
        <p><em>"${quote.text}"</em></p>
        <cite>[${quote.author}, ${quote.work}, ${quote.year}, ${quote.cite}]</cite>
        <button class="tooltip-close" aria-label="Close quote">×</button>
      </div>
    `;
    
    // Position tooltip
    const rect = chip.getBoundingClientRect();
    tooltip.style.cssText = `
      position: fixed;
      top: ${Math.max(10, rect.top - 10)}px;
      left: ${Math.max(10, Math.min(window.innerWidth - 290, rect.left - 100))}px;
      z-index: 1000;
      background: var(--color-white);
      border: 2px solid var(--color-black);
      padding: var(--space-md);
      max-width: 280px;
      font-size: calc(var(--font-size-base) * 0.85);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(tooltip);
    
    // Close tooltip handlers
    const closeBtn = tooltip.querySelector('.tooltip-close');
    const closeTooltip = () => {
      if (tooltip.parentNode) {
        tooltip.remove();
      }
    };
    
    closeBtn.addEventListener('click', closeTooltip);
    
    // Close on click outside after a delay
    setTimeout(() => {
      const clickOutsideHandler = (e) => {
        if (!tooltip.contains(e.target) && e.target !== chip) {
          closeTooltip();
          document.removeEventListener('click', clickOutsideHandler);
        }
      };
      document.addEventListener('click', clickOutsideHandler);
    }, 100);
    
    // Auto-close after 10 seconds
    setTimeout(closeTooltip, 10000);
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.goToSlide(this.currentSlide - 1);
    }
  }

  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.goToSlide(this.currentSlide + 1);
    }
  }

  goToSlide(index) {
    if (index < 0 || index >= this.totalSlides || index === this.currentSlide) return;
    
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.progress-dot');
    
    // Remove active class from current slide and dot
    if (slides[this.currentSlide]) {
      slides[this.currentSlide].classList.remove('active');
    }
    if (dots[this.currentSlide]) {
      dots[this.currentSlide].classList.remove('active');
    }
    
    // Add prev class to current slide if moving forward
    if (index > this.currentSlide && slides[this.currentSlide]) {
      slides[this.currentSlide].classList.add('prev');
    } else if (slides[this.currentSlide]) {
      slides[this.currentSlide].classList.remove('prev');
    }
    
    // Update current slide index
    this.currentSlide = index;
    
    // Activate new slide and dot
    if (slides[this.currentSlide]) {
      slides[this.currentSlide].classList.add('active');
      slides[this.currentSlide].classList.remove('prev');
    }
    if (dots[this.currentSlide]) {
      dots[this.currentSlide].classList.add('active');
    }
    
    // Update navigation buttons
    this.updateNavButtons();
    
    // Update URL hash
    window.history.replaceState(null, null, `#slide-${this.currentSlide}`);
    
    // Announce slide change
    this.announceSlide();
  }

  updateNavButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn) {
      prevBtn.disabled = this.currentSlide === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
    }
  }

  loadFromHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#slide-')) {
      const slideIndex = parseInt(hash.replace('#slide-', ''));
      if (!isNaN(slideIndex) && slideIndex >= 0 && slideIndex < this.totalSlides) {
        this.goToSlide(slideIndex);
        return;
      }
    }
    // Default to slide 0 if no valid hash
    this.goToSlide(0);
  }

  announceSlide() {
    const slidesContainer = document.querySelector('.slides-container');
    const title = this.slideTitle[this.currentSlide];
    
    if (slidesContainer) {
      // Update aria-label for the container
      slidesContainer.setAttribute('aria-label', `Slide ${this.currentSlide + 1} of ${this.totalSlides}: ${title}`);
    }
    
    // Create announcement for screen readers
    const announcement = document.createElement('div');
    announcement.textContent = `Slide ${this.currentSlide + 1}: ${title}`;
    announcement.className = 'sr-only';
    announcement.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(announcement);
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.remove();
      }
    }, 1000);
  }

  populateReferences() {
    const referencesList = document.getElementById('references-list');
    if (!referencesList) return;
    
    referencesList.innerHTML = '';
    
    INPUT.quotes.forEach((quote) => {
      const refItem = document.createElement('div');
      refItem.className = 'reference-item';
      refItem.innerHTML = `
        ${quote.author}. <em>${quote.work}</em>. ${quote.year}. ${quote.cite}.
      `;
      referencesList.appendChild(refItem);
    });
  }

  updateGroundingBadge() {
    const badge = document.getElementById('grounding-badge');
    if (badge) {
      badge.textContent = `Grounded ${this.quotesUsed.size}/${INPUT.quotes.length}`;
    }
  }

  copyCitations() {
    const citations = INPUT.quotes.map(quote => 
      `${quote.author}. ${quote.work}. ${quote.year}. ${quote.cite}.`
    ).join('\n');
    
    const fullBibliography = `References:\n\n${citations}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullBibliography).then(() => {
        this.showCopyConfirmation();
      }).catch(err => {
        console.error('Failed to copy: ', err);
        this.fallbackCopy(fullBibliography);
      });
    } else {
      this.fallbackCopy(fullBibliography);
    }
  }

  fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.cssText = `
      position: fixed;
      left: -999999px;
      top: -999999px;
      opacity: 0;
    `;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.showCopyConfirmation();
      }
    } catch (err) {
      console.error('Fallback copy failed: ', err);
    }
    
    document.body.removeChild(textArea);
  }

  showCopyConfirmation() {
    const copyBtn = document.getElementById('copy-citations');
    if (!copyBtn) return;
    
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.style.background = 'var(--color-medium-gray)';
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = 'var(--color-black)';
    }, 2000);
  }
}

// Add screen reader only utility class styles
const srOnlyStyles = document.createElement('style');
srOnlyStyles.textContent = `
  .sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }
  
  .quote-tooltip {
    animation: fadeIn 0.2s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .tooltip-content {
    position: relative;
  }
  
  .tooltip-close {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--color-black);
    color: var(--color-white);
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    line-height: 1;
  }
  
  .tooltip-close:hover {
    background: var(--color-medium-gray);
  }
  
  @media (prefers-reduced-motion: reduce) {
    .quote-tooltip {
      animation: none;
    }
  }
`;
document.head.appendChild(srOnlyStyles);

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PresentationController();
});

// Validate INPUT data and show warnings if missing
document.addEventListener('DOMContentLoaded', () => {
  const missingFields = [];
  
  if (!INPUT.caseMedium) missingFields.push('caseMedium');
  if (!INPUT.quotes || INPUT.quotes.length === 0) missingFields.push('quotes');
  if (!INPUT.keyArguments) missingFields.push('keyArguments');
  if (!INPUT.microEvidence || INPUT.microEvidence.length === 0) missingFields.push('microEvidence');
  
  if (missingFields.length > 0) {
    const warningRibbon = document.createElement('div');
    warningRibbon.innerHTML = `
      <div style="
        background: var(--color-black);
        color: var(--color-white);
        padding: var(--space-sm);
        text-align: center;
        font-size: calc(var(--font-size-base) * 0.85);
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
      ">
        ⚠ Missing INPUT fields: ${missingFields.join(', ')}
      </div>
    `;
    document.body.appendChild(warningRibbon);
    
    // Adjust body padding to account for warning ribbon
    document.body.style.paddingTop = '30px';
  }
});