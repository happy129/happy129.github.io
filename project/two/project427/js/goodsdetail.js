window.onload = function() {

    $(function() {
        var loginId = getCookie("loginId");
        $("#header").load("../html/header.html", function() {
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


        var arr = window.location.href.split("?");
        var arr1 = arr[1].split("-");
        var arr2 = arr1[1];
        var goodsid = arr2;
        getGoodsInfo();

        function getGoodsInfo() {
            $.ajax({
                type: "get",
                url: "../php/goodsdetail.php",
                data: {
                    goodsid: goodsid
                },
                dataType: "json",
                success: function(list) {
                    var html = "";
                    list.forEach(function(goods) {
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
                            goodsnum,
                        } = goods;
                        // ${location}&nbsp; ${brand}&nbsp;${goodsname}&nbsp;${kind}&nbsp;${weight}ml
                        html += `<div class="goods-text">
                                <span>首页</span> >
                                <span>${kind}</span> >
                                <span>${brand}</span> >
                                <span>${location}&nbsp; ${brand}&nbsp;${goodsname}&nbsp;${kind}&nbsp;${weight}ml</span>
                            </div>
                            <div class="goodsShow">
                                <div class="glass fl">
                                    <div class="goodsPic">
                                        <img src="${goodsimg}" alt="" class="goodsImg smallimg" data-img="${goodsimg}">
                                        <div id="shadow"></div>
                                        <div id="bigShadow">
                                            <img src="${goodsimg}" id="bigimg">
                                        </div>
                                    </div>
                                </div>
                                <div class="goodsItem fl " data-goodsname="${goodsname}"  data-goodsid="${goodsid}"
                                data-brand="${brand}"  data-dushu="${dushu}"  data-price="${price}" 
                                 data-discount="${discount}"  data-weight="${weight}"  data-kind="${kind}" 
                                 data-goodsimg="${goodsimg}"  data-location="${location}" data-year="${year}">
                                    <h3 class="goodsTitle">${location}&nbsp; ${brand}&nbsp;${goodsname}&nbsp;${kind}&nbsp;${weight}ml&nbsp;${year}年产&nbsp;${goodsid}&nbsp;浓度:${dushu}</h3>
                                    <div class="goodsMsg">
                                        <div class="goodsMsg-one">
                                            <span>活动价:</span>
                                            <span>￥<strong>${price}</strong></span>
                                        </div>
                                        <div class="goodsMsg-two">
                                            <span>领券:</span>
                                            <span>满300减50</span>
                                        </div>
                                        <div class="goodsMsg-three">
                                            <span>促销信息</span>
                                            <span>购酒优惠</span>
                                            <span>优惠￥<i>${discount}</i></span>
                                        </div>
                                    </div>
                                    <div class="upMsg">
                                        <div class="upMsg-one">
                                            <span>单笔订单不满100元,收运费10元</span>
                                            <span> <i class="icon iconfont"></i>满百包邮</span>
                                        </div>
                                        <div class="upMsg-two">
                                            <p>关注度 <em>31987</em></p>
                                            <span class="line"></span>
                                            <p>累计评价 <em>14</em></p>
                                            <span class="line"></span>
                                            <p>送积分 <em>${price}</em></p>
                                        </div>
                                        <div class="numBox">
                                            <div class="fl shu">数量:</div>
                                            <div class="numContent">
                                                <span class="reduce fl"></span>
                                                <input type="text fl" class="num" value="1">
                                                <span class="add fl">+</span>
                                            </div>
                                        </div>
                                        <div class="goods-kind">
                                            <div class="fl">包装类型:</div>
                                            <ul class="navTab">
                                                <li class="one active">精包装</li>
                                                <li class="two">普通包装</li>
                                            </ul>
                        
                                        </div>
                                        <div class="btnBox">
                                            <button class="btn rightNowBuy">立即购买</button>
                                            <button class="btn addCart">加入购物车</button>
                                        </div>
                                    </div>
                                </div>
                            </div> `;
                    })
                    $(".mainContent").html(html);
                }
            })
        }


        // 添加背景图片：
        $(document).delegate(".navTab li", "click", function() {
            $(this).addClass("active").siblings().removeClass("active");
        })

        // 操作商品数量
        // - 
        $(document).delegate(".reduce", "click", function() {
            var numVal = $(".num").val() * 1;

            if (numVal <= 2) {
                $(".reduce").html("");
                $(".num").val(1);
                $(".reduce").onclick = null;
            } else {
                numVal--;
                $(".num").val(numVal);
                if ($(".num").val(numVal) <= 1) {
                    $(".reduce").html("");
                    $(".num").val(1);
                }
            }
        })

        //+
        $(document).delegate(".add", "click", function() {
            var numVal = $(".num").val();

            numVal++;
            $(".num").val(numVal);
            if (numVal >= 2) {
                $(".reduce").html("-");
            }
        })

        // 动态生成商品信息：

        //放大镜：
        //2.1 图片的出现
        $(document).delegate(".goodsPic", "mouseover", function(e) {
            $("#shadow").show();
            $("#bigShadow").show();
        });
        // 2.1图片的隐藏
        $(document).delegate(".goodsPic", "mouseout", function(e) {
            $("#shadow").hide();
            $("#bigShadow").hide();
        });

        // 2.4遮罩层与右侧图片的的移动
        $(document).delegate(".goodsPic", "mouseover", function(e) {
            var evt = window.event || e;
            var pageX = evt.pageX;
            var pageY = evt.pageY;

            var x = pageX - $(".goodsPic").offset().left - ($("#shadow").width() / 2)
            var y = pageY - $(".goodsPic").offset().top - ($("#shadow").height() / 2)
            if (x <= 0) {
                x = 0
            }
            if (x > $(this).width() - $("#shadow").width()) {
                x = $(this).width() - $("#shadow").width()
            }
            if (y <= 0) {
                y = 0
            }
            if (y > $(this).height() - $("#shadow").height()) {
                y = $(this).height() - $("#shadow").height()
            }

            $("#shadow").css({
                "left": x,
                "top": y
            })
            var bigX = x / ($(".goodsPic").width() - $("#shadow").width())
            var bigY = y / ($(".goodsPic").height() - $("#shadow").height())
            $("#bigShadow img").css({
                "left": -bigX * ($("#bigShadow img").width() - $("#bigShadow").width()),
                "top": -bigY * ($("#bigShadow img").height() - $("#bigShadow").height()),
            })

            $("#bigShadow").css({
                "left": x,
                "top": y
            })
        })


        // 立即购买：
        $(document).delegate(".rightNowBuy", "click", function() {
            var goodsname = $(".goodsItem").attr("data-goodsname");
            var goodsid = $(".goodsItem").attr("data-goodsid");
            var brand = $(".goodsItem").attr("data-brand");
            var dushu = $(".goodsItem").attr("data-dushu");
            var price = $(".goodsItem").attr("data-price");
            var discount = $(".goodsItem").attr("data-discount");
            var weight = $(".goodsItem").attr("data-weight");
            var kind = $(".goodsItem").attr("data-kind");
            var goodsimg = $(".goodsItem").attr("data-goodsimg");
            var location = $(".goodsItem").attr("data-location");
            var year = $(".goodsItem").attr("data-year");
            var goodsnum = $(".num").val();
            getData(goodsname, goodsid, brand, dushu, price, discount, weight, kind, goodsimg, location, year, goodsnum);
            // cartNum();
        })

        function getData(goodsname, goodsid, brand, dushu, price, discount, weight, kind, goodsimg, location, year, goodsnum) {
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
                        goodsnum: goodsnum,
                    },
                    dataType: "json",
                    success: function(obj) {
                        if (obj["code"] == 1) {
                            // 加入购物车时重新加载商品列表中购物车的信息
                            cartNum();
                            if (confirm("商品已成功加入购物车,是否进入购物车")) {
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


        // 加入购物车：
        $(document).delegate(".addCart", "click", function() {
            var goodsname = $(".goodsItem").attr("data-goodsname");
            var goodsid = $(".goodsItem").attr("data-goodsid");
            var brand = $(".goodsItem").attr("data-brand");
            var dushu = $(".goodsItem").attr("data-dushu");
            var price = $(".goodsItem").attr("data-price");
            var discount = $(".goodsItem").attr("data-discount");
            var weight = $(".goodsItem").attr("data-weight");
            var kind = $(".goodsItem").attr("data-kind");
            var goodsimg = $(".goodsItem").attr("data-goodsimg");
            var location = $(".goodsItem").attr("data-location");
            var year = $(".goodsItem").attr("data-year");
            var goodsnum = $(".num").val();
            addCart(goodsname, goodsid, brand, dushu, price, discount, weight, kind, goodsimg, location, year, goodsnum);
        })

        function addCart(goodsname, goodsid, brand, dushu, price, discount, weight, kind, goodsimg, location, year, goodsnum) {
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
                        goodsnum: goodsnum,
                    },
                    dataType: "json",
                    success: function(obj) {
                        if (obj["code"] == 1) {
                            // 加入购物车时重新加载商品列表中购物车的信息
                            cartNum();
                            alert(obj["msg"]);

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


        // 获取我的购物车商品的 总量：
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

        function userExit() {
            setCookie("username", "", -7);
            setCookie("loginId", "", -7);
            gotoLogin();
        }

        // 去登陆
        function gotoLogin() {
            setCookie("backUrl", window.location.href, 7);
            window.location.href = "../html/login.html";
        }

    })

}