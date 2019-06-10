import { userRegister } from "./user1.js";


var usernameInput = document.getElementById("username");
var userpwdInput = document.getElementById("userpwd");
var usertelInput = document.getElementById("usertel");
var btn = document.getElementById("btn");
btn.onclick = function() {
    var username = usernameInput.value;
    var userpwd = userpwdInput.value;
    var usertel = usertelInput.value;

    // 调用接口  使用promise
    userRegister(username, userpwd, usertel).then(function(obj) {
        if (obj["code"] == 1) {
            alert(obj["msg"]);
            window.location.href = "./login.html";
        } else {
            alert(obj["msg"]);
        }
    });
}