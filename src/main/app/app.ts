import {newLogger} from "libs/logger";

class App {
    private logger = newLogger("App");
    private starts: Array<(() => Promise<boolean>)> = [];
    private stops: Array<(() => Promise<boolean>)> = [];

    public async start(): Promise<any> {
        this.logger.prompt("开始启动");

        for (let start of this.starts) {
            let ok = await start();
            if (!ok) {
                this.logger.fatal("启动失败");
            }
        }

        process.on('SIGTERM', this.stop.bind(this));
        process.on('SIGINT', this.stop.bind(this));

        this.logger.prompt("启动完毕");

        return true;
    }
    public async stop(): Promise<void> {
        this.logger.prompt("开始关闭");

        for (let stop of this.stops) {
            let ok = await stop();
            if (!ok) {
                this.logger.error("关闭失败");
            }
        }

        this.logger.prompt("关闭完成");
    }
    public onStart(...starts: [() => Promise<boolean>]) {
        this.starts = starts;
    }
    public onStop(...stops: [() => Promise<boolean>]) {
        this.stops = stops;
    }
}

export default App;