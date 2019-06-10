// $(function() {

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
                        <div class="float-left">
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
                                <ul>
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
                                    <div class="g-cart"><i class="iconfont icon-gouwuche"></i>加入购物车 </div>
                                </dd>
                                <dd>
                                    <div class="height-1"></div>
                                </dd>
                                <dd>
                                    <div class="g-fw">
                                        <ul>
                                            <li>服务</li>
                                            <li>90天商品保价</li>
                                            <li>30天无理由退货</li>
                                            <li>10分钟极速退款</li>
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
// })