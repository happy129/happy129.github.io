$(function() {
        // 轮播图
        /*定义位置：由于图片个数与下侧顺序按钮数量一致，可通过位置进行关联*/
        var index = 0;
        /*当鼠标放到顺序按钮上时：
        1.将当前这个顺序按钮增加样式为红色背景
        2.移除周围其他同级元素红色背景样式
        3.获取当前顺序按钮的index
        4.通过index获取该位置图片
        5.一秒钟渐入该图片
        6.一秒钟渐出其他相邻图片
        7.防止移动过快导致的效果闪现，使用stop方法
        */
        $(".banner-num li").mousemove(function() {
            $(this).addClass("banner-current").siblings().removeClass("banner-current");
            index = $(this).index();
            $(".banner-img li").eq(index).stop().fadeIn(1000).siblings().stop().fadeOut(1000);
        });
        /*设置每一秒钟自动轮播：
        1.获取当前位置序号：自加操作；当超过图片最大序号时序号设置为0
        2.设置下侧顺序按钮及轮播图显示
        */
        var time = setInterval(move, 3000);

        function move() {
            index++;
            if (index == 6) {
                index = 0
            }
            $(".banner-num li").eq(index).addClass("banner-current").siblings().removeClass("banner-current");
            $(".banner-img li").eq(index).stop().fadeIn(1000).siblings().stop().fadeOut(2000);
        };
        /*当鼠标划入、划出轮播图区域时：
        1.划入时停止自动轮播
        2.划出时继续自动轮播
        */
        $(".banner-outer").hover(function() {
                clearInterval(time);
            },
            function() {
                time = setInterval(move, 2000);
            });
        /*点击右侧按钮时执行*/
        $(".right_btn").click(function() {
            move();
        });
        /*点击左侧按钮时执行*/
        function moveL() {
            index--;
            if (index == -1) {
                index = 6
            }
            $(".banner-num li").eq(index).addClass("banner-current").siblings().removeClass("banner-current");
            $(".banner-img li").eq(index).stop().fadeIn(1000).siblings().stop().fadeOut(1000);
        }
        $(".left_btn").click(function() {
            moveL();
        });




        /**
         * 楼层效果
         */
        //			第一种点击li元素到相应的楼层的方法,可以直接用锚点的方式,然后加上点击后的效果
        //			$(".floor li").click(function(){
        //				$(this).addClass("active").siblings().removeClass("active")
        //			})

        //			第二种点击li元素到相应的楼层的方法，锚点要去掉
        var flag = true //设置标识。防止出现跑马灯
        $(".floor li").click(function() {
            flag = false
            $(this).addClass("active").siblings().removeClass("active")
            var index = $(this).index() //获取当前点击元素的索引
            var top = $(".shop").eq(index).offset().top; //获取每个banner到顶部的距离
            $("html,body").stop(true).animate({ "scrollTop": top }, function() { flag = true })
        })

        //			滚轮滑动切换楼层
        $(window).scroll(function() {
            if (flag) {
                //浏览器可视窗口的一半，也可以根据自己需求设定
                var winH = $(window).innerHeight() / 2;
                var scrollT = $(window).scrollTop()
                var len = $(".shop").size()
                for (var i = 0; i < len; i++) {
                    //注意这里banner对象加了i之后变成了js对象,所以用offsetTop
                    var shopGap = $(".shop")[i].offsetTop - scrollT
                    if (shopGap < winH) {
                        $(".floor li").eq(i).addClass("active").siblings().removeClass("active")
                    }
                }
            }
        });


        // 头部悬浮

        $(window).scroll(function() {
            var nav = $('.nav-note').offset().top - $(document).scrollTop()
            if (nav < -102) {
                $(".fixedSch_box").css("display", "block");
            } else {
                $(".fixedSch_box").css("display", "none")
            }
        });
        // 头部悬浮

        var loginId = getCookie("loginId");
        if (loginId) {
            var username = getCookie("username");
            $(".login").html("会员" + username);
            $(".register").html("退出登录")
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




        $(".shopCarBox").on("click", function() {
            window.location.href = "../html/mycart.html";
        })

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
    // 购物活动倒计时
showTime();

function showTime() {
    var time_start = new Date().getTime(); //设定当前时间
    var time_end = new Date("2019/05/12 00:00:00").getTime(); //设定目标时间
    // 计算时间差 
    var time_distance = time_end - time_start;
    // 天
    var int_day = Math.floor(time_distance / 86400000)
    time_distance -= int_day * 86400000;
    // 时
    var int_hour = Math.floor(time_distance / 3600000)
    time_distance -= int_hour * 3600000;
    // 分
    var int_minute = Math.floor(time_distance / 60000)
    time_distance -= int_minute * 60000;
    // 秒 
    var int_second = Math.floor(time_distance / 1000)
        // 时分秒为单数时、前面加零 
    if (int_day < 10) {
        int_day = "0" + int_day;
    }
    if (int_hour < 10) {
        int_hour = "0" + int_hour;
    }
    if (int_minute < 10) {
        int_minute = "0" + int_minute;
    }
    if (int_second < 10) {
        int_second = "0" + int_second;
    }
    // 显示时间 
    $("#time_d").val(int_day);
    $("#time_h").val(int_hour);
    $("#time_m").val(int_minute);
    $("#time_s").val(int_second);
    // 设置定时器
    setTimeout("showTime()", 1000);
}