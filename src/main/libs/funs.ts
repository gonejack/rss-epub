// @ts-ignore
import * as replaceAll from 'replaceall'

export function wrapTimeout(promise:Promise<any>, timeout:number = 3):Promise<any> {
    const timeoutPromise = new Promise<void>((res, rej) => {
        setTimeout(() => {rej("操作超时")}, timeout * 1e3);
    });

    return Promise.race([promise, timeoutPromise]);
}

export function stringReplaceAll(text: string, search: string, replacement: string) {
    return replaceAll(search, replacement, text);
}

export function macroReplace(tpl: string, info: { [key: string]: string }):string {
    return tpl.replace(/{(\w+)}/g, (str, p1) => info[p1]);
}