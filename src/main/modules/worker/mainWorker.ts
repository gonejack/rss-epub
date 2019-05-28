import {Interface} from "./interface";
import {Ilogger, newLogger} from "libs/logger";
import {sleep, time} from "libs/time";
import * as Parser from 'rss-parser'
import * as DateFormat from 'dateformat'
import Conf from "app/conf";
import {macroReplace} from "libs/funs";
import {parse} from 'url';
import * as fs from 'fs';
import {dirname, resolve} from 'path';

class MainWorker implements Interface {
    private keep: boolean;
    private running: boolean;
    private readonly logger: Ilogger = newLogger("MainWorker");
    private readonly books: {
        [key: string]: {
            epub: string,
            cover: string,
            feeds: {
                [key: string]: string
            }
        }
    };

    constructor() {
        this.running = false;
        this.keep = false;
        this.books = Conf.get("books");
    }

    async start(): Promise<boolean> {
        this.keep = true;

        this.loop().then(() => this.running = false);

        return true;
    }
    async stop(): Promise<boolean> {
        this.keep = false;

        while (this.running) {
            await sleep(time.second);

            if (this.running) {
                this.logger.info("关闭中...")
            }
        }

        return true;
    }

    private async loop(): Promise<void> {
        this.running = true;

        await sleep(time.second * 3);
        while (this.keep) {
            await this.genBooks();

            let sec = 24 * 60 * 60;
            while (sec-- > 0 && this.keep) {
                await sleep(time.second);
            }
        }

        this.running = false;
    }
    private async genBooks(): Promise<any> {
        const feedTimes = this.readFeedTimes();
        const parser = new Parser(Conf.get('app.parserOption'));

        for (const bookName in this.books) {
            this.logger.info("开始生成书籍[%s]", bookName);

            const bookConf = this.books[bookName];
            const now = new Date();
            const info: {[key:string]: string} = {
                bookName: bookName,
                date: DateFormat(now, "yyyy-mm-dd"),
                time: DateFormat(now, "HH-MM-ss"),
                ts: String(now.getTime()),
            };
            const book = {
                title: bookName,
                author: 'rss-epub',
                publisher: 'rss-epub',
                lang: 'zh-CN',
                cover: macroReplace(bookConf.cover, info),
                tocTitle: "Table Of Contents",
                content: new Array<{
                    title: string,
                    author: string,
                    data: string,
                }>(),
            };

            const feeds = bookConf.feeds;
            for (const feedName in feeds) {
                const feedURL = feeds[feedName];
                try {
                    this.logger.info("拉取[%s]", feedName);

                    const feed = await parser.parseURL(feedURL);
                    const lastTime = new Date(feedTimes[feedName] || 0);
                    const feedTime = new Date(feed.pubDate || feed.lastBuildDate);

                    if (feedTime.getTime() > lastTime.getTime()) {
                        feedTimes[feedName] = feedTime.toISOString();

                        if (feed.items != null) {
                            for (const item of feed.items) {
                                this.fixItem(feed, item);

                                const pubDate = new Date(String(item.pubDate));
                                const chapter = {
                                    title: String(item.title),
                                    author: String(item.author || item.creator),
                                    data: `${item.content}
                                    <br/>
                                    <div>
                                        <p>From: ${feed.title}</p>
                                        <p>Time: ${DateFormat(pubDate, "yyyy-mm-dd HH:MM:ss")}</p>
                                        <p>Link: <a href="${item.link}">${item.link}</a> </p>
                                    </div>`
                                };

                                book.content.push(chapter);
                            }
                        }
                    }
                    else {
                        this.logger.info("[%s]未更新", feedName);
                    }
                }
                catch (e) {
                    this.logger.error("拉取失败[%s(%s)]: %s", feedName, feedURL, e);
                }
            }

            if (book.content.length > 0) {
                const Epub = require('epub-gen');
                const epub = resolve(macroReplace(bookConf.epub, info));

                try {
                    await (new Epub(book, epub).promise);

                    this.saveFeedTimes(feedTimes);

                    this.logger.info("已完成[%s=>%s]", bookName, epub);
                }
                catch (e) {
                    this.logger.error("生成[%s]出错: %s", epub, e);
                }
            }
        }
    }
    private fixItem(feed: {}, item: {[key:string]:string}) {
        if (item["content:encoded"]) {
            item.content = item["content:encoded"];
        }

        let linkInfo = parse(item.link);
        let website = `${linkInfo.protocol}//${linkInfo.host}`;
        item.content = item.content.replace(/src="(\/[^"]+?)"/g, (str, p1) => `src="${website}${p1}"`);
    }
    private readFeedTimes(): {[key: string]: any} {
        const file = resolve(`${Conf.get('app.varDir')}/feedDates.json`);

        try {
            this.logger.info("读取日期记录文件: %s", file);

            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf-8');

                if (content) {
                    return JSON.parse(content);
                }
            }
        }
        catch (e) {
            this.logger.warn("读取日期记录文件出错: %s", file, e);
        }

        return {};
    }
    private saveFeedTimes(feedTimes: object) {
        const file = resolve(`${Conf.get('app.varDir')}/feedDates.json`);

        try {
            this.logger.info("更新日期记录文件: %s", file);

            fs.mkdirSync(dirname(file), {recursive: true});
            fs.writeFileSync(file, JSON.stringify(feedTimes, null, 4));
        }
        catch (e) {
            this.logger.error("更新日期记录文件出错: %s", file, e);

            return {};
        }
    }
}

export default new MainWorker();