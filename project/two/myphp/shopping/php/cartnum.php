<?php
    @require_once("../config.php");

    $userid = $_GET["userid"];

    $str = "select sum(goodsnum) as sum from mycart where userid=$userid";

    // echo $str;
    $result = mysql_query($str);
    $item = mysql_fetch_array($result);
    $obj = array();
    $obj["code"] =1;
    $obj["sum"] = $item["sum"];

    echo json_encode($obj);
?>