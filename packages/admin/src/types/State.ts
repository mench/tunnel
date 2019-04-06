export interface Tunnel {
    createdAt: string
    id: string
    internetPort: number
    relayPort: number
}
export interface Headers {
    [k:string]:any
}

export interface Req {
    method: string;
    path: string;
    headers: Headers;
    body: string;
}


export interface Res {
    statusCode: number;
    statusMessage: string;
    headers: Headers;
    body: string;
}

export interface ReqInfo {
    id: string;
    username: string;
    tunnel: Tunnel;
    duration: number;
    createdAt: string;
    req: Req;
    res: Res;
}

export interface State {
    app: {
        status:string,
        session:{
            id:string,
            domain:string,
            connections:number
        },
        selected:string,
        loadingRequests:boolean,
        loadedRequests:boolean,
        tunnels:Tunnel[]
    }
    requests:ReqInfo[]
}