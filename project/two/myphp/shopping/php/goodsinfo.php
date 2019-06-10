<?php
    @require_once("../config.php");

    $skipnum = $_GET["skipnum"];
    $shownum = $_GET["shownum"];
    $str = "select *from goodsinfo  limit $skipnum,$shownum";

    $result = mysql_query($str);
    $list = array();

    while($item = mysql_fetch_array($result)){
        $temp = array();
        $temp["id"] = $item["id"];
        $temp["goodsname"] = $item["goodsname"];
        $temp["goodsid"] = $item["goodsid"];
        $temp["goodsimg"] = $item["goodsimg"];
        $temp["goodsnum"] = $item["goodsnum"];
        $temp["goodsprices"] = $item["goodsprices"];
        $list[]=$temp;
    }
    echo json_encode($list);
?>