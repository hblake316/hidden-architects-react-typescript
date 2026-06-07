import { useEffect, useRef } from 'react';
import { pageHtml } from './pageHtml';

const slideSelector = '.hero, .page-section, .cta-section';

declare global {
  interface Window {
    __hiddenArchitectsGoElemental?: (value: number, absolute?: boolean) => void;
    __hiddenArchitectsGoPlant?: (value: number, absolute?: boolean) => void;
  }
}

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

    const getEventElement = (target: EventTarget | null) => {
      if (target instanceof Element) return target;
      if (target instanceof Node) return target.parentElement;
      return null;
    };

    let current = 0;
    const total = slides.length;

    const getCurrentIndex = () => {
      const activeIndex = slides.findIndex((slide) => !slide.classList.contains('slide-hidden'));
      return activeIndex === -1 ? current : activeIndex;
    };

    const getHashIndex = () => {
      const targetId = window.location.hash.replace(/^#\/?/, '');
      if (!targetId) return 0;

      const targetIndex = slides.findIndex((slide) => slide.id === targetId);
      return targetIndex === -1 ? 0 : targetIndex;
    };

    const updateUI = (index: number, resetScroll = false) => {
      current = index;
      counter.textContent = `${pad(index + 1)} / ${pad(total)}`;
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === total - 1;

      const activeId = slides[index]?.id;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === index;
        slide.classList.toggle('slide-hidden', !isActive);

        if (isActive && resetScroll) {
          slide.scrollTop = 0;
          slide.querySelectorAll<HTMLElement>('.section-panel-text').forEach((panel) => {
            panel.scrollTop = 0;
          });
        }
      });
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
      });
    };

    const goTo = (index: number) => {
      if (index < 0 || index >= total) return;

      const targetId = slides[index]?.id;
      if (targetId) {
        window.location.hash = targetId;
      } else {
        window.history.pushState(null, '', `${window.location.pathname}${window.location.search}`);
      }
      updateUI(index, true);
    };

    const goBy = (offset: 1 | -1) => {
      goTo(getCurrentIndex() + offset);
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

    const handleRootClick = (event: MouseEvent) => {
      const target = getEventElement(event.target);
      const button = target?.closest<HTMLButtonElement>('#prev-btn, #next-btn');
      if (!button || button.disabled) return;

      event.preventDefault();
      goBy(button.id === 'next-btn' ? 1 : -1);
    };
    root.addEventListener('click', handleRootClick);

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault();
        goBy(1);
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        goBy(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goBy(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goBy(-1);
      } else if (event.key === 'n' || event.key === 'N') {
        const currentSlide = slides[getCurrentIndex()];
        if (currentSlide?.classList.contains('page-section')) {
          currentSlide.classList.toggle('notes-open');
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    const handleHashChange = () => updateUI(getHashIndex(), true);
    window.addEventListener('hashchange', handleHashChange);

    slides.forEach((slide, index) => {
      const numberEl = slide.querySelector<HTMLElement>('.section-num');
      if (numberEl) numberEl.textContent = `${pad(index + 1)} / ${pad(total)}`;
    });
    navLinks.forEach((link) => {
      const numberEl = link.querySelector<HTMLElement>('.nav-num');
      const targetId = link.getAttribute('href')?.slice(1);
      const targetIndex = slides.findIndex((slide) => slide.id === targetId);

      if (numberEl && targetIndex !== -1) {
        numberEl.textContent = pad(targetIndex + 1);
      }
    });

    const elemTrack = root.querySelector<HTMLElement>('#elemental-track');
    const elemSlides = elemTrack ? Array.from(elemTrack.querySelectorAll<HTMLElement>('.carousel-slide')) : [];
    const elemDots = Array.from(root.querySelectorAll<HTMLElement>('.elem-dot'));
    let elemIdx = 0;

    const goElem = (index: number) => {
      if (!elemTrack || elemSlides.length === 0) return;

      elemIdx = (index + elemSlides.length) % elemSlides.length;
      elemTrack.classList.add('is-js-carousel');
      elemTrack.style.transform = '';
      elemSlides.forEach((slide, slideIndex) => {
        slide.classList.toggle('carousel-slide-active', slideIndex === elemIdx);
      });
      elemDots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === elemIdx);
      });
    };

    window.__hiddenArchitectsGoElemental = (value: number, absolute = false) => {
      goElem(absolute ? value : elemIdx + value);
    };

    const plantTrack = root.querySelector<HTMLElement>('#plant-track');
    const plantSlides = plantTrack ? Array.from(plantTrack.querySelectorAll<HTMLElement>('.carousel-slide')) : [];
    const plantDots = Array.from(root.querySelectorAll<HTMLElement>('.plant-dot'));
    let plantIdx = 0;

    const goPlant = (index: number) => {
      if (!plantTrack || plantSlides.length === 0) return;

      plantIdx = (index + plantSlides.length) % plantSlides.length;
      plantTrack.classList.add('is-js-carousel');
      plantTrack.style.transform = '';
      plantSlides.forEach((slide, slideIndex) => {
        slide.classList.toggle('carousel-slide-active', slideIndex === plantIdx);
      });
      plantDots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === plantIdx);
      });
    };

    window.__hiddenArchitectsGoPlant = (value: number, absolute = false) => {
      goPlant(absolute ? value : plantIdx + value);
    };

    const handleCarouselClick = (event: MouseEvent) => {
      const target = getEventElement(event.target);
      const control = target?.closest<HTMLElement>('.carousel-btn, .elem-dot, .plant-dot');
      if (!control || !root.contains(control)) return;

      event.preventDefault();
      event.stopPropagation();

      if (control.classList.contains('elem-dot')) {
        const index = Number(control.dataset.idx);
        if (!Number.isNaN(index)) goElem(index);
        return;
      }

      if (control.classList.contains('plant-dot')) {
        const index = Number(control.dataset.idx);
        if (!Number.isNaN(index)) goPlant(index);
        return;
      }

      if (control.id === 'elem-prev') goElem(elemIdx - 1);
      if (control.id === 'elem-next') goElem(elemIdx + 1);
      if (control.id === 'plant-prev') goPlant(plantIdx - 1);
      if (control.id === 'plant-next') goPlant(plantIdx + 1);
    };
    root.addEventListener('click', handleCarouselClick, true);

    goElem(0);
    goPlant(0);
    updateUI(getHashIndex());

    return () => {
      toggle.removeEventListener('click', handleToggleClick);
      navHandlers.forEach(({ link, handler }) => link.removeEventListener('click', handler));
      root.removeEventListener('click', handleRootClick);
      root.removeEventListener('click', handleCarouselClick, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashChange);
      delete window.__hiddenArchitectsGoElemental;
      delete window.__hiddenArchitectsGoPlant;
    };
  }, []);

  return <div ref={appRef} dangerouslySetInnerHTML={{ __html: pageHtml }} />;
}
