<template>
	<div id="app" @mousemove="mouseMove" @mouseup="mouseUp" v-on:click="onClick()" ref="app_ref">
		<div class="top_row_div">
			<div 	class="single_row_div"
					v-for="(d,i) in depth"
					:key='i'
					ref="row_ref"
					v-on:click="changeDivWidth(i)">
			</div>
		</div>
		<transition-group name="flip-list" tag="div" >

			<LabelTree v-for='child in sorted_children'
						@on-dragged="onDragged"
						@on-select="onSelect"
						@Mouse-On-Label="mouseOnLabel"
						@drop-on-label="dropOnLabel"
						:label="child"
						:label_after_dragging="label_after_dragging"
						:moving_box_props="returnMovingBox"
						:isdragging="isdragging"
						:unselect="unselect"
						:label_select="label_select"
						:key='child.id'
						:row_shrink="row_shrink"
						:depth="-1"
						:total_depth="depth"
						:newlabel="newlabel">
			</LabelTree>


		</transition-group>
		<div class="last_label_sugestion_div"
			v-if="isdragging && this.moving_box.label.parent_label"
			@mouseenter="new_parent = true"
			@mouseleave="new_parent = false">
		</div>

		<temporaryLabelDrag v-if="isdragging"
							:movingbox="moving_box"
							:newparent="new_parent"
							:label_select="label_select"
							:mouse_on_label="mouse_on_label">
		</temporaryLabelDrag>

		<div class="tracking_div">
			<div class="button_div undo" v-on:click="historyUndo()">Backward</div>
			<div class="button_div redo" v-on:click="historyRedo()">Forward</div>
		</div>
	</div>
</template>

<script>
import LabelTree 			from './components/LabelTree'
import temporaryLabelDrag 	from './components/temporaryLabelDrag'
import ActionHistory 	    from './actions/ActionHistory'
import {ActionGroup} 		from "@/actions/Action"
import {AddObjectToArrayAction, DeleteObjectFromArrayAction} from "@/actions/ArrayAction"
var {MouseHandler} = require("./mousehandler/Mousehandler.js")
export default {
	components:{
		LabelTree,
		temporaryLabelDrag
	},
	data(){
		return{
			moving_box : null,
			tree_tracker : null,
			mtracker : null,
			isdragging : false,
			new_parent : false,
			mouse_on_label: false,
			depth: 0,

			label_select : [],
			label_select_length : 0,
			click_label : null,
			unselect: false,
			newlabel: null,
			actions: [],
			history: new ActionHistory(),
			row_shrink: [],
			/* label: [
				{
					id: 1,
					name: 'label 1',
					color: 'red',
					child:[
						{
							id: 11,
							name: 'label 1.1',
							color: 'purple',
							child: []
						}
					]
				},
				{
					id: 2,
					name: 'label 2',
					color: 'purple',
					child: [
						{
							id: 21,
							name: 'label 2.1',
							color: 'purple',
							child: [
								{
									id: 211,
									name: 'label 2.1.1',
									color: 'yellow',
									child: []
								},
								{
									id: 212,
									name: 'label 2.1.2',
									color: 'green',
									child: []
								}
							]
						},
						{
							id: 22,
							name: 'label 2.2',
							color: 'silver',
							child: []
						},
						{
							id: 23,
							name: 'label 2.3',
							color: 'cyan',
							child: []
						}
					]
				},
				{
					id: 3,
					name: 'label 3',
					color: 'Emerald',
					child:[
						{
							id: 31,
							name: 'label 3.1',
							color: 'Coral',
							child: []
						},
						{
							id: 32,
							name: 'label 3.2',
							color: 'blue',
							child: []
						}
					]
				},
				{
					id: 4,
					name: 'label 4',
					color: 'lightgreen',
					child: []
				}
			], */
			label: [
				{
					id: 1,
					name: 'label 1',
					color: 'red',
					child: [
						{
							id: 4,
							name: 'label 1.1',
							color: 'yellow',
							child: []
						},
						{
							id: 5,
							name: 'label 1.2',
							color: 'green',
							child: [
								{
									id: 7,
									name: 'label 1.2.1',
									color: 'blue',
									child: [
										{
											id: 16,
											name: 'label 1.2.1.1',
											color: 'red',
											child: []
										},
										{
											id: 17,
											name: 'label 1.2.1.2',
											color: 'blue',
											child: []
										},
										{
											id: 21,
											name: 'label 1.2.1.3',
											color: 'green',
											child: []
										},
										{
											id: 22,
											name: 'label 1.2.1.4',
											color: 'blue',
											child: []
										},
										{
											id: 23,
											name: 'label 1.2.1.5',
											color: 'purple',
											child: []
										},
										{
											id: 24,
											name: 'label 1.2.1.6',
											color: 'gray',
											child: []
										},
										{
											id: 25,
											name: 'label 1.2.1.7',
											color: 'blue',
											child: []
										},
										{
											id: 26,
											name: 'label 1.2.1.8',
											color: 'blue',
											child: []
										},
										{
											id: 27,
											name: 'label 1.2.1.9',
											color: 'blue',
											child: []
										},
										{
											id: 28,
											name: 'label 1.2.1.10',
											color: 'blue',
											child: []
										},
										{
											id: 29,
											name: 'label 1.2.1.11',
											color: 'red',
											child: []
										},
										{
											id: 30,
											name: 'label 1.2.1.12',
											color: 'white',
											child: []
										}
									]
								},
								{
									id: 8,
									name: 'label 1.2.2',
									color: 'Red-violet',
									child: [
										{
											id: 10,
											name: 'label 1.2.2.1',
											color: 'cyan',
											child: [
												{
													id: 31,
													name: 'label 1.2.2.1.1',
													color: 'cyan',
													child: []
												},
											]
										},
										{
											id: 11,
											name: 'label 1.2.2.2',
											color: 'orange',
											child: []
										},
										{
											id: 12,
											name: 'label 1.2.2.3',
											color: 'brown',
											child: []
										}
									]
								},
								{
									id: 9,
									name: 'label 1.2.3',
									color: 'black',
									child: []
								}
							]
						}
					],
				},
				{
					id: 2,
					name: 'label 2',
					color: 'purple',
					child: []
				},
				{
					id: 3,
					name: 'label 3',
					color: 'Emerald',
					child: [
						{
							id: 6,
							name: 'label 3.1',
							color: 'Coral',
							child: [
								{
									id: 13,
									name: 'label 3.1.1',
									color: 'Gray',
									child: []
								},
								{
									id: 14,
									name: 'label 3.1.2',
									color: 'Indigo',
									child: [
										{
											id: 31,
											name: 'label 3.1.2.1',
											color: 'Gray',
											child: []
										},
										{
											id: 32,
											name: 'label 3.1.2.2',
											color: 'Indigo',
											child: [
												{
													id: 33,
													name: 'label 3.1.2.2.1',
													color: 'Indigo',
													child: []
												},
											]
										},
									]
								},
								{
									id: 15,
									name: 'label 3.1.3',
									color: 'Pink',
									child: []
								}
							]
						},
						{
							id: 18,
							name: 'label 3.2',
							color: 'yellow',
							child: []
						},
						{
							id: 19,
							name: 'label 3.3',
							color: 'green',
							child: []
						},
						{
							id: 20,
							name: 'label 3.4',
							color: 'blue',
							child: []
						}
					]
				},
				{
					id: 4,
					name: 'label 4',
					color: 'red',
					child:[
						{
							id: 41,
							name: 'label 4.1',
							color: 'purple',
							child: []
						}
					]
				},
				{
					id: 5,
					name: 'label 5',
					color: 'purple',
					child: [
						{
							id: 51,
							name: 'label 5.1',
							color: 'purple',
							child: [
								{
									id: 511,
									name: 'label 5.1.1',
									color: 'yellow',
									child: []
								},
								{
									id: 512,
									name: 'label 5.1.2',
									color: 'green',
									child: []
								}
							]
						},
						{
							id: 52,
							name: 'label 5.2',
							color: 'silver',
							child: []
						},
						{
							id: 53,
							name: 'label 5.3',
							color: 'cyan',
							child: []
						}
					]
				},
				{
					id: 6,
					name: 'label 6',
					color: 'Emerald',
					child:[
						{
							id: 61,
							name: 'label 6.1',
							color: 'Coral',
							child: []
						},
						{
							id: 62,
							name: 'label 6.2',
							color: 'blue',
							child: []
						}
					]
				},
				{
					id: 7,
					name: 'label 7',
					color: 'lightgreen',
					child: []
				}
			],
			label_after_dragging: null
		}
	},
	created() {
		this.maxDepth( this.label, this.depth )
		for(let i=0; i < this.depth; i++) {
			this.row_shrink[i] = false
		}
	},
	mounted(){
		window.xxx = this.history
		window.depth = this.depth
		this.mtracker = MouseHandler.create_tracker(this.$el)
	},
	watch:{
		isdragging: function(){
			this.depth = 0
			this.maxDepth(this.label, this.depth)
			this.row_shrink = this.updatingRowShrink
		},
		depth: function(){
			window.depth = this.depth
		}
	},
	computed: {
		returnMovingBox: function(){
			return this.moving_box
		},
		sorted_children: function(){
            return this.label.slice(0).sort((a, b) =>
                this.recursive_count(b) - this.recursive_count(a)
            )
		},
		updatingRowShrink: function(){
			var temp_arr = []
			if(this.depth > this.row_shrink.length){
				for(let i=0; i < this.depth; i++) {
					if(this.row_shrink[i])
						temp_arr[i] = this.row_shrink[i]
					else
						temp_arr[i] = false
				}
				return temp_arr
			}
			else if(this.depth < this.row_shrink.length){
				for(let i=0; i < this.depth; i++)
					temp_arr[i] = this.row_shrink[i]
				return temp_arr
			}
			else
				return this.row_shrink
		}
	},
	methods: {
		onClick: function(){
			if(this.label_select_length == this.label_select.length && this.click_label == null){
				this.label_select = []
				this.unselect = true
			}
			this.label_select_length = this.label_select.length
			this.click_label = null
		},
		mouseOnLabel: function( label ){

			if(!label) this.mouse_on_label = false //mouse not on label
			else if(this.label_select.length != 0){//if more then one label
				for(var i = 0; i<this.label_select.length; i++){
					if(  this.searchLabel(this.label_select[i].label, label.label) //label is the child of dragging label
						|| this.isParent(label, this.label_select[i].parent_label) ){ // label is parent of moving_box

						this.mouse_on_label = false
						break
					}
					else
						this.mouse_on_label = true
				}
			}
			else if(this.moving_box){ // moving_box is not null
				if( this.searchLabel(this.moving_box.label.label, label.label) //label is the child of dragging label
					|| this.isParent(label, this.moving_box.label.parent_label)  ) // label is parent of moving_box

					this.mouse_on_label = false
				else
					this.mouse_on_label = true
			}
		},
		isParent: function(label, parent){
			if(!parent)
				return false
			if(label.label.id == parent.label.id)
				return true
		},
		onSelect: function(label, bool){
			this.click_label = label
			if(bool){
				var length = this.label_select.length
				var label_arr = this.label_select
				for(var i=0; i<length; i++){
					if( label_arr[i] && this.searchLabel( label.label, label_arr[i].label)){
						this.label_select.splice(this.label_select.indexOf(label_arr[i]), 1)
						i--
					}
				}
				this.label_select.push(label)
				this.unselect = false
			}
			else
				this.label_select.splice(this.label_select.indexOf(label), 1)
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
		historyUndo: function(){
			this.history.undo()
			this.depth = 0
			this.maxDepth(this.label, this.depth)
			for (let i = 0; i < this.depth; i++) {
				this.row_shrink[i] = false
			}
		},
		historyRedo: function(){
			this.history.redo()
			this.depth = 0
			this.maxDepth(this.label, this.depth)
			this.updatingRowShrink
			for (let i = 0; i < this.depth; i++) {
				this.row_shrink[i] = false
			}
		},
		count_all_children(l){
			return l.child.length
		},
		recursive_count(l){
			return 1 + l.child.map(l_ => this.recursive_count(l_)).reduce((t,n) => t+n, 0)
		},
		actionsPush: function(drag_on_label, dragging_label, parent){
			if( parent ) //if dragging_label has parent
				this.actions.push( new DeleteObjectFromArrayAction(dragging_label, parent.label.child) )
			else
				this.actions.push( new DeleteObjectFromArrayAction(dragging_label, this.label) )
			this.actions.push( new AddObjectToArrayAction(dragging_label, drag_on_label.child) )
		},

		//Function for giving suggestion for dropping label
		dropOnLabel: function( label ){
			if(!this.mouse_on_label)
				return
			var drag_on_label = null
			this.actions = []
			if(label.label == undefined)//Check its not the whole component
				drag_on_label = label
			else
				drag_on_label = label.label

			if(this.label_select.length == 0){
				var dragging_label = this.moving_box.label.label
				var parent = this.moving_box.label.parent_label
				this.actionsPush( drag_on_label, dragging_label, parent )
				this.label_after_dragging = this.moving_box.label
			}
			else{
				for(var i=0; i<this.label_select.length; i++){
					var dragging_label_list = this.label_select[i].label
					var parent_list = this.label_select[i].parent_label
					this.actionsPush( drag_on_label, dragging_label_list, parent_list )
					this.label_after_dragging = this.label_select[i]
				}
			}
			this.history.do(new ActionGroup(this.actions))
			this.actions = []
		},
		mouseUp: function(){//when making label with no parent
			if(this.moving_box){
				let moving_box = this.moving_box.label
				if(this.new_parent ){
					//let actions = [];
					if(this.label_select.length != 0){
						for(var i=0; i<this.label_select.length; i++){
							if(this.label_select[i].parent_label){
								this.actions.push( new DeleteObjectFromArrayAction(this.label_select[i].label, this.label_select[i].parent_label.label.child) )
								this.actions.push( new AddObjectToArrayAction(this.label_select[i].label ,this.label) )
							}
						}
					}
					else{
						this.actions.push( new DeleteObjectFromArrayAction(moving_box.label, moving_box.parent_label.label.child) )
						this.actions.push( new AddObjectToArrayAction(moving_box.label ,this.label) )
					}
					this.history.do(new ActionGroup(this.actions))
					this.newlabel = this.moving_box.label
				}
			}
			this.new_parent = false
			this.isdragging = false
			this.moving_box = null
			this.actions = []
		},
		mouseMove: function(event){
			if(event.buttons == 0)//Check mouse button is clicked
			{
				this.isdragging = false
				this.moving_box = null
			}
			else if( this.moving_box && this.tree_tracker.x != this.mtracker.x ){
				this.isdragging = true
				this.moving_box.x = this.mtracker.x+15
				this.moving_box.y = this.mtracker.y+15
			}
		},
		onDragged: function(moving_box, tracker){
			this.moving_box = moving_box
			this.tree_tracker = tracker
		},
		/* Calculate the maximum depth of Tree */
		maxDepth: function( array, depth ){
			depth += 1
			if(depth > this.depth)
				this.depth = depth
			for (let i = 0; i < array.length; i++) {
				if(array[i].child.length != 0){
					this.maxDepth(array[i].child, depth)
				}
			}
		},
		changeDivWidth: function(i){
			this.row_shrink[i] = !this.row_shrink[i]
			var new_row_shrink = []
			for(let i=0; i < this.depth; i++) {
				new_row_shrink[i] = this.row_shrink[i]
			}
			this.row_shrink = new_row_shrink
			if(this.row_shrink[i])
				this.$refs['row_ref'][i].style.minWidth = '50px'
			else
				this.$refs['row_ref'][i].style.minWidth = '200px'
		}
	},
}
</script>

<style>
#app {
	padding: 20px;
	transition: all 1s ease;
  -webkit-transition: all 1s ease;
}
.top_row_div{
	display: flex;
	margin-left: 10px;
	margin-bottom: 10px;
}
.single_row_div{
	min-width: 200px;
	height: 50px;
	margin-right: 10px;
	background-color: #00a3ff;
	background-image: url('./assets/triangle.svg');
	background-repeat: no-repeat;
	background-size: 15px;
	background-position-x: 90%;
	background-position-y: 50%;
	cursor: pointer;
	border: 2px solid transparent;
}
.tracking_div{
	display: flex;
	position: fixed;
	right: 10px;
	top: 10px;
}
.button_div{
	width: 100px;
	height: 30px;
	border: solid 1px grey;
	color: white;
	background-color: #9f9f9fcf;
	margin: 5px;
	cursor: pointer;
}
.last_label_sugestion_div{
	width: 200px;
	height: 50px;
	border: 1px dashed black;
	margin-left: 10px;
}
.button_div.redo{
}
.button_div.undo{
}
.flip-list-move {
  transition-delay: 0.3s;
  transition: transform 0.3s ;
}
</style>