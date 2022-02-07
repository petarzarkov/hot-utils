export class HotWatch {
    private _startTime: number;
    public constructor() {
        this._startTime = Date.now();
    }

    public get startTime() {
        return this._startTime;
    }

    public getElapsedMs(): number {
        return Date.now() - this._startTime;
    }

    public getElapsedS(): number {
        return (Date.now() - this._startTime) / 1000;
    }
}