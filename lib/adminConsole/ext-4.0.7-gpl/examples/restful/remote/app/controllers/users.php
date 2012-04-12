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
        $rec = User::create($this->params);
        if ($rec) {
            $res->success = true;
            $res->message = "Created new User" . $rec->id;
            $res->data = $rec->to_hash();
        } else {
            $res->message = "Failed to create User";
        }
        return $res->to_json();
    }
    /**
     * update
     */
    public function update() {
        $res = new Response();
        $rec = User::update($this->id, $this->params);
        if ($rec) {
            $res->data = $rec->to_hash();
            $res->success = true;
            $res->message = 'Updated User ' . $this->id;
        } else {
            $res->message = "Failed to find that User";
        }
        return $res->to_json();
    }
    /**
     * destroy
     */
    public function destroy() {
        $res = new Response();
        if (User::destroy($this->id)) {
            $res->success = true;
            $res->message = 'Destroyed User ' . $this->id;
        } else {
            $res->message = "Failed to destroy User";
        }
        return $res->to_json();
    }
}

