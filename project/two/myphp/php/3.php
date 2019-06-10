<?php
    @header("content-Type:text/html;charset=utf-8");
    for($i=1;$i<10;$i++){
        for($j=1;$j<=$i;$j++){

            echo $j.'X'.$i.'='.($i*$j).'&nbsp;&nbsp;&nbsp;&nbsp;';
        }
        echo '<br/>';
    }
?>