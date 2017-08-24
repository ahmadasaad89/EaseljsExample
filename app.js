let stage, w, h, loader;
let sky, box, coin, ground, clouds, clouds1, clouds2, groundImg, boxes, resultsTxt, tempCoin;
let BoxesEventsList, startShuffle, canPress;

window.onload =init;
/**
 * Initialize the stage and load the assets
 */
function init() {
    stage = new createjs.Stage("testCanvas");

    // grab canvas width and height for later calculations
    w = stage.canvas.width;
    h = stage.canvas.height;

    BoxesEventsList = [];
    startShuffle = false;
    manifest = [
        {src: "barrel_destroyed.png", id: "box"},
        {src: "coin.png", id: "coin"},
        {src: "reset_button.png", id: "reset"},
        {src: "sky_1.png", id: "sky"},
        {src: "ground_1.png", id: "ground"},
        {src: "clouds_1.png", id: "clouds"},
        {src: "clouds_2.png", id: "clouds1"}
    ];

    loader = new createjs.LoadQueue(false);
    loader.addEventListener("complete", handleComplete);
    loader.loadManifest(manifest, true, "assets/art/");

}
/**
 * Called after loading the assets is complete
 */
function handleComplete() {
    createBackground();
    //create the reset botton and the result panel
    createControls();
    //create 3 boxes
    boxes = boxesFactory(3, h - groundImg.height - 86);
    // create the main coin
    coin = createCoin(0, 0);
    // create the initial coin that shows at the start of the game
    tempCoin = createCoin(w/2 - 16, h/2 - 100);
    tempCoin.gotoAndPlay("run");
    stage.addChild(tempCoin);

    reset();
}
/**
 * Create the background components and add it to the stage
 */
function createBackground() {
    sky = new createjs.Shape();
    sky.graphics.beginBitmapFill(loader.getResult("sky")).drawRect(0, 0, w, h);

    groundImg = loader.getResult("ground");
    ground = new createjs.Shape();
    ground.graphics.beginBitmapFill(groundImg).drawRect(0, 0, w + groundImg.width, groundImg.height);
    ground.tileW = groundImg.width;
    ground.y = h - groundImg.height;

    clouds = new createjs.Bitmap(loader.getResult("clouds"));
    clouds.setTransform(Math.random() * w, h - clouds.image.height * 4 - 200, 4, 4);
    clouds.alpha = 0.6;

    clouds1 = new createjs.Bitmap(loader.getResult("clouds1"));
    clouds1.setTransform(Math.random() * w, h - clouds1.image.height * 3 - 200, 3, 3);

    clouds2 = new createjs.Bitmap(loader.getResult("clouds1"));
    clouds2.setTransform(Math.random() * w, h - clouds2.image.height * 2 - 200, 3, 3);

    stage.addChild(sky, clouds, clouds1, clouds2, ground);
}
/**
 * create the reset botton and the result panel
 */
function createControls() {
    let spriteSheet = new createjs.SpriteSheet({
        "images": [loader.getResult("reset")],
        "frames": {width: 300, height: 100},
        "animations": {
            out: 0,
            over: 1,
            down: 2
        }
    });
    let bitmapButton = new createjs.Sprite(spriteSheet);
    let bounds = bitmapButton.getBounds();
    stage.addChild(bitmapButton).set({x: w/2 - bounds.width/5.5 , y: 25, scaleX: 0.35, scaleY: 0.35});
    let resetButton = new createjs.ButtonHelper(bitmapButton);
    bitmapButton.on("click", () => {
        reset();
    });

    resultsTxt = new createjs.Text("Find The Coin!", "16px Arial", "#FFF");
    bounds = resultsTxt.getBounds();
    stage.addChild(resultsTxt).set({x: w/2 - bounds.width/2 , y: 75});
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", tick);
}
/**
 * Create a box instance and return it
 * @param posX
 * @param posY
 * @param hasCoin
 * @returns {createjs.Sprite} a box instance
 */
function createBox(posX, posY, hasCoin){
    let spriteSheet = new createjs.SpriteSheet({
        framerate: 3,
        "images": [loader.getResult("box")],
        "frames": {"regX": 0, "height": 96, "count": 6, "regY": 0, "width": 96},
        "animations": {
            "run": [0, 5, "stop", 1.5],
            "stop": [5],
            "reset": [0]
        }
    });
    let tempBox = new createjs.Sprite(spriteSheet);
    tempBox.hasCoin = hasCoin;
    tempBox.x = posX;
    tempBox.y = posY;

    return tempBox;

}
/**
 * Handle the event when clicking any of the boxes
 * @param evt: event data
 * @param box: data we send on adding the event listener
 */
function handleBoxClick(evt, box) {
    box.gotoAndPlay("run");
    if (box.hasCoin) {
        coin.gotoAndPlay("run");
        coin.visible = true;
        resultsTxt.text = "You Win!";
        resultsTxt.set({
            x:w/2 - resultsTxt.getBounds().width/2
        });
    } else {
        resultsTxt.text = "You Lost, Try Again!";
        resultsTxt.set({
            x:w/2 - resultsTxt.getBounds().width/2
        });
    }
    let i=0;
    boxes.forEach((box) => {
        box.off("click", BoxesEventsList[i], false);
        i++;
    });
    stage.update();
}
/**
 * Create a specific number of box instances and return an array with these instances
 * @param count
 * @param posY
 * @returns {Array}
 */
function boxesFactory(count, posY) {
    let boxesList = [];
    let initPos = w/2-50;
    for(let i=0; i<count; i++) {
        boxesList.push(createBox(initPos, posY, false));
    }
    return boxesList;
}
/**
 * Assigning the coin to a random box
 * @param boxesList
 */
function randomizeCoin(boxesList){
    let random = Math.floor(Math.random() * (boxesList.length));
    for(let i=0; i<boxesList.length; i++) {
        let hasCoin = i === random? true : false;
        boxesList[i].hasCoin = hasCoin;
    }
}
/**
 * Create a coin instance and return it
 * @param posX
 * @param posY
 * @returns {createjs.Sprite}
 */
function createCoin(posX, posY,) {
    let spriteSheet = new createjs.SpriteSheet({
        framerate: 3,
        "images": [loader.getResult("coin")],
        "frames": {"regX": 0, "height": 32, "count": 4, "regY": 0, "width": 32},
        "animations": {
            "run": [0, 3, "run", 1.5]
        }
    });
    let tempCoin = new createjs.Sprite(spriteSheet);
    tempCoin.x = posX;
    tempCoin.y = posY;
    return tempCoin;
}
/**
 * Remove the coin from all boxes
 */
function resetCoin() {
    boxes.forEach((box) => {
        box.hasCoin = false;
    });
}
/**
 * Reset the game
 */
function reset() {

    // when it is set to false, you can't click on the boxes
    canPress = false;
    resetCoin();
    randomizeCoin(boxes);
    let i = 0;
    boxes.forEach((box) => {
        box.gotoAndStop("reset");
        // placing the coin under the box
        if(box.hasCoin){
            coin.x = box.x+32;
            coin.y = box.y+32;
            stage.addChild(coin);
        }
        box.x = w/2-50;
        // remove the event listeners from the boxes
        box.off("click", BoxesEventsList[i], false);
        i++;
        stage.addChild(box);
    });

    // reset the events array
    BoxesEventsList = [];

    // reset the text panel
    resultsTxt.text = "Find The Coin!";
    resultsTxt.set({
        x:w/2 - resultsTxt.getBounds().width/2
    });

    // reset the temporary coin
    tempCoin.y =h/2 - 16;
    tempCoin.visible = true;
    startShuffle = false;
    coin.visible = false;

    createjs.Ticker.paused = false;
    stage.update();
}
/**
 * Handling the tick event
 * @param event
 */
function tick(event) {
    let deltaS = event.delta / 1000;

    // Animating the coin
    if(!createjs.Ticker.paused){
        if(tempCoin.y < h - 120) {
            tempCoin.y = (tempCoin.y + deltaS * 120)
        } else {
            startShuffle = true;
            tempCoin.visible = false;
        }
    }

    // Start shuffling the boxes after the coin hides behind them
    if(startShuffle){
        for(let i=0; i<boxes.length; i++){
            switch (i) {
                case 0:
                    if (boxes[i].x >= w/2 - 150) {
                        boxes[i].x = boxes[i].x - deltaS * 215;
                    }else {
                        createjs.Ticker.paused = true;
                        canPress = true;
                        startShuffle = false;
                    }
                    break;
                case 1:
                    if (boxes[i].x <= w/2 +50) {
                        boxes[i].x = boxes[i].x + deltaS * 215;
                    }
                    break;
                case 2:
                    break;
                default:break;
            }
        }
    }

    // adding the eventListeners to the boxes after the animation finish
    if (canPress) {
        boxes.forEach((box) => {
            if(box.hasCoin){
                coin.x = box.x+32;
                coin.y = box.y+32;
            }
            BoxesEventsList.push(box.on("click", handleBoxClick, null, true, box));
        });
        canPress = false;
    }

    //animating the clouds
    clouds.x = (clouds.x - deltaS * 30);
    if (clouds.x + clouds.image.width * clouds.scaleX <= 0) {
        clouds.x = w;
    }
    clouds1.x = (clouds1.x - deltaS * 45);
    if (clouds1.x + clouds1.image.width * clouds1.scaleX <= 0) {
        clouds1.x = w;
    }

    clouds2.x = (clouds2.x - deltaS * 60);
    if (clouds2.x + clouds2.image.width * clouds2.scaleX <= 0) {
        clouds2.x = w;
    }

    stage.update(event);
}