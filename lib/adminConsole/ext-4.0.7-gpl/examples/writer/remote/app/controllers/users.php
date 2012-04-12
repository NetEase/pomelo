<?php
/**
 * @class Users
 * A simple application controller extension
 */
class Users extends ApplicationController {
    /**
     * view
     * Retrieves rows from database.
     */
    public function view() {
        $res = new Response();
        $res->success = true;
        $res->message = "Loaded data";
        $res->data = User::all();
        return $res->to_json();
    }
    /**
     * create
     */
    public function create() {
        $res = new Response();

        // Ugh, php...check if !hash
        if (is_array($this->params) && !empty($this->params) && preg_match('/^\d+$/', implode('', array_keys($this->params)))) {
            foreach ($this->params as $data) {
                array_push($res->data, User::create($data)->to_hash());
            }
            $res->success = true;
            $res->message = "Created " . count($res->data) . ' records';
        } else {
            if ($rec =  User::create($this->params)) {
                $res->success = true;
                $res->data = $rec->to_hash();
                $res->message = "Created record";
            } else {
                $res->success = false;
                $res->message = "Failed to create record";
            }
        }
        return $res->to_json();
    }

    /**
     * update
     */
    public function update() {
        $res = new Response();

        if (is_array($this->params)) {
            $res->data = array();
            foreach ($this->params as $data) {
                if ($rec = User::update($data->id, $data)) {
                    array_push($res->data, $rec->to_hash());
                }
            }
            $res->success = true;
            $res->message = "Updated " . count($res->data) . " records";
        } else {
            if ($rec = User::update($this->params->id, $this->params)) {
                $res->data = $rec->to_hash();

                // SIMULATE ERROR:  All records having odd-numbered ID have error.
                if ($rec->id % 2) {
                    $res->success = false;
                    $res->message = "SIMULATED ERROR:  Lorem ipsum dolor sit amet, placerat consectetuer, nec lacus imperdiet velit dui interdum vestibulum, sagittis lectus morbi, urna aliquet minus natoque commodo egestas non, libero libero arcu sed sed.";
                } else {
                    $res->success = true;
                    $res->message = "Updated record";
                }
            } else {
                $res->message = "Failed to updated record " . $this->params->id;
                $res->success = false;
            }

        }
        return $res->to_json();
    }

    /**
     * destroy
     */
    public function destroy() {
        $res = new Response();
        if (is_array($this->params)) {
            $destroyed = array();
            foreach ($this->params as $rec) {
                if ($rec = User::destroy($rec->id)) {
                    array_push($destroyed, $rec);
                }
            }
            $res->success = true;
            $res->message = 'Destroyed ' . count($destroyed) . ' records';
        } else {
            if ($rec = User::destroy($this->params->id)) {
                $res->message = "Destroyed User";
                $res->success = true;
            } else {
                $res->message = "Failed to Destroy user";
            }
        }
        return $res->to_json();
    }
}

