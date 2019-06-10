window.onload = function() {
    $(function() {
        $("#header").load("../html/header.html", function() {
            // 判断用户状态--- 是否登录
            var loginId = getCookie("loginId");
            if (loginId) {
                var username = getCookie("username");
                $(".login").html("会员" + username);
                // $(".login").html("会员" + getCookie("username"));
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

            // 进入购物车
            $(document).delegate(".cart", "click", function() {
                window.location.href = "../html/mycart.html";
            })

            // 获取购物车商品数量总和：
            cartNum();

        })
        $("#rightBox").load("../html/right.html", function() {

        })
        $("#footBox").load("../html/footer.html", function() {

        })
        var keywords = "";
        var price = "";
        var discount = "";
        // var dushu = "";
        // var year = "";
        getData();

        var loginId = getCookie("loginId");

        function getData() {
            $.ajax({
                type: 'get',
                url: "../php/getallgoodslistcount.php",
                dataType: 'json',
                success: function(obj) {
                    var count = obj["count"];
                    new Page("#page", {
                        count: count,
                        shownum: 8,
                        showpage: 5,
                        callback: function(pageIndex) {

                            $.ajax({
                                type: "get",
                                url: "../php/goodslist.php",
                                // data:"接收页面传递的参数至php页面中";
                                data: {
                                    // skipnum表示跳过的数据条数
                                    skipnum: (pageIndex - 1) * 8,
                                    // shownum表示页面显示数据条数
                                    shownum: 8,
                                    // 搜索商品品牌
                                },
                                dataType: "json",
                                success: function(list) {
                                    var html = "";
                                    // console.log(typeof(list));
                                    list.forEach(item => {
                                        var {
                                            goodsid,
                                            goodsname,
                                            brand,
                                            dushu,
                                            price,
                                            discount,
                                            weight,
                                            kind,
                                            goodsimg,
                                            location,
                                            year,
                                        } = item;
                                        html += `<li class="listItem">
                                                    <a href="" class="goodsLink"></a>
                                                    <div class="itemBox">
                                                        <div class="goodsInfo"  data-goodsname="${goodsname}"  data-goodsid="${goodsid}"
                                                        data-brand="${brand}"  data-dushu="${dushu}"  data-price="${price}" 
                                                         data-discount="${discount}"  data-weight="${weight}"  data-kind="${kind}" 
                                                         data-goodsimg="${goodsimg}"  data-location="${location}" data-year="${year}">
                                                            <div class="itemImg">
                                                                <img class="goodsimg" src="${goodsimg}" alt="" secret="${goodsid}">
                                                            </div>
                                                            <div class="itemName">
                                                                <span class="location">${location}</span>
                                                                <span class="kind">${kind} ${goodsid}</span>
                                                                <span class="name">${brand}&nbsp;${year}年产&nbsp;${goodsname}&nbsp;&nbsp;${dushu}度</span>
                                                                <span class="weight">${weight}ml</span>
                                                            </div>
                                                            <div class="itemBottom">
                                                                <div class="itemPrices">
                                                                    <span class="price">优惠:<del>￥${discount}</del>元</span> 
                                                                    <span class="price">折扣价:￥ ${price}元</span>
                                                                </div>
                                                                <button class="addCartBtn btn">加入购物车</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>`;
                                        // seeCart();
                                    });
                                    $(".proList").html(html);
                                }
                            });
                        }
                    })
                }
            });
        }


        // 搜索
        function queryGood(keywords) {
            $.ajax({
                type: "get",
                url: "../php/queryKeyWords.php",
                // data:"接收页面传递的参数至php页面中";
                data: {

                    // 搜索商品品牌
                    keywords: keywords,
                },
                dataType: "json",
                success: function(list) {
                    var html = "";
                    // console.log(typeof(list));
                    list.forEach(item => {
                        var {
                            goodsid,
                            goodsname,
                            brand,
                            dushu,
                            price,
                            discount,
                            weight,
                            kind,
                            goodsimg,
                            location,
                            year,
                        } = item;
                        html += `<li class="listItem">
                                    <a href="" class="goodsLink"></a>
                                    <div class="itemBox">
                                        <div class="goodsInfo"  data-goodsname="${goodsname}"  data-goodsid="${goodsid}"
                                        data-brand="${brand}"  data-dushu="${dushu}"  data-price="${price}" 
                                         data-discount="${discount}"  data-weight="${weight}"  data-kind="${kind}" 
                                         data-goodsimg="${goodsimg}"  data-location="${location}" data-year="${year}">
                                            <div class="itemImg">
                                                <img class="goodsimg" src="${goodsimg}" alt="" secret="${goodsid}">
                                            </div>
                                            <div class="itemName">
                                                <span class="location">${location}</span>
                                                <span class="kind">${kind} ${goodsid}</span>
                                                <span class="name">${brand}&nbsp;${year}年产&nbsp;${goodsname}&nbsp;&nbsp;${dushu}度</span>
                                                <span class="weight">${weight}ml</span>
                                            </div>
                                            <div class="itemBottom">
                                                <div class="itemPrices">
                                                    <span class="price">优惠:<del>￥${discount}</del>元</span> 
                                                    <span class="price">折扣价:￥ ${price}元</span>
                                                </div>
                                                <button class="addCartBtn btn">加入购物车</button>
                                            </div>
                                        </div>
                                    </div>
                                </li>`;
                        // seeCart();
                    });
                    $(".proList").html(html);
                }
            });
        }

        // 排序
        function queryData(price, discount) {
            $.ajax({
                type: 'get',
                url: "../php/getallgoodslistcount.php",
                dataType: 'json',
                success: function(obj) {
                    var count = obj["count"];
                    new Page("#page", {
                        count: count,
                        shownum: 8,
                        showpage: 5,
                        callback: function(pageIndex) {

                            $.ajax({
                                type: "get",
                                url: "../php/goodsquery.php",
                                // data:"接收页面传递的参数至php页面中";
                                data: {
                                    // skipnum表示跳过的数据条数
                                    skipnum: (pageIndex - 1) * 8,
                                    // shownum表示页面显示数据条数
                                    shownum: 8,
                                    price: price,
                                    discount: discount,
                                    // 搜索商品品牌
                                },
                                dataType: "json",
                                success: function(list) {
                                    var html = "";
                                    // console.log(typeof(list));
                                    list.forEach(item => {
                                        var {
                                            goodsid,
                                            goodsname,
                                            brand,
                                            dushu,
                                            price,
                                            discount,
                                            weight,
                                            kind,
                                            goodsimg,
                                            location,
                                            year,
                                        } = item;
                                        html += `<li class="listItem">
                                                    <a href="" class="goodsLink"></a>
                                                    <div class="itemBox">
                                                        <div class="goodsInfo"  data-goodsname="${goodsname}"  data-goodsid="${goodsid}"
                                                        data-brand="${brand}"  data-dushu="${dushu}"  data-price="${price}" 
                                                         data-discount="${discount}"  data-weight="${weight}"  data-kind="${kind}" 
                                                         data-goodsimg="${goodsimg}"  data-location="${location}" data-year="${year}">
                                                            <div class="itemImg">
                                                                <img class="goodsimg" src="${goodsimg}" alt="" secret="${goodsid}">
                                                            </div>
                                                            <div class="itemName">
                                                                <span class="location">${location}</span>
                                                                <span class="kind">${kind} ${goodsid}</span>
                                                                <span class="name">${brand}&nbsp;${year}年产&nbsp;${goodsname}&nbsp;&nbsp;${dushu}度</span>
                                                                <span class="weight">${weight}ml</span>
                                                            </div>
                                                            <div class="itemBottom">
                                                                <div class="itemPrices">
                                                                    <span class="price">优惠:<del>￥${discount}</del>元</span> 
                                                                    <span class="price">折扣价:￥ ${price}元</span>
                                                                </div>
                                                                <button class="addCartBtn btn">加入购物车</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>`;
                                        // seeCart();
                                    });
                                    $(".proList").html(html);
                                }
                            });
                        }
                    })
                }
            });
        };

        // 查询商品
        $(document).delegate(".topSearchBtn", "click", function() {
            var keywords = $(".search").val();
            if (keywords != "") {
                $("#page").hide();
                queryGood(keywords);
            }
        })


        // 排序
        // 按价格
        var count = 1;
        var countDiscount = 1;
        $(document).delegate(".price", "click", function() {
            count++;
            // console.log(count);
            if (count % 2 == 0) {
                // 按价格降序排列
                price = "desc";
                // getData();
                $("#page").html("");
                queryData(price, discount);
            } else {
                // 按价格升序排列
                price = "asc";
                $("#page").html("");
                queryData(price, discount);
            }
        });
        // 按折扣
        $(document).delegate(".discount", "click", function() {
            countDiscount++;
            console.log(countDiscount);
            if (countDiscount % 2 == 0) {
                // 按折扣降序排列
                discount = "desc";
                $("#page").html("");
                queryData(price, discount);

            } else {
                // 按价格升序排列
                discount = "asc";
                $("#page").html("");
                queryData(price, discount);
            }
        });


        $(document).delegate(".proList li img", "click", function() {
            var goodsid = $(this).attr("secret");
            window.location.href = "goodsdetail.html?goodsid-" + goodsid;
        });

        // 加入购物车：
        $(document).delegate(".addCartBtn", "click", function() {
            var goodsname = $(this).parent().parent().parent().find(".goodsInfo").attr("data-goodsname");
            var goodsname = $(this).parent().parent().parent().find(".goodsInfo").attr("data-goodsname");
            var goodsid = $(this).parent().parent().parent().find(".goodsInfo").attr("data-goodsid");
            var brand = $(this).parent().parent().parent().find(".goodsInfo").attr("data-brand");
            var dushu = $(this).parent().parent().parent().find(".goodsInfo").attr("data-dushu");
            var price = $(this).parent().parent().parent().find(".goodsInfo").attr("data-price");
            var discount = $(this).parent().parent().parent().find(".goodsInfo").attr("data-discount");
            var weight = $(this).parent().parent().parent().find(".goodsInfo").attr("data-weight");
            var kind = $(this).parent().parent().parent().find(".goodsInfo").attr("data-kind");
            var goodsimg = $(this).parent().parent().parent().find(".goodsInfo").attr("data-goodsimg");
            var location = $(this).parent().parent().parent().find(".goodsInfo").attr("data-location");
            var year = $(this).parent().parent().parent().find(".goodsInfo").attr("data-year");
            addCart(goodsname, goodsid, brand, dushu, price, discount, weight, kind, goodsimg, location, year);
        })

        function addCart(goodsname, goodsid, brand, dushu, price, discount, weight, kind, goodsimg, location, year) {
            var loginId = getCookie("loginId");
            var username = getCookie("username");
            if (loginId) {
                $.ajax({
                    type: "get",
                    url: "../php/addshoppingcart.php",
                    data: {
                        userid: loginId,
                        username: username,
                        goodsname: goodsname,
                        goodsid: goodsid,
                        brand: brand,
                        dushu: dushu,
                        price: price,
                        discount: discount,
                        weight: weight,
                        kind: kind,
                        goodsimg: goodsimg,
                        location: location,
                        year: year,
                        goodsnum: 1,
                    },
                    dataType: "json",
                    success: function(obj) {
                        if (obj["code"] == 1) {
                            // 加入购物车时重新加载商品列表中购物车的信息
                            cartNum();
                            if (confirm("商品已成功加入购物车,点击进入购物车")) {
                                window.location.href = "../html/mycart.html";
                            }
                        } else {
                            alert(obj["msg"]);
                        }
                    }
                });
            } else {
                if (confirm("您还未登录,请登录后进行购买.")) {
                    gotoLogin();
                }
            }
        };


        // 显示用户购物车数量
        // 获取我的购物车商品的总量：

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
                            html += `<i class="icon iconfont icon-gouwuche1 fl"></i>
                             <span class="cartText">购物车</span>
                             <span class="badge itemNum">${sum}</span>`;
                            $(".cart").html(html);
                        } else {
                            html += `<i class="icon iconfont icon-gouwuche1 fl"></i>
                             <span class="cartText">购物车</span>
                             <span class="badge itemNum">0</span>`;
                            $(".cart").html(html);
                        }
                    }

                });
            } else {
                // if (confirm("您还未登录,请登录后进行购买.")) {
                //     gotoLogin();
                // }
            }
        }



        // 进入购物车
        function gocart() {
            window.location.href = "../html/mycart.html";
        }

        function userExit() {
            setCookie("username", "", -7);
            setCookie("loginId", "", -7);
            gotoLogin();
        }

        function gotoLogin() {
            setCookie("backUrl", window.location.href, 7);
            window.location.href = "../html/login.html";
        }

    })

}