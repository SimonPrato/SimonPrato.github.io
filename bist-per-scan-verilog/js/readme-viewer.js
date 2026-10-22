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
        })
        .catch(function (err) {
            statusEl.textContent = 'Could not load README.md (' + err.message + '). View it on GitHub instead.';
        });
})();
