import dns from "dns";

export function DNSLookup(targetSite){
  let dnsServers = ["8.8.8.8","8.8.4.4"]
    return new Promise<string>((resolve, reject) => {
        dns.setServers(dnsServers);
        dns.resolve(targetSite, (err , address) => {
            if (!err) {
                resolve(address[0]);
            } else {
                reject(err);
            }
        });
    })
}