//------------------------------------
// POST javascript module
//  3/9/2017, g1
//    encapsulate an asynchronous HTTP post function for making API calls
//

import https from 'https';

let authToken = "";

export async function post<T>(host: string, path: string, body: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        if (authToken !== '') {
            path += '?access_token=' + authToken;
        }
        const opts = {
            hostname: host,
            port: 443,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
            },
        };
        const req = https.request(opts, (res) => {
            let body = '';
            res.setEncoding('utf-8');
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(body));
                    } catch {
                        reject(body);
                    }
                } else {
                    reject(body)
                }
            });
        });
        req.on('error', (e) => {
            reject(e.message);
        });
        req.write(payload);
        req.end();
    });
}

export async function get<T>(host: string, path: string): Promise<T> {
    return new Promise((resolve, reject) => {
        if (authToken !== '') {
            path += '?access_token=' + authToken;
        }

        const opts = {
            hostname: host,
            port: 443,
            path,
            method: 'GET',
        };

        const req = https.request(opts, (res) => {
            let body = '';
            res.setEncoding('utf-8');
            res.on('data', chunk => {
                body += chunk;
            });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(body));
                    } catch {
                        reject(body);
                    }
                } else {
                    reject(body);
                }
            });
        });

        req.on('error', e => {
            reject(e.message);
        });
        req.end();
    });
}

export function authorize(token: string): void {
    authToken = token;
}
