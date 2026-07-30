/* ==========================================================================
   Contact Page — Premium Interactions
   Vanilla JS, no dependencies
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- 1. Scroll Reveal with Intersection Observer ---------- */
  const revealEls = document.querySelectorAll(
    '.reveal-card, .reveal-left, .reveal-right, .reveal-fade, .reveal-scale'
  );

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- 2. FAQ Accordion ---------- */
  const faqItems = document.querySelectorAll('.contact-faq-item');

  faqItems.forEach((item) => {
    const question = item.querySelector('.contact-faq-question');
    const answer = item.querySelector('.contact-faq-answer');

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other items
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('active');
          const otherQuestion = other.querySelector('.contact-faq-question');
          otherQuestion.setAttribute('aria-expanded', 'false');
        }
      });

      if (isActive) {
        item.classList.remove('active');
        question.setAttribute('aria-expanded', 'false');
      } else {
        // Set max-height to scrollHeight for smooth animation
        const inner = answer.querySelector('.contact-faq-answer-inner');
        answer.style.maxHeight = inner.scrollHeight + 32 + 'px';
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });

    // Calculate correct max-height on window resize for active items
    window.addEventListener('resize', () => {
      if (item.classList.contains('active')) {
        const inner = answer.querySelector('.contact-faq-answer-inner');
        answer.style.maxHeight = inner.scrollHeight + 32 + 'px';
      }
    });
  });

  /* ---------- 3. Contact Form ---------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const submitBtn = document.getElementById('contactSubmitBtn');
    const submitText = document.getElementById('contactSubmitText');
    const submitLoading = document.getElementById('contactSubmitLoading');
    const successMsg = document.getElementById('contactFormSuccess');

    const fields = {
      name: document.getElementById('cfName'),
      email: document.getElementById('cfEmail'),
      phone: document.getElementById('cfPhone'),
      subject: document.getElementById('cfSubject'),
      message: document.getElementById('cfMessage'),
    };

    const errors = {
      name: document.getElementById('cfNameError'),
      email: document.getElementById('cfEmailError'),
      phone: document.getElementById('cfPhoneError'),
      subject: document.getElementById('cfSubjectError'),
      message: document.getElementById('cfMessageError'),
    };

    function showError(field, message) {
      if (errors[field]) errors[field].textContent = message;
      if (fields[field]) fields[field].classList.add('error');
    }

    function clearError(field) {
      if (errors[field]) errors[field].textContent = '';
      if (fields[field]) fields[field].classList.remove('error');
    }

    function clearAllErrors() {
      Object.keys(errors).forEach((key) => {
        if (errors[key]) errors[key].textContent = '';
      });
      Object.keys(fields).forEach((key) => {
        if (fields[key]) fields[key].classList.remove('error');
      });
    }

    // Live validation
    Object.keys(fields).forEach((key) => {
      const el = fields[key];
      if (!el) return;
      el.addEventListener('input', () => clearError(key));
      el.addEventListener('blur', () => {
        if (el.hasAttribute('required') && el.value.trim() === '') {
          showError(key, 'هذا الحقل مطلوب');
        }
      });
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAllErrors();

      let isValid = true;

      if (!fields.name.value.trim()) {
        showError('name', 'هذا الحقل مطلوب');
        isValid = false;
      }

      if (!fields.email.value.trim()) {
        showError('email', 'هذا الحقل مطلوب');
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim())) {
        showError('email', 'يرجى إدخال بريد إلكتروني صحيح');
        isValid = false;
      }

      if (fields.phone.value.trim() && !/^[0-9+\-\s]{8,15}$/.test(fields.phone.value.trim())) {
        showError('phone', 'يرجى إدخال رقم هاتف صحيح');
        isValid = false;
      }

      if (!fields.subject.value || fields.subject.value === '') {
        showError('subject', 'هذا الحقل مطلوب');
        isValid = false;
      }

      if (!fields.message.value.trim()) {
        showError('message', 'هذا الحقل مطلوب');
        isValid = false;
      }

      if (!isValid) {
        const firstError = document.querySelector('.contact-field-error:not(:empty)');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Show loading state
      submitBtn.classList.add('loading');

      // Simulate sending (replace with actual API call)
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        submitBtn.classList.remove('loading');
        contactForm.reset();
        successMsg.classList.add('show');

        // Hide success after 5 seconds
        setTimeout(() => {
          successMsg.classList.remove('show');
        }, 5000);
      } catch (err) {
        submitBtn.classList.remove('loading');
        showError('message', 'حدث خطأ أثناء الإرسال. حاول مرة أخرى.');
      }
    });
  }

  /* ---------- 4. Smooth Scroll for Anchor Links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const offset = 100;
          const targetPos = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
      }
    });
  });

  /* ---------- 5. Button Ripple Effect ---------- */
  document.querySelectorAll('.contact-btn, .contact-submit-btn, .contact-cta-btn, .contact-map-glass-btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        transform: scale(0);
        animation: contactRipple 0.6s ease-out;
        pointer-events: none;
      `;

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Inject ripple keyframe once
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes contactRipple {
      to { transform: scale(3); opacity: 0; }
    }
  `;
  document.head.appendChild(styleSheet);

  /* ---------- 6. Form Btn ripple support ---------- */
  console.log('🌟 Contact page loaded successfully');
})();
