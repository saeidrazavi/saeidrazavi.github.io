/* Inline BibTeX with a copy button, and hover-to-play figure animations.
   Without JS, the bibtex links simply download the .bib file. */
(function () {
  "use strict";

  /* BibTeX: show the entry inline, with a copy button ------------------- */

  var bibCount = 0;

  function buildBibPanel(text, id) {
    var panel = document.createElement("div");
    panel.className = "bib";
    panel.id = id;

    var copy = document.createElement("button");
    copy.type = "button";
    copy.className = "bib__copy";
    copy.textContent = "Copy";
    copy.addEventListener("click", function () {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(text).then(function () {
        copy.textContent = "Copied";
        setTimeout(function () {
          copy.textContent = "Copy";
        }, 1500);
      });
    });

    var pre = document.createElement("pre");
    pre.textContent = text;

    panel.appendChild(copy);
    panel.appendChild(pre);
    return panel;
  }

  document.querySelectorAll("a[data-bib]").forEach(function (link) {
    var panel = null;
    link.setAttribute("role", "button");
    link.setAttribute("aria-expanded", "false");

    link.addEventListener("click", function (event) {
      event.preventDefault();

      if (panel) {
        var opening = panel.hidden;
        panel.hidden = !opening;
        link.setAttribute("aria-expanded", String(opening));
        return;
      }

      fetch(link.getAttribute("href"))
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          return response.text();
        })
        .then(function (text) {
          bibCount += 1;
          panel = buildBibPanel(text.trim(), "bib-" + bibCount);
          link.closest(".pub__body").appendChild(panel);
          link.setAttribute("aria-controls", panel.id);
          link.setAttribute("aria-expanded", "true");
        })
        .catch(function () {
          // Fall back to the plain file.
          window.location.href = link.href;
        });
    });
  });

  /* Publication figures: play the method animation while the card is hovered */

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var canHover = window.matchMedia("(hover: hover)");

  document.querySelectorAll(".pub").forEach(function (pub) {
    var video = pub.querySelector("video.pub__alt");
    if (!video) return;
    pub.addEventListener("mouseenter", function () {
      if (reducedMotion.matches || !canHover.matches) return;
      video.currentTime = 0;
      var playing = video.play();
      if (playing && playing.catch) playing.catch(function () {});
    });
    pub.addEventListener("mouseleave", function () {
      video.pause();
    });
  });
})();
