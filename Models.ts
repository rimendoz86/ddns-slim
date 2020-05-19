export class DNSProvider {
    public Name: string;
    public Endpoint: string;
    public Method: string;
    public RequiredHeader: string;
    public TransformKey: string;
    constructor(initializer?: DNSProvider){
        Object.assign(this, initializer);
    }
}

export class Site {
    public Hostname: string
    public TestURL: string;
    public Provider: string;
    public Username: string;
    public Password: string;
    public TransformedEndpoint?: string;
    public SleepUntil?: Date;
    public LastLog?: Log;
    constructor(initializer?: Site){
        Object.assign(this, initializer);
    }
    IsSleep(){ return this.SleepUntil && new Date() < this.SleepUntil};
}

export class Log
{

}

export enum Severity 
{

}