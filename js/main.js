/**
 * Created by dmitriy on 24.04.15.
 */

    //RequestAnimation Frame handler
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
        }
        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());

    function Game(w, h){
        var that = this;
        this.w = w;
        this.h = h;
        this.movePosition = {
            x: null,
            y: null
        }

        this.bubbles = [];
    }
    Game.prototype = {
        start: function() {
            $('body').on('contextmenu', '#field', function(e){ return false; });

            this.drawer = new Drawer();
            this.drawer.field.canvas.width = this.w;
            this.drawer.field.canvas.height = this.h;
            this.drawer.field.w = this.w;
            this.drawer.field.h = this.h;

            this.addClickListener();
            this.step();
        },
        addClickListener: function() {
            var that = this;
            var position = {
              x: 0,
              y: 0
            };
            $('#field').on('mouseup', function(ev){
                ev.preventDefault();
                var target = ev.target,
                    flagToMove = true;
                position.x = ev.offsetX;
                position.y = ev.offsetY;

                if(ev.which == 1) {
                    for(var i in that.bubbles) {
                        if(that.isClickedInCircle(position, that.bubbles[i])) {
                            flagToMove = false;
                            if(!that.bubbles[i].marked) {
                                for(var j in that.bubbles) {
                                    that.bubbles[j].marked = false;
                                }
                                that.bubbles[i].marked = true;
                            } else {
                                that.bubbles[i].marked = false;
                            }
                        }
                    }
                    if(flagToMove) {
                        that.movePosition.x = ev.offsetX;
                        that.movePosition.y = ev.offsetY;
                        that.moveBubbles();
                    }
                } else if(ev.which == 3) {
                    that.addBubble(position);
                }
                that.setBubblesCondition();
                that.drawer.draw(that.bubbles);
            });
        },
        addBubble: function(position) {
            var radius = this.getRandomNumber(10, 50),
                color = this.getRandomColor(),
                speed = 200;
            var bubble = new Bubble(position, radius, color, speed);
            this.bubbles.push(bubble);
        },
        getRandomColor: function() {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        },
        getRandomNumber: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        isClickedInCircle: function(position, circle) {
           return (Math.pow((position.y - circle.y), 2) + Math.pow((position.x - circle.x), 2)) <= Math.pow(circle.radius + 5, 2 );
        },
        step: function() {
            var that = this;
            requestAnimationFrame(function() { that.step(); });
            that.drawer.draw(that.bubbles);
        },
        setBubblesCondition: function() {
            for(var i in this.bubbles) {
                this.bubbles[i].toggleMarked();
            }
        },
        moveBubbles: function() {
            for(var i in this.bubbles) {
                if(this.bubbles[i].marked) {
                    this.bubbles[i].moveX = this.movePosition.x;
                    this.bubbles[i].moveY = this.movePosition.y;
                }
            }
        }
    };
    function Bubble(position, radius, color, speed) {
        this.x = position.x;
        this.y = position.y;
        this.moveX = null;
        this.moveY = null;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.borderColor = color;
        this.marked = false;
        this.moving = false;
    }
    Bubble.prototype = {
        bubbleMover: function() {

        },
        toggleMarked: function() {
            if(this.marked){
                this.borderColor = '#CCFF99';
            } else {
                this.borderColor = this.color;
            }
        }
    };

    function Drawer() {
        this.field = {
            canvas: document.createElement('canvas'),
            w: null,
            h: null
        };
        this.field.canvas.id = "field";
        document.body.appendChild(this.field.canvas);
        this.field.context = this.field.canvas.getContext("2d");

    }
    Drawer.prototype = {
        draw: function(elements) {
            this.field.context.clearRect(0, 0, this.field.w, this.field.h);
            for(var i in elements) {
                this.drawBubble(elements[i]);
            }

        },
        drawBubble: function(bubble) {
            this.field.context.beginPath();
            this.field.context.arc(bubble.x, bubble.y, bubble.radius, 0, 2 * Math.PI, false);
            this.field.context.fillStyle = bubble.color;
            this.field.context.fill();
            this.field.context.lineWidth = 5;
            this.field.context.strokeStyle = bubble.borderColor;
            this.field.context.stroke();
        }
    };


    var myGame = new Game(600, 300);

    myGame.start();