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

        this.options = {
            minBubbleRadius : 10,
            maxBubblesRadius: 50,
            minBubblesSpeed: 1,
            maxBubbleSpeed: 8,
            borderSize: 5
        };
        this.movingFlag = true;
        this.requestAnimationFrame = null;

        this.bubbles = [];
    }
    Game.prototype = {
        start: function() {
            this.drawer = new Drawer(this.w, this.h);
            this.attachTo(document.body);

            // todo remove event listener
            $('body').on('contextmenu', '#field', function(e){ return false; });

            this.addClickListener(this.drawer.field.canvas);
            this.step();
        },
        pause: function() {
            this.movingFlag = !this.movingFlag;
            if(this.movingFlag) {
                this.step();
            }
        },
        attachTo : function (el) {
            // todo attach this.drawer.el / Done
            el.appendChild(this.drawer.field.canvas);
        },
        addClickListener: function(el) {
            var that = this,
                ctrlFlag = false;
            var position = {
              x: 0,
              y: 0
            };
            var keys = {
                1 : function(){
                    var i = 0, bubblesQuantity = that.bubbles.length,
                        isClickedToEmpty = true;
                    for(i; i < bubblesQuantity; i++) {
                        if(that.isClickedInCircle(position, that.bubbles[i])) {
                            // todo WTF?  / Done
                            isClickedToEmpty = false;

                            if(!ctrlFlag) {
                                if(!that.bubbles[i].marked) {
                                    that.clearBubblesMark();
                                    that.bubbles[i].marked = true;
                                } else {
                                    that.bubbles[i].marked = false;
                                }
                            } else {
                                if(!that.bubbles[i].marked) {
                                    that.bubbles[i].marked = true;
                                }
                            }
                        }
                    }
                    i = 0;
                    for(i; i < bubblesQuantity; i++) {
                        if(isClickedToEmpty && that.bubbles[i].marked) {
                            // todo simplify / Done
                            that.bubbles[i].setTarget(position.x, position.y);
                        }
                    }
                    that.moveBubbles();
                },
                3 : function(){
                    that.addBubble(position);
                },
                80 : function() {
                    that.pause();
                },
                112 : function() {
                    that.pause();
                }
            };

            $(el).on('mouseup', function(ev){
                ev.preventDefault();
                var target = ev.target;
                position.x = ev.offsetX;
                position.y = ev.offsetY;

                keys[ev.which]();

                that.setBubblesMarked();
                that.drawer.draw(that.bubbles);
            });
            document.addEventListener('keydown', function(ev){
                if(keys[ev.which]) {
                    keys[ev.which]();
                }
                if(ev.which == 17) {
                    ctrlFlag = true;
                }
            }, false);
            document.addEventListener('keyup', function(ev){
                if(ev.which == 17) {
                    ctrlFlag = false;
                }
            }, false);
        },
        addBubble: function(position) {
            // todo remove magic numbers / Done
            var radius = this.getRandomNumber(this.options.minBubbleRadius, this.options.maxBubblesRadius),
                color = this.getRandomColor(),
                speed = this.getRandomNumber(this.options.minBubblesSpeed, this.options.maxBubbleSpeed),
                bubble = new Bubble(position, radius, color, speed);
            this.bubbles.push(bubble);
        },
        getRandomColor: function() {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
            // (1048576 + Math.floor(Math.random() * 15728639)).toString(16)
            // ('000000' + Math.floor(Math.random() * 16777215).toString(16)).substr(-6)
        },
        getRandomNumber: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        isClickedInCircle: function(position, circle) {
           return (Math.pow((position.y - circle.y), 2) + Math.pow((position.x - circle.x), 2)) <= Math.pow(circle.radius + this.options.borderSize, 2 );
        },
        step: function() {
            var that = this;
            this.requestAnimationFrame = requestAnimationFrame(function() {
                if(that.movingFlag) {
                    that.step();
                }
            });

            for(var i in that.bubbles) {
                if(that.bubbles[i].moveX && that.bubbles[i].moveY) {
                    if(!that.isFinishPosition(that.bubbles[i])) {
                        that.bubbles[i].x += this.bubbles[i].step.x * that.bubbles[i].speed;
                        that.bubbles[i].y += this.bubbles[i].step.y * that.bubbles[i].speed;
                    }
                }
            }
            that.drawer.draw(that.bubbles);
        },
        setBubblesMarked: function() {
            for(var i in this.bubbles) {
                this.bubbles[i].toggleMarked();
            }
        },
        moveBubbles: function() {
            var distance = 0;
            for(var i in this.bubbles) {
                if(this.bubbles[i].marked) {
                    distance = Math.sqrt(Math.pow(this.bubbles[i].moveX - this.bubbles[i].x, 2) + Math.pow(this.bubbles[i].moveY - this.bubbles[i].y, 2));
                    this.bubbles[i].step = {
                        x: (this.bubbles[i].moveX - this.bubbles[i].x) / distance,
                        y: (this.bubbles[i].moveY - this.bubbles[i].y) / distance
                    };
                }
            }
        },
        isFinishPosition: function(bubble) {
            // todo remove magic numbers / Done
            return (bubble.moveX > (bubble.x - bubble.targetZone) && bubble.moveX < (bubble.x + bubble.targetZone)) &&
                (bubble.moveY > (bubble.y - bubble.targetZone) && bubble.moveY < (bubble.y + bubble.targetZone));
        },
        clearBubblesMark: function() {
            var i = 0, bubblesQuantity = this.bubbles.length;
            // todo separate / Done
            for(i; i < bubblesQuantity; i++) {
                this.bubbles[i].marked = false;
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
        this.step = {
            x : 0,
            y : 0
        };
        this.targetZone = this.speed / 2;
    }
    Bubble.prototype = {
        toggleMarked: function() {
            if(this.marked){
                this.borderColor = '#CCFF99';
            } else {
                this.borderColor = this.color;
            }
        },
        setTarget : function (x, y) {
            // todo implement this / Done
            this.moveX = x;
            this.moveY = y;
        }
    };

    function Drawer(w, h) {
        this.DOUBLE_PI = 2 * Math.PI;
        this.field = {
            canvas: document.createElement('canvas'),
            w: w,
            h: h
        };
        // todo don't touch inner data / Done

        this.field.canvas.width = this.field.w;
        this.field.canvas.height = this.field.h;
        this.field.canvas.id = "field";

        // todo only export element / Done
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
            this.field.context.arc(bubble.x, bubble.y, bubble.radius, 0, this.DOUBLE_PI, false);
            this.field.context.fillStyle = bubble.color;
            this.field.context.fill();
            this.field.context.lineWidth = 5;
            this.field.context.strokeStyle = bubble.borderColor;
            this.field.context.stroke();
        }
    };

    var myGame = new Game(600, 300);

    myGame.start();