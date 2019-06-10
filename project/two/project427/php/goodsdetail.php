<?php
    @require_once("./config.php");

    $goodsid = $_GET["goodsid"];

    
    $str = "select  * from  goodslist where goodsid=$goodsid";
    
    $result = mysql_query($str);

    $list = array();

    while($item = mysql_fetch_array($result)){
        $temp = array();
        $temp["goodsid"]=$item["goodsid"];
        $temp["goodsname"]=$item["goodsname"];
        $temp["brand"]=$item["brand"];
        $temp["dushu"]=$item["dushu"];
        $temp["price"]=$item["price"];
        $temp["discount"]=$item["discount"];
        $temp["weight"]=$item["weight"];
        $temp["kind"]= $item["kind"];
        $temp["goodsimg"]=$item["goodsimg"];
        $temp["location"]=$item["location"];
        $temp["year"]=$item["year"];
        $list[] = $temp;
    }
    echo  json_encode($list);
?>