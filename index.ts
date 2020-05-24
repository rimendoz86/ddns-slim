import { Analysis } from "./Analysis";
import { Log, Severity } from "./Models";

export class DDNSSlim
{
    static Analysis: Analysis;
    public static Start(){
        this.Analysis = new Analysis().BeginInterval();
        new Log(Severity.Info,"The app started");
    }
}
DDNSSlim.Start()
