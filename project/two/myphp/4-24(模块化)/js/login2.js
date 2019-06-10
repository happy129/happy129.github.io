import { userLogin } from "./user.js";

var usernameInput = document.getElementById("username");
var userpwdInput = document.getElementById("userpwd");
var btn = document.getElementById("btn");

btn.onclick = function() {
    var username = usernameInput.value;
    var userpwd = userpwdInput.value;

    userLogin(username, userpwd).then(function(obj) {
        if (obj["code"] == 1) {
            setCookie("username", username, 7);
            setCookie("loginId", obj["userid"], 7);
            if (getCookie("backUrl")) {
                window.location.href = getCookie("backUrl");
            } else {
                window.location.href = "./goodsinfo2.html";
            }
        } else {
            confirm(obj["msg"]);
        }
    });
}