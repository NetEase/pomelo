<?php
class TestAction {
    function doEcho($data){
        return $data;
    }

    function multiply($num){
        if(!is_numeric($num)){
            throw new Exception('Call to multiply with a value that is not a number');
        }
        return $num*8;
    }

    function getTree($id){
        $out = array();
        if($id == "root"){
        	for($i = 1; $i <= 5; ++$i){
        	    array_push($out, array(
        	    	'id'=>'n' . $i,
        	    	'text'=>'Node ' . $i,
        	    	'leaf'=>false
        	    ));
        	}
        }else if(strlen($id) == 2){
        	$num = substr($id, 1);
        	for($i = 1; $i <= 5; ++$i){
        	    array_push($out, array(
        	    	'id'=>$id . $i,
        	    	'text'=>'Node ' . $num . '.' . $i,
        	    	'leaf'=>true
        	    ));
        	}
        }
        return $out;
    }
    
    function getGrid($params){
        $sort = $params->sort[0];
        $field = $sort->property;
        $direction = $sort->direction;
        
        /*
         * Here we would apply a proper sort from the DB, but since
         * it's such a small dataset we will just sort by hand here.
         */
         
        if ($field == 'name') {
            $data = array(array(
                'name'=>'ABC Accounting',
                'turnover'=>50000
            ), array(
                'name'=>'Ezy Video Rental',
                'turnover'=>106300
            ), array(
                'name'=>'Greens Fruit Grocery',
                'turnover'=>120000
            ), array(
                'name'=>'Icecream Express',
                'turnover'=>73000
            ), array(
                'name'=>'Ripped Gym',
                'turnover'=>88400
            ), array(
                'name'=>'Smith Auto Mechanic',
                'turnover'=>222980
            ));
        } else {
            $data = array(array(
                'name'=>'ABC Accounting',
                'turnover'=>50000
            ), array(
                'name'=>'Icecream Express',
                'turnover'=>73000
            ), array(
                'name'=>'Ripped Gym',
                'turnover'=>88400
            ), array(
                'name'=>'Ezy Video Rental',
                'turnover'=>106300
            ), array(
                'name'=>'Greens Fruit Grocery',
                'turnover'=>120000
            ), array(
                'name'=>'Smith Auto Mechanic',
                'turnover'=>222980
            ));
        }
        if ($direction == 'DESC') {
            $data = array_reverse($data);
        }
        return $data;
    }
    
    function showDetails($data){
        $first = $data->firstName;
        $last = $data->lastName; 
        $age = $data->age;
        return "Hi $first $last, you are $age years old.";
    }
}
