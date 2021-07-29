var Action = {
    define: function(d){

        var defined_action = d.create;
        defined_action.prototype.redo = d.redo;
        defined_action.prototype.undo = d.undo;
        defined_action.prototype.valid = true

        return defined_action;
    }
}

var ActionGroup = Action.define({
    create: function(g){
        this.g = []

        // add only non-null valid actions to this.g
        for(var i=0; i<g.length; i++){
            if(g[i] && g[i].valid){
                this.g.push(g[i])
            }
        }

        // valid if this.g has any actions to do
        this.valid = (this.g.length > 0)
    },
    redo: function(){
        for(var i=0; i<this.g.length; i++){
            this.g[i].redo()
        }
    },
    undo: function(){
        for(var i=this.g.length-1; i>=0; i--){
            this.g[i].undo()
        }
    }
})

export {
    Action,
    ActionGroup
}