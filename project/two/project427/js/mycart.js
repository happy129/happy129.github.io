$(function() {
    $("#footBox").load("../html/footer.html", function() {

    });
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


    // 购物车商品数量总和：
    cartNum();

    function cartNum() {
        if (loginId) {
            $.ajax({
                type: "get",
                url: "../php/cartnum.php",
                data: {
                    userid: loginId,
                },
                dataType: "json",
                success: function(obj) {
                    var html = "";
                    var {
                        sum,
                    } = obj;
                    if (sum >= 1) {
                        html += `<span>购物车</span>
                                 <span class="cartNum">&nbsp;${sum}&nbsp;</span>件
                                 `;
                        $(".mycart").html(html);
                    } else {
                        $(".mycart").html(html);
                    }
                }

            });
        } else {
            if (confirm("您还未登录,请登录后进行购买.")) {
                gotoLogin();
            }
        }
    };

    var count = 0;

    // 购物车商品信息
    getData();

    function getData() {
        if (loginId) {
            var username = getCookie("username");
            $.ajax({
                type: "get",
                url: "../php/mycart.php",
                data: {
                    userid: loginId,
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
                        html += `<tr class="tr" data-id="${id}">
                                    <td>
                                        <div class="checkbox">
                                            <label>
                                                                <input type="checkbox" id="blankCheckbox" class="check-one" value="option1" data-id="${id}" aria-label="...">
                                                            </label>
                                        </div>
                                    </td>
                                    <td id="pic">
                                        <img src="${goodsimg}" alt="">
                                        <p>商品名:<span id="goodsname">${goodsname}</span> </p>
                                        <p>商品编号:<span id="goodsid">${goodsid}</span> </p>
                                        <p><span>种类:${kind}</span>&nbsp;&nbsp;<span>品牌:${brand}</span>&nbsp;&nbsp;<span>${dushu}度</span>&nbsp;&nbsp;<span>${weight}ml</span></p>
                                    </td>
                                    <td class="price">${price}</td>
                                    <td class="discount">${(discount)}</td>
                                    <td class="shuliang">
                                        <span class="reduce">${goodsnum>1?"-":""}</span> 
                                        <input type="text" class="num" value="${goodsnum}">  
                                        <span class="add">+</span>
                                    </td>
                                    <td class="pricesTotal">${(price*goodsnum).toFixed(2)}</td>
                                    <td>
                                        <button type="button" class="btn btn-info delBtn">删除</button>
                                    </td>
                                </tr>`
                    });
                    $("#tbody").html(html);
                    var allCount = $(".check-one").length;
                    $(".check-all").click(function() {
                        var flag = $(this).prop("checked");
                        $(".check-one").prop("checked", flag);
                        count = flag ? allCount : 0;
                        getTotalAndPrice()
                    });
                    $(".check-one").click(function() {
                        if ($(this).prop("checked")) {
                            count++;
                        } else {
                            count--;
                        }

                        if (count == allCount) {
                            $(".check-all").prop("checked", true);
                        } else {
                            $(".check-all").prop("checked", false);
                        }
                        getTotalAndPrice()
                    })
                }

            });
        } else {
            gotoLogin();
        }

    };

    // 减少商品数量   -
    $(document).delegate(".reduce", "click", function() {
        // 获取商品id
        var id = $(this).parent().parent().attr("data-id");
        var countInput = $(this).next();
        var count = countInput.val();
        if (count == 1) {
            return false;
        }
        countInput.val(count - 1);
        if (countInput.val() == 1) {
            $(this).html("");
        }

        var price = $(this).parent().prev().prev().html();
        var total = price * countInput.val();
        $(this).parent().next().html(total.toFixed(2));
        getTotalAndPrice();
        // 获取改变后的商品的数量
        var goodsnum = $(this).next().val() * 1;
        // 改变数据库中的商品数量
        changeCartNum(id, goodsnum);
        // 修改右侧购物车中的商品 总量
        cartNum();

    });

    // 增加商品数量   +
    $(document).delegate(".add", "click", function() {
        var id = $(this).parent().parent().attr("data-id");
        var countInput = $(this).prev();
        countInput.val(countInput.val() * 1 + 1);
        countInput.prev().html("-");
        var price = $(this).parent().prev().prev().html();
        var total = price * countInput.val();
        $(this).parent().next().html(total.toFixed(2));
        getTotalAndPrice();
        // 获取改变后的商品的数量
        var goodsnum = $(this).prev().val() * 1;
        // 改变数据库中的商品数量
        changeCartNum(id, goodsnum);
        // 修改右侧购物车中的商品 总量
        cartNum();
    });


    // 改变商品数量到数据库：
    function changeCartNum(id, goodsnum) {
        // id为商品记录id  goodsname为本条记录商品数量
        $.ajax({
            type: "get",
            url: "../php/changenum.php",
            data: {
                id: id,
                goodsnum: goodsnum,
            },
            dataType: "json",
            success: function(obj) {
                if (obj["code"] == 1) {

                } else {
                    alert(obj["msg"]);
                }

            }
        });
    };


    // 删除单条商品记录
    $(document).delegate(".delBtn", "click", function() {
        count = $(this).parent().parent().find(".check-one").prop("checked") ? count - 1 : count;
        $(this).parent().parent().remove();
        allCount = $(".check-one").length;

        if (count == allCount) {
            $(".check-all").prop("checked", true);
        } else {
            $(".check-all").prop("checked", false);
        }
        var id = $(this).parent().parent().attr("data-id");
        delshop(id);
        getTotalAndPrice();
    });

    // 结算
    $(document).delegate("#goAccount", "click", function() {
        if (count >= 1) {
            var checkOneList = $(".check-one");
            var idList = [];
            for (var i = 0; i < checkOneList.length; i++) {
                if (checkOneList[i].checked) {
                    // checkOne被选中之后,找到选中的商品记录的id
                    var id = checkOneList[i].getAttribute("data-id");
                    // 将找到的商品记录的id存入空数组之中
                    idList.push(id);
                }
            }
            var ids = idList.join(",");
            console.log(ids);
            window.location.href = "../html/account.html?goodsid-" + ids;

        } else {
            alert("您还没有选择要购买的商品")
        }
    })

    // 批量删除
    $(document).delegate("#delAll", "click", function() {
        var checkOneList = $(".check-one");
        var idList = [];
        for (var i = 0; i < checkOneList.length; i++) {
            // 判断checkOne是否被选中
            if (checkOneList[i].checked) {
                // checkOne被选中之后,找到选中的商品记录的id
                var id = checkOneList[i].getAttribute("data-id");
                // 将找到的商品记录的id存入空数组之中
                idList.push(id);
                // console.log(id);
            }
        }
        // 将其用','分隔
        var ids = idList.join(",");
        $.ajax({
            type: "get",
            url: "../php/delshoppingbyid.php",
            data: {
                id: ids,
            },
            dataType: "json",
            success: function(obj) {
                if (obj['code'] == 1) {
                    getData();
                    // getTotalAndPrice();
                    alert(obj['msg']);
                    cartNum();
                    getTotalAndPrice();

                } else {
                    alert("删除失败,请选中要删除的商品");
                }
            }

        })
        $(".check-one:checked").parent().parent().parent().parent().remove();
        getTotalAndPrice();
        count = 0;
        allCount = $(".check-one").length;
    });

    // 删除商品;
    function delshop(ids) {
        $.ajax({
            type: "get",
            url: "../php/delshoppingbyid.php",
            data: {
                id: ids,
            },
            dataType: "json",
            success: function(obj) {
                if (obj['code'] == 1) {
                    alert(obj['msg']);
                    cartNum();
                    getTotalAndPrice();
                } else {
                    alert("删除失败,请选中要删除的商品");
                }
            }

        })
    }


    function userExit() {
        setCookie("username", "", -7);
        setCookie("loginId", "", -7);
        gotoLogin();
    };

    function gotoLogin() {
        setCookie("backUrl", window.location.href, 7);
        window.location.href = "../html/login.html";
    };


    // 求和---商品总量与总价
    function getTotalAndPrice() {
        var num = 0;
        var price = 0;
        $(".check-one").each(function(index, item) {
            if ($(item).prop("checked")) {
                num += $(item).parent().parent().parent().parent().find(".num").val() * 1;
                price += $(item).parent().parent().parent().parent().find(".pricesTotal").html() * 1;
            }
        })
        $("#pricesTotal").html(price.toFixed(2));
        $("#zong").html(num);

    }


    $(document).delegate(".goAccount", "click", function() {
        goAccount();
    });

    function goAccount() {
        var zong = $("#zong").html() * 1;
        var pricesTotal = $("#pricesTotal").html() * 1;
        // 将商品数量有String转换为number类型
        if (zong >= 1) {
            window.location.href = "../html/account.html"
        } else {
            alert("您还没有选中需要购买的商品");
        }
    }


});