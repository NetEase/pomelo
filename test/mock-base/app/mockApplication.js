var Application = module.exports = {
    components: { __pushScheduler__: {},
                  __connector__: {},
                },
    settings: {}
 };

Application.set = function(setting, val, attach){
  if (arguments.length === 1) {
    return this.settings[setting];
  }
  this.settings[setting] = val;
  if(attach) {
    this[setting] = val;
  }
  return this;
}

Application.get = function(setting){
  return this.settings[setting];
}


