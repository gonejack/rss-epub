class Queue<T> {
    private readonly capacity: number;
    private closed = false;
    private valuesQueue: Array<T> = new Array<T>();
    private pendingPushQueue: ((ret:number) => void)[];
    private pendingPullQueue: ((ret:T) => void)[];

    constructor(cap?: number) {
        if (cap == null) {
            cap = 0;
        }

        this.capacity = cap;
        this.pendingPushQueue = new Array<(ret:any) => void>();
        this.pendingPullQueue = new Array<(ret:any) => void>();
    }

    async push(item: any): Promise<boolean> {
        if (this.closed) {
            return false;
        }
        else {
            if (this.pendingPullQueue.length) {
                // @ts-ignore
                this.pendingPullQueue.shift()({value: item, suc: true});
            }
            else {
                this.valuesQueue.push(item);
            }

            if (this.valuesQueue.length > this.capacity) {
                // @ts-ignore
                return new Promise((res:() => void) => this.pendingPushQueue.push(res));
            }
            else {
                return true;
            }
        }
    }

    async pull(): Promise<{value: T|any, suc:boolean}> {
        if (this.valuesQueue.length) {
            const value = this.valuesQueue.shift();

            if (this.pendingPushQueue.length) {
                // @ts-ignore
                this.pendingPushQueue.shift()(true);
            }

            // @ts-ignore
            return {value: value, suc: true};
        }
        else {
            if (this.closed) {
                return {value: undefined, suc: false};
            }
            else {
                // @ts-ignore
                return new Promise((res:() => void) => this.pendingPullQueue.push(res));
            }
        }
    }

    async close():Promise<void> {
        this.closed = true;

        while (this.pendingPullQueue.length) {
            if (this.valuesQueue.length) {
                // @ts-ignore
                process.nextTick(() => this.pendingPullQueue.shift()({value: this.valuesQueue.shift(), suc: true}))
            }
            else {
                // @ts-ignore
                this.pendingPullQueue.shift()({value: undefined, suc: false});
            }
        }
    }

    size():number {
        return this.valuesQueue.length - this.pendingPushQueue.length
    }
}

export default Queue;