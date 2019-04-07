import * as Fs   from 'fs';
import * as Path from 'path';


export function env(name: string, defaultValue?) {
  return process.env[ name ] || defaultValue;
}

export function toBool(value: string): boolean {
  return value === 'true';
}

export function writeJson(res, status: number, data: any, headers = {}) {
  const body = Buffer.from(JSON.stringify(data));
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf8',
    'Content-Length': body.byteLength,
    ...headers
  });
  res.end(body);
}
export function serveStatics(root, path, res) {
  console.info("STATIC",root,path);
  if(path=='/'){
    path = '/index.html'
  }
  let filePath = Path.resolve(root, `./${path}`);
  if (filePath.startsWith(root) && Fs.existsSync(filePath)) {
    const fileContent = Fs.readFileSync(filePath);
    const fileType = getMime(Path.extname(filePath));
    res.writeHead(200, {
      'Content-Type': fileType,
      'Content-Length': fileContent.byteLength,
    });
    res.end(fileContent);
  }else{
    writeJson(res,404,{
      error:"Not found"
    })
  }
}

function getMime(ext) {
  switch (ext) {
    case '.css':
      return 'text/css;charset=utf-8';
    case '.js':
      return 'application/javascript;charset=utf-8';
    case '.map':
    case '.json':
      return 'application/json;charset=utf-8';
    case '.html':
      return 'text/html;charset=utf-8';
    case '.ico':
      return 'image/x-icon';
    default:
      return 'application/octet-stream';
  }
}