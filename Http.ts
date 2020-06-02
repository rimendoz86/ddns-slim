import httpsDependancy from 'https';
import httpDependancy from 'http';
export class Http<T> {
    public Url: string;
    public Request;
    public Options = {
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': "application/json"
        }
    };

    constructor(url: string) {
        // If the string contains 'https' the https module will be used, otherwise the http module will be used.
        this.Request = url.indexOf('https') < 0 ? httpDependancy : httpsDependancy;
        this.Url = url;
    }

    Get() {
        // By using a Generic in our promise, the intellisense will be more aware of our intent.
        return new Promise<T>((resolve, reject) => {
            this.Request.get(this.Url, this.Options, res => {
                if (!this.isSuccess(res.statusCode)) reject(res.statusMessage);
                var data: string = '';
                res.on('data', d => {
                    data += d;
                })
                res.on('end', () => {
                    resolve(this.JsonTryParse(data));
                });

            }).on('error', reject);
        })
    }

    isSuccess(statusCode: string){
        if (!statusCode) return false;
        return statusCode.toString().startsWith('2', 0 )
            || statusCode.toString().startsWith('3', 0 );
    }

    JsonTryParse(json: any) {
        // Attempt to parse the json response, otherwise send the raw response.
        let model
        try {
            model = JSON.parse(json);
        } catch (error) {
            model = json
        }
        return model;
    }
}