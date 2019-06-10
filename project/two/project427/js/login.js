$(function() {
    // var username = $("#username").val();
    // var userpwd= $("#userpwd").val();
    // var usernameInput = document.getElementById("username");
    // var userpwdInput = document.getElementById("userpwd");
    // var btn = document.getElementById("btn");

    $("#loginBtn").click(function() {
        var username = $("#username").val();
        var userpwd = $("#userpwd").val();

        // 封装ajax请求数据
        $.ajax({
            type: "get",
            url: "../php/login.php",
            data: {
                username: username,
                userpwd: userpwd,
            },
            dataType: "json",
            success: function(obj) {
                if (obj["code"] == 1) {
                    setCookie("username", username, 7);
                    setCookie("loginId", obj["userid"], 7);
                    if (getCookie("backUrl")) {
                        window.location.href = getCookie("backUrl");
                    } else {
                        alert(obj["msg"]);
                        window.location.href = "../html/index.html";
                    }
                } else {
                    alert(obj["msg"]);
                }
            }
        })
    });
})