(function () {
    var statusEl = document.getElementById('readmeStatus');
    var contentEl = document.getElementById('readmeContent');

    fetch('./README.md')
        .then(function (res) {
            if (!res.ok) {
                throw new Error('HTTP ' + res.status);
            }
            return res.text();
        })
        .then(function (markdown) {
            contentEl.innerHTML = marked.parse(markdown);
            statusEl.textContent = '';
            renderMermaidBlocks();
        })
        .catch(function (err) {
            statusEl.textContent = 'Could not load README.md (' + err.message + '). View it on GitHub instead.';
        });

    function renderMermaidBlocks() {
        if (typeof mermaid === 'undefined') {
            return;
        }
        var blocks = contentEl.querySelectorAll('code.language-mermaid');
        if (!blocks.length) {
            return;
        }
        blocks.forEach(function (block) {
            var pre = block.parentElement;
            var div = document.createElement('div');
            div.className = 'mermaid';
            div.textContent = block.textContent;
            pre.replaceWith(div);
        });
        mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
        mermaid.run({ querySelector: '.mermaid' });
    }
})();
