// App entry point — initializes namespace and wires all pages
window.IELTS = window.IELTS || {};
window.IELTS.pages = window.IELTS.pages || {};

document.addEventListener('DOMContentLoaded', () => {
  // Register all pages
  IELTS.router.register('home',       IELTS.pages.home);
  IELTS.router.register('vocabulary', IELTS.pages.vocabulary);
  IELTS.router.register('speaking',   IELTS.pages.speaking);
  IELTS.router.register('writing',    IELTS.pages.writing);
  IELTS.router.register('checkin',    IELTS.pages.checkin);

  // Start the router
  IELTS.router.init();
});
