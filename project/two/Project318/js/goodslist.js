$(function() {
    var username = getCookie("username");
    if (username) {
        $(".register").attr("display", "none");
        $(".login").html(username + "已登录");
    }

    var pageIndex = 0;
    var shownum = 8;
    // 默认折扣与价格都是按升序排列
    var keywords = "";
    var discount = "asc";
    var prices = "asc";


    getPage();
    skipnum = pageIndex * shownum;
    getData(skipnum, keywords);

    function getPage() {
        $(document).delegate(".nextbtn", "click", function() {
            pageIndex++;
            skipnum = pageIndex * shownum;
            // getData(skipnum, keywords, discount, prices);
            getData(skipnum, keywords);
        });

        $(document).delegate(".prebtn", "click", function() {
            pageIndex--;
            skipnum = pageIndex * shownum;
            // getData(skipnum);
            getData(skipnum, keywords);

        });
    }

    $(document).delegate(".search-btn", "click", function() {
        var keywords = $(".search-text").val();
        getData(skipnum, keywords);


    })

    // $(document).delegate(".zhekou", "click", function() {

    //     // $(".discount").click(function() {
    //     var count = 0;
    //     count++;
    //     if (count % 2 == 1) {
    //         discount = "desc";
    //         var text = $(".zhekou").html("折扣升序");
    //         // console.log(text);
    //         $(".zhekou").html(text);
    //         getData(skipnum, keywords, discount);
    //     } else {
    //         discount = "asc";
    //         var text = $(".zhekou").html("折扣降序");
    //         $(".zhekou").html(text);
    //         getData(skipnum, keywords, discount);
    //     }
    //     // });
    // });
    // $(document).delegate(".prices", "click", function() {

    //     // $(".prices").click(function() {
    //     count++;
    //     if (count / 2 == 1) {
    //         prices = "desc";
    //         $(this).html() = "价格降序"
    //         getData(skipnum, keywords, discount, prices);

    //     } else {
    //         order = "asc";
    //         $(this).html() = "价格升序"
    //         getData(skipnum, keywords, discount, prices);
    //     }
    //     // });
    // })


    function getData(skipnum, keywords) {

        $.ajax({
            type: "get",
            url: "../php/goodslist.php",
            dataType: "json",
            data: {
                skipnum,
                keywords,
                // prices
                // prices,
                // way,
                // order,
            },
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
                    html += `<li secret="${id}">
                                <a href="" target="_blank" class="special-good  ">
                                    <div class="special-img">
                                        <img src="${imgsrc}" />
                                    </div>
                                    <p class="special-descr" title="益泡柑 代用茶 柑普茶 益泡·雅 大红柑  一级 方罐100g">${goodsname}&nbsp;&nbsp;${kinds}&nbsp;&nbsp;净含量:${weight}g&nbsp;&nbsp;等级:${rank}</p>
                                    <p class="special-alt" title="【库存较低，即将售罄】健身达人伴侣 维持好身材">产地:${localtion}+&nbsp;&nbsp;健身达人伴侣 维持好身材,商品编号${goodscode}</p>
                                    <p class="special-price">
                                        <span class="special-now-price">￥${newprices}</span>
                                        <del class="special-old-price">￥${marketprices}</del>
                                    </p>
                                </a>
                            </li>`;
                })
                $(".goodslist-content").html(html);
            }
        })

    };
    // }
    $(document).delegate(".goodslist-content li", "click", function() {
        var id = $(this).attr("secret");
        window.location.href = "goods.html?id=" + id;
    });

    var username = getCookie("username");
    if (username) {
        $(".register").attr("display", "none");
        $(".login").html(username + "已登录");
    }

});


// function buyGoods(id) {
//     // alert(id);
//     window.open = "goods.html?id="+ id;
//     // var id = location.search.split("=")[1];
// }