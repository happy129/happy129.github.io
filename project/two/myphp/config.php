<?php

    @header("content-type:text/html;charset=utf-8");//防止中文字符串乱码
    @header("Access-Control-Allow-Origin:*");       //解决跨域问题

    mysql_connect("localhost:3306","root","root");  //链接到数据库端口号、用户名与密码
    mysql_select_db("1901");                     //选择要连接的数据库
    mysql_query("set character set 'utf8'");
?>