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
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    workItems.forEach((item) => {
      item.hidden = filter !== "all" && item.dataset.category !== filter;
    });
  });
});

const lightbox = document.querySelector("[data-lightbox]");
const lightboxTitle = document.querySelector("[data-lightbox-title]");
const lightboxMeta = document.querySelector("[data-lightbox-meta]");
const lightboxText = document.querySelector("[data-lightbox-text]");
const lightboxClose = document.querySelector("[data-lightbox-close]");

workItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (!lightbox) return;
    lightboxTitle.textContent = item.dataset.title || "Réalisation";
    lightboxMeta.textContent = item.dataset.city || "";
    lightboxText.textContent = item.dataset.description || "";
    lightbox.classList.add("open");
    lightboxClose?.focus();
  });
});

const closeLightbox = () => lightbox?.classList.remove("open");
lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});

const quoteForm = document.querySelector("[data-quote-form]");
const formStatus = document.querySelector("[data-form-status]");
quoteForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (formStatus) {
    formStatus.textContent = "Merci, votre demande est prête. Remplacez ce formulaire par votre outil d’envoi ou votre CRM pour recevoir les messages.";
  }
  quoteForm.reset();
});
