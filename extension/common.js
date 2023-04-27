/**
 * @returns Browser accessor for current web browser.
 */
function getBrowser() {
    if (typeof browser === "undefined") {
        return chrome;
    }
    return browser;
}

/**
 * Create an element.
 * 
 * @param {String} tagName Tag name of element to create.
 * @param  {...String} classes Classes to add to element. 
 * @returns 
 */
function el(tagName, ...classes) {
    let el = document.createElement(tagName);
    for (const cls of classes) {
        el.classList.add(cls);
    }
    return el;
}

/**
 * Add an element to the document.
 * @param {HTMLElement} el Element to add. 
 * @param {HTMLElement} parent Element to add to. Fallback to body.
 */
function add(el, parent) {
    parent = parent || document.body;
    parent.appendChild(el);
    return el;
}
