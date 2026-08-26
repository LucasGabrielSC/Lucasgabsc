/* ========================================
   PORTFOLIO LUCAS GABRIEL — Main Script
   Refactored: accessible inline validation,
   safe observer logic, smooth transitions
   ======================================== */

(function () {
  'use strict';

  // ===== Header background & logo swap on scroll =====
  const header = document.getElementById('site-header');
  const nav = document.getElementById('site-nav');
  const navLogo = document.getElementById('nav-logo');

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('bg-night/90', 'backdrop-blur-md', 'border-royal/40');
      header.classList.remove('border-transparent');
      if (nav) {
        nav.classList.add('py-2');
        nav.classList.remove('py-3', 'sm:py-5');
      }
      if (navLogo) {
        navLogo.classList.add('h-8');
        navLogo.classList.remove('h-10', 'h-12', 'sm:h-16');
      }
    } else {
      header.classList.remove('bg-night/90', 'backdrop-blur-md', 'border-royal/40');
      header.classList.add('border-transparent');
      if (nav) {
        nav.classList.remove('py-2');
        nav.classList.add('py-3', 'sm:py-5');
      }
      if (navLogo) {
        navLogo.src = 'assets/images/logonav.png';
        navLogo.classList.add('h-10', 'sm:h-16');
        navLogo.classList.remove('h-8', 'h-12', 'sm:h-12');
      }
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  // ===== Mobile menu toggle =====
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('hidden') === false;
      menuBtn.setAttribute('aria-expanded', String(open));
    });

    mobileMenu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // ===== Reveal on scroll =====
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  reveals.forEach((el) => io.observe(el));

  // ===== Contact form (Accessible Inline Feedback + WhatsApp Redirect) =====
  const form = document.getElementById('contact-form');
  const nameInput = document.getElementById('name');
  const messageInput = document.getElementById('message');
  const nameError = document.getElementById('name-error');
  const messageError = document.getElementById('message-error');
  const formSuccess = document.getElementById('form-success');

  const clearErrors = () => {
    if (nameError) {
      nameError.textContent = '';
      nameError.classList.remove('is-shown');
    }
    if (messageError) {
      messageError.textContent = '';
      messageError.classList.remove('is-shown');
    }
    if (formSuccess) {
      formSuccess.textContent = '';
      formSuccess.classList.remove('is-shown');
    }
  };

  if (form) {
    if (nameInput) nameInput.addEventListener('input', clearErrors);
    if (messageInput) messageInput.addEventListener('input', clearErrors);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      const name = nameInput ? nameInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';
      let hasError = false;

      if (!name) {
        if (nameError) {
          nameError.textContent = 'Por favor, informe seu nome.';
          nameError.classList.add('is-shown');
        }
        if (nameInput) nameInput.focus();
        hasError = true;
      }

      if (!message) {
        if (messageError) {
          messageError.textContent = 'Por favor, escreva uma mensagem.';
          messageError.classList.add('is-shown');
        }
        if (!hasError && messageInput) messageInput.focus();
        hasError = true;
      }

      if (hasError) return;

      if (formSuccess) {
        formSuccess.textContent = 'Redirecionando para o WhatsApp...';
        formSuccess.classList.add('is-shown');
      }

      const fullText = `Olá, meu nome é ${name}.\n${message}`;
      const whatsappUrl = `https://wa.me/5511918420158?text=${encodeURIComponent(fullText)}`;

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 350);
    });
  }

  // ===== Smooth anchor scroll =====
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ===== Typewriter: SOBRE MIM =====
  const aboutTitle = document.getElementById('about-title');
  if (aboutTitle) {
    const textToType = 'SOBRE MIM';
    const typeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            typeObserver.unobserve(entry.target);
            aboutTitle.textContent = '';
            aboutTitle.classList.add('typing-cursor');
            let charIndex = 0;
            const typingInterval = setInterval(() => {
              if (charIndex < textToType.length) {
                aboutTitle.textContent += textToType.charAt(charIndex);
                charIndex++;
              } else {
                clearInterval(typingInterval);
                setTimeout(
                  () => aboutTitle.classList.remove('typing-cursor'),
                  2000
                );
              }
            }, 110);
          }
        });
      },
      { threshold: 0.3 }
    );
    typeObserver.observe(aboutTitle);
  }

  // ===== Typewriter & Choreography: HERO =====
  const heroTitle = document.getElementById('hero-title');
  const heroLine1 = document.getElementById('hero-line1');
  const heroLine2 = document.getElementById('hero-line2');
  const heroSubtitle = document.getElementById('hero-subtitle');
  const heroCta = document.getElementById('hero-cta');

  if (heroTitle && heroLine1 && heroLine2) {
    const text1 = 'Olá, eu sou o';
    const text2 = 'Lucas.';

    heroLine1.textContent = '';
    heroLine2.textContent = '';
    heroLine1.classList.add('typing-cursor');

    let i = 0;
    const timer1 = setInterval(() => {
      if (i < text1.length) {
        heroLine1.textContent += text1.charAt(i);
        i++;
      } else {
        clearInterval(timer1);
        heroLine1.classList.remove('typing-cursor');
        heroLine2.classList.add('typing-cursor');

        let j = 0;
        const timer2 = setInterval(() => {
          if (j < text2.length) {
            heroLine2.textContent += text2.charAt(j);
            j++;
          } else {
            clearInterval(timer2);
            setTimeout(
              () => heroLine2.classList.remove('typing-cursor'),
              1500
            );

            if (heroSubtitle) {
              heroSubtitle.classList.remove('opacity-0', 'translate-y-4');
              heroSubtitle.classList.add('opacity-100', 'translate-y-0');
            }

            if (heroCta) {
              setTimeout(() => {
                heroCta.classList.remove('opacity-0', 'translate-y-4');
                heroCta.classList.add('opacity-100', 'translate-y-0');
              }, 300);
            }
          }
        }, 80);
      }
    }, 55);
  }
})();
