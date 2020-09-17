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
var ammo,sky, jet, keypadControl;
var game = new Phaser.Game(config);

function preload(){
    //here "sky" is the key
    this.load.image('sky', 'http://labs.phaser.io/assets/skies/space3.png');
    //Loading the images
    this.load.image('jet', '/assets/images/jet.png');
    this.load.image('ammo', '/assets/images/ammo.png');
    this.load.image('bomb', '/assets/images/bomb.png');
    this.load.image('coin', '/assets/images/coin.png');
    //Spritesheet is a set of images, every image is called a frame
    this.load.spritesheet('explosion', '/assets/images/explosion.png',{
        frameWidth: 16,
        frameHeight: 16
    });
    
}
function create(){
    sky= this.add.image(400,300,'sky');
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
    //Adding velocity to the bombs
    setObjVelocity(bomb);
    //Adding animation after explosion
    this.anims.create({
        key: 'explode',
        frames: this.anims.generateFrameNumbers('explosion'),
        //20 frames in 1 sec
        frameRate: 20
    })
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
    if(keypadControl.left.isDown) jet.setVelocityX(-150);
    else if(keypadControl.right.isDown) jet.setVelocityX(150);
    else jet.setVelocityX(0);

    if(keypadControl.up.isDown) jet.setVelocityY(-150);
    else if(keypadControl.down.isDown) jet.setVelocityY(150);
    else jet.setVelocityY(0);

    //Keep falling the bombs, if they have all fell down
    checkForBombs(bomb);
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