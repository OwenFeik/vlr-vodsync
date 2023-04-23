function addStreamLink(text, url) {
    const VOD_LIST_SELECTOR = ".match-vods .match-streams-container";

    let container = document.querySelector(VOD_LIST_SELECTOR);
    container.appendChild(createStreamLink(text, url));
}

function createStreamLink(text, url) {
    // This is hard coded on the vod list items on VLR.gg.
    const STYLE = `
        height: 37px;
        line-height: 37px;
        padding: 0 20px;
        margin: 0 3px;
        margin-bottom: 6px;
        flex: 1;
    `;

    let streamLink = document.createElement("a");
    streamLink.classList.add("wf-card", "mod-dark");
    streamLink.target = "_blank";
    streamLink.style = STYLE;

    streamLink.text = text;
    streamLink.href = url;

    return streamLink;
}

function main() {
    addStreamLink("Owen's Website", "https://owen.feik.xyz/");
}

main();
