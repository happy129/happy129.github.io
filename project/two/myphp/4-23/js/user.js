var userinfo = {
    url: "http://localhost/",
    login: function(username, userpwd) {
        var p = new Promise(function(resolve, reject) {
            $.ajax({
                type: "get",
                url: userinfo.url + "myphp/4-23/php/login.php",
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
                url: userinfo.url + "myphp/4-23/php/register.php",
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