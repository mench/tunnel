export function env(name: string, defaultValue?) {
    return process.env[name] || defaultValue;
}

export function toBool(value: string): boolean {
    return value === 'true';
}

export function writeJson(res, status: number, data: any) {
    const body = Buffer.from(JSON.stringify(data));
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf8',
        'Content-Length': body.byteLength
    });
    res.end(body);
}
