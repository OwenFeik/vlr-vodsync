// source: https://github.com/thomasasfk/clipsync/blob/main/config.py
const TWITCH_GQL_CONFIG = {
    url: "https://gql.twitch.tv/gql",
    client_id: "kimne78kx3ncx6brgo4mv6wki5h1ko",
};

/**
 * Perform a GQL query using the Twitch GQL API.
 * 
 * @param {String} gql GQL query. 
 * @param {Object} vars Variable map. 
 * @param {JSON => void} callback Handler for returned JSON.
 */
function twitchGqlQuery(gql, vars, callback) {
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
 * Query Latest 100 vods 
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
 * Finds a list of vods and calls callback with an array of { streamer, vodId }
 * objects.
 *  
 * @param {Object[] => void} callback Handler for vod list. 
 */
function findCoStreams(callback) {
    let streamers = ["sliggytv", "sideshow"];

    let matchTime = getMatchTime();
    getLatestStreamerVods(streamers, data => {
        let vods = [];

        console.log(data);
        data["users"].forEach(entry => {
            let vodId = null;
            entry["videos"]["edges"].forEach(edge => {
                let node = edge["node"];
                let streamTime = new Date(node["createdAt"]).getTime();
                let length = node["lengthSeconds"] * 1000; // s to ms
                let startsBefore = streamTime <= matchTime;
                let endsAfter = streamTime + length >= matchTime; 
                if (startsBefore && endsAfter) {
                    vodId = node["id"];
                }
            });
    
            if (vodId != null) {
                vods.push({ streamer: entry["login"], vodId });
            }
        });
    
        callback(vods);
    });
}

/**
 * Create a link for each co stream found.
 */
function addCoStreamLinks() {
    const URL_PREFIX = "https://www.twitch.tv/videos/";

    findCoStreams(vods => vods.forEach(
        vod => addStreamLink(vod.streamer, URL_PREFIX + vod.vodId)
    ));
}

function main() {
    addCoStreamLinks();
}

main();
