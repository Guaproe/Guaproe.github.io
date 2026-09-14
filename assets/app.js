const menuToggle = document.querySelector("[data-menu-toggle]");
if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(document.body.classList.contains("nav-open")));
  });
}

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const filterButtons = document.querySelectorAll("[data-filter]");
const workItems = document.querySelectorAll("[data-category]");
const carousels = document.querySelectorAll("[data-carousel]");
let activeFilter = "all";

const getVisibleSlides = (carousel) => Array.from(carousel.querySelectorAll("[data-category]")).filter((item) => !item.hidden);

const goToSlide = (carousel, direction = 1) => {
  const slides = getVisibleSlides(carousel);
  if (!slides.length) return;

  const maxScroll = carousel.scrollWidth - carousel.clientWidth;
  if (maxScroll <= 4) return;

  const styles = window.getComputedStyle(carousel);
  const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
  const step = slides[0].getBoundingClientRect().width + gap;
  const target = direction > 0
    ? (carousel.scrollLeft >= maxScroll - 8 ? 0 : Math.min(carousel.scrollLeft + step, maxScroll))
    : (carousel.scrollLeft <= 8 ? maxScroll : Math.max(carousel.scrollLeft - step, 0));

  carousel.scrollTo({ left: target, behavior: "smooth" });
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    activeFilter = filter;
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    workItems.forEach((item) => {
      item.hidden = filter !== "all" && item.dataset.category !== filter;
    });
    carousels.forEach((carousel) => {
      carousel.scrollTo({ left: 0, behavior: "smooth" });
    });
  });
});

const carouselMotionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
carousels.forEach((carousel) => {
  let paused = false;
  const controls = carousel.previousElementSibling;
  const previousButton = controls?.querySelector("[data-carousel-prev]");
  const nextButton = controls?.querySelector("[data-carousel-next]");

  const move = (direction) => {
    paused = true;
    goToSlide(carousel, direction);
    window.setTimeout(() => { paused = false; }, 4500);
  };

  previousButton?.addEventListener("click", () => move(-1));
  nextButton?.addEventListener("click", () => move(1));
  carousel.addEventListener("mouseenter", () => { paused = true; });
  carousel.addEventListener("mouseleave", () => { paused = false; });
  carousel.addEventListener("focusin", () => { paused = true; });
  carousel.addEventListener("focusout", () => { paused = false; });

  if (carouselMotionAllowed) {
    const timer = window.setInterval(() => {
      if (!paused && activeFilter === "all") goToSlide(carousel, 1);
    }, 2800);
    window.addEventListener("pagehide", () => window.clearInterval(timer), { once: true });
  }
});

document.querySelectorAll("[data-review-carousel]").forEach((carousel) => {
  const track = carousel.querySelector("[data-review-track]");
  const slides = Array.from(carousel.querySelectorAll("[data-review-slide]"));
  const controls = carousel.querySelector("[data-review-controls]");
  const previousButton = carousel.querySelector("[data-review-prev]");
  const nextButton = carousel.querySelector("[data-review-next]");
  const count = carousel.querySelector("[data-review-count]");
  let activeIndex = 0;

  if (!track || slides.length <= 1) {
    if (controls) controls.hidden = true;
    return;
  }

  const updateCount = () => {
    if (count) count.textContent = `${activeIndex + 1} / ${slides.length}`;
  };

  const showReview = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    const target = slides[activeIndex].offsetLeft - track.offsetLeft;
    track.scrollTo({ left: target, behavior: "smooth" });
    updateCount();
  };

  previousButton?.addEventListener("click", () => showReview(activeIndex - 1));
  nextButton?.addEventListener("click", () => showReview(activeIndex + 1));
  track.addEventListener("scroll", () => {
    const trackLeft = track.getBoundingClientRect().left;
    const closest = slides.reduce((best, slide, index) => {
      const distance = Math.abs(slide.getBoundingClientRect().left - trackLeft);
      return distance < best.distance ? { index, distance } : best;
    }, { index: activeIndex, distance: Infinity });
    activeIndex = closest.index;
    updateCount();
  }, { passive: true });

  if (carouselMotionAllowed) {
    const timer = window.setInterval(() => {
      showReview(activeIndex + 1);
    }, 3500);
    window.addEventListener("pagehide", () => window.clearInterval(timer), { once: true });
  }

  updateCount();
});

const lightbox = document.querySelector("[data-lightbox]");
const lightboxTitle = document.querySelector("[data-lightbox-title]");
const lightboxMeta = document.querySelector("[data-lightbox-meta]");
const lightboxText = document.querySelector("[data-lightbox-text]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const lightboxPrevious = document.querySelector("[data-lightbox-prev]");
const lightboxNext = document.querySelector("[data-lightbox-next]");
let activeLightboxItem = null;

const setLightboxContent = (item) => {
  if (!item || !lightbox) return;
  activeLightboxItem = item;
  lightboxTitle.textContent = item.dataset.title || "Réalisation";
  lightboxMeta.textContent = item.dataset.city || "";
  lightboxText.textContent = item.dataset.description || "";
  if (lightboxImage && item.dataset.image) {
    lightboxImage.src = item.dataset.image;
    lightboxImage.alt = item.dataset.title || "Photo de réalisation";
  }
};

const navigateLightbox = (direction) => {
  if (!activeLightboxItem) return;
  const carousel = activeLightboxItem.closest("[data-carousel]");
  const items = carousel ? getVisibleSlides(carousel) : Array.from(workItems).filter((item) => !item.hidden);
  if (!items.length) return;
  const currentIndex = Math.max(0, items.indexOf(activeLightboxItem));
  const nextIndex = (currentIndex + direction + items.length) % items.length;
  setLightboxContent(items[nextIndex]);
};

workItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (!lightbox) return;
    setLightboxContent(item);
    lightbox.classList.add("open");
    lightboxClose?.focus();
  });
});

const closeLightbox = () => {
  lightbox?.classList.remove("open");
  activeLightboxItem = null;
};
lightboxClose?.addEventListener("click", closeLightbox);
lightboxPrevious?.addEventListener("click", () => navigateLightbox(-1));
lightboxNext?.addEventListener("click", () => navigateLightbox(1));
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
  if (!lightbox?.classList.contains("open")) return;
  if (event.key === "ArrowLeft") navigateLightbox(-1);
  if (event.key === "ArrowRight") navigateLightbox(1);
});
