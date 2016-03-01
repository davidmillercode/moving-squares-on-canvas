window.onload = function() {
    document.body.style.margin = 0; // fix margin issue -- would do in css but requirement is no css
    var c = document.createElement('canvas');
    c.width = 300;
    c.height = 300;
    document.body.appendChild(c);
    //var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");

    // generate Png objects
    var topLeft = new Png(50,50,100,100, "http://riley.dev.kargo.com/code-test/test0.png");
    var middle = new Png(100,100,100,100, "http://riley.dev.kargo.com/code-test/test1.png");
    var bottomRight = new Png(150,150,100,100, "http://riley.dev.kargo.com/code-test/test2.png");

    // create MovementTracker which will update Png objs and properly render them in canvas
    var movementTracker = new MovementTracker(topLeft, middle, bottomRight);
    var interval = setInterval(function(){
        movementTracker.move();
    }, 7);

    // Png objects are the individual img squares loaded externally
    function Png(x, y, w, h, url){
        this.x = x || 0;
        this.y = y || 0;
        this.w = w || 100;
        this.h = h || 100;
        this.url = url || "http://riley.dev.kargo.com/code-test/test0.png";
    }

    Png.prototype.draw = function(first){
        var that = this;
        var img = new Image();
        img.src = this.url;
        if (first) {
            img.onload = function(){
                ctx.drawImage(img, that.x, that.y, that.w, that.h);
            }
        } else {
            ctx.drawImage(img, that.x, that.y, that.w, that.h);
        }
    };

    // MovementTracker keeps track of locations of the three images and orders that to be drawn
    // in appropriate location
    function MovementTracker(imgA, imgB, imgC) {
        // a and c move in opposite directions always
        // for a: up and left 50, followed by right 200 -- opposite for c
        this.a = imgA;
        this.b = imgB;
        this.c = imgC;
        this.collection = [this.a, this.b, this.c]; // to easily generate later
    }

    // cycle through each image and draw it in the proper order
    MovementTracker.prototype.draw = function(isLastMove){
        // reset canvas first
        ctx.clearRect(0, 0, c.width, c.height);
        // draw each image (draw middle image last only on last move)
        this.collection.forEach(function(img, i){
            if (isLastMove && i === 1) {
                // dont draw middle one yet - need to draw last so on top
            } else {
                img.draw();
            }
        });
        // draw middle img last when on last move - not added above on last move
        if (isLastMove){
            this.collection[1].draw();
        }
    };

    // TL and BR going toward corners
    MovementTracker.prototype.firstMove = function(){
        this.a.x -= 1;
        this.a.y -= 1;
        this.c.x += 1;
        this.c.y += 1;
        this.draw();
    };

    // TL and BR going to opposite horizontal corner
    MovementTracker.prototype.secondMove = function(){
        this.a.x += 1;
        this.c.x -= 1;
        this.draw();
    };

    // center square overlaps and grows to size of canvas
    MovementTracker.prototype.lastMove = function(){
        // case to stop drawing
        if (this.b.w === 300) {
            // center square image is full canvas now
            clearInterval(interval);
        } else {
            this.b.w += 2;
            this.b.h += 2;
            this.b.x -= 1;
            this.b.y -= 1;
            this.draw(true); // true to tell that it's the last move
        }
    };

    // controls which move gets triggered (first, second, or last)
    MovementTracker.prototype.move = function(){
        // if first iteration of movement (a is below top of canvas)
        if (this.a.y > 0) {
            this.firstMove();
        // if second iteration of movement (a is on top of canvas and not all the way on right)
        } else if (this.a.y === 0 && this.a.x < 200) {
            this.secondMove();
        // last movement (center circle gets big and is drawn last so that it overlaps)
        } else {
            this.lastMove();
        }
    };
};