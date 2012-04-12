<?php
    require('remote/init.php');

    // Get Request
    $request = new Request(array('restful' => true));

    // Get Controller
    require('remote/app/controllers/' . $request->controller . '.php');
    $controller_name = ucfirst($request->controller);
    $controller = new $controller_name;

    // Dispatch request
    echo $controller->dispatch($request);

