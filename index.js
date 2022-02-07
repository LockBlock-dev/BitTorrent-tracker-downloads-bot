const axios = require("axios").default;
const fs = require("fs");
const parseTorrent = require("parse-torrent");
const bencode = require("bencode");
const config = require("./config.json")

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

const randomString = (chars, length) => {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const log = (count) => {
    const toParse = Object.entries(count);
    let text = "";

    for (let val in toParse) {
        text += `${toParse[val].join(" : ")}\n`;
    }
    //console.clear();
    console.log(text);
};

const req = async (url, proxy, count) => {
    var _proxy = proxy.split(":");

    var options = {
        method: "GET",
        url: url,
        responseType: "arraybuffer",
        proxy: {
            protocol: "http",
            host: _proxy[0],
            port: _proxy[1],
        },
        headers: {
            "Accept-Encoding": "gzip",
            Connection: "close",
        },
    };

    await axios(options)
        .then(async (response) => {
            if (response.status == 200) {
                let res;
                try {
                    res = bencode.decode(Buffer.from(response.data), "utf8");
                } catch {}
                Object.assign(count, res);
            }
        })
        .catch((error) => {
            console.log(error.response?.data || error.response || error.code || error);
            count.error += 1;
        });
    log(count);
};

const getRandomPort = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomPeerId = () => {
    const caps = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const full = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return `-${randomString(caps, 2)}${randomString(numbers, 4)}-${randomString(full, 12)}`;
};

const stringifyInfoHash = (hash) => {
    hash = hash.replace(/.{2}/g, (group) => {
        let v = parseInt(group, 16);
        if (v <= 127) {
            group = encodeURIComponent(String.fromCharCode(v));
            if (group[0] === "%") group = group.toLowerCase();
        } else group = `%${group}`;
        return group;
    });
    return hash;
};

const main = async () => {
    let count = { proxies_left: 0, error: 0 };

    let proxies = fs.readFileSync(`${__dirname}/proxies.txt`, "utf-8")
    proxies = proxies.split("\r\n");

    count.proxies_left = proxies.length;

    const torrent = parseTorrent(fs.readFileSync(`${__dirname}/${config.torrentFileName}`));

    const params = new URLSearchParams({
        info_hash: stringifyInfoHash(torrent.infoHash),
        peer_id: getRandomPeerId(),
        port: getRandomPort(6000, 65535),
        uploaded: 0,
        downloaded: 0,
        left: torrent.length,
        event: "started",
        numwant: 200,
        compact: 1,
    });

    let url_start = `${config.trackerURL}?${decodeURIComponent(params)}`;

    params.set("event", "completed");
    params.set("downloaded", torrent.length);
    params.set("left", 0);

    let url_end = `${config.trackerURL}?${decodeURIComponent(params)}`;

    for (let proxy in proxies) {
        req(url_start, proxies[proxy], count);

        await sleep(1000);

        req(url_end, proxies[proxy], count);

        count.proxies_left -= 1;

        sleep(500);
    }
};

main();
