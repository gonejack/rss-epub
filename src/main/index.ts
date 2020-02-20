import App from "./app/app";
import Log from "./app/log"
import mainWorker from "./modules/worker/mainWorker";

class Main {
    public static main(): void {
        Log.init();

        let app = new App();

        app.onStart(
            mainWorker.start,
        );
        app.onStop(
            mainWorker.stop,
        );

        app.start();
    }
}

Main.main();