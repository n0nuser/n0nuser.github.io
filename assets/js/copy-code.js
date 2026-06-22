'use strict';

document.addEventListener('DOMContentLoaded', function () {
  var COPY_LABEL = '{{ T "copy_code" }}';
  var DONE_LABEL = '{{ T "copy_code_done" }}';

  document.querySelectorAll('.highlight, article > pre').forEach(function (container) {
    var pre = container.matches('.highlight') ? container.querySelector('pre') : container;
    if (!pre) return;

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy-btn outline-dashed';
    button.setAttribute('aria-label', COPY_LABEL);
    button.textContent = COPY_LABEL;

    var resetTimer;

    button.addEventListener('click', function () {
      var code = pre.querySelector('code') || pre;

      navigator.clipboard.writeText(code.innerText).then(function () {
        button.textContent = DONE_LABEL;
        button.classList.add('is-copied');

        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(function () {
          button.textContent = COPY_LABEL;
          button.classList.remove('is-copied');
        }, 2000);
      });
    });

    container.style.position = 'relative';
    container.appendChild(button);
  });
});
