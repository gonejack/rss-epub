import App from "./app/app";
import Log from "./app/log"
import epubService from "./service/epubService";

class Main {
    public static main(): void {
        Log.init();

        const app = new App();

        app.onStart(
            epubService.start,
        );
        app.onStop(
            epubService.stop,
        );
        app.boot();
    }
}

Main.main();