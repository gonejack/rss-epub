export async function sleep(ms: number = 0): Promise<any> {
    return new Promise((res) => setTimeout(res, ms));
}

export enum time {
    millisecond = 1,
    second = millisecond * 1e3,
    minute = second * 60,
    hour = minute * 60,
    day = hour * 24,
    week = day * 7,
}