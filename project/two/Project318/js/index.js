$(function() {
    /**
     * 1.轮播图的切换:
     */
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
    $(".hd li").mousemove(function() {
        $(this).addClass("active").siblings().removeClass("active");
        index = $(this).index();
        $(".hd li").eq(index).stop().fadeIn(1000).siblings().stop().fadeOut(500);
    });
    /*设置每一秒钟自动轮播：
    1.获取当前位置序号：自加操作；当超过图片最大序号时序号设置为0
    2.设置下侧顺序按钮及轮播图显示
    */
    var time = setInterval(move, 5000);

    function move() {
        index++;
        if (index == 6) {
            index = 0
        }
        $(".hd li").eq(index).addClass("active").siblings().removeClass("active");
        $(".bd li").eq(index).stop().fadeIn(100).siblings().stop().fadeOut(100);
    };
    /*当鼠标划入、划出轮播图区域时：
    1.划入时停止自动轮播
    2.划出时继续自动轮播
    */
    $(".slide-box").hover(function() {
            clearInterval(time);
        },

        function() {
            time = setInterval(move, 5000);
        });



    /**
     * 1.轮播图的切换:
     */

    /**
     * 2.右侧定位:
     */


    /**
     * 2.右侧定位:
     */

    /**
     * 3.菜单
     */
    $(".list-info dl").hover(function() {
        $(this).find(".conmmon-list").css("display", "block");
    }, function() {
        $(this).find(".conmmon-list").css("display", "none");
    });


    /**
     * 3.菜单
     */

    /**
     * 4.判断用户是否已经登陆
     */
    // var loginId = getCookie("loginId");
    // if (loginId) {
    //     var loginName = getCookie("loginName");
    //     $(".login").html('<li class="account login"><span>${loginName}</span><span onclick="userExist">点击退出</span> </li>')
    // } else {
    //     // $(".login").html('<span onclick="gotoLogin()">点击登录</span>');
    // }

    // function userExist() {
    //     setCookie("loginName", "", -7);
    //     setCookie("loginId", "", -7);
    //     gotoLogin();
    // }

    // function gotoLogin() {
    //     setCookie("backUrl", window.location.href, 7);
    //     window.location.href = "login.html";
    // }

    var username = getCookie("username");
    if (username) {
        $(".register").attr("display", "none");
        $(".login").html(username + "已登录");
    }


    var flag = true //设置标识。防止出现跑马灯
    $(".floor li").click(function() {
        flag = false
        $(this).addClass("active").siblings().removeClass("active")
        var index = $(this).index() //获取当前点击元素的索引
        var top = $(".banner").eq(index).offset().top; //获取每个banner到顶部的距离
        $("html,body").stop(true).animate({ "scrollTop": top }, function() { flag = true })
    })

    //			滚轮滑动切换楼层
    $(window).scroll(function() {
        if (flag) {
            //浏览器可视窗口的一半，也可以根据自己需求设定
            var winH = $(window).innerHeight() / 2;
            var scrollT = $(window).scrollTop()
            var len = $(".banner").size()
            for (var i = 0; i < len; i++) {
                //注意这里banner对象加了i之后变成了js对象,所以用offsetTop
                var bannerGap = $(".banner")[i].offsetTop - scrollT
                if (bannerGap < winH) {
                    $(".floor li").eq(i).addClass("active").siblings().removeClass("active")
                }
            }
        }
    })

})