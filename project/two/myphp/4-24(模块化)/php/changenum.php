<?php
    @require_once("../config.php");

    $id = $_GET["id"];
    $goodsnum = $_GET["goodsnum"];

    $str = "update mycart SET goodsnum = $goodsnum where id=$id";
    
    mysql_query($str);
    $count = mysql_affected_rows();

    $obj = array();
    if($count>0){
        $obj["code"]=1;
        $obj["msg"]="成功";
    }else{
        $obj["code"]=0;
        $obj["msg"]="失败";
    }
    echo json_encode($obj);
?>