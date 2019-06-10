<?php
    @require_once("../config.php");

    $str = "select * from userinfo ";//准备好要执行的sql语句

    $result = mysql_query($str);     //执行sql语句

    $list = array();

    while($item = mysql_fetch_array($result)){
        $obj = array();
        $obj["id"] = $item["id"];
        $obj["username"] = $item["username"];
        $obj["userpwd"] = $item["username"];
        $obj["usertel"] = $item["usertel"];
        $list[] = $obj;

    }

    echo json_encode($list);
?>