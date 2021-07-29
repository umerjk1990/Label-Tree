<template>
    <div class="temp_div" :style="moveDiv"> {{labelName}} </div>
</template>

<script>
export default {
    props: {
        movingbox: {
            type: Object,
            default: null
        },
        newparent: {
            type : Boolean,
            default : false
        },
        label_select: {
            type: Array,
        },
        mouse_on_label : {
            type: Boolean,
            default: false,
        }
    },
    computed: {
        moveDiv: function(){
            if(this.movingbox){

                return {
                    left : this.movingbox.x + 'px',
                    top  : this.movingbox.y + 'px',
                    backgroundColor : (this.mouse_on_label || this.newparent) ? '' : 'red'
                }
            }
            return ''
        },
        labelName: function(){
            if(!this.movingbox)
                return this.movingbox

            if( this.label_select.length != 0 )
                return this.label_select.length + " Labels"
            else
                return this.movingbox.label.label.name
        }
    }

}
</script>


<style>
.temp_div{
    width: 200px;
    height: 50px;
    background-color: yellowgreen;
    position: absolute;
    vertical-align: middle;
    line-height: 50px;
    text-align: center;
    color: white;
    font-weight: bold;
}
</style>