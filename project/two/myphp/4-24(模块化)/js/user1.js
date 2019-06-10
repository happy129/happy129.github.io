import { $ } from './ajax1.js';
// ./表示上一级目录    反之则认为其为变量

var userinfo = {
    // url: "http://localhost/",
    login: function(username, userpwd) {
        var p = new Promise(function(resolve, reject) {
            $.ajax({
                type: "get",
                url: $.url + "myphp/4-23/php/login.php",
                data: {
                    username: username,
                    userpwd: userpwd
                },
                dataType: "json",
                success: function(obj) {
                    resolve(obj);
                }
            })
        })
        return p;
    },
    register: function(username, userpwd, usertel) {
        var p = new Promise(function(resolve, reject) {
            $.ajax({
                type: "get",
                url: $.url + "myphp/4-23/php/register.php",
                data: {
                    username: username,
                    userpwd: userpwd,
                    usertel: usertel,
                },
                dataType: "json",
                success: function(obj) {
                    resolve(obj);
                }
            })
        })
        return p;
    },
    list: function() {

    },
    del: function() {

    }
}
let userLogin = userinfo.login;
let userRegister = userinfo.register;
export { userLogin, userRegister }