class Queue<T> {
    private readonly capacity: number;
    private producers: (() => boolean)[];
    private consumers: ((value: T | any) => ({ value: T | any, suc: boolean }))[];
    private values: Array<T | any>;
    private closed = false;

    constructor(cap ?: number) {
        if (cap == null) {
            cap = 0;
        }
        this.capacity = cap;
        this.producers = new Array<() => boolean>();
        this.consumers = new Array<(value: T | any) => ({ value: T | any, suc: boolean })>();
        this.values = new Array<T | any>();
    }

    async push(value: T): Promise<boolean> {
        if (this.closed) {
            return false;
        }

        this.values.push(value);

        if (this.consumers.length > 0) {
            const consumer = this.consumers.shift();
            const value = this.values.shift();
            if (consumer != null && value != null) {
                consumer(value);
            }
        }

        if (this.values.length <= this.capacity) {
            return true;
        } else {
            const resolve = () => true;
            this.producers.push(resolve);
            return new Promise<boolean>(resolve);
        }
    }
    async pull(): Promise<{ value: T | any, suc: boolean }> {
        switch (true) {
            case this.values.length > 0:
                if (this.producers.length > 0) {
                    let producer = this.producers.shift();
                    if (producer != null) {
                        producer();
                    }
                }
                return {value: this.values.shift(), suc: true};
            case this.closed:
                return {value: null, suc: false};
            default:
                const resolve = (value: T | any) => ({value: value, suc: true});
                this.consumers.push(resolve);
                return new Promise<{ value: T | any, suc: boolean }>(resolve);
        }
    }
    close() {
        this.closed = true;
    }
    size(): number {
        return this.values.length;
    }
}

export default Queue;