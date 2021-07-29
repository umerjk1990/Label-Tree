<template>
    <div class="labeltree_template_div" @mousemove="mouseMove">

        <div class="wrapper_node"
            :style="{   opacity : highligted ? '0.25' : '1',
                        border : select_label ? '2px solid #cac9c9' : ''}"
            v-on:click="onClick()">

            <div class="node_name_div"  :style="styleNodeDiv"
                                        @mousedown="mouseDown"
                                        @mouseup="mouseUp"
                                        @mouseenter="mouseEnter"
                                        @mouseleave="mouseLeave">
                <div class="label_detail_div" :style='style || shrinkStyle'>
                    <div class="label_color_div" :style="{ backgroundColor : label.color }"></div>
                    <div class="label_name_div">{{labelName}}</div>
                    <div class="label_option_div" v-if="!shrink"></div>
                    <div v-else style="width: 10px; height : 20px;"></div>
                </div>
            </div>
            <div class="fold_childs_div"
                v-if="label.child.length > 1 && showchild"
                v-on:click="showChild()"
                :style="shrinkStyle">
            </div>
        </div>
        <transition-group name="flip-list" tag="div" v-if='showchild'>
            <div v-for="(l,i) in sorted_children" :key="i">

                <node  :key="componentkey"
                    @on-dragged="onDragged"
                    @on-select="onSelect"
                    @Mouse-On-Label="mouseOnLabel"
                    @drop-on-label="dropOnLabel"
                    :label_after_dragging="label_after_dragging"
                    :moving_box_props="moving_box_props"
                    :parent_label="that"
                    :label="l"
                    :unselect="unselect"
                    :label_select="label_select"
                    :parent_selected="select_label"
                    :row_shrink="row_shrink"
                    :depth="label_depth"
                    :total_depth="total_depth"
                    :newlabel="label_prop"
                    :label_depth_click="folded_index">
                </node>
            </div>
        </transition-group>



        <div v-else
            class="showchild_div"
            v-for="(lc, index) in labelChildFolded"
            style="display: flex"
            :key="index"
            v-on:click="showChildClick(index)">

            <div class="folded_number_child"
                v-if="lc.child != 0"
                :style="styleFoldedNodeDiv(index + 1)"
                @mouseup="mouseUpFolded(lc, index)"
                @mouseenter="mouseEnterFolded(lc, index)"
                @mouseleave="mouseLeaveFolded()">
                <div class="label_detail_div" v-if="lc.child == 1">
                    <div class="label_color_div" :style="{ backgroundColor : lc.color }"></div>
                    <div class="label_name_div" >{{labelNameFolded(lc.name[0].name, index)}}</div>
                    <div class="label_option_div" v-if="!shrink"></div>
                </div>

                <div v-else class="color_colective_div" :style="{marginRight : row_shrink[label_depth + index + 1 ] ? '0px' : ''}">
                    <div v-for="(color,index) in lc.color"
                        :style="{ backgroundColor : color }"
                        :key="index">
                    </div>
                </div>
                <div v-if="!row_shrink[label_depth + index + 1 ] && lc.child > 1 "> {{lc.child}} Categories </div>
            </div>

        </div>

    </div>
</template>

<script>
var {MouseHandler} = require('../mousehandler/Mousehandler.js')
export default {
    name: "node",
    props:{
        label : {
            type : Object
        },
        row_shrink : {
            type : Array
        },
        depth : {
            type: Number
        },
        total_depth:{
            type: Number
        },
        parent_label : {
            type: Object,
            default: null
        },
        parent_selected: {
            type : Boolean,
            default : false,
        },
        unselect: {
            type : Boolean,
            default : false,
        },
        label_select : {
            type : Array,
            default: function (){ return  [] }
        },
        child_folded : {
            type: Boolean,
            default: false
        },
        moving_box_props : {
            type : Object,
            default: null
        },
        newlabel: {
            type: Object,
            default: null,
        },
        label_depth_click: {
            type: Number,
            default: -1
        },
        label_after_dragging: {
            type : Object
        }
    },
    data() {
        return{
            showchild : true,
            label_depth : -1,
            moving_box: null,
            parentlabel: null,
            select_label : false,
            shiftKey : false,
            that: this,
            folded_child : [],
            label_prop: null,
            folded_index: this.label_depth_click,
            componentkey: Math.random(),
        }
    },
    watch:{
        unselect: function(){
            if(this.unselect && this.select_label)
                this.select_label = false
        },
        parent_selected: function(){
            this.select_label = this.parent_selected
        },
        childArray: function(){
            this.componentkey = Math.random()
            if(!this.showchild){
                var array = []
                this.folded_child=this.foldedChilds(this.label_depth-1, this.label, array)
            }
        },
    },
    created(){
        this.label_depth = this.depth + 1
        if(this.newlabel){
            if(this.newlabel.showchild == undefined)
                this.showchild = this.newlabel.label.showchild
            else
                this.showchild = this.newlabel.showchild
        }
        if(this.label_after_dragging && (this.label.id === this.label_after_dragging.label.id)){
            this.showchild = this.label_after_dragging.showchild
        }

        if(this.label_depth_click <= this.label_depth && (this.label_depth_click != -1)){
            this.showchild = false
        }
    },
    mounted: function() {
        //intilaizing tracker
        this.mTracker = MouseHandler.create_tracker(this.$el)
        //initialize label as a parent
        //to send as pros to te child
        this.parentlabel = this.label
        if(!this.showchild){
            var array = []
            this.folded_child=this.foldedChilds(this.label_depth-1, this.label, array)
        }
    },
    methods: {

        showChildClick: function(i){
            this.showchild = !this.showchild
            this.folded_index = i + 1
        },
        onSelect: function(label, bool){
            this.$emit('on-select', label, bool)
		},
        mouseMove: function(e){
            this.shiftKey = e.shiftKey
        },
        onClick: function(){
            if(this.shiftKey){
                this.select_label = !this.select_label
                this.$emit('on-select', this, this.select_label)
            }
            else{
                this.select_label = false
            }
        },
        showChild: function(){
            var array = []
            this.showchild = !this.showchild
            this.folded_child=this.foldedChilds(this.label_depth-1, this.label, array)
        },
        foldedChilds: function( label_depth, label, array ){
            var depth = label_depth+1
            var color = label.color
            var name = label
            array.push({depth, color , name})
            for (let i = 0; i < label.child.length ; i++) {
                this.foldedChilds(depth, label.child[i], array )
            }
            return array
        },
        mouseOnLabel: function( label ){
            this.$emit('Mouse-On-Label', label)
        },
        mouseEnter: function(){
            this.$emit('Mouse-On-Label', this)
        },
        mouseEnterFolded: function(lc,index){
            if(index == 0 || lc.child == 1)
                this.$emit('Mouse-On-Label', this)
        },
        mouseLeave: function(){
            this.$emit('Mouse-On-Label', null)
        },
        mouseLeaveFolded: function(){
            this.$emit('Mouse-On-Label', null)
        },
        dropOnLabel: function(label){
            this.$emit("drop-on-label", label)
        },
        mouseUp: function(){
            if(!this.canDrop)
                return
            else
                this.$emit("drop-on-label", this)
        },
        mouseUpFolded: function(lc, index ){
            if(lc.child == 1){
                this.$emit("drop-on-label", lc.name[0])
                var array = []
                this.folded_child=this.foldedChilds(this.label_depth-1, this.label, array)
                return
            }
            if(index == 0)
                this.$emit("drop-on-label", this)
        },
        mouseDown: function(e){
            this.mTracker.mousedown(e)
            this.moving_box = {
                label : this,
                x : 0,
                y : 0,
            },
            this.$emit("on-dragged", this.moving_box, this.mTracker)
        },
        onDragged: function( moving_box, mTracker){
            if( moving_box && mTracker )
                this.$emit("on-dragged", moving_box, mTracker)
        },
        styleFoldedNodeDiv: function(index){
            return {
                width: ( this.row_shrink[this.label_depth + index] ) ?
                    50 + 'px' : 200 + 'px'
            }
        },
        recursive_count(l){
            return 1 + l.child.map(l_ => this.recursive_count(l_)).reduce((t,n) => t+n, 0)
        },
        searchLabel: function(label, matchingLabel){
            if(label.id == matchingLabel.id){
                return true
            }
            else if( label.child.length != 0 ){
                var result = false
                for(var i=0; i<label.child.length; i++){
                    result = this.searchLabel(label.child[i], matchingLabel)
                    if( result )
                        return result
                }
                return result
            }
            return false
        },
        labelNameFolded: function(name, i){

            if(this.row_shrink[this.label_depth + i + 1])
                return name[0]
            else
                return name
        },
    },
    computed: {
        labelChildFolded: function(){//Array contain depth, childs, color, names
            var array = []
            for (var i = this.label_depth+1; i< this.total_depth; i++){
                var depth = i
                var child = 0
                var color = []
                var name = []
                for( var j = 0; j<this.folded_child.length; j++){
                    if(depth == this.folded_child[j].depth){
                        child++
                        color.push(this.folded_child[j].color)
                        name.push(this.folded_child[j].name)
                    }
                }
                array.push({depth, child, color, name})
            }
            return array
        },
        highligted: function(){
            if(this.moving_box_props){
                let drag_label = this.moving_box_props.label.label
                if(drag_label && drag_label.id == this.label.id)
                    return true
                else
                    return false
            }
            return false
        },
        parents: function(){ //need to be reconsider
            var parent = this.parent_label
            var parents = []
            while(parent){
                parents.push(parent.label.id)
                parent = parent.parent_label
            }
            return parents
        },
        canDrop: function(){
            if(!this.moving_box_props)
                return null
            let label = this.moving_box_props.label.label
            return (this.label.id != label.id && !this.parents.includes(label.id))
        },
        childArray: function(){
            return this.label.child
        },
        styleNodeDiv: function(){
            if(this.childArray.length == 1){

                return { height : 100 + '%',
                        width: ( this.shrink ) ?
                        50 + 'px' : 200 + 'px'
                }
            }
            else{

                return {
                    height : (!this.hasChild || !this.showchild )  ?
                       '50px' : '',
                    width: ( this.shrink ) ?
                        50 + 'px' : 200 + 'px'
                }
            }
        },
        hasChild: function(){
            if(this.childArray.length > 1 )
                return true
            else
                return false
        },
        shrink: function(){
            return this.row_shrink[this.label_depth]
        },
        labelName: function(){
            if(this.shrink)
                return this.label.name[0]
            else
                return this.label.name
        },
        sorted_children: function(){
            return this.childArray.slice(0).sort((a, b) =>
                this.recursive_count(b) - this.recursive_count(a)
            )
        },
        style: function(){
            return {
                top: (this.selected_index != -1) ?
                     this.selected_index*50 + 'px' :
                     parseInt(this.childArray.length/2) * 50 + 'px'
            }
        },
        selected_index: function(){
            return -1;
        },
        shrinkStyle: function(){
            return {
                width: ( this.shrink ) ?
                        50 + 'px' : 200 + 'px'
            }
        }
    }
}
</script>

<style>
.labeltree_template_div{
    display: flex;
    margin-left: 10px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.folded_number_child{
    width: 200px;
    height: 50px;
    background-color: blanchedalmond;
    margin-left: 10px;
    display: flex;
    cursor: pointer;
    text-align: center;
    vertical-align: middle;
    line-height: 50px;
    border: 2px solid transparent;
}
.color_colective_div{
    width: 50px;
    height: 50px;
    background-color: transparent;
    display: grid;
    grid-template-rows: repeat(3,minmax(1px, 50px));
    grid-gap: 0px;
    grid-auto-flow: column;
    margin-right: 15px;
}
.show_child_arrow_div{
    width: 20px;
    height: 20px;
    margin-top: 15px;
    background-image: url('../assets/triangle-down-active.svg');
    background-repeat: no-repeat;
    background-size: 15px;
}
.wrapper_node{
    background-color: blanchedalmond;
    margin-bottom: 10px;
    border: 2px solid transparent;
}
.node_name_div{
    line-height: 50px;
    height: calc(100% - 35px);
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.label_detail_div{
    height: 50px;
    display: flex;
    justify-content: space-between;
    position: sticky;
    top: 0px;
    width: 100%;
}
.label_color_div{
    width: 10px;
    height: 100%;
    background-color: red;
}
.label_name_div{user-select: none}
.label_option_div{
    width: 20px;
    height: 20px;
    margin-top: 15px;
    background-image: url('../assets/three dot options focus.svg');
    background-repeat: no-repeat;
    background-size: 15px;
}
.fold_childs_div{
    width: 200px;
    height: 35px;
    float: inline-end;
    cursor: pointer;
    background-image: url('../assets/triangle-down-populated.svg');
    background-repeat: no-repeat;
    background-size: 15px;
    background-position-x: 50%;
    background-position-y: 50%;
}
.fold_childs_div:hover{
    background-image: url('../assets/triangle-down-active.svg');
    background-color: rgb(246, 221, 184);
}
.flip-list-move {
  transition-delay: 0.3s;
  transition: transform 0.3s ;
}
</style>