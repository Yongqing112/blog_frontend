import { get, post, put} from './common.js'

export const createUserAPI = (json, callback, error_callback) => {
    // json = {
    //     username
    //     password
    // }
    let requestPath = process.env.REACT_APP_HOST + process.env.REACT_APP_USER_API + '/create';
    let payload = {
        username: json.username,
        password: json.password
    }
    post(requestPath, payload, callback, error_callback);
}