/**
 * @param {String} id ID of the element ( == config key). 
 * @returns A new list input.
 */
function listInput(id, description) {
    let root = add(el("div", "config-entry"));
    root.id = id;

    let header = add(el("div", "row"), root);

    let title = add(el("span", "title"), header);
    title.innerText = id;

    let button = add(el("button"), root);
    button.innerText = "Add";

    let list = add(el("ul"), root);

    if (description) {
        let desc = add(el("p"), root);
        desc.innerText = description;
    }

    const add_item = text => {
        let item = add(el("li"), list);
        let input = add(el("input"), item);
        input.value = text;
        let remove = add(el("button", "bright"), item);
        remove.innerText = "Remove"
        remove.onclick = () => item.remove();
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
 * @returns Button to save all fields on click.
 */
function submitButton() {
    let root = add(el("div", "row"));

    let button = add(el("button"), root);
    let message = add(el("span"), root);

    button.innerText = "Save";
    button.addEventListener("click",  () => {
        getBrowser().storage.sync.set({ config: serialise() }).then(
            () => {
                setTimeout(() => message.innerText = "", 1500);
                message.innerText = "Saved!";
            }
        );
    });
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
            "Only streams where the title contains at least one of these"
            + " keywords will be shown."
        )
    );
    submitButton();
}

/**
 * @returns JSON object containing all configuration information.
 */
function serialise() {
    let config = {};
    document.querySelectorAll(".config-entry").forEach(
        setting => config[setting.id] = setting.serialise()
    );
    return config;
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
    });
}

function main() {
    buildUi();
    deserialise();
}

main();
