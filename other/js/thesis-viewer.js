(function () {
    'use strict';

    var PDF_URL = './master-thesis.pdf';
    var BATCH_SIZE = 5;

    var pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    var pagesContainer = document.getElementById('pdfPages');
    var statusEl = document.getElementById('viewerStatus');
    var rangeEl = document.getElementById('pageRange');
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');

    var pdfDoc = null;
    var batchStart = 1;
    var renderToken = 0;
    var resizeTimer = null;
    var lastRenderedWidth = 0;

    function setStatus(message) {
        statusEl.textContent = message || '';
    }

    function renderBatch() {
        if (!pdfDoc) {
            return;
        }

        var token = ++renderToken;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        setStatus('Rendering pages…');
        pagesContainer.innerHTML = '';

        var batchEnd = Math.min(batchStart + BATCH_SIZE - 1, pdfDoc.numPages);
        var containerWidth = pagesContainer.clientWidth || pagesContainer.parentElement.clientWidth;
        lastRenderedWidth = containerWidth;

        var pageNum = batchStart;

        function renderNext() {
            if (token !== renderToken) {
                return;
            }
            if (pageNum > batchEnd) {
                rangeEl.textContent = 'Pages ' + batchStart + '–' + batchEnd + ' of ' + pdfDoc.numPages;
                prevBtn.disabled = batchStart <= 1;
                nextBtn.disabled = batchEnd >= pdfDoc.numPages;
                setStatus('');
                return;
            }

            var currentPage = pageNum;
            pageNum += 1;

            pdfDoc.getPage(currentPage).then(function (page) {
                if (token !== renderToken) {
                    return;
                }

                var unscaledViewport = page.getViewport({ scale: 1 });
                var scale = containerWidth / unscaledViewport.width;
                var viewport = page.getViewport({ scale: scale });
                var outputScale = window.devicePixelRatio || 1;

                var wrapper = document.createElement('div');
                wrapper.className = 'pdf-page-wrapper';

                var canvas = document.createElement('canvas');
                canvas.className = 'pdf-page-canvas';
                canvas.width = Math.floor(viewport.width * outputScale);
                canvas.height = Math.floor(viewport.height * outputScale);
                canvas.style.width = Math.floor(viewport.width) + 'px';
                canvas.style.height = Math.floor(viewport.height) + 'px';

                var label = document.createElement('div');
                label.className = 'pdf-page-label';
                label.textContent = 'Page ' + currentPage;

                wrapper.appendChild(canvas);
                wrapper.appendChild(label);
                pagesContainer.appendChild(wrapper);

                var ctx = canvas.getContext('2d');
                var transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

                return page.render({ canvasContext: ctx, viewport: viewport, transform: transform }).promise;
            }).then(function () {
                renderNext();
            }).catch(function (err) {
                console.error('Failed to render page ' + currentPage, err);
                renderNext();
            });
        }

        renderNext();
    }

    function scrollToTop() {
        document.querySelector('.viewer-toolbar').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    prevBtn.addEventListener('click', function () {
        batchStart = Math.max(1, batchStart - BATCH_SIZE);
        renderBatch();
        scrollToTop();
    });

    nextBtn.addEventListener('click', function () {
        if (!pdfDoc) {
            return;
        }
        batchStart = Math.min(pdfDoc.numPages, batchStart + BATCH_SIZE);
        renderBatch();
        scrollToTop();
    });

    window.addEventListener('resize', function () {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(function () {
            var currentWidth = pagesContainer.clientWidth || pagesContainer.parentElement.clientWidth;
            if (pdfDoc && Math.abs(currentWidth - lastRenderedWidth) > 8) {
                renderBatch();
            }
        }, 250);
    });

    setStatus('Loading document…');
    // disableAutoFetch: only fetch the byte ranges needed for the pages being
    // viewed (via HTTP Range requests) instead of streaming the whole file
    // in the background — keeps initial load fast for a large PDF.
    pdfjsLib.getDocument({ url: PDF_URL, disableAutoFetch: true }).promise.then(function (doc) {
        pdfDoc = doc;
        renderBatch();
    }).catch(function (err) {
        console.error('Failed to load PDF document', err);
        setStatus('Failed to load the PDF for preview. You can still use the download button above.');
    });
})();
