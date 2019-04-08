export class HttpError extends Error{
    httpCode:number;
    constructor(httpCode,message){
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.httpCode = httpCode;
    }
}