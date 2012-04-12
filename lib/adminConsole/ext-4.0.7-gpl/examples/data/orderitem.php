<?php
$items = array(array(
        'id'=>1,
        'order_id'=>1,
        'product'=>'Chair',
        'price'=>13.43,
        'quantity'=>1
    ), array(
        'id'=>2,
        'order_id'=>1,
        'product'=>'Stool',
        'price'=>14.55,
        'quantity'=>2
    ), array(
        'id'=>3,
        'order_id'=>1,
        'product'=>'Table',
        'price'=>44.2,
        'quantity'=>1
    ),array(
        'id'=>4,
        'order_id'=>2,
        'product'=>'Chair',
        'price'=>13.43,
        'quantity'=>3
    ), array(
        'id'=>5,
        'order_id'=>2,
        'product'=>'Stool',
        'price'=>14.55,
        'quantity'=>6
    ), array(
        'id'=>6,
        'order_id'=>2,
        'product'=>'Table',
        'price'=>44.2,
        'quantity'=>2
    ), array(
        'id'=>7,
        'order_id'=>3,
        'product'=>'Chair',
        'price'=>13.43,
        'quantity'=>1
    ), array(
        'id'=>8,
        'order_id'=>3,
        'product'=>'Stool',
        'price'=>14.55,
        'quantity'=>2
    ),array(
        'id'=>9,
        'order_id'=>4,
        'product'=>'Table',
        'price'=>44.2,
        'quantity'=>1
    ), array(
        'id'=>10,
        'order_id'=>5,
        'product'=>'Stool',
        'price'=>14.55,
        'quantity'=>2
    ), array(
        'id'=>11,
        'order_id'=>5,
        'product'=>'Table',
        'price'=>44.2,
        'quantity'=>2
    ), array(
        'id'=>12,
        'order_id'=>6,
        'product'=>'Chair',
        'price'=>13.43,
        'quantity'=>2
    ), array(
        'id'=>13,
        'order_id'=>6,
        'product'=>'Stool',
        'price'=>14.55,
        'quantity'=>4
    ), array(
        'id'=>14,
        'order_id'=>6,
        'product'=>'Table',
        'price'=>44.2,
        'quantity'=>1
    )
);

echo json_encode($items);
?>