import { DNSLookup } from "./Utilities";
import { Site, Severity, Log } from "./Models";
import sites from "./sites.json";
import { Http } from "./Http";

export class Analysis {
    IntervalJob;
    Sites: Site[];
    CheckInterval: number = 5;
    IPService: string = "https://domains.google.com/checkip";

    BeginInterval() {
        //Check the list of sites and then again every 5 minutes.
        this.AnalyzeSites();

        this.IntervalJob = setInterval(() => {
            this.AnalyzeSites();
        }, this.CheckInterval * 60 * 1000);
        return this;
    }

    AnalyzeSites(){
        //If the sites is null then map the site.json into the Site array.
        if (!this.Sites)
            this.Sites = sites.map(site => new Site(site))
        // Loop through each site calling the Analysis method.
        this.Sites.forEach(dnsEntry => { this.Analysis(dnsEntry) });
    }

    // The Analysis method has the async keyword to use the await keyword when we use our promise methods. 
    async Analysis(site: Site) {
        // Check if the site responds without errors and bail the method if successful
        var IsSiteUp = await new Http<string>(site.TestURL).Get()
            .catch(err => { new Log(Severity.Error, `${site.Hostname} did not respond`, err) });

        if (IsSiteUp) {
            site.LastLog = new Log(Severity.Info, `${site.Hostname} is up.`)
            return;
        }

        // If the site has been put to sleep, bail the method.
        if (site.IsSleep()) return;

        // Since the site is down, get the Public IP address from the IPService provided. If this fails bail the method.
        var myIP = await new Http<string>(this.IPService).Get()
            .catch(err => {
                 site.LastLog = new Log(Severity.Error, "Unable to get IP", err);
                 site.Sleep(1);
            })

        if (!myIP) return;

        // Check the DNS Record using the DNSLookup method, If this fails, bail the method.
        var dnsIP = await DNSLookup(site.Hostname)
        .catch(err => { 
            site.LastLog = new Log(Severity.Error, "Unable to get DNS response", err);
            site.Sleep(1);
        });

        if (!dnsIP) return;

        //If the IP Address received by the service does not match the IP Address received by the DNS Service, Put the site to sleep and update the DNS Provider.
        if (myIP != dnsIP) {
            site.Sleep(2);
            site.LastLog = new Log(Severity.Update, `Updating DNS provider for ${site.Hostname}`);
            //Replace the IPAddress placeholder with the Public IP Address received from the IP Service.
            let siteEndpoint = site.Endpoint.replace("$myip", myIP);
            
            await new Http<string>(siteEndpoint).Get()
            .then(response => {
                site.LastUpdate = new Log(Severity.Update, 
                            `DNS Update for ${site.Hostname} sent with response ${response}`, 
                            JSON.stringify({myip: myIP, dnsip: dnsIP}));
            })
            .catch( err => {
                site.LastLog = new Log(Severity.Error, `Failed to send DNS update for ${site.Hostname}`, err);
            })
        }
    }
}