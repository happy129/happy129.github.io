$(function() {
    $(".btn").on("click", function() {
        var username = $(".username").val();
        var userpwd = $(".userpwd").val();
        $.ajax({
            type: "get",
            url: "../php/login.php",
            data: {
                username,
                userpwd,
            },
            dataType: "json",
            success: function(obj) {
                if (obj["code"] == 1) {
                    console.log(10);
                    setCookie("username", username, 7);
                    location.href = "../html/index.html";
                } else {
                    confirm(obj["msg"]);
                }
            }
        })
    });

})