<?php
    @require_once("config.php");

    //注册页面接收三个参数:
    $username = $_GET["username"];
    $userpwd = $_GET["userpwd"];
    $useremail= $_GET["useremail"];

    // sql语句判断用户名与电话号码
    $str = "select count(*) from userreg where username = '$username'";
    $result = mysql_query($str);

    $item = mysql_fetch_array($result);

    $obj = array();
    // sql语句判断用户名与电话号码是否有重复的
    // if($item){
    //     $existUserName = $item["username"];
    //     if($existUserName==$username){

    //         $obj["code"]=0;
    //         $obj["msg"]="用户名已经注册,请重新输入用户名";
    //     }
    if($item[0]>0){//有数据
        $obj["code"] = 0;
        $obj["msg"] = "用户名或者手机号已经存在";
    }
        else{
            //由于数据库中设置username  userpwd  usertel 等三个字段均是为字符串类型的  所以要加'';
            $str = "insert into userreg(username,userpwd,useremail) values ('$username','$userpwd','$useremail')";
            mysql_query($str);
    
            $count = mysql_affected_rows();//受影响的行;
            if($count>0){
                $obj["code"]=1;
                $obj["msg"] = "注册成功";
            }else{
                $obj["code"]=0;
                $obj["msg"] = "注册失败";
            }
            
        }
    // }
    echo json_encode($obj);
?>