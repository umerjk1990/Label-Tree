import Action from "./Action"

// Change object attributes
var ModifyObjectAction = Action.define({
    create: function(obj, data){
        this.obj = obj
        this.data = {}
        this.data_backup = {}
        this.keys = Object.keys(data)

        var no_change = true;
        for(var i=0; i<this.keys.length; i++){
            var k = this.keys[i]
            this.data[k] = data[k]
            no_change = no_change & (data[k] == obj[k]);
        }

        this.valid = !no_change
    },
    redo: function(){
        for(var i=0; i<this.keys.length; i++){
            var k = this.keys[i]
            this.data_backup[k] = this.obj[k]
        }

        for(var i=0; i<this.keys.length; i++){
            var k = this.keys[i]
            this.obj[k] = this.data[k]
        }
    },
    undo: function(){
        for(var i=0; i<this.keys.length; i++){
            var k = this.keys[i]
            this.obj[k] = this.data_backup[k]
        }
    }
});

export {
    ModifyObjectAction
}
