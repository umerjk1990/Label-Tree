var ActionHistory = function(){
    this.actions      = []       // array to store Action objects for undo/redo support
    this.action_index = 0
}

// ACTIONS METHODS ==
// do action
ActionHistory.prototype.do = function(action){
    if(!action || !action.valid) return;
    this.actions.splice(this.action_index)
    this.actions.push(action)
    this.redo()
}
// redo action
ActionHistory.prototype.redo = function(){
    if(this.action_index >= this.actions.length) return;
    this.actions[this.action_index].redo()
    this.action_index++;
}
// undo action
ActionHistory.prototype.undo = function(){
    if(this.action_index == 0) return;
    this.action_index--;
    this.actions[this.action_index].undo()
}

export {ActionHistory as default}