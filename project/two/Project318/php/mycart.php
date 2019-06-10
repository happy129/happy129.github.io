<?php
    @require_once("./config.php");

    $username = $_GET["username"];
    $goodscode = $_GET["goodscode"];
    $num = $_GET["num"];
    $goodsname=$_GET["goodsname"];
    $imgsrc=$_GET["imgsrc"];
    // $prices=$_GET["prices"];

    $str = "select  count(*) as count FROM  mycart  mc where  mc.username = '$username' and mc.goodscode='$goodscode'";

    $result = mysql_query($str);//执行  就会有结果

    $item = mysql_fetch_array($result);//解析出一个array

    if($item["count"]>0){//表示:该人已经购买过了该商品
    //更新
    $str = "update  mycart SET num = num+$num where  username = $username and goodscode=$goodscode";
    }else{
    //新增
    // $str = "insert INTO mycart(goodscode,goodsname,imgsrc,prices,num,username) VALUES($goodscode,'$goodsname','$imgsrc','$prices',$num,$username)";
    $str = "insert INTO mycart(goodscode,goodsname,imgsrc,num,username) VALUES('$goodscode','$goodsname','$imgsrc',$num,'$username')";
    }

    mysql_query($str);

    $count = mysql_affected_rows();//判断受影响的行数
    // echo $count;
    $obj= array();
    if($count>0){
        $obj["code"] = 1;
        $obj["msg"] = "购买成功";
    }else{
        $obj["code"] =0;
        $obj["msg"] = "购买失败";
    }
    echo json_encode($obj);
?>