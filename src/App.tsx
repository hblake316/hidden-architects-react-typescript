import { useEffect, useRef } from 'react';
import { pageHtml } from './pageHtml';

const slideSelector = '.hero, .page-section, .cta-section';

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export default function App() {
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = appRef.current;
    if (!root) return;

    const toggle = root.querySelector<HTMLButtonElement>('#nav-toggle');
    const sidebar = root.querySelector<HTMLElement>('#sidebar');
    const mainEl = root.querySelector<HTMLElement>('main');
    const counter = root.querySelector<HTMLElement>('#slide-counter');
    const prevBtn = root.querySelector<HTMLButtonElement>('#prev-btn');
    const nextBtn = root.querySelector<HTMLButtonElement>('#next-btn');
    const navLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>('.nav-link'));
    const slides = Array.from(root.querySelectorAll<HTMLElement>(slideSelector));

    if (!toggle || !sidebar || !mainEl || !counter || !prevBtn || !nextBtn || slides.length === 0) {
      return;
    }

    let current = 0;
    const total = slides.length;

    const updateUI = (index: number) => {
      current = index;
      counter.textContent = `${pad(index + 1)} / ${pad(total)}`;
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === total - 1;

      const activeId = slides[index]?.id;
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
      });
    };

    const goTo = (index: number) => {
      if (index < 0 || index >= total) return;

      mainEl.scrollTo({
        top: index * mainEl.clientHeight,
        behavior: 'smooth',
      });
      updateUI(index);
    };

    const handleToggleClick = () => sidebar.classList.toggle('open');
    toggle.addEventListener('click', handleToggleClick);

    const navHandlers = navLinks.map((link) => {
      const handler = (event: MouseEvent) => {
        event.preventDefault();
        const targetId = link.getAttribute('href')?.slice(1);
        const targetIndex = slides.findIndex((slide) => slide.id === targetId);

        if (window.innerWidth < 900) {
          sidebar.classList.remove('open');
        }
        if (targetIndex !== -1) {
          goTo(targetIndex);
        }
      };

      link.addEventListener('click', handler);
      return { link, handler };
    });

    const handlePrevClick = () => goTo(current - 1);
    const handleNextClick = () => goTo(current + 1);
    prevBtn.addEventListener('click', handlePrevClick);
    nextBtn.addEventListener('click', handleNextClick);

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault();
        goTo(current + 1);
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        goTo(current - 1);
      } else if (event.key === 'n' || event.key === 'N') {
        const currentSlide = slides[current];
        if (currentSlide?.classList.contains('page-section')) {
          currentSlide.classList.toggle('notes-open');
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    const plateTriggers = Array.from(root.querySelectorAll<HTMLElement>('.plate-trigger'));
    const handlePlateTriggerClick = (event: Event) => {
      event.stopPropagation();
      const trigger = event.currentTarget as HTMLElement;
      trigger.closest('.page-section')?.classList.toggle('notes-open');
    };
    plateTriggers.forEach((trigger) => trigger.addEventListener('click', handlePlateTriggerClick));

    let snapObserver: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      snapObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = slides.indexOf(entry.target as HTMLElement);
              if (index !== -1) updateUI(index);
            }
          });
        },
        { root: mainEl, threshold: 0.6 },
      );
      slides.forEach((slide) => snapObserver?.observe(slide));
    }

    slides.forEach((slide, index) => {
      const numberEl = slide.querySelector<HTMLElement>('.section-num');
      if (numberEl) numberEl.textContent = `${pad(index + 1)} / ${pad(total)}`;
    });

    const elemTrack = root.querySelector<HTMLElement>('#elemental-track');
    const elemSlides = elemTrack ? Array.from(elemTrack.querySelectorAll<HTMLElement>('.carousel-slide')) : [];
    const elemDots = Array.from(root.querySelectorAll<HTMLElement>('.elem-dot'));
    const elemPrev = root.querySelector<HTMLButtonElement>('#elem-prev');
    const elemNext = root.querySelector<HTMLButtonElement>('#elem-next');
    let elemIdx = 0;

    const goElem = (index: number) => {
      if (!elemTrack || elemSlides.length === 0) return;

      elemIdx = (index + elemSlides.length) % elemSlides.length;
      elemTrack.style.transform = `translateX(-${elemIdx * 100}%)`;
      elemDots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === elemIdx);
      });
    };

    const handleElemPrevClick = (event: MouseEvent) => {
      event.stopPropagation();
      goElem(elemIdx - 1);
    };
    const handleElemNextClick = (event: MouseEvent) => {
      event.stopPropagation();
      goElem(elemIdx + 1);
    };
    const elemDotHandlers = elemDots.map((dot) => {
      const handler = (event: MouseEvent) => {
        event.stopPropagation();
        goElem(Number(dot.dataset.idx ?? 0));
      };

      dot.addEventListener('click', handler);
      return { dot, handler };
    });

    elemPrev?.addEventListener('click', handleElemPrevClick);
    elemNext?.addEventListener('click', handleElemNextClick);
    updateUI(0);

    return () => {
      toggle.removeEventListener('click', handleToggleClick);
      navHandlers.forEach(({ link, handler }) => link.removeEventListener('click', handler));
      prevBtn.removeEventListener('click', handlePrevClick);
      nextBtn.removeEventListener('click', handleNextClick);
      document.removeEventListener('keydown', handleKeyDown);
      plateTriggers.forEach((trigger) => trigger.removeEventListener('click', handlePlateTriggerClick));
      snapObserver?.disconnect();
      elemPrev?.removeEventListener('click', handleElemPrevClick);
      elemNext?.removeEventListener('click', handleElemNextClick);
      elemDotHandlers.forEach(({ dot, handler }) => dot.removeEventListener('click', handler));
    };
  }, []);

  return <div ref={appRef} dangerouslySetInnerHTML={{ __html: pageHtml }} />;
}
