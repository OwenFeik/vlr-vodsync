/**
 * Perform a GQL query using the Twitch GQL API.
 * 
 * @param {String} gql GQL query. 
 * @param {Object} vars Variable map. 
 * @param {JSON => void} callback Handler for returned JSON.
 */
function twitchGqlQuery(gql, vars, callback) {
    // source: https://github.com/thomasasfk/clipsync/blob/main/config.py
    const TWITCH_GQL_CONFIG = {
        url: "https://gql.twitch.tv/gql",
        client_id: "kimne78kx3ncx6brgo4mv6wki5h1ko",
    };
    
    fetch(TWITCH_GQL_CONFIG.url, {
        headers: { "Client-Id": TWITCH_GQL_CONFIG.client_id },
        method: "POST",
        body: JSON.stringify({
            "query": gql,
            "variables": vars,
        }),
    }).then(resp => resp.json().then(callback))
}

/**
 * Query Latest 100 vods. Based on:
 * https://github.com/thomasasfk/clipsync/blob/main/_twitch/queries.py#L81
 * 
 * @param {String[]} streamers Streamer login names.
 * @param {Object[] => void} callback Handler for returned JSON data. 
 */
function getLatestStreamerVods(streamers, callback) {
    const QUERY = `
    query($logins: [String!]) {
        users(logins: $logins) {
            login
            videos(first: 100) {
                edges {
                    node {
                        id
                        createdAt
                        title
                        lengthSeconds
                    }
                    cursor
                }
            }
        }
    }
    `;

    twitchGqlQuery(
        QUERY,
        { logins: streamers },
        resp => { callback(resp["data"]); }
    );
}

/**
 * @param {String} text Text to put on the link. 
 * @param {String} url URL to link to. 
 * @returns {HTMLElement} VLR styled vod link to the given URL.
 */
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

    let streamLink = el("a", "wf-card", "mod-dark");
    streamLink.target = "_blank";
    streamLink.style = STYLE;

    streamLink.text = text;
    streamLink.href = url;

    return streamLink;
}

/**
 * VLR uses an invisible element as a line break in the vod list. This creates
 * such an element.
 * @returns Divider element for the vod list.
 */
function createStreamDivider() {
    // This is hard coded on the dividers on VLR.gg.
    const STYLE = "flex-basis: 100%; height: 0;";

    let divider = el("div");
    divider.style = STYLE;
    return divider;
}

/**
 * Add an element to the match vod list.
 * @param {HTMLElement} element Element to add to vod list. 
 */
function addToVodList(element) {
    const VOD_LIST_SELECTOR = ".match-vods .match-streams-container";

    let container = document.querySelector(VOD_LIST_SELECTOR);
    add(element, container);
}

/**
 * Add a link for each vod in vods, including line breaks every two vods.
 * @param {Object[]} vods Vods to create links to.
 */
function addStreamLinks(vods) {
    let i = 0;
    for (const vod of vods) {
        if (!(i++ % 2)) {
            addToVodList(createStreamDivider());
        }
        addToVodList(createStreamLink(vod.streamer, vod.url));
    }
}

/**
 * Sourced from the time in top left of the match info box.
 * @returns {number} Start time of the match, UTC millis.
 */
function getMatchTime() {
    const SELECTOR = ".match-header-date .moment-tz-convert";
    const ATTRIBUTE = "data-utc-ts";
    const VLR_TZ = "EDT"; // VLR dates are in EDT not UTC

    let string = document.querySelector(SELECTOR).getAttribute(ATTRIBUTE);
    let date = new Date(string);
    let [_w, month, day, year, time] = date.toString().split(" ");
    let format = [day.padStart(2, "0"), month, year, time, VLR_TZ].join(" ");
    return new Date(format).getTime();
}

/**
 * @param {number} matchTime Scheduled start time of the match (epoch ms).
 * @param {number} streamTime Start time of the stream (epoch ms).
 * @param {number} streamLength Duration of the stream (ms).
 * @returns Whether a given stream includes a given match time.
 */
function vodIncludesMatch(matchTime, streamTime, streamLength) {
    return (
        streamTime <= matchTime
        && streamTime + streamLength >= matchTime
    );
}

/**
 * Build a vod URL from match time, vided id and stream time, with an
 * appropriate timestamp.
 * 
 * @param {number} matchTime Scheduled start time of the match (epoch ms).
 * @param {String} videoId ID of the twitch video.
 * @param {number} streamTime Start time of the twitch video.
 * @returns {String} Link to the start of the match.
 */
function getVodUrl(matchTime, videoId, streamTime) {
    const URL_PREFIX = "https://www.twitch.tv/videos/";
    return (
        URL_PREFIX
        + videoId
        + "?t="
        + Math.round((matchTime - streamTime) / 1000) // ms to s
        + "s"
    );
}

/**
 * @param {number} matchTime Scheduled match start timestamp (epoch ms)
 * @param {RegExp} regex Regex to match title against.
 * @param {Object[]} edges GQL edges to search for a co stream. 
 * @returns {String|null} A vod url if one was found, else null.
 */
function findCoStream(matchTime, regex, edges) {
    for (const edge of edges || []) {
        let video = edge["node"];

        if (!regex.test(video["title"])) {
            continue;
        }

        let streamTime = new Date(video["createdAt"]).getTime();
        let streamLength = video["lengthSeconds"] * 1000; // s to ms
        if (vodIncludesMatch(matchTime, streamTime, streamLength)) {
            return getVodUrl(matchTime, video["id"], streamTime);
        }
    }
    return null;
}

/**
 * Finds a list of vods and calls callback with an array of { streamer, url }
 * objects.
 *  
 * @param {String[]} streamers List of streamer logins to check.
 * @param {RegExp} regex Regex to match title against.
 * @param {Object[] => void} callback Handler for vod list. 
 */
function findCoStreams(streamers, regex, callback) {
    let matchTime = getMatchTime();
    getLatestStreamerVods(streamers, data => {
        let vods = [];

        data["users"].forEach(entry => {
            let videos = entry["videos"]["edges"];
            let url = findCoStream(matchTime, regex, videos);
            if (url) {
                vods.push({ streamer: entry["login"], url });
            }
        });
    
        callback(vods);
    });
}

/**
 * @param {String[]} keywords Keywords to compile into a regex.
 * @returns Regex matching at least one keyword in string.
 */
function compileKeywords(keywords) {
    return new RegExp((keywords || []).join("|"), "i");
}

/**
 * Create a link for each co stream found.
 */
function addCoStreamLinks() {
    loadConfig(config => {
        if (config?.streamers.length) {
            findCoStreams(
                config.streamers,
                compileKeywords(config.keywords),
                addStreamLinks
            );
        }
    });
}

/**
 * @returns {boolean} Whether the current page is a match page.
 */
function isMatchPage() {
    const REGEX = /(https:\/\/)?(www.)?vlr.gg\/\d+\/.*/;
    return REGEX.test(window.location.href);
}

function main() {
    if (isMatchPage()) {
        addCoStreamLinks();
    }
}

main();
