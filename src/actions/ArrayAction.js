import {Action} from "./Action"

// Add Object To Array
var AddObjectToArrayAction = Action.define({
    create: function(obj, arr, idx){
        // keep track of object and where to add it
        this.obj = obj;
        this.arr = arr;
        this.idx = (typeof idx != 'undefined') ? idx : -1;
        window.obj = [this.obj.name, this.arr]
    },
    redo: function(){
        // Push object to array end
        /* eslint-disable no-console */
        //console.log( this.arr )
        if(this.idx == -1){
            this.arr.push(this.obj)
        }else{
            this.arr.splice(this.idx, 0, this.obj)
        }
    },
    undo: function(){
        // Pop object from array end
        if(this.idx == -1){
            this.arr.pop()
        }
        else{
            this.arr.splice(this.idx, 1)
        }
    }
});

// Delete Object From Array
var DeleteObjectFromArrayAction = Action.define({
    create: function(obj, arr){
        this.obj = obj;                  // keep track of object
        this.arr = arr;                  // from where to delete object
        this.valid = (arr.indexOf(obj) > -1)
        this.check = arr.indexOf(obj)

        window.obj = this.obj.name
        window.arr = arr
        window.valid = this.valid
        window.check = this.check
    },
    redo: function(){
        // save which index it has currently
        this.index = this.arr.indexOf(this.obj)
        if(this.index == -1) return;
        // remove object from array
        this.arr.splice(this.index, 1)
    },
    undo: function(){
        if(this.index == -1) return;

        // add object to array at same index
        this.arr.splice(this.index, 0, this.obj)
    }
});

// Replace Object in Array
var ReplaceObjectInArrayAction = Action.define({
    create: function(obj, rep, arr){
        this.obj = obj;                  // keep track of object
        this.rep = rep;                  // keep track of replacement object
        this.arr = arr;                  // from where to delete object
        this.valid = (arr.indexOf(obj) > -1)
    },
    redo: function(){
        // save which index it has currently
        this.index = this.arr.indexOf(this.obj)

        if(this.index == -1) return;
        // swap objects at index
        this.arr.splice(this.index, 1, this.rep)
    },
    undo: function(){
        if(this.index == -1) return;
        // swap objects at index
        this.arr.splice(this.index, 1, this.obj)
    }
});

// Delete Multiple Objects From Array
var DeleteObjectsFromArrayAction = Action.define({
    create: function(objs, arr){
        this.dels = [] // prep a place to store all the delete actions
        this.objs = objs.slice()
        this.arr  = arr
        this.valid = (objs.filter(o => arr.indexOf(o) > -1).length > 0)
    },
    redo: function(){
        // loop through all the objects that should be deleted
        for(var i=0; i<this.objs.length; i++){
            // create a delete-from-array action
            var d = new DeleteObjectFromArrayAction(this.objs[i], this.arr);
            // add action to array to keep track
            this.dels.push(d);
            // do that action
            d.redo()
        }
    },
    undo: function(){
        // while there is still actions
        while(this.dels.length > 0){
            // remove action from array and undo it
            this.dels.pop().undo()
        }
    }
});

export {
    AddObjectToArrayAction,
    DeleteObjectFromArrayAction,
    ReplaceObjectInArrayAction,
    DeleteObjectsFromArrayAction
}