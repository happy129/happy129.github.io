$(function() {

    var loginId = getCookie("loginId");
    if (loginId) {
        var username = getCookie("username");
        $(".login").html("会员" + username);
        $(".register").html("退出登录");
        $(".register").on("click", function() {
            userExit();
        })

    } else {
        $(".login").html("登录");
        $(".register").html("注册");
        $(".login").on("click", function() {
            window.location.href = "../html/login.html"
        })
        $(".register").on("click", function() {
            window.location.href = "../html/register.html";
        })
    }

    $("#city").click(function(e) {
        SelCity(this, e);
    });
    $("s").click(function(e) {
        SelCity(document.getElementById("city"), e);
    });

    var arr = window.location.href.split("?");
    var arr1 = arr[1].split("-");
    var arr2 = arr1[1];
    var idli = arr2.split(",");
    var idList = [];
    idList.push(idli);
    var ids = idList.join(",");
    $.ajax({
        type: "get",
        url: "../php/account.php",
        data: {
            id: ids,
        },
        dataType: "json",
        success: function(obj) {
            var html = "";
            obj.forEach(item => {
                var {
                    id,
                    goodsid,
                    goodsname,
                    brand,
                    goodsimg,
                    price,
                    kind,
                    discount,
                    dushu,
                    weight,
                    goodsnum,
                } = item;
                html += `<tr class="tr">
                                    <td id="pic">
                                        <img src="${goodsimg}" alt="">
                                        <p>商品名:<span id="goodsname">${goodsname}</span> </p>
                                        <p>商品编号:<span id="goodsid">${goodsid}</span> </p>
                                        <p><span>${kind}</span>&nbsp;&nbsp;<span>${brand}</span></p>
                                    </td>
                                    <td class="price">${price}</td>
                                    <td class="discount">${discount}</td>
                                    <td class="num">${goodsnum}</td>
                                    <td class="pricesTotal">${(price*goodsnum).toFixed(2)}</td>
                                </tr>`

            });
            $("#tbody").html(html);
            var pricesTotal = 0;
            var zong = 0;
            $("#tbody .tr").find("td").each(function() {
                if ($(this).index() == "4") {
                    pricesTotal += $(this).html() * 1;
                    $("#pricesTotal").html(pricesTotal);
                }
            });

            $("#tbody .tr").find("td").each(function() {
                if ($(this).index() == "3") {
                    zong += $(this).html() * 1;
                    $("#zong").html(zong);
                }
            });

            // zong += $(this)
        },
    });


    $(".dingdan").on("click", function() {
        var check = checkAddress() && checkPhone() && checkName();
        if (check == true) {
            var detailAddress = $("#detailAddress").val();
            var phone = $("#phone").val();
            var name = $("#name").val();

            $(".dingdanInfo").show();
            $(".dingdanInfo .goodsAddress").html(detailAddress);
            $(".dingdanInfo .goodsPhone").html(phone);
            $(".dingdanInfo .goodsName").html(name);
            var total = $("#pricesTotal").html();
            var goodsNum = $("#zong").html();
            $(".goodsNum").html(goodsNum + '件');
            $(".total").html(total + '元');
            // alert(detailAddress + phone + name);
        } else {
            alert("请补全订单信息");
        }
    })



});

function checkAddress() {
    var check = false;
    var address = $("#detailAddress").val();
    if (address != "") {
        check = true;
    } else {
        alert("请输入收货地址")
    }
    return check;
}

function checkPhone() {
    var check = false;
    var phone = $("#phone").val();
    if (phone != "") {
        check = true;
    } else {
        alert("请输入联系电话")
    }
    return check;
}

function checkName() {
    var check = false;
    var name = $("#name").val();
    if (name != "") {
        check = true;
    } else {
        alert("请输入收货人")
    }
    return check;
}