/*
 * Name:    KeyBinder
 * Author:  Forat Seif <foratseif@gmail.com>
 *
 * Desc:
 *
 * Usage:
 *
 */



var MouseHandler = (function(){

    /* === VARIABLES === */
    //var self = this

    // track mouse position on screen
    this.mouse_on = {
        active: false,
        x: 0,
        y: 0,
    }

    // track mouse "click and drag"
    this.mouse_down = {
        active: false,
        x:  0,
        y:  0,
        dx: 0,
        dy: 0,
    }

    this.to_arr = []


    var _TrackerObject = function(el, MH, active){
        var th = this

        this.mouse_on = false
        this.mouse_down = false

        this.x = 0
        this.y = 0
        this.dx = 0
        this.dy = 0

        this.rel = {
            ix: 0,
            iy: 0,
        }

        this.restricted = {
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            rel: {
                x: 0,
                y: 0,
                dx: 0,
                dy: 0,
                x_min: 0,
                y_min: 0,
            }
        }

        this.ix = 0
        this.iy = 0

        this.dims = {
            h:0,
            w:0,
        }
        this.offset = {
            top:0,
            left:0,
        }



        this.mousemove = function(){
            var r = el.getBoundingClientRect();

            th.dims.w = r.width
            th.dims.h = r.height

            th.offset.top  = r.top
            th.offset.left = r.left

            th.x = MH.mouse_on.x - r.left
            th.y = MH.mouse_on.y - r.top

            if      (th.x < 0)         th.restricted.x = 0
            else if (th.x > th.dims.w) th.restricted.x = th.dims.w
            else                       th.restricted.x = th.x

            if      (th.y < 0)         th.restricted.y = 0
            else if (th.y > th.dims.h) th.restricted.y = th.dims.h
            else                       th.restricted.y = th.y

            th.restricted.rel.x = th.restricted.x/th.dims.w
            th.restricted.rel.y = th.restricted.y/th.dims.h

            if(th.mouse_down){
                th.dx = th.x - th.ix
                th.dy = th.y - th.iy

                if      (th.x < 0)           th.restricted.dx = th.ix * -1
                else if (th.x > th.dims.w) th.restricted.dx = th.dims.w - th.ix
                else                           th.restricted.dx = th.dx

                if      (th.y < 0)           th.restricted.dy = th.iy * -1
                else if (th.y > th.dims.h) th.restricted.dy = th.dims.h - th.iy
                else                           th.restricted.dy = th.dy

                th.restricted.rel.dx = th.restricted.dx/th.dims.w
                th.restricted.rel.dy = th.restricted.dy/th.dims.h

                if(th.dx > 0) th.restricted.rel.x_min = th.rel.ix
                else            th.restricted.rel.x_min = th.restricted.rel.x

                if(th.dy > 0) th.restricted.rel.y_min = th.rel.iy
                else            th.restricted.rel.y_min = th.restricted.rel.y

            }
        }

        this.mouseenter = function(e){
            th.mouse_on = true
            if(e.buttons == 1) th.mousedown(e);
        }

        this.mouseleave = function(){
            th.mouse_on = false
        }

        this.mousedown = function(){
            th.mouse_down = true
            th.ix = th.x
            th.iy = th.y

            th.rel.ix = th.ix/th.dims.w
            th.rel.iy = th.iy/th.dims.h
        }

        this.mouseup = function(){
            th.mouse_down = false
            th.dx = 0
            th.dy = 0
            th.restricted.dx = 0
            th.restricted.dy = 0
            th.restricted.rel.dx = 0
            th.restricted.rel.dy = 0
        }


        this.track_wheel = function(callback, prevent){
            if(typeof callback != "function") return;

            /* The flag that determines whether the wheel event is supported. */
            var supportsWheel = false;

            /* The function that will run when the events are triggered. */
            function DoSomething (e) {
                if(prevent) e.preventDefault();

                /* Check whether the wheel event is supported. */
                if (e.type == "wheel") supportsWheel = true;
                else if (supportsWheel) return;

                /* Determine the direction of the scroll (< 0 → up, > 0 → down). */
                var delta = ((e.deltaY || -e.wheelDelta || e.detail) >> 10) || 1;

                callback(delta)
            }

            /* Add the event listeners for each event. */
            el.addEventListener('wheel', DoSomething);
            el.addEventListener('mousewheel', DoSomething);
            el.addEventListener('DOMMouseScroll', DoSomething);
        }

        if(active){
            el.addEventListener("mouseup", this.mouseup)
            el.addEventListener("mousemove", this.mousemove)
            el.addEventListener("mouseenter", this.mouseenter)
            el.addEventListener("mouseleave", this.mouseleave)
            el.addEventListener("mousedown", this.mousedown)
        }
    }


    /* === FUNCTIONS === */

    // mousemove handler
    this.mousemove = function(e){
        MouseHandler.mouse_on.x = e.x
        MouseHandler.mouse_on.y = e.y

        // check if mouse btn is pressed
        if(MouseHandler.mouse_down.active){
            // calculate dx and dy
            MouseHandler.mouse_down.dx = MouseHandler.mouse_on.x - MouseHandler.mouse_down.x;
            MouseHandler.mouse_down.dy = MouseHandler.mouse_on.y - MouseHandler.mouse_down.y;
        }

    }

    // mouseenter handler
    this.mouseenter = function(){
        MouseHandler.mouse_on.active = true;
    }

    // mouseleave handler
    this.mouseleave = function(){
        MouseHandler.mouse_on.active = false;
        MouseHandler.mouseup()
    }

    // mousedown handler
    this.mousedown = function(){
        // register mouse is down
        MouseHandler.mouse_down.active = true;
        MouseHandler.mouse_down.x = MouseHandler.mouse_on.x;
        MouseHandler.mouse_down.y = MouseHandler.mouse_on.y;
        MouseHandler.mouse_down.dx = 0;
        MouseHandler.mouse_down.dy = 0;
    }

    // mouseup handler
    this.mouseup = function(){
        // register mouse is up
        MouseHandler.mouse_down.active = false;
        MouseHandler.mouse_down.dx = 0;
        MouseHandler.mouse_down.dy = 0;

        for(var i=0; i<MouseHandler.to_arr.length; i++){
            MouseHandler.to_arr[i].mouse_down = false
        }
    }

    // create tracker
    this.create_tracker = function(el, active){
        active = (typeof active == 'undefined') ? true : false ;
        var to = new _TrackerObject(el, MouseHandler, active);
        MouseHandler.to_arr.push(to)
        return to
    }

    // get size of window
    this.get_window_size = function(){
        var w = window
        var d = document
        var e = d.documentElement
        var g = d.getElementsByTagName('body')[0]
        return {
            w: w.innerWidth || e.clientWidth || g.clientWidth,
            h: w.innerHeight|| e.clientHeight|| g.clientHeight
        }
    }

    // initialize the MouseHandler lib
    document.addEventListener("mousemove", this.mousemove);
    document.addEventListener("mouseenter", this.mouseenter);
    document.addEventListener("mouseleave", this.mouseleave);
    document.addEventListener("mousedown", this.mousedown);
    document.addEventListener("mouseup", this.mouseup);

    this.Tracker = _TrackerObject;

    // return the created MouseHandler object
    return this;
})();

exports.MouseHandler = MouseHandler