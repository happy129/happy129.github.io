<?php
    @require_once("../config.php");
    $userid = $_GET["userid"];
    $username = $_GET["username"];
    $goodsid = $_GET["goodsid"];
    $goodsnum = $_GET["goodsnum"];
    $goodsname = $_GET["goodsname"];
    $goodsprices = $_GET["goodsprices"];
    $goodsimg = $_GET["goodsimg"];


    $str = "select count(*) from mycart where userid=$userid and goodsid =$goodsid";
    // echo $str;

    $result = mysql_query($str);

    $item = mysql_fetch_array($result);
    if($item[0]>0){
        // 用户购物车中已有该商品,直接更新商品数量
        $str1 = "update  mycart set goodsnum = goodsnum +$goodsnum where userid =$userid and goodsid=$goodsid";
    }else{
        // 用户购物车无该商品,新增商品数量及相关信息
        $str1 = "insert into mycart(userid,username,goodsid,goodsname,goodsnum,goodsprices,goodsimg) VALUES ($userid,'$username',$goodsid,'$goodsname',$goodsnum,'$goodsprices','$goodsimg')";
    }
    // 执行str1命令
    mysql_query($str1);
    // echo $str1;
    // 计算受影响行数
    $count = mysql_affected_rows();

    $obj= array();

    if($count>0){
        $obj["code"]=1;
        $obj["msg"] = "加入成功";
    }else{
        $obj["code"]=0;
        $obj["msg"]= "加入失败" ;
    }
    
    echo json_encode($obj);
?>