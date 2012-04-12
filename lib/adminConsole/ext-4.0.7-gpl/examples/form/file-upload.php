<?php
    sleep(1);
    echo '{success:true, file:'.json_encode($_FILES['photo-path']['name']).'}';
?>