<?php
    @header("content-Type:text/html;charset=utf-8");
    function test( $arg = 10){
    echo $arg;
    }
    test();
    echo "<br/>";
    test(88);
?>