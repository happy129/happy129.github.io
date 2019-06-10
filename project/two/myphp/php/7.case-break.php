<?php
    @header("content-Type:text/html;charset=utf-8");

    $tool = rand(1,8);
    switch($tool){
        case 1:
            echo '用腿儿---步行';
            break;
        case 2:
            echo 'K字头---火车';
            break;
        case 3:
            echo '打个飞的---飞机';
            break;
        case 4:
            echo '轮船';
            break;
        case 5:
            echo '绿色出行---自航车';
            break;
        case 6:
            echo '高品质生活---自驾游';
            break;
        case 7:
            echo '国家复兴---和谐号';
            break;
        case 8:
            echo '非一般的感觉---复兴号';
            break;
    }
?>