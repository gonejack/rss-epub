export interface Ilogger {
    debug(tpl: string, ...args: any): void;

    info(tpl: string, ...args: any): void;

    warn(tpl: string, ...args: any): void;

    error(tpl: string, ...args: any): void;

    fatal(tpl: string, ...args: any): void;

    prompt(tpl: string, ...args: any): void;
}

export enum LEVEL {
    DEBUG,
    INFO,
    WARN,
    ERROR,
    FATAL,
    PROMPT,
}

export class BaseLogger implements Ilogger {
    private readonly component: string;
    private readonly pattern: string;
    private readonly threadHold: LEVEL;

    constructor(name: string) {
        this.component = name;
        this.pattern = "{TIME} {LEVEL} {COMP} {MSG}";
        this.threadHold = [
            LEVEL.DEBUG,
            LEVEL.INFO,
            LEVEL.WARN,
            LEVEL.ERROR,
            LEVEL.FATAL,
            LEVEL.PROMPT,
        ].map(lv => LEVEL[lv]).indexOf((process.env.LOG_LEVEL || "WARN").toUpperCase());

        if (this.threadHold < LEVEL.DEBUG) {
            this.threadHold = LEVEL.WARN
        }
    }

    format(level:LEVEL, msg:string): string {
        let text = this.pattern;

        text = text.replace(/{[A-Z]+?}/g, (str) => {
            switch (str) {
                case '{TIME}':
                    return BaseLogger.getTime('Y-m-d H:i:s', new Date());
                case '{LEVEL}':
                    return `[${LEVEL[level]}]`;
                case '{COMP}':
                    return `[${this.component}]`;
                case '{MSG}':
                    return msg;
                default:
                    return str;
            }
        });

        return text;
    }

    log(level: LEVEL, tpl: string, ...args: any): void {
        if (level >= this.threadHold) {
            const consoleFn = level >= LEVEL.WARN && level <= LEVEL.FATAL ? console.error : console.log;

            consoleFn(this.format(level, tpl), ...args);
        }
    }

    debug(tpl: string, ...args: any): void {
        this.log(LEVEL.DEBUG, tpl, ...args);
    }

    info(tpl: string, ...args: any): void {
        this.log(LEVEL.INFO, tpl, ...args);
    }

    warn(tpl: string, ...args: any): void {
        this.log(LEVEL.WARN, tpl, ...args);
    }

    error(tpl: string, ...args: any): void {
        this.log(LEVEL.ERROR, tpl, ...args);
    }

    fatal(tpl: string, ...args: any): void {
        this.log(LEVEL.FATAL, tpl, ...args);

        process.exit(1);
    }

    prompt(tpl: string, ...args: any): void {
        this.log(LEVEL.PROMPT, tpl, ...args);
    }

    static getTime(format:string, date:Date):string {
        const year = date.getFullYear();
        const mon = '0' + (date.getMonth() + 1);
        const day = '0' + date.getDate();
        const hour = '0' + date.getHours();
        const min = '0' + date.getMinutes();
        const sec = '0' + date.getSeconds();

        return format
            .replace('Y', String(year))
            .replace('m', mon.slice(-2))
            .replace('d', day.slice(-2))
            .replace('H', hour.slice(-2))
            .replace('i', min.slice(-2))
            .replace('s', sec.slice(-2));
    }
}

export function newLogger(name: string): Ilogger {
    return new BaseLogger(name);
}