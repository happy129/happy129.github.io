<?php
    @require_once("./config.php");

    $skipnum = $_GET["skipnum"];
    $shownum = $_GET["shownum"];
    $str = "select *from goodslist limit $skipnum,$shownum";
    // echo $str;

    $result = mysql_query($str);
    $list = array();

    while($item = mysql_fetch_array($result)){
        $temp = array();
        $temp["id"] = $item["id"];
        $temp["goodsid"] = $item["goodsid"];
        $temp["goodsname"] = $item["goodsname"];
        $temp["brand"] = $item["brand"];
        $temp["dushu"] = $item["dushu"];
        $temp["price"] = $item["price"];
        $temp["discount"] = $item["discount"];
        $temp["weight"] = $item["weight"];
        $temp["kind"] = $item["kind"];
        $temp["goodsimg"] = $item["goodsimg"];
        $temp["location"] = $item["location"];
        $temp["year"] = $item["year"];
        $list[]=$temp;
    }
    echo json_encode($list);
?>