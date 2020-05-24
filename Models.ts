export class Site {
    public Hostname: string;
    public TestURL: string;
    public Endpoint: string;
    public SleepUntil?: Date;
    public LastLog?: Log;
    public LastUpdate?: Log;
    constructor(initializer?: Site){
        Object.assign(this, initializer);
    }
    Sleep?(hours: number){
        let sleepUntil = new Date();
        sleepUntil.setHours(sleepUntil.getHours() + hours)
        this.SleepUntil = sleepUntil
    }
    IsSleep?(){ return this.SleepUntil && new Date() < this.SleepUntil};
}

export class Log
{
    public Severity: Severity;
    public Message: string;
    public Details: string;
    constructor(severity: Severity, message: string, details: string = ''){
        this.Severity = severity;
        this.Message = message;
        this.Details = details;
        console.log(this);
    }
}

export enum Severity 
{
    Info,
    Update,
    Error
}