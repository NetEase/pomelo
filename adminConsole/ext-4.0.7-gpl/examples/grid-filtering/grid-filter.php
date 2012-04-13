<?php

function getDB() {
    $dbFile = "filter-demo.db";
    $hasDB = file_exists($dbFile);

    $db = new SQLiteDatabase($dbFile);
    if (!$hasDB) {
        $db->query(readCreateSql());
    }
    return $db;
}

function readCreateSql() {
    $filename = "grid-demo.sql";
    $file = fopen($filename, 'r');
    $data = fread($file, filesize($filename));
    fclose($file);
    return $data;
}

// collect request parameters
$start  = isset($_REQUEST['start'])  ? $_REQUEST['start']  :  0;
$count  = isset($_REQUEST['limit'])  ? $_REQUEST['limit']  : 50;
$sort   = isset($_REQUEST['sort'])   ? $_REQUEST['sort']   : '';
$dir    = isset($_REQUEST['dir'])    ? $_REQUEST['dir']    : 'ASC';
$filters = isset($_REQUEST['filter']) ? $_REQUEST['filter'] : null;

// GridFilters sends filters as an Array if not json encoded
if (is_array($filters)) {
    $encoded = false;
} else {
    $encoded = true;
    $filters = json_decode($filters);
}

$where = ' 0 = 0 ';
$qs = '';

// loop through filters sent by client
if (is_array($filters)) {
    for ($i=0;$i<count($filters);$i++){
        $filter = $filters[$i];

        // assign filter data (location depends if encoded or not)
        if ($encoded) {
            $field = $filter->field;
            $value = $filter->value;
            $compare = isset($filter->comparison) ? $filter->comparison : null;
            $filterType = $filter->type;
        } else {
            $field = $filter['field'];
            $value = $filter['data']['value'];
            $compare = isset($filter['data']['comparison']) ? $filter['data']['comparison'] : null;
            $filterType = $filter['data']['type'];
        }

        switch($filterType){
            case 'string' : $qs .= " AND ".$field." LIKE '%".$value."%'"; Break;
            case 'list' :
                if (strstr($value,',')){
                    $fi = explode(',',$value);
                    for ($q=0;$q<count($fi);$q++){
                        $fi[$q] = "'".$fi[$q]."'";
                    }
                    $value = implode(',',$fi);
                    $qs .= " AND ".$field." IN (".$value.")";
                }else{
                    $qs .= " AND ".$field." = '".$value."'";
                }
            Break;
            case 'boolean' : $qs .= " AND ".$field." = ".($value); Break;
            case 'numeric' :
                switch ($compare) {
                    case 'eq' : $qs .= " AND ".$field." = ".$value; Break;
                    case 'lt' : $qs .= " AND ".$field." < ".$value; Break;
                    case 'gt' : $qs .= " AND ".$field." > ".$value; Break;
                }
            Break;
            case 'date' :
                switch ($compare) {
                    case 'eq' : $qs .= " AND ".$field." = '".date('Y-m-d',strtotime($value))."'"; Break;
                    case 'lt' : $qs .= " AND ".$field." < '".date('Y-m-d',strtotime($value))."'"; Break;
                    case 'gt' : $qs .= " AND ".$field." > '".date('Y-m-d',strtotime($value))."'"; Break;
                }
            Break;
        }
    }
    $where .= $qs;
}

$query = "SELECT * FROM demo WHERE ".$where;
if ($sort != "") {
    $query .= " ORDER BY ".$sort." ".$dir;
}
$query .= " LIMIT ".$start.",".$count;

$db = getDB();
$count = $db->singleQuery("SELECT COUNT(id) FROM demo WHERE ".$where);
$result = $db->query($query);
$rows = Array();
while($row = $result->fetch(SQLITE_ASSOC)) {
    array_push($rows, $row);
}
echo json_encode(Array(
    "total"=>$count,
    "data"=>$rows
));

?>