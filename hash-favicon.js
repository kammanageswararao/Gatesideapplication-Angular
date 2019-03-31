const md5 = require('md5-file');
const fs = require('fs');

function updateIndexHtmlFavicon(path, html, faviconTagIndicator, newFaviconLinkTag) {

    const faviconLinkBeginIndex = html.indexOf(faviconTagIndicator);

    if (faviconLinkBeginIndex <= 0) {
        throw new Error('Could not find favicon tag: ' + faviconTagIndicator);
    }

    const faviconLinkEndIndex = html.indexOf('>', faviconLinkBeginIndex);
    const faviconLinkLen = faviconLinkEndIndex - faviconLinkBeginIndex + 1;
    const faviconLinkTag = html.substr(faviconLinkBeginIndex, faviconLinkLen);

    const newContent = html.replace(faviconLinkTag, newFaviconLinkTag);

    return newContent;
}

md5('./src/favicon.ico', (err, faviconHash) => {
    if (err) throw err;

    console.log("Favicon hash: " + faviconHash);

    const htmlFilePath = './src/index.html';
    const htmlFileEncoding = 'UTF-8';

    fs.readFile(htmlFilePath, htmlFileEncoding, (err, content) => {
        if (err) throw err;

        let html = updateIndexHtmlFavicon(htmlFilePath, content, '<link rel="shortcut icon"', `<link rel="icon" type="image/x-icon" href="favicon.ico?${faviconHash}" />`);

        html = updateIndexHtmlFavicon(htmlFilePath, html, '<link rel="icon"', `<link rel="shortcut icon" href="favicon.ico?${faviconHash}" />`);

        fs.writeFile(htmlFilePath, html, htmlFileEncoding, err => {
            if (err) throw err;

            console.log('Successfully generated favicon hash');
        });
    });
});
