window.onload = function() {
    document.body.style.margin = 0; // fix margin issue -- would do in css but requirement is no css

    // set variable units of measurement so we can change the canvasSquareSize and everything scales
    var canvasSquareSize = 300;
    var sqSize = canvasSquareSize / 3;
    var halfsqSize = sqSize / 2;

    // create canvas and append to body
    var c = document.createElement('canvas');
    c.width = canvasSquareSize;
    c.height = canvasSquareSize;
    document.body.appendChild(c);
    var ctx = c.getContext("2d");

    // generate Png objects
    var topLeft = new Png(halfsqSize, halfsqSize, sqSize, sqSize, "http://riley.dev.kargo.com/code-test/test0.png");
    var middle = new Png(halfsqSize * 2, halfsqSize * 2, sqSize, sqSize, "http://riley.dev.kargo.com/code-test/test1.png");
    var bottomRight = new Png(halfsqSize * 3, halfsqSize * 3, sqSize, sqSize, "http://riley.dev.kargo.com/code-test/test2.png");

    // create MovementTracker which will update Png objs and properly render them in canvas
    var movementTracker = new MovementTracker(topLeft, middle, bottomRight);
    var interval = setInterval(function(){
        movementTracker.move();
    }, 7);

    // Png objects are the individual img squares loaded externally
    function Png(x, y, w, h, url){
        this.x = x || 0;
        this.y = y || 0;
        this.w = w || sqSize;
        this.h = h || sqSize;
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

    // Cycle through each image and draw it in the proper order
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
        if (this.b.w === canvasSquareSize) {
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
        } else if (this.a.y === 0 && this.a.x < canvasSquareSize - sqSize) {
            this.secondMove();
        // last movement (center circle gets big and is drawn last so that it overlaps)
        } else {
            this.lastMove();
        }
    };
};