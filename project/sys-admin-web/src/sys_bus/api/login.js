import api from './index';
import Service from '@/util/axios';


export function login(param) {
    return Service.post(api.auth.login, {
        body: param
    });
} 

export function getSign(param) {
    return Service.post(api.auth.secret, {
        body: param
    })
}

export function logout() {
    return Service.post(api.auth.logout);
}
