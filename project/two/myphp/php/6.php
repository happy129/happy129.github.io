<?php
    @header("content-Type:text/html;charset=utf-8");
    //定义一个随机变量，抵达时间,随机0点至23点
    $dida = rand(0,23);
    if($dida > 6 && $dida < 10){
    echo '我爱泡澡';
    }else if($dida >10 && $dida < 14){
    echo '吃神户牛肉';
    }else if($dida >=19 && $dida < 22){
    echo '找一个朋友聊聊内心的寂寞';
    }elseif($dida > 22 && $dida <= 23){
    echo '泡澡';
    }elseif($dida >= 1 && $dida <3){
    echo '泡澡';
    }else{
    echo '睡觉或者工作';
    }
?>
