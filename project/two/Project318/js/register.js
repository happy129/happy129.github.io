$(function() {
    // 表单验证：
    // 判断输入的信息是否符合要求
    //为表单元素添加失去焦点事件
    $(".code").html(creatCode(4));
    // $(".btn").css({ "backgroundColor": "#ddd", "disabled": "true" });
    $("form :input").blur(function() {
        // $(".username").blur(function(){

        // })
        if ($(this).is(".username")) {
            var username = $.trim(this.value); //原生js去空格方式：this.replace(/(^\s*)|(\s*$)/g, "")

            var regUserName = /d[~#^$@%&!*()<>:;'"{}【】  ]/;
            if (username == "" || username.length < 6 || username.length > 10 || regUserName.test(username)) {
                var errorMsg = " 可含有字母、数字、$、_,不能以数字开头,6-10位";
                $(".username-span").html(errorMsg);
                $(".username-span").css("color", "red")
            } else {
                var okMsg = " 输入正确";
                $(".username-span").html(okMsg);
                $(".username-span").css("color", "black");

            }

            // function checkUsername() {
            //     $.ajax({
            //         type: "get",
            //         url: "../php/register.php",
            //         data: {
            //             username,
            //         },
            //         dataType: "json",
            //         success: function(obj) {
            //             if (obj["code"] == 1) {
            //                 // window.location.href = "../html/login.html";
            //             } else {
            //                 confirm(obj["msg"]);
            //             }
            //         }
            //     })
            // }
        }

        // 验证密码:
        if ($(this).is(".userpwd")) {
            var userPwdVal = $.trim(this.value);
            var regUserPwd = /[~#^$@%&!*()<>:;'"{}【】  ]/;
            if (userPwdVal == "" || userPwdVal.length < 6 || userPwdVal.length > 12 || regUserPwd.test(userPwdVal)) {
                var errorMsg = " 密码可含有字母、数字、$、_,6-12位";
                $(".userpwd-span").html(errorMsg);
                $(".userpwd-span").css("color", "red");
            } else {
                var okMsg = " 输入正确";
                $(".userpwd-span").html(okMsg);
                $(".userpwd-span").css("color", "black");

            }

        }

        if ($(this).is(".repwd")) {
            var regPwdVal = $.trim(this.value);
            var userPwdVal = $(".userpwd").val();
            if (regPwdVal == userPwdVal && userPwdVal != "") {
                var okMsg = " 输入正确";
                $(".repwd-span").html(okMsg);
                $(".repwd-span").css("color", "black");
            } else {
                var errorMsg = " 请检查密码与上方密码是否一致";
                $(".repwd-span").html(errorMsg);
                $(".repwd-span").css("color", "red");
            }
        }

        //验证邮箱
        if ($(this).is(".useremail")) {
            var emailVal = $.trim(this.value);
            var regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

            if (regEmail.test(emailVal)) {
                var okMsg = " 输入正确";
                $(".useremail-span").html(okMsg);
                $(".useremail-span").css("color", "black")
            } else {
                var errorMsg = " 请输入正确的E-Mail住址！";
                $(".useremail-span").html(errorMsg);
                $(".useremail-span").css("color", "red")
            }
        }




        // 验证码生成与验证:
        // $(".code").html(creatCode(4));
        $(".code").click = function() {
            $(".code").html(creatCode(4));
        }
        $(".usercode").blur(function() {

            if ($(this).is(".usercode")) {
                var usercode = $(".usercode").val();
                var judegCode = $(".code").html();
                // var $usercode = $(".usercode").val();
                if (toUpperCode(usercode) == toUpperCode(judegCode)) {
                    var okMsg = "输入正确";
                    $(".usercode-span").html(okMsg);
                    $(".usercode-span").css("color", "black")
                } else {
                    var okMsg = "验证码有误,请重新输入";
                    $(".usercode-span").html(okMsg);
                    $(".usercode-span").css("color", "red")
                }
            }
        })

        // // 判断各项验证是否成功:
        // if ($(".username-span").html() && $(".userpwd-span").html() && $(".repwd-span").html() && $(".usercode-span").html() && $(".useremail-span").html() == "输入正确") {
        //     $(".btn").css({ "backgroundColor": "chocolate", "disabled": "fasle" });
        // }

    }).keyup(function() {
        //triggerHandler 防止事件执行完后，浏览器自动为标签获得焦点
        $(this).triggerHandler("blur");
    }).focus(function() {
        $(this).triggerHandler("blur");
    });

    $(".btn").click(function() {
        var username = $(".username").val();
        var userpwd = $(".userpwd").val();
        var useremail = $(".useremail").val();
        console.log(username, userpwd, useremail);

        // function checkUsername() {
        $.ajax({
                type: "get",
                url: "../php/register.php",
                data: {
                    username,
                    userpwd,
                    useremail,
                },
                dataType: "json",
                success: function(obj) {
                    if (obj["code"] == 1) {
                        window.location.href = "../html/login.html";
                    } else {
                        confirm(obj["msg"]);
                    }
                }
            })
            // }
    })

})