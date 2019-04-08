import {HttpError} from "./HttpError";

export class UnauthorizedError extends HttpError{
    constructor(message = 'Invalid Credentials'){
        super(401,message);
    }
}