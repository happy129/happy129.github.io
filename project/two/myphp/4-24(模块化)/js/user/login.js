import {
    userLogin
} from "./user.js";

var usernameInput = document.getElementById("username");
var userpwdInput = document.getElementById("userpwd");
var btn = document.getElementById("btn");
btn.onclick = function () {
    var username = usernameInput.value;
    var userpwd = userpwdInput.value;

    userLogin(username, userpwd).then(function (obj) {
        if (obj["code"] == 1) {
            localStorage.setItem("loginId", obj["userid"]);
            localStorage.setItem("loginName", username);
            var backUrl = window.localStorage.getItem("backUrl");
            if (backUrl) {
                window.location.href = backUrl;
            } else {
                window.location.href = "userlist.html";
            }
        } else {
            alert(obj["msg"]);
        }
    })
}
