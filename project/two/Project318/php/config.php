<?php
    @header("Access-Control-Allow-Origin:*");//跨域
    @header("content-type:text/html;charset=utf8");
    mysql_connect("localhost:3306","root","root");//你们的是3306
    mysql_select_db("project1");//表示选择的执行的数据库
    mysql_query("set character set 'utf8'"); //设置执行语句的编码格式  防止中文乱码

    // @header("Access-Control-Allow-Origin:*");//跨域
    // @header("content-type:text/html;charset=utf8");
    // mysql_connect("b-1oopygizr9z2uj.bch.rds.gz.baidubce.com:3306","b_1oopygizr9z2uj","2kYeVO6R4lh7gMSx");//你们的是3306
    // mysql_select_db("b_1oopygizr9z2uj");//表示选择的执行的数据库
    // mysql_query("set character set 'utf8'"); //设置执行语句的编码格式  防止中文乱码
	
?>