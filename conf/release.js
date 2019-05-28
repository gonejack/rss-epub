const app = {
    name: "rss-epub",
    varDir: "./var/",
    parserOption: {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
        },
    },
    log: {
        app_log: "./log/app_",
        err_log: "./log/err_",
    }
};

const books = {
    "博客": {
        epub: './epub/博客_{date}_{time}.epub',
        cover: './conf/cover/博客.jpg',
        feeds: {
            // "月光博客": "https://www.williamlong.info/rss.xml",
            "阮一峰的网络杂志": "http://www.ruanyifeng.com/blog/atom.xml",
        }
    },
    // "软件": {
    //     epub: './epub/软件-{date}-{time}.epub',
    //     cover: './conf/cover/软件.jpg',
    //     feeds: {
    //         "小众软件": "https://feeds.appinn.com/appinns/",
    //         "少数派": "https://sspai.com/feed",
    //     }
    // },
    // "网络": {
    //     epub: './epub/网络-{date}-{time}.epub',
    //     cover: './conf/cover/网络.jpg',
    //     feeds: {
    //         "机核": "https://www.gcores.com/rss",
    //         "奇点": "https://www.solidot.org/index.rss"
    //     }
    // }
};

module.exports = {
    app,
    books,
};