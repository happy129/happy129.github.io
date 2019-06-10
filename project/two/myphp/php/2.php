<?php
    @header("content-Type:text/html;charset=utf-8");

    for($i=0,$sum=0;$i<=100;$i++){
        $sum += $i;
        // echo $sum;
    }
    
    echo "1-100的和为:";
    echo $sum;
    // echo "1-100的和为"+$sum;
?>