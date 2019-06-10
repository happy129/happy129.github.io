import {
    $
} from './../ajax1.js';
var userinfo = {
    login: function (username, userpwd) {
        var p = new Promise(function (resolve, reject) {
            $.ajax({
                type: "get",
                url: $.url + "1901/php/login.php",
                data: {
                    username: username,
                    userpwd: userpwd
                },
                dataType: "json",
                success: function (obj) {
                    resolve(obj);
                }
            })
        });
        return p;

    },
    register: function (username, userpwd, tel) {
        var p = new Promise(function (resolve, reject) {
            $.ajax({
                type: "get",
                url: $.url + "1901/php/register.php",
                data: {
                    username: username,
                    userpwd: userpwd,
                    tel: tel
                },
                dataType: "json",
                success: function (obj) {
                    resolve(obj);
                }
            });
        })
        return p;

    },
    list: function () {

    },
    del: function () {

    }
}
let userLogin = userinfo.login;
let userRegister = userinfo.register;
export {
    userLogin,
    userRegister
}