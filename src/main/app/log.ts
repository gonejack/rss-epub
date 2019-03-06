import Conf from "app/conf";
import * as fs from "fs"

class Log {
    static init():void {
        if (process.env.LOG_TO_FILE && process.env.LOG_TO_FILE.toLowerCase() == 'true') {

            const conf = Conf.get('app.log');

            Log.redirectStream('app', process.stdout, conf.app_log);
            Log.redirectStream('err', process.stderr, conf.err_log);
        }
    }

    static redirectStream(name:string, std:NodeJS.WritableStream, path:string) {
        const origin = std.write;
        const dateStr = require('libs/utils').toDateStr;

        let today = dateStr(new Date());
        let stream: NodeJS.WritableStream | null;

        std.write = function (...args:any) {
            const nowDate = dateStr(new Date());

            if (today !== nowDate) {
                today = nowDate;
                stream && stream.end();
                stream = null;
            }

            if (stream == null) {
                const file = `${path}${nowDate}.log`;
                stream = fs.createWriteStream(file, {'flags': 'a'});
                stream.on('error', e => {
                    std.write = origin;
                    console.log("Log file[%s] stream error", e)
                });
            }

            stream.write.apply(stream, args);

            return true;
        }
    }
}

export default Log;