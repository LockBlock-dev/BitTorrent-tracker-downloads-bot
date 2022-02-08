# BitTorrent-tracker-downloads-bot

[![axios](https://img.shields.io/github/package-json/dependency-version/LockBlock-dev/BitTorrent-tracker-downloads-bot/axios)](https://www.npmjs.com/package/axios)

[![GitHub stars](https://img.shields.io/github/stars/LockBlock-dev/BitTorrent-tracker-downloads-bot.svg)](https://github.com/LockBlock-dev/BitTorrent-tracker-downloads-bot/stargazers)

A BitTorrent tracker downloads bot

Tested on a HTTP tracker only.

## How to use

-   Install [NodeJS](https://nodejs.org).

-   Download or clone the project.

-   Run `npm install`.

-   Edit the [config](./config.json) :

```json
{
    "trackerURL": "http://tracker-exemple.com:1234/announce",
    "torrentFileName": "torrent_file_example.torrent"
}
```

-   Add your proxies inside [proxies.txt](./proxies.txt)

-   Run `node index.js` or `npm start`

## Copyright

See the [license](/LICENSE).
