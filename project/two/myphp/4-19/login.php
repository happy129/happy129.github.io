<?php
    require_once("../config.php");
    // 接收用户名/密码两个参数
    $username = $_GET["username"];
    $userpwd = $_GET["userpwd"];

    //查询用户 
    $str = "select * from userinfo where username = '$username' or usertel = '$username' ";
    // 执行sql语句
    $result = mysql_query($str);
    // 从结果集中取得一行作为关联数组,或数字数组
    $item = mysql_fetch_array($result);
    // 新建一个对象用来存储数据
    $obj = array();
    // 
    if($item){
        // 判断数据库中密码与输入密码是否一致；
        if($item["userpwd"]==$userpwd){
            $obj["code"]=1;
            $obj["msg"] = '登录成功';
        }else{
            $obj["code"] = 0;
            $obj["msg"] = '登录失败,用户名与密码不匹配';
        }
    }else{
        $obj["code"] = 0;
        $obj["msg"] = '用户名不存在,请重新登录';
    }

    echo json_encode($obj);

    // select  *  from  userinfo where  username like '%l%'  ORDER BY id  desc
?>