import Log from "app/log"
import {newLogger} from "libs/logger";
import mainWorker from "modules/worker/mainWorker";

class App {
    private logger = newLogger("App");

    constructor() {
        Log.init();
    }

    async start(): Promise<any> {
        this.logger.prompt("开始启动");

        await mainWorker.start();

        process.on('SIGTERM', this.stop.bind(this));
        process.on('SIGINT', this.stop.bind(this));

        this.logger.prompt("启动完毕");

        return true;
    }

    async stop(): Promise<void> {
        this.logger.prompt("开始关闭");

        await mainWorker.stop();

        this.logger.prompt("关闭完成");
    }

    public static main(): void {
        new App().start();
    }
}

App.main();