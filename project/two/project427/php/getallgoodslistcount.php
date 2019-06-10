<?php
    @require_once("./config.php");

    $str = "select count(*) from goodslist";

    $result = mysql_query($str);

    $item = mysql_fetch_array($result);

    $obj = array();

    $obj["count"] = $item[0];
    echo json_encode($obj);
?>