<?php
    @require_once("../config.php");
    $userid = $_GET["userid"];
    
    $str = "select * from mycart where userid =$userid";
    $result = mysql_query($str);
    // echo $str;
    $list = array();

    while($item = mysql_fetch_array($result)){
        $obj = array();
        $obj["id"] = $item["id"];
        $obj["goodsid"] = $item["goodsid"];
        $obj["goodsnum"] = $item["goodsnum"];
        $obj["goodsname"] = $item["goodsname"];
        $obj["goodsprices"] = $item["goodsprices"];
        $obj["goodsimg"] = $item["goodsimg"];
        $list[] = $obj;
    }
    echo json_encode($list);
    
?>