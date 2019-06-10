$(function() {
    var username = getCookie("username");
    if (username) {
        $(".register").attr("display", "none");
        $(".login").html(username + "已登录");
    }

    var arr = window.location.href.split("?");
    var arr1 = arr[1].split("=");
    var arr2 = arr1[1];
    var id = arr2;

    $.ajax({
        type: "get",
        url: "../php/goods.php",
        data: {
            id: id
        },
        dataType: "json",
        success: function(list) {
            var html = "";
            list.forEach(function(goods) {

                var {
                    id,
                    goodsname,
                    kinds,
                    localtion,
                    marketprices,
                    newprices,
                    discount,
                    weight,
                    goodscode,
                    rank,
                    imgsrc
                } = goods;
                html += `<div class="goods">
                    <div class="goods-content">
                        <div class="float-left" data-id="${goodscode}" data-kinds="${kinds}"
                        data-goodsname="${goodsname}" data-dizhi="${localtion}" data-oldprices="${marketprices}" 
                         data-newprices="${newprices}" data-discount="${discount}" data-weight="${weight}" 
                         data-rank="${rank}" data-imgsrc="${imgsrc}">
                            <ul class="s-img">
                                <li class="active"><img src="${imgsrc}" alt=""></li>
                                <li><img src="${imgsrc}" alt=""></li>
                                <li><img src="${imgsrc}" alt=""></li>
                                <li><img src="${imgsrc}" alt=""></li>
                                <li><img src="${imgsrc}" alt=""></li>
                            </ul>
                            <div class="b-img">
                                <div class="shadow"></div>
                                <div class="big-shadow">
                                    <img src="" alt="">

                                </div>
                                <ul class="imgsrc">
                                    <li class="active"><img src="${imgsrc}" alt=""></li>
                                    <li><img src="${imgsrc}" alt=""></li>
                                    <li><img src="${imgsrc}" alt=""></li>
                                    <li><img src="${imgsrc}" alt=""></li>
                                    <li><img src="${imgsrc}" alt=""></li>
                                </ul>
                            </div>
                        </div>
                        <div class="float-right">
                            <h1 class="g-title">${kinds}&nbsp;&nbsp;${goodsname}&nbsp;&nbsp;${localtion}&nbsp;&nbsp;${rank}</h1>
                            <p class="g-scr">个人收藏，赠送亲友</p>
                            <div class="height-1"></div>
                            <dl>
                                <dt>
                                    <div class="g-scj">市场价<span class="old-price">￥<del>${marketprices}</del></span></div>
                                </dt>
                                <dd>
                                    <div class="new-price">
                                        折扣价：<span class="xj">￥${newprices}</span>
                                    </div>
                                </dd>
                                <dd>
                                    <div class="g-cx">
                                        促销：
                                        <div class="cx-top">
                                            <div class="icon-text">包邮</div>
                                            <div class="content-text">全场在线支付满59元免运费</div>
                                        </div>
                                        <div class="cx-bottom">
                                            <div class="icon-text">直降</div>
                                            <div class="content-text">已优惠<b class="yh">${discount}</b> 元</div>
                                        </div>
                                    </div>
                                </dd>
                                <dd>
                                    <div class="height-1"></div>
                                </dd>
                                <dd>
                                    <div class="pp">
                                        <ul>
                                            <li><span class="g-hl">品牌</span><span class="g-con">其他品牌</span></li>
                                            <li><span class="g-hl">净含量</span><span class="g-con">${weight}克</span></li>
                                            <li><span class="g-hl">商品编号</span><span class="g-con">${goodscode}</span></li>
                                        </ul>
                                    </div>
                                </dd>
                                <dd>
                                    <div class="height-1"></div>
                                </dd>
                                <dd>
                                    <div class="sl">
                                        数量：
                                        <button class="jian">-</button>
                                        <input type="text" class="text-num" value="1">
                                        <button class="plus">+</button>
                                    </div>
                                </dd>
                                <dd>
                                    <div class="g-cart" id="add-btn">
                                        <i class="iconfont icon-gouwuche"></i>
                                        加入购物车 
                                    </div>
                                    <div class="g-cart" id="go-cart">
                                        进入购物车结算 
                                    </div>
                                </dd>
                                <dd>
                                    <div class="height-1"></div>
                                </dd>
                                <dd>
                                    <div class="g-fw">
                                        <ul>
                                            <li>90天商品保价</li>
                                            <li>30天无理由退货</li>
                                        </ul>
                                    </div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>`;
            })
            $(".goods").html(html);
        }
    });

    $(document).delegate("#add-btn", "click", function() {
        var goodsname = $(".float-left").attr("data-goodsname");
        var goodscode = $(".float-left").attr("data-id");
        var kinds = $(".float-left").attr("data-kinds");
        var localtion = $(".float-left").attr("data-dizhi");
        var marketprices = $(".float-left").attr("data-oldprices");
        var newprices = $(".float-left").attr("data-newprices");
        var imgsrc = $(".float-left").attr("data-imgsrc");
        var rank = $(".float-left").attr("data-rank");
        var discount = $(".float-left").attr("data-discount");
        var weight = $(".float-left").attr("data-weight");
        getData(username, goodscode, goodsname, imgsrc, rank, localtion, weight, kinds, discount, newprices);

    })

    function getData(username, goodscode, goodsname, imgsrc, rank, localtion, weight, kinds, discount, newprices) {
        var username = getCookie("username");
        console.log(username);
        if (username) {
            //加入到购物车
            $.ajax({
                type: "get",
                url: "../php/mycart.php",
                data: {
                    username: username,
                    goodscode: goodscode,
                    goodsname: goodsname,
                    imgsrc: imgsrc,
                    rank: rank,
                    localtion: localtion,
                    weight: weight,
                    kinds: kinds,
                    discount: discount,
                    newprices: newprices,
                    num: 1
                },
                dataType: "json",
                success: function(data) {
                    if (data["code"] == 1) {
                        if (confirm("加入成功 是否立即结算")) {
                            location.href = "cart.html";
                        }

                    } else {
                        alert(data["msg"]);
                        location.href = "cart.html";
                    }

                }
            })
        } else {
            // 跳转登录页面
            setCookie("backUrl", window.location.href, 7);
            window.location.href = "login.html";
            gotoLogin();
        }
    }
    // 绑定未来事件;
    //1.图片切换：
    $(document).delegate(".s-img>li", "mouseenter", function() {
        // $(".s-img>li").mouseenter(function() {
        // 1.1为选中的li添加类，去除其他兄弟的类
        $(this).addClass("active").siblings().removeClass("active");
        // 1.2获取选择元素的下标
        var index = $(this).index();
        // console.log(index);
        $(".b-img>ul li").eq(index).addClass("active").siblings().removeClass("active");

        // 方法二：
        // var li = $(".b-img>ul li").eq(index);
        // console.log(li);
        // li.siblings().removeClass("active");
        // li.addClass("active");

    });

    // 2.放大镜：
    // 2.1图片的出现
    $(document).delegate(".b-img", "mouseover", function(e) {

        // $(".b-img").mouseover(function(e) {
        $(".shadow").show();
        $(".big-shadow").show();
        // values: e.clientX, e.clientY, e.pageX, e.pageY
        // });
    });
    // 2.1图片的隐藏
    $(document).delegate(".b-img", "mouseout", function(e) {

        // $(".b-img").mouseout(function() {
        $(".shadow").hide();
        $(".big-shadow").hide();
        // });
    });


    // 2.3右侧大图的切换
    $(document).delegate(".b-img  li img", "mouseover", function(e) {

            // $(".b-img  li img").mouseover(function() {
            var bigImgSrc = $(this).attr("src");
            $(".big-shadow img").attr("src", bigImgSrc);
            // });
        })
        // 2.4遮罩层与右侧图片的的移动
    $(document).delegate(".b-img", "mouseover", function(e) {

        // $(".b-img").mousemove(function(e) {
        var evt = window.event || e;
        var pageX = evt.pageX;
        var pageY = evt.pageY;

        var x = pageX - $(".b-img").offset().left - ($(".shadow").width() / 2)
        var y = pageY - $(".b-img").offset().top - ($(".shadow").height() / 2)
        if (x <= 0) {
            x = 0
        }
        if (x > $(this).width() - $(".shadow").width()) {
            x = $(this).width() - $(".shadow").width()
        }
        if (y <= 0) {
            y = 0
        }
        if (y > $(this).height() - $(".shadow").height()) {
            y = $(this).height() - $(".shadow").height()
        }

        $(".shadow").css({
            "left": x,
            "top": y
        })
        var bigX = x / ($(".b-img").width() - $(".shadow").width())
        var bigY = y / ($(".b-img").height() - $(".shadow").height())
        $(".big-shadow img").css({
            "left": -bigX * ($(".big-shadow img").width() - $(".big-shadow").width()),
            "top": -bigY * ($(".big-shadow img").height() - $(".big-shadow").height())
        })

        // })
    })

    // 3.购物车的操作：(+ -按钮的操作)
    $(document).delegate(".jian", "click", function(e) {

        // $(".jian").click(function() {
        var inputVal = $(".text-num").val() * 1;
        if (inputVal <= 1) {
            $(".jian").css({ "disabled": "true", "backgroundColor": "#fff" });
        } else {
            inputVal--;
            $(".text-num").val(inputVal);
            console.log(inputVal);
        }
        // })
    })
    $(document).delegate(".plus", "click", function(e) {

        // $(".plus").click(function() {
        var inputVal = $(".text-num").val() * 1;
        inputVal++;
        $(".text-num").val(inputVal);
        console.log(inputVal);
        // })
    })

    // 点击加入购物车  先判断用户是否已经登陆：
    // $("#add-btn")



    function userExist() {
        setCookie("loginName", "", -7);
        setCookie("loginId", "", -7);
        gotoLogin();
    }

    function gotoLogin() {
        setCookie("backUrl", window.location.href, 7);
        window.location.href = "login.html";
    }
});