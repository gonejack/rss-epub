import * as path from 'path'

class Conf {
    private json: { [key: string]: any } = {};

    constructor() {
        this.env('CONF_FILE', './conf/release.js');
        this.env('LOG_LEVEL', 'WARN');
        this.env('LOG_TO_FILE', 'false');
        this.init();
    }

    env(key:string, fallback:string): string {
        if (key in process.env) {
            console.log("环境变量[%s]读取[=%s]", key, process.env[key]);
        }
        else {
            process.env[key] = fallback;
            console.log("环境变量[%s]为空，缺省[=%s]", key, fallback);
        }

        return process.env[key] || '';
    }

    public get(key: string):any {
        let json = this.json;

        if (key) {
            let ps = key.split('.');

            while (ps.length && json) {
                const prop = ps.shift();
                if (prop && json.hasOwnProperty(prop)) {
                    json = json[prop];
                }
                else {
                    throw `找不到配置[${key}]`;
                }
            }
        }

        return json;
    }

    public init(): void {
        if (process.env.CONF_FILE) {
            const file = path.resolve(process.env.CONF_FILE);

            console.log('读取配置文件[%s]', file);

            this.json = require(file);
        }
        else {
            throw '环境变量CONF_FILE为空';
        }
    }
}

export default new Conf();