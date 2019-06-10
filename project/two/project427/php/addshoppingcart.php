<?php
    @require_once("./config.php");
    $userid = $_GET["userid"];
    $username = $_GET["username"];
    $goodsname = $_GET["goodsname"];
    $goodsid = $_GET["goodsid"];
    $brand=$_GET["brand"];
    $dushu=$_GET["dushu"];
    $price = $_GET["price"];
    $discount=$_GET["discount"];
    $weight = $_GET["weight"];
    $kind = $_GET["kind"];
    $goodsimg = $_GET["goodsimg"];
    $location = $_GET["location"];
    $year = $_GET["year"];
    $goodsnum = $_GET["goodsnum"];

    $str = "select count(*) from mycart where userid=$userid and goodsid =$goodsid ";

    $result = mysql_query($str);

    $item = mysql_fetch_array($result);
    if($item[0]>0){
        // 用户购物车中已有该商品,直接更新商品数量
        $str1 = "update  mycart set goodsnum = goodsnum +$goodsnum where userid =$userid and goodsid=$goodsid";
    }else{
        // 用户购物车无该商品,新增商品数量及相关信息
        $str1 = "insert into mycart(userid,username,goodsname,goodsid,brand,dushu,price,discount,weight,kind,goodsimg,location,year,goodsnum) VALUES ($userid,'$username','$goodsname',$goodsid,'$brand',$dushu,'$price','$discount','$weight','$kind','$goodsimg','$location','$year',$goodsnum)";

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