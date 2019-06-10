<?php
    @require_once("../config.php");
    $username = $_GET["username"];
    $userpwd = $_GET["userpwd"];
    $usertel = $_GET["usertel"];

    // 注册新用户之前要先判断用户是否已注册,先查询，后新增
    $str = "select count(*) from userinfo where username = '$username' or usertel='$usertel'";
    // echo $str;
    // 执行SQL语句，
    $result = mysql_query($str);//执行sql语句

    // 
    $item = mysql_fetch_array($result);
    // echo $item;

    $obj = array();            //定义一个对象接收返回的数据
    if($item[0]>0){
        $obj["code"] = 0;
        $obj["msg"] = "该用户已经注册过,请重新注册";
    }else{
        $str = "insert into userinfo (username,userpwd,usertel) values ('$username','$userpwd','$usertel')";
        // 执行sql语句；新增用户
        mysql_query($str);
        $count = mysql_affected_rows();//返回受影响的行数
        // 判断受影响的行数是否大于0
        if($count>0){
            $obj["code"] = 1;
            $obj["msg"] = "注册成功";
        }else{
            $obj["code"] = 0;
            $obj["msg"] = "注册失败";
        }   
    }
    echo json_encode($obj);
?>