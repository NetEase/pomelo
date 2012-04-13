<?php
$customers = array(array(
        'id'=>1,
        'name'=>'Bread Barn',
        'phone'=>'8436-365-256'
    ), array(
        'id'=>2,
        'name'=>'Icecream Island',
        'phone'=>'8452-389-719'
    ), array(
        'id'=>3,
        'name'=>'Pizza Palace',
        'phone'=>'9378-255-743'
    )
);

if (isset($_REQUEST['id'])) {
    $id = $_REQUEST['id'];
    foreach ($customers as &$customer) {
        if ($customer['id'] == $id) {
            echo json_encode($customer);
            break;
        }
    }
} else {
    echo json_encode($customers);
}
?>