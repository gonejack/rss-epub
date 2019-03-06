import * as Logger from "libs/logger"

class Cache {
    private readonly name: string;
    private readonly logger: Logger.LoggerInterface;
    private readonly data: { [key: string]: any };
    private readonly data_ts: { [key: string]: any };
    private readonly item_ttl: number;

    constructor(name: string, item_ttl: number = 7 * 86400, clean_interval: number = 3600) {
        this.name = name;
        this.logger = Logger.newLogger(name);
        this.data = {};
        this.data_ts = {};
        this.item_ttl = item_ttl;

        setInterval(this.flush.bind(this), clean_interval * 1e3);
    }
    public get(key: string): any {
        this.logger.debug("读取缓存[key=%s]: %s", key, this.data[key]);

        this.data_ts[key] = Date.now();

        return this.data[key];
    }
    public set(key: string, data: any) {
        this.logger.debug("写缓存[key=%s]", key, data);

        this.data[key] = data;
        this.data_ts[key] = Date.now();
    }
    public flush() {
        let now = Date.now();

        for (const key of Object.keys(this.data)) {
            if (this.data_ts[key] && now - this.data_ts[key] > this.item_ttl * 1e3) {
                this.logger.debug("清除不活跃条目[key=%s]", key);

                delete this.data[key];
                delete this.data_ts[key];
            }
        }
    }
}

export default Cache;