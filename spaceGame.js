var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
    },
    //Default screen
    scene: {
        //Used in preloading the aasets (audio, video, images etc.)
        preload: preload,
        //Adds the preloaded items to the screen
        create: create,
        //Update runs in a continuous loop
        update: update
    }
};
//Declaring variables
var coins, gunshot,explosion,ammo,sky, jet, keypadControl;
var game = new Phaser.Game(config);
var coinhit;

function preload(){
    //here "sky" is the key
    this.load.image('sky', 'http://labs.phaser.io/assets/skies/space3.png');
    //Loading the images
    this.load.image('jet', '/assets/images/jet.png');
    this.load.image('ammo', '/assets/images/ammo.png');
    this.load.image('bomb', '/assets/images/bomb.png');
    this.load.image('coin', '/assets/images/coin.png');
    //Spritesheet is a set of images, every image is called a frame
    this.load.spritesheet('explosion', 'assets/spritesheets/explosion.png', {
        frameWidth: 16,
        frameHeight: 16
    })
    //Loading the audio for gunshot and audio collection
    this.load.audio('gun-shot', 'assets/audio/gunshot.wav');
    this.load.audio('coinhit', 'assets/audio/coinhit.wav');
}
function create(){
    //Making the background dynamic
    sky= this.add.tileSprite(400,300,config.width, config.height,'sky');
    jet= this.physics.add.image(400,500,'jet').setScale(0.15);

    jet.setCollideWorldBounds(true);
    keypadControl= this.input.keyboard.createCursorKeys();
    this.input.on('pointerdown', shoot, this)  //On click it should shoot

    bomb= this.physics.add.group({
        key:'bomb',
        repeat:3,
        setXY:{
            x:20, y:50, stepX:Phaser.Math.Between(10, config.width-15),stepY:Phaser.Math.Between(15, 300)
        }
    })
    //Adding coins
    coins= this.physics.add.group();
    for (let index = 0; index < 10; index++) {
        let X= Phaser.Math.Between(0, config.width-15);
        let Y= Phaser.Math.Between(0, 200);
        let newCoin = coins.create(X,Y,'coin')
    }
    //Adding velocity to the bombs & coins
    setObjVelocity(coins);
    setObjVelocity(bomb);
    //Adding animation after explosion
    this.anims.create({
        key: 'explode',
        frames: this.anims.generateFrameNumbers('explosion'),
        frameRate: 20,
        //The explosion will be removed after completion
        hideOnComplete: true
    })
    //Collect coins when the jet and the coins collide
    this.physics.add.collider(jet, coins, collectCoins, null, this);

    //Adding the gunshot sounds & coin collection
    gunshot= this.sound.add('gun-shot');
    coinHit= this.sound.add('coinhit');
}

function collectCoins(jet, coins){
    //Enabling coin sounds
    coinHit.play();
    //Disable coins after collision
    coins.disableBody(true, true)

    //enabling coins again
    let x= Phaser.Math.Between(0, config.width-15);
    //Now enable the coins (reset, xcoord, ycoord, enable, show)
    coins.enableBody(true, x,0,true, true);
    
    //Adding velocity to the coins
    let xVel= Phaser.Math.Between(-100,100);
    let yVel= Phaser.Math.Between(80,170);
    coins.setVelocity(xVel, yVel);
}

function setObjVelocity(bombs){
    bombs.children.iterate(function(bom){
        let xVel= Phaser.Math.Between(-100,100);
        let yVel= Phaser.Math.Between(110,170);
        bom.setVelocity(xVel, yVel);
    })
}
function shoot(){
    //Setting the ammo to the top of the jet
    ammo= this.physics.add.image(jet.x,jet.y,'ammo').setScale(0.1).setOrigin(0.5,0.5);
    //Rotating the ammo by 90 deg
    ammo.setRotation(-Phaser.Math.PI2 / 4);
    ammo.setVelocityY(-600);
    //What happens when ammo hits bomb
    this.physics.add.collider(ammo, bomb, destroyBomb, null, this);
}

function destroyBomb(ammo, bomb){
    //Adding the explosion animation  & the sound
    gunshot.play()
    explosion = this.add.sprite(bomb.x, bomb.y, 'explosion').setScale(4);
    explosion.play('explode')
    bomb.disableBody(true, true);
    ammo.disableBody(true, true);
    //Disable that bomb and set that bomb at a new position
    let x= Phaser.Math.Between(0, config.width-15);
    let y= Phaser.Math.Between(0, 200);
    //Now enable the bomb (reset, xcoord, ycoord, enable, show)
    bomb.enableBody(true, x,y,true, true);
    //Adding velocity to the bomb
    let xVel= Phaser.Math.Between(-100,100);
    let yVel= Phaser.Math.Between(80,170);
    bomb.setVelocity(xVel, yVel);
    
}

function update(){
    //Moving the screen
    sky.tilePositionY -= 0.5;
    if(keypadControl.left.isDown) jet.setVelocityX(-150);
    else if(keypadControl.right.isDown) jet.setVelocityX(150);
    else jet.setVelocityX(0);

    if(keypadControl.up.isDown) jet.setVelocityY(-150);
    else if(keypadControl.down.isDown) jet.setVelocityY(150);
    else jet.setVelocityY(0);

    //Keep falling the bombs and coins, if they have all fell down
    checkForBombs(bomb);
    checkForBombs(coins)
}

function checkForBombs(bombs){
    bombs.children.iterate(function(bomb){
        //if the bomb falls down, reset the coords of the bomb
        if(bomb.y >config.height){
            resetPos(bomb);
        }
    })
}

function resetPos(bomb){
    bomb.y=0;
    let randomX= Phaser.Math.Between(15, config.width-15);
    bomb.x=randomX;

}