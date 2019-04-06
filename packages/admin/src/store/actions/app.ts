import {ActionType}  from "./ActionType";

export const init = () => ({
    type: ActionType.INIT
});
export const select = (id)=>({
    type: ActionType.SELECT,
    payload:id
});