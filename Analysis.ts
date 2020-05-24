import { DNSLookup } from "./Utilities";
import { Site, Severity, Log } from "./Models";
import sites from "./sites.json";
import { Http } from "./Http";

export class Analysis {
    IntervalJob;
    Sites: Site[];
    CheckInterval: number = 0.25;
    IPService: string = "https://domains.google.com/checkip";

    BeginInterval() {
        this.IntervalJob = setInterval(() => {
            this.AnalyzeSites();
        }, this.CheckInterval * 60 * 1000);
        return this;
    }

    AnalyzeSites(){
        if (!this.Sites)
            this.Sites = sites.map(site => new Site(site))
        this.Sites.forEach(dnsEntry => { this.Analysis(dnsEntry) });
    }

    async Analysis(site: Site) {
        var IsSiteUp = await new Http<string>(site.TestURL).Get()
            .catch(err => { new Log(Severity.Error, `${site.Hostname} did not respond`, err) });

        if (IsSiteUp) {
            site.LastLog = new Log(Severity.Info, `${site.Hostname} is up.`)
            return;
        }

        if (site.IsSleep()) return;

        var myIP = await new Http<string>(this.IPService).Get()
            .catch(err => {
                 site.LastLog = new Log(Severity.Error, "Unable to get IP", err);
                 site.Sleep(1);
            })

        if (!myIP) return;

        var dnsIP = await DNSLookup(site.Hostname)
        .catch(err => { 
            site.LastLog = new Log(Severity.Error, "Unable to get DNS response", err);
            site.Sleep(1);
        });

        if (!dnsIP) return;

        if (myIP != dnsIP && !site.IsSleep()) {
            site.Sleep(2);
            site.LastUpdate = new Log(Severity.Update, `Updating DNS provider for ${site.Hostname}`);
            let siteEndpoint = site.Endpoint.replace("$myip", myIP);
            
            await new Http<string>(siteEndpoint).Get()
            .then(response => {
                new Log(Severity.Update, 
                            `DNS Update for ${site.Hostname} sent with response ${response}`, 
                            JSON.stringify({myip: myIP, dnsip: dnsIP}));
            })
            .catch( err => {
                new Log(Severity.Error, `Failed to send DNS update for ${site.Hostname}`, err)
            })
        }

        site.LastLog = new Log(Severity.Error, `${site.Hostname} is down.`);
        site.Sleep(1);
    }
}