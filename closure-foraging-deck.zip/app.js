// Closure Machine Presentation JavaScript
class ClosureMachinePresentation {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 9;
        this.isTransitioning = false;
        this.backgroundAnimationState = 'open';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateProgressBar();
        this.updateSlideCounter();
        this.setupPromptInteractions();
        this.initializeBackgroundAnimation();
        this.preloadSlides();
        this.setupNavigationButtons();
    }
    
    setupNavigationButtons() {
        // Ensure navigation buttons work properly
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.previousSlide();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextSlide();
            });
        }
    }
    
    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isTransitioning) return;
            
            switch(e.key) {
                case 'ArrowRight':
                case 'Space':
                case ' ':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides);
                    break;
                case 'Escape':
                    this.collapseAllPrompts();
                    break;
            }
        });
        
        // Touch/swipe support
        this.setupTouchEvents();
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.adjustForScreenSize();
        });
        
        // Visibility change handler for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }
    
    setupTouchEvents() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        });
    }
    
    handleSwipe(startX, startY, endX, endY) {
        const minSwipeDistance = 50;
        const maxVerticalDistance = 100;
        
        const horizontalDistance = endX - startX;
        const verticalDistance = Math.abs(endY - startY);
        
        // Ignore if vertical swipe is too large (scrolling)
        if (verticalDistance > maxVerticalDistance) return;
        
        if (Math.abs(horizontalDistance) > minSwipeDistance) {
            if (horizontalDistance > 0) {
                this.previousSlide();
            } else {
                this.nextSlide();
            }
        }
    }
    
    setupPromptInteractions() {
        // Use setTimeout to ensure DOM is fully loaded
        setTimeout(() => {
            const prompts = document.querySelectorAll('.prompt');
            
            prompts.forEach((prompt, index) => {
                // Remove any existing listeners to avoid duplicates
                prompt.removeEventListener('click', prompt._clickHandler);
                
                // Create and store the click handler
                prompt._clickHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    this.togglePrompt(prompt);
                };
                
                // Add click listener
                prompt.addEventListener('click', prompt._clickHandler);
                
                // Keyboard accessibility
                prompt.setAttribute('tabindex', '0');
                prompt.setAttribute('role', 'button');
                prompt.setAttribute('aria-expanded', 'false');
                
                // Remove existing keydown listener
                prompt.removeEventListener('keydown', prompt._keyHandler);
                
                // Create and store keydown handler
                prompt._keyHandler = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.togglePrompt(prompt);
                    }
                };
                
                prompt.addEventListener('keydown', prompt._keyHandler);
                
                // Add unique IDs for tracking
                prompt.setAttribute('data-prompt-id', `slide-${this.getSlideNumber(prompt)}-prompt-${index}`);
            });
            
            console.log(`Set up interactions for ${prompts.length} prompts`);
        }, 100);
    }
    
    togglePrompt(prompt) {
        const isExpanded = prompt.classList.contains('expanded');
        const expandedText = prompt.getAttribute('data-expanded-text');
        
        if (!expandedText) {
            console.log('No expanded text found for prompt:', prompt.textContent.substring(0, 50));
            return;
        }
        
        if (isExpanded) {
            this.collapsePrompt(prompt);
        } else {
            this.expandPrompt(prompt);
        }
        
        // Update ARIA state
        prompt.setAttribute('aria-expanded', (!isExpanded).toString());
        
        // Analytics/tracking
        this.trackPromptInteraction(prompt, !isExpanded);
        
        console.log(`Prompt ${isExpanded ? 'collapsed' : 'expanded'}:`, prompt.textContent.substring(0, 50));
    }
    
    expandPrompt(prompt) {
        // Collapse other expanded prompts in the same slide for better focus
        const currentSlideElement = document.querySelector('.slide.active');
        if (currentSlideElement) {
            const otherPrompts = currentSlideElement.querySelectorAll('.prompt.expanded');
            otherPrompts.forEach(p => {
                if (p !== prompt) this.collapsePrompt(p);
            });
        }
        
        prompt.classList.add('expanded');
        
        // Add shimmer effect for Windows & Mirrors slides
        if (prompt.classList.contains('mirror-window')) {
            this.addMirrorWindowEffect(prompt);
        }
        
        // Smooth scroll to keep expanded prompt in view
        setTimeout(() => {
            prompt.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
        }, 300);
    }
    
    collapsePrompt(prompt) {
        prompt.classList.remove('expanded');
        
        // Remove special effects
        prompt.classList.remove('mirror-effect', 'window-effect');
    }
    
    collapseAllPrompts() {
        const expandedPrompts = document.querySelectorAll('.prompt.expanded');
        expandedPrompts.forEach(prompt => this.collapsePrompt(prompt));
    }
    
    addMirrorWindowEffect(prompt) {
        const text = prompt.textContent.toLowerCase();
        
        if (text.includes('hypermediacy') || text.includes('mirror')) {
            prompt.classList.add('mirror-effect');
        } else if (text.includes('immediacy') || text.includes('window')) {
            prompt.classList.add('window-effect');
        }
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides && !this.isTransitioning) {
            this.goToSlide(this.currentSlide + 1);
        } else if (this.currentSlide === this.totalSlides && !this.isTransitioning) {
            // Restart from beginning if at last slide
            this.goToSlide(1);
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 1 && !this.isTransitioning) {
            this.goToSlide(this.currentSlide - 1);
        }
    }
    
    goToSlide(slideNumber) {
        if (slideNumber === this.currentSlide || this.isTransitioning) return;
        if (slideNumber < 1 || slideNumber > this.totalSlides) return;
        
        console.log(`Transitioning from slide ${this.currentSlide} to slide ${slideNumber}`);
        
        this.isTransitioning = true;
        
        // Collapse all prompts before transition
        this.collapseAllPrompts();
        
        // Update slide states
        const currentSlideElement = document.getElementById(`slide-${this.currentSlide}`);
        const nextSlideElement = document.getElementById(`slide-${slideNumber}`);
        
        if (!currentSlideElement || !nextSlideElement) {
            console.error('Could not find slide elements');
            this.isTransitioning = false;
            return;
        }
        
        // Determine transition direction
        const isForward = slideNumber > this.currentSlide;
        
        // Apply transition classes
        currentSlideElement.classList.remove('active');
        currentSlideElement.classList.add(isForward ? 'prev' : 'next');
        
        // Small delay for smoother transition
        setTimeout(() => {
            nextSlideElement.classList.add('active');
            nextSlideElement.classList.remove('prev', 'next');
            
            // Clean up previous slide
            setTimeout(() => {
                currentSlideElement.classList.remove('prev', 'next');
                this.isTransitioning = false;
                
                // Re-setup prompt interactions for the new slide
                this.setupPromptInteractions();
            }, 400);
            
        }, 50);
        
        this.currentSlide = slideNumber;
        this.updateProgressBar();
        this.updateSlideCounter();
        this.updateNavigationButtons();
        this.updateBackgroundAnimation();
        
        // Announce slide change for screen readers
        this.announceSlideChange(slideNumber);
    }
    
    updateProgressBar() {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            const percentage = (this.currentSlide / this.totalSlides) * 100;
            progressFill.style.width = `${percentage}%`;
            
            // Add a subtle pulse effect on slide change
            progressFill.style.animation = 'none';
            setTimeout(() => {
                progressFill.style.animation = '';
            }, 10);
        }
    }
    
    updateSlideCounter() {
        const currentSlideElement = document.getElementById('currentSlide');
        const totalSlidesElement = document.getElementById('totalSlides');
        
        if (currentSlideElement) currentSlideElement.textContent = this.currentSlide;
        if (totalSlidesElement) totalSlidesElement.textContent = this.totalSlides;
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentSlide === 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = false; // Never disable next - it can restart
            
            // Update button text for context
            if (this.currentSlide === this.totalSlides) {
                nextBtn.innerHTML = '<span>Restart</span><span>↻</span>';
            } else {
                nextBtn.innerHTML = '<span>Next</span><span>→</span>';
            }
        }
    }
    
    updateBackgroundAnimation() {
        const bgElement = document.getElementById('bgAnimation');
        if (!bgElement) return;
        
        // Different animation states based on slide content
        if (this.currentSlide <= 3) {
            // Opening slides - more chaotic, open
            this.backgroundAnimationState = 'open';
            bgElement.style.animationDuration = '10s';
        } else if (this.currentSlide <= 6) {
            // Middle slides - structured, closed
            this.backgroundAnimationState = 'closed';
            bgElement.style.animationDuration = '20s';
        } else {
            // Windows & Mirrors slides - alternating
            this.backgroundAnimationState = 'mirror-window';
            bgElement.style.animationDuration = '8s';
        }
        
        // Add CSS class for different states
        bgElement.className = `background-animation ${this.backgroundAnimationState}`;
    }
    
    initializeBackgroundAnimation() {
        // Create floating particles for ambient effect
        this.createFloatingParticles();
    }
    
    createFloatingParticles() {
        const container = document.getElementById('bgAnimation');
        if (!container) return;
        
        const particleCount = window.innerWidth < 768 ? 15 : 25;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            
            // Random properties
            const size = Math.random() * 4 + 1;
            const duration = Math.random() * 20 + 15;
            const delay = Math.random() * 20;
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(102, 204, 255, 0.3);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: floatParticle ${duration}s linear infinite;
                animation-delay: ${delay}s;
                pointer-events: none;
            `;
            
            container.appendChild(particle);
        }
        
        // Add CSS for particle animation if not already present
        if (!document.querySelector('#particleStyles')) {
            const style = document.createElement('style');
            style.id = 'particleStyles';
            style.textContent = `
                @keyframes floatParticle {
                    0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
                }
                .floating-particle {
                    will-change: transform, opacity;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    adjustForScreenSize() {
        // Adjust particle count on resize
        const container = document.getElementById('bgAnimation');
        if (!container) return;
        
        const particles = container.querySelectorAll('.floating-particle');
        const targetCount = window.innerWidth < 768 ? 15 : 25;
        
        if (particles.length !== targetCount) {
            particles.forEach(p => p.remove());
            this.createFloatingParticles();
        }
    }
    
    pauseAnimations() {
        document.body.style.animationPlayState = 'paused';
    }
    
    resumeAnimations() {
        document.body.style.animationPlayState = 'running';
    }
    
    announceSlideChange(slideNumber) {
        const slideElement = document.getElementById(`slide-${slideNumber}`);
        if (!slideElement) return;
        
        const title = slideElement.querySelector('.slide-title')?.textContent || '';
        const subtitle = slideElement.querySelector('.slide-subtitle')?.textContent || '';
        
        // Create live region announcement for screen readers
        const announcement = `Slide ${slideNumber} of ${this.totalSlides}: ${title}, ${subtitle}`;
        this.announce(announcement);
    }
    
    announce(message) {
        // Create or update live region for screen reader announcements
        let liveRegion = document.getElementById('live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.cssText = `
                position: absolute;
                left: -10000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            `;
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = message;
    }
    
    trackPromptInteraction(prompt, isExpanded) {
        const promptId = prompt.getAttribute('data-prompt-id');
        const slideNumber = this.currentSlide;
        
        // Analytics tracking could be implemented here
        console.log(`Prompt interaction: ${promptId}, expanded: ${isExpanded}, slide: ${slideNumber}`);
    }
    
    getSlideNumber(prompt) {
        const slide = prompt.closest('.slide');
        if (!slide) return 1;
        const slideId = slide.id;
        return parseInt(slideId.split('-')[1]) || 1;
    }
    
    preloadSlides() {
        // Ensure all slides are ready for smooth transitions
        const slides = document.querySelectorAll('.slide');
        slides.forEach(slide => {
            // Force layout calculation
            slide.offsetHeight;
        });
    }
}

// Global functions for button onclick handlers (backup)
function nextSlide() {
    console.log('Global nextSlide called');
    if (window.presentation) {
        window.presentation.nextSlide();
    }
}

function previousSlide() {
    console.log('Global previousSlide called');
    if (window.presentation) {
        window.presentation.previousSlide();
    }
}

// Initialize presentation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing presentation');
    window.presentation = new ClosureMachinePresentation();
    
    // Add some special CSS for different animation states
    const dynamicStyles = document.createElement('style');
    dynamicStyles.textContent = `
        .background-animation.open::before {
            animation: morphBackground 10s ease-in-out infinite;
        }
        
        .background-animation.closed::before {
            animation: morphBackground 20s ease-in-out infinite reverse;
        }
        
        .background-animation.mirror-window::before {
            animation: mirrorWindowCycle 8s ease-in-out infinite;
        }
        
        @keyframes mirrorWindowCycle {
            0% { 
                background: radial-gradient(circle at 20% 30%, rgba(255, 51, 102, 0.2) 0%, transparent 50%);
                filter: blur(0px);
            }
            25% { 
                background: radial-gradient(circle at 80% 70%, rgba(102, 204, 255, 0.2) 0%, transparent 50%);
                filter: blur(2px);
            }
            50% { 
                background: linear-gradient(45deg, rgba(255, 51, 102, 0.1), rgba(102, 204, 255, 0.1));
                filter: blur(0px);
            }
            75% { 
                background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 30%);
                filter: blur(1px);
            }
            100% { 
                background: radial-gradient(circle at 20% 30%, rgba(255, 51, 102, 0.2) 0%, transparent 50%);
                filter: blur(0px);
            }
        }
        
        .prompt.mirror-effect {
            background: rgba(255, 51, 102, 0.2) !important;
            border-left-color: var(--closure-red) !important;
            animation: mirrorPulse 2s ease-in-out infinite;
        }
        
        .prompt.window-effect {
            background: rgba(102, 204, 255, 0.15) !important;
            border-left-color: var(--closure-blue) !important;
            animation: windowShimmer 2s ease-in-out infinite;
        }
        
        @keyframes mirrorPulse {
            0%, 100% { box-shadow: 0 0 20px rgba(255, 51, 102, 0.4); }
            50% { box-shadow: 0 0 40px rgba(255, 51, 102, 0.6); }
        }
        
        @keyframes windowShimmer {
            0%, 100% { 
                box-shadow: 0 0 20px rgba(102, 204, 255, 0.4);
                transform: translateX(12px);
            }
            50% { 
                box-shadow: 0 0 30px rgba(102, 204, 255, 0.6);
                transform: translateX(16px);
            }
        }
    `;
    document.head.appendChild(dynamicStyles);
    
    console.log('Presentation initialized successfully');
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
    if (window.presentation) {
        if (document.hidden) {
            window.presentation.pauseAnimations();
        } else {
            window.presentation.resumeAnimations();
        }
    }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClosureMachinePresentation;
}