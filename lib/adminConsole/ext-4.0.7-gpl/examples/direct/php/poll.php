<?php
echo json_encode(array(
    'type'=>'event',
    'name'=>'message',
    'data'=>'Successfully polled at: '. date('g:i:s a')
));
