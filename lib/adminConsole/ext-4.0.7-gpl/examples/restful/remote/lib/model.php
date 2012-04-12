<?php
/**
 * @class Model
 * Baseclass for Models in this imaginary ORM
 */
class Model {
    public $id, $attributes;
    static function create($params) {
        $obj = new self(get_object_vars($params));
        $obj->save();
        return $obj;
    }
    static function find($id) {
        global $dbh;
        $found = null;
        foreach ($dbh->rs() as $rec) {
            if ($rec['id'] == $id) {
                $found = new self($rec);
                break;
            }
        }
        return $found;
    }
    static function update($id, $params) {
        global $dbh;
        $rec = self::find($id);

        if ($rec == null) {
            return $rec;
        }
        $rs = $dbh->rs();

        foreach ($rs as $idx => $row) {
            if ($row['id'] == $id) {
                $rec->attributes = array_merge($rec->attributes, get_object_vars($params));
                $dbh->update($idx, $rec->attributes);
                break;
            }
        }
        return $rec;
    }
    static function destroy($id) {
        global $dbh;
        $rec = null;
        $rs = $dbh->rs();
        foreach ($rs as $idx => $row) {
            if ($row['id'] == $id) {
                $rec = new self($dbh->destroy($idx));
                break;
            }
        }
        return $rec;
    }
    static function all() {
        global $dbh;
        return $dbh->rs();
    }

    public function __construct($params) {
        $this->id = isset($params['id']) ? $params['id'] : null;
        $this->attributes = $params;
    }
    public function save() {
        global $dbh;
        $this->attributes['id'] = $dbh->pk();
        $dbh->insert($this->attributes);
    }
    public function to_hash() {
        return $this->attributes;
    }
}

