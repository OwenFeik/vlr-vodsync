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
 * Ensure that config and all needed keys are defined, setting to default
 * values if missing.
 * 
 * @param {Object} config Configuration loaded from browser storage.
 * @returns Validated config.
 */
function validateConfig(config) {
    config = config || {};
    config.streamers = config.streamers || [];
    config.keywords = config.keywords || [];
    return config;
}

/**
 * Load the configuration details from browser storage.
 * @param {Object => void} callback Handler for the loaded config. 
 */
function loadConfig(callback) {
    const STORAGE_KEY = "config";

    getBrowser().storage.sync.get(STORAGE_KEY).then(
        resp => callback(validateConfig(resp.config))
    ); 
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
