<?php
$total = $_POST["total"];
$items = array();
for ($i = 1; $i <= $total; ++$i) {
    array_push($items, array(
        'flex'=>1,
        'html'=>"Item $i"
    ));
}
echo json_encode($items);
?>