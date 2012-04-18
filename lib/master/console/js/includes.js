/* Browser helper to fake out node.js require()
 * TODO: Use browserify to do away with this 
 */

var _node = {Node: Node};
var _ln = {LogNode: LogNode};
var _lf = {LogFile: LogFile};
var _stream = {Stream: Stream};
var _history = {History: History};
var _cm = {ColorManager: ColorManager};
