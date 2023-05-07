/**
 * @param {String} string String to capitalise. 
 * @returns {String} string with first letter capitalised. 
 */
function capitalise(string) {
    return string.substring(0, 1).toUpperCase() + string.substring(1);
}

/**
 * Convert an ID from camel case to a string with each word capitalised and add
 * a span with this text and the title class to the parent element provided.
 * 
 * @param {String} id ID to convert to a title. 
 * @param {HTMLElement} parent Element to add child to.
 * @returns {HTMLElement} New title element.
 */
function addTitle(id, parent) {
    let words = [];
    let word = "";
    for (const char of id) {
        if (char == char.toUpperCase() && word) {
            words.push(capitalise(word));
            word = "";
        }
        word += char;
    }

    if (word) {
        words.push(capitalise(word));
    }

    let title = add(el("span", "title"), parent);
    title.innerText = words.join(" ");
    
    return title;
}

/**
 * Add a description on a parent element. Does nothing if text is empty.
 * 
 * @param {String} text Text to add to the description. 
 * @param {HTMLElement} parent Parent to add description to. 
 * @returns {HTMLElement} Newly created element.
 */
function addDescription(text, parent) {
    if (!text) return null;

    let desc = add(el("p"), parent);
    desc.innerText = text;
    return desc;
}

/**
 * @param {String} id ID of the element ( == config key). 
 */
function listInput(id, description) {
    let root = add(el("div", "config-entry"));
    root.id = id;

    let header = add(el("div", "row"), root);
    addTitle(id, header);

    let button = add(el("button"), header);
    button.innerText = "Add";

    let list = add(el("ul"), root);

    addDescription(description, root);

    const add_item = text => {
        let item = add(el("li"), list);
        let input = add(el("input"), item);
        input.value = text;
        input.addEventListener("input", serialise);
        let remove = add(el("button", "bright"), item);
        remove.innerText = "Remove"
        remove.onclick = () => { item.remove(); serialise(); };
    };

    button.onclick = () => add_item("");

    root.serialise = () => {
        let entries = [];
        list.querySelectorAll("input").forEach(
            inp => {
                if (inp.value) {
                    entries.push(inp.value);
                }
            }
        );
        return entries;
    };

    root.deserialise = entries => {
        if (entries && entries.length) {
            entries.forEach(entry => add_item(entry));
        }
    };
}

/**
 * @param {String} id ID and config entry key of the boolean. 
 * @param {String} description Description of the entry.
 */
function checkboxInput(id, description) {
    let root = add(el("div", "config-entry"));
    root.id = id;

    let body = add(el("div", "row"), root);
    addTitle(id, body);

    let input = add(el("input"), body);
    input.type = "checkbox";

    addDescription(description, root);

    root.serialise = () => input.checked;

    root.deserialise = value => { input.checked = value; };
}

/**
 * @param {String} id ID and config entry key of the number. 
 * @param {String} description Description of the entry.
 */
function numberInput(id, description) {
    let root = add(el("div", "config-entry"));
    root.id = id;

    let header = add(el("div", "row"), root);
    let title = addTitle(id, header);
    title.style.paddingRight = "1em";

    let input = add(el("input"), header);
    input.type = "number";

    addDescription(description, root);

    root.serialise = () => input.valueAsNumber;

    root.deserialise = value => { input.value = String(value); };
}

/**
 * Build configuration UI.
 */
function buildUi() {
    listInput(
        "streamers",
        "Names of Twitch streamers to check for co-streams."
    );
    listInput(
        "keywords",
        (
            "Streams where the title contains at least one of these"
            + " keywords will be shown. Streams with titles which contain a"
            + " word from a team name or a team letter code will also be"
            + " shown."
        )
    );
    numberInput(
        "streamsPerRow",
        "Number of streams to show in each row of the VOD list."
    );
}

/**
 * @returns JSON object containing all configuration information.
 */
function serialise() {
    let config = {};
    document.querySelectorAll(".config-entry").forEach(
        setting => config[setting.id] = setting.serialise()
    );

    getBrowser().storage.sync.set({ config }).then(
        () => console.log("Saved", config)
    );
}

/**
 * Load configuration information and submit it to UI elements.
 */
function deserialise() {
    loadConfig(config => {
        for (const [k, v] of Object.entries(config)) {
            try {
                document.getElementById(k).deserialise(v);
            } catch {}
        }
        console.log("Loaded", config);
    });
}

function main() {
    buildUi();
    deserialise();

    document.querySelectorAll("input").forEach(el => {
        el.addEventListener("input", serialise);
    });
}

main();
