<?php
$orders = array(array(
        'id'=>1,
        'date'=>'2010-08-13',
        'customer_id'=>1
    ), array(
        'id'=>2,
        'date'=>'2010-07-14',
        'customer_id'=>1
    ), array(
        'id'=>3,
        'date'=>'2010-01-22',
        'customer_id'=>2
    ), array(
        'id'=>4,
        'date'=>'2010-11-06',
        'customer_id'=>2
    ), array(
        'id'=>5,
        'date'=>'2010-12-29',
        'customer_id'=>3
    ), array(
        'id'=>6,
        'date'=>'2010-03-03',
        'customer_id'=>3
    )
);

if (isset($_REQUEST['id'])) {
    $id = $_REQUEST['id'];
    foreach ($orders as &$order) {
        if ($order['id'] == $id) {
            echo json_encode($order);
            break;
        }
    }
} else {
    echo json_encode($orders);
}
?>