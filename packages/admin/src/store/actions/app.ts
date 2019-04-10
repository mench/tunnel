import {ActionType} from "./ActionType";

export const init = () => ({
    type: ActionType.INIT
});
export const select = (id) => ({
    type: ActionType.SELECT,
    payload: id
});

export const logout = () => ({
    type: ActionType.LOGOUT
});
export const saveUser = ({ username, password }) => ({
    type: ActionType.SAVE_USER,
    payload: { username, password }
});
export const updateUsers = (data) => ({
    type: ActionType.UPDATE_USER,
    payload: data
});
export const toggleUsers = (payload) => ({
    type: ActionType.TOGGLE_USERS,
    payload
});
export const deleteUser = (username) => ({
    type: ActionType.DELETE_USER,
    payload:username
});
export const clearRequests = (subdomain) => ({
    type: ActionType.FLUSH,
    payload:subdomain
});
export const loadRequests = (subdomain) => ({
    type: ActionType.LOAD_REQUESTS,
    payload:subdomain
});