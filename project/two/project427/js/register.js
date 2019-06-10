// jQuery(function() {
$("#btn").on("click", function() {
    var check = checkUserName() && checkUserPwd() && checkRePwd() && checkUserTel() && checkCode() && checkUserEmail();
    if (check == true) {
        var username = $("#username").val();
        var userpwd = $("#userpwd").val();
        // var repwd = repwdInput.value;
        var usertel = $("#usertel").val();
        var useremail = $("#useremail").val();

        $.ajax({
            type: "get",
            url: "../php/register.php",
            data: {
                username: username,
                userpwd: userpwd,
                usertel: usertel,
                useremail: useremail,
            },
            dataType: "json",
            success: function(obj) {
                if (obj["code"] == 1) {
                    alert(obj["msg"]);
                    window.location.href = "../html/login.html";
                } else {
                    alert(obj["msg"]);
                }
            }
        })
    } else {
        alert("注册失败,请检查标红部分,重新注册");
    }
});


function checkUserName() {
    var check = false;
    var username = $("#username").val();
    var regUsername = /^[a-zA-Z]([$_a-zA-Z0-9]{3,9})$/;
    if (!regUsername.test(username)) {
        $("#usernameSpan").html("×&nbsp;&nbsp;用户名长度为4-10位且不能以数字开头.");
        $("#usernameSpan").css("color", "#f40");
        check = false;
    } else {
        $("#usernameSpan").html("√");
        $("#usernameSpan").css("color", "#0d0");
        check = true;
    }
    return check;
}

function checkUserPwd() {
    var check = false;
    var userpwd = $("#userpwd").val();
    var regUserPwd = /^[a-zA-Z0-9]{4,10}$/;
    if (!regUserPwd.test(userpwd)) {
        $("#userpwdSpan").html("×&nbsp;&nbsp;密码长度为4-10位由字母/数字组成.");
        $("#userpwdSpan").css("color", "#f40");
        check = false;
    } else {
        $("#userpwdSpan").html("√");
        $("#userpwdSpan").css("color", "#0d0");
        check = true;
    }
    return check;
}

function checkRePwd() {
    var check = false;
    var repwd = $("#repwd").val();
    var userpwd = $("#userpwd").val();
    if (userpwd != repwd) {
        $("#repwdSpan").html("×&nbsp;&nbsp;两次密码输入不一致,请重新输入.");
        $("#repwdSpan").css("color", "#f40");
        check = false;
    } else {
        $("#repwdSpan").html("√");
        $("#repwdSpan").css("color", "#0d0");
        check = true;
    }
    return check;
}

function checkUserTel() {
    var check = false;
    var usertel = $("#usertel").val();
    // var regUserTel = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/;
    var regUserTel = /^1[34578]\d{9}$/;
    if (!regUserTel.test(usertel)) {
        $("#usertelSpan").html("×&nbsp;&nbsp;请输入常用的电话号码");
        $("#usertelSpan").css("color", "#f40");
        check = false;
    } else {
        $("#usertelSpan").html("√");
        $("#usertelSpan").css("color", "#0f0");
        check = true;
    }
    return check;
}

var usercodeInput = document.getElementById("usercode");
var usercodeSpan = document.getElementById("usercodeSpan");

var code = document.getElementById("code");
code.innerHTML = getRandFromList(bigList, 4);
code.onclick = function() {
    code.innerHTML = getRandFromList(bigList, 4);
};

function checkCode() {
    var check = false;
    var usercode = usercodeInput.value;
    var judegCode = code.innerHTML;
    if (toUpperCode(usercode) == toUpperCode(judegCode)) {
        usercodeSpan.innerHTML = "√";
        usercodeSpan.style.color = "#0f0";
        check = true;
    } else {
        usercodeSpan.innerHTML = "×&nbsp;&nbsp;验证码错误,请重新输入.";
        usercodeSpan.style.color = "#f40";
        check = false;
    }
    return check;
}

// $("#code").html(getRandFromList(bigList, 4));
// $("#code").on("click", function() {
//     $("#code").html(getRandFromList(bigList, 4));
// })

// function checkCode() {
//     var check = false;
//     var usercode = $("#usercode").val();
//     var judegCode = $("#code");
//     if (toUpperCode(usercode) == toUpperCode(judegCode)) {
//         $("#usercodeSpan").html("√");
//         $("#usercodeSpan").css("color", "#0f0");
//         check = true;
//     } else {
//         $("#usercodeSpan").html("×&nbsp;&nbsp;验证码错误,请重新输入.");
//         $("#usercodeSpan").css("color", "#f40");
//         check = false;
//     }
//     return check;
// }

// 随机生成4位验证码
//封装一个方法 从一个集合中 随机返回指定长度的数
function getRandFromList(list, length) {
    var str = "";
    for (var i = 0; i < length; i++) {
        var randIndex = Math.round(Math.random() * (list.length - 1));
        var randCode = list[randIndex];
        str += randCode;
    }
    return str;
}


// 验证邮箱：
function checkUserEmail() {
    var check = false;
    var useremail = $("#useremail").val();
    var regUserEmail = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
    if (!regUserEmail.test(useremail)) {
        $("#useremailSpan").html("×&nbsp;&nbsp;请输入常用邮箱");
        $("#useremailSpan").css("color", "#f40");
        check = false;
    } else {
        $("#useremailSpan").html("√");
        $("#useremailSpan").css("color", "#0f0");
        check = true;
    }
    return check;
}
// });