<?php
// 使用php下标连接数据库
    @require_once("../config.php");

    // 接收前端界面传递过来的参数
    $key = $_GET["key"];
    $username = $_GET["username"];
    $id = $_GET["id"];
    $select = $_GET["select"];
    // $tatol = $_GET["tatol"];

    // 查询(模糊匹配)
    // $str = "select *from userinfo where type =0 and username like '%$key%' order by $order $ways limit $tatol,$selected";
    $str = "select *from userinfo where type =0 and username like '%$key%' order by id $id , username $username limit $select";
    // echo $str;
    // 执行SQL语句
    $result = mysql_query($str);
    // 声明一个集合用来存储传递的参数值
    $obj = array();
    while($item = mysql_fetch_array($result,MYSQL_ASSOC)){
        $temp  = array();//对象
        $temp["id"] = $item["id"];
        $temp["username"] = $item["username"];
        $temp["userpwd"] = $item["userpwd"];
        $temp["usertel"] = $item["usertel"];
        // 去除冗余  筛选指定的字段
        $obj[] = $temp;
    }
    echo json_encode($obj);
?>