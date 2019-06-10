<?php
    @require_once("./config.php");
    $userid = $_GET["userid"];
    
    $str = "select * from mycart where userid =$userid";
    $result = mysql_query($str);
    // echo $str;
    $list = array();

    while($item = mysql_fetch_array($result)){
        $obj = array();
        $obj["id"] = $item["id"];
        $obj["goodsid"] = $item["goodsid"];
        $obj["goodsname"] = $item["goodsname"];
        $obj["brand"] = $item["brand"];
        $obj["goodsimg"] = $item["goodsimg"];
        $obj["price"] = $item["price"];
        $obj["kind"] = $item["kind"];
        $obj["weight"] = $item["weight"];
        $obj["dushu"] = $item["dushu"];
        // $obj["kind"] = $item["kind"];
        $obj["discount"] = $item["discount"];
        $obj["goodsnum"] = $item["goodsnum"];
        $list[] = $obj;
    }
    echo json_encode($list);
    
?>