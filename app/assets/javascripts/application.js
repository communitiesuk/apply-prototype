//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

function revealHiddenText() {
    let hiddenElements = document.querySelectorAll('.govuk-visually-hidden');
    for (const hiddenElement of hiddenElements) {
        hiddenElement.classList.remove('govuk-visually-hidden');
        hiddenElement.classList.add('prototype-visually-revealed');
    }
}

function hideRevealedText() {
    let revealedElements = document.querySelectorAll('.prototype-visually-revealed');
    for (const revealedElement of revealedElements) {
        revealedElement.classList.remove('prototype-visually-revealed');
        revealedElement.classList.add('govuk-visually-hidden');
    }
}

window.GOVUKPrototypeKit.documentReady(() => {
  // Add JavaScript here
    "use strict";

    for (const el of document.querySelectorAll('[data-module="prototype-reveal-hidden"]')) {
        el.addEventListener('click', (e) => {
            e.preventDefault();

            let revealed = localStorage.getItem('prototype-reveal-hidden');
            if (revealed === 'false' || revealed === undefined) {
                revealHiddenText();
                localStorage.setItem('prototype-reveal-hidden', 'true');
            } else {
                hideRevealedText();
                localStorage.setItem('prototype-reveal-hidden', 'false');
            }
        });
    };

    // Reveal hidden text on page load if we're in revealed-mode. Allows this to last across page loads/sessions.
    if (localStorage.getItem('prototype-reveal-hidden') === 'true') {
        revealHiddenText();
    };
})
