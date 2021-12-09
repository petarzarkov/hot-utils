export class Hotwatch {
    private startTime: number;
    public constructor() {
        this.startTime = Date.now();
    }

    public getElapsedMs(): number {
        return Date.now() - this.startTime;
    }

    public getElapsedS(): number {
        return (Date.now() - this.startTime) / 1000;
    }
}
