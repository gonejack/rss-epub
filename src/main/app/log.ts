import Conf from "app/conf";
import * as fs from "fs"
import * as path from "path";
import * as DateFormat from 'dateformat'

class Log {
    static init(): void {
        if (process.env.LOG_TO_FILE && process.env.LOG_TO_FILE.toLowerCase() == 'true') {
            const conf = Conf.get('app.log');

            Log.rewriteStream('app', process.stdout, conf.app_log);
            Log.rewriteStream('err', process.stderr, conf.err_log);
        }
    }

    static rewriteStream(name: string, std: NodeJS.WritableStream, prefix: string) {
        const stdWrite = std.write;

        let stream: NodeJS.WritableStream | null;
        std.write = (...args: any): boolean => {
            if (!stream) {
                const now = new Date();
                const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 1, 0);
                setTimeout(() => {
                    if (stream) {
                        stream.end()
                    }
                    stream = null;
                }, end.getTime() - now.getTime());

                const target = path.resolve(`${prefix}${DateFormat(now, "yyyymmdd")}.log`);
                if (!fs.existsSync(path.dirname(target))) {
                    fs.mkdirSync(path.dirname(target), {recursive: true});
                }
                stream = fs.createWriteStream(target, {'flags': 'a'});
                stream.on('error', e => {
                    std.write = stdWrite;
                    console.log("Log file[%s] stream error", e)
                });
            }

            if (stream) {
                stream.write.apply(stream, args);
            }

            return true;
        };
    }
}

export default Log;