<?php
    @require_once("./config.php");

    $skipnum = $_GET["skipnum"];
    $keywords = $_GET["keywords"];
    // $discount = $_GET["discount"];
    // $prices = $_GET["prices"];
    // $discount = $_GET["discount"];
    // $str = "select  * from  goodslist order by prices $prices limit $skipnum,8";
    // $str = "select  * from  goodslist  limit $skipnum,8";
    $str = "select  * from  goodslist  where  kinds like '%$keywords%' limit $skipnum,8";
    // $str = "select  * from  goodslist  where goodsname like '%$keywords%' or kinds like '%$keywords%' order by discount='$discount' limit $skipnum,8";
    // $str = "select  * from goodslist where goodsname like '%$keywords%' or kinds like '%$keywords%' order by '$discount' and $prices limit $skipnum,8";
    // echo $str;
    $result = mysql_query($str);

    $list = array();

    while($item = mysql_fetch_array($result)){
        $temp = array();
        $temp["id"]=$item["id"];
        $temp["goodsname"]=$item["goodsname"];
        $temp["kinds"]=$item["kinds"];
        $temp["localtion"]=$item["localtion"];
        $temp["marketprices"]=$item["marketprices"];
        $temp["newprices"]= $item["newprices"];
        $temp["discount"]=$item["discount"];
        $temp["weight"]=$item["weight"];
        $temp["goodscode"]=$item["goodscode"];
        $temp["rank"]=$item["rank"];
        $temp["imgsrc"]=$item["imgsrc"];
        $list[] = $temp;
    }
    echo  json_encode($list);
?>