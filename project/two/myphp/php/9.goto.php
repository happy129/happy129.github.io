<?php
    @header("content-Type:text/html;charset=utf-8");
    for($i=0;$i<100;$i++){
        echo '第'.$i.'周往返北京武汉<br/>';
        if($i == 17){
            goto end;
        }
    }
    end:
    echo '集团倒闭了';
?>