import Phaser from "phaser";
import victorJSON from './assets/victor.json'
import victorPNG from './assets/victor.png'
import beetleJSON from './assets/beetle.json'
import beetlePNG from './assets/beetle.png'
import birdJSON from './assets/bird.json'
import birdPNG from './assets/bird.png'
import bg_1 from './assets/bg1.png'
import bg_2 from './assets/bg2.png'
import bg_3 from './assets/bg3.png'
import bg_3_1 from './assets/bg3_1.png'

import clouds from './assets/clouds.png'
import tower from './assets/tower.png'
import ground from './assets/ground.png'
// import foreground from './assets/foreground.png'

import laser from './assets/laser.png'
import pet from './assets/pet.png'
import petFire from './assets/pet-fire.png'




import ost from './sounds/ost.mp3'
import soundtrack1 from './sounds/soundtrack1.mp3'

import runningSound from './sounds/running.mp3'
import laserSound from './sounds/laser.mp3'




class Laser extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'laser')
  }
  fire(x, y, v, scene, pointer) {
    let movedX;
    this.body.reset(x, y)
    this.body.setAllowGravity(false)
    this.setActive(true)
    this.setVisible(true)
    this.setVelocityX(v)
    this.setVelocityY(v)
    scene.sounds.laser.currentTime = 500
    scene.sounds.laser.play()
    scene.beetles.forEach(b => {
      scene.physics.add.overlap(this, b, function(laser,beetle) {
        beetle.tint = 0xff0000;
        beetle.health -= 10;
        if (beetle.health === 0) {beetle.destroy();scene.beetles = scene.beetles.filter(b => b.id !== beetle.id);beetle = undefined}
        setTimeout(() => {if (laser) laser.destroy()},25)
        setTimeout(() => {
          if (beetle) beetle.tint = 0xffffff;
        }, 100)
  
      })


    })
    
    if (scene.cameras.main.scrollX > 0) movedX = pointer.x + scene.cameras.main.scrollX
    else movedX = pointer.x
    this.angle = Phaser.Math.Angle.Between(x, y, pointer.x + scene.cameras.main.scrollX, pointer.y + scene.cameras.main.scrollY) * (180 / Math.PI)
    scene.physics.moveTo(this, movedX, pointer.y, v);
  }
}

class LaserGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene)


    this.createMultiple({
      classType: Laser,
      frameQuantity: 30,
      visible: false,
      acitve: false,
      key: 'laser',
    })
  }
  fireLaser(x, y, v, scene, pointer) {

    const laser = this.getFirstDead(true)
    if (laser) {
      laser.fire(x, y, v, scene, pointer)
    }

  }
}



const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: window.innerWidth,
  height: window.innerHeight,
  resolution: window.devicePixelRatio * 2,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 2000 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('bg_1', bg_1);
  this.load.image('bg_2', bg_2);
  this.load.image('bg_3', bg_3);
  this.load.image('bg_3_1', bg_3_1);


  this.load.image('ground', ground);
  // this.load.image('foreground', foreground);

  this.load.image('clouds', clouds);
  this.load.image('tower', tower);
  this.load.image('laser', laser);
  


  this.load.image('pet', pet);
  this.load.image('pet-fire', petFire);


  this.load.atlas('victor', victorPNG, victorJSON);
  this.load.atlas('bird', birdPNG, birdJSON);
  this.load.atlas('beetle', beetlePNG, beetleJSON);


  this.load.audio('soundtrack1', soundtrack1);

  this.load.audio('ost', ost);

  this.load.audio('runningSound', runningSound);
  this.load.audio('laserSound', laserSound);


}

let player, helper, beetle;
let state = 'idle';
let isRight = true;
let jumpTimer = 0;
let running, jumping, petFly = true;

function WH(percent) {
  // return <percent> pixels height
  return Math.ceil(window.innerHeight * (percent / 100))
}

function create() {

  this.time.desiredFps = 30;
  this.WH = window.innerHeight;


  this.bg_1 = this.add.tileSprite(0, 0, game.config.width, game.config.height, "bg_1");
  let scaleX = this.cameras.main.width / this.bg_1.width
  let scaleY = this.cameras.main.height / this.bg_1.height
  let scale = Math.max(scaleX / 2, scaleY / 2)
  this.bg_1.setOrigin(0, 0);
  this.bg_1.setScrollFactor(0)

  this.clouds = this.add.tileSprite(0, 0, game.config.width, 144, "clouds");
  this.clouds.setOrigin(0, 0);
  this.clouds.setScrollFactor(0);
  this.clouds.y -= WH(2)
  this.bg_2 = this.add.tileSprite(0, 0, game.config.width, game.config.height, "bg_2");
  this.bg_2.setScrollFactor(0)
  this.bg_2.setOrigin(0, 0);
  this.bg_2.y += WH(5)

  // TOWER
  this.tower = this.add.image(game.config.width, game.config.height * .3, "tower");
  this.tower.scale = 1.5;
  this.tower.setOrigin(0, 0);
  this.tower.setScrollFactor(0);

  //BIRDS

  let bird1 = this.physics.add.sprite(100, 200, 'bird');
  bird1.body.setAllowGravity(false)
  bird1.scale = .2
  bird1.x = 2100

  let bird2 = this.physics.add.sprite(100, 100, 'bird');
  bird2.body.setAllowGravity(false)
  bird2.scale = .2
  bird2.x = 2850

  let bird3 = this.physics.add.sprite(100, 125, 'bird');
  bird3.body.setAllowGravity(false)
  bird3.scale = .1
  bird3.x = 3500

  this.beetles = []


  this.birds = [bird1, bird2, bird3]


  // TREES
  this.bg_3_1 = this.add.tileSprite(0, 0, game.config.width, game.config.height, "bg_3_1");
  this.bg_3_1.setScrollFactor(0)
  this.bg_3_1.setOrigin(0, 0);
  this.bg_3_1.y += Math.ceil(this.WH * .13)
  this.bg_3 = this.add.tileSprite(0, 0, game.config.width, game.config.height, "bg_3");
  this.bg_3.setScrollFactor(0)
  this.bg_3.setOrigin(0, 0);
  this.bg_3.y += WH(12)


  this.ground = this.add.tileSprite(0, 0, game.config.width, 200, "ground");
  this.ground.setOrigin(0, 0);
  this.ground.setScrollFactor(0);
  this.ground.y = WH(80)

  
  


  this.input.on('pointerdown', pointer => {
    this.shootLaser(pointer)
  })
  this.laserGroup = new LaserGroup(this)
  this.shootLaser = function (pointer) {
    this.helper.setTexture('pet-fire')
    setTimeout(() => this.helper.setTexture('pet'), 150)
   
      this.laserGroup.fireLaser(isRight ? this.helper.x + 60: this.helper.x - 25, this.helper.y, 3000, this, pointer)

   
  }

  player = this.physics.add.sprite(100, WH(70), 'victor');
  player.setCollideWorldBounds(true);
  player.body.setSize(250, 300, 5, 16);
  player.setOrigin(.5, 1)
  player.landY = player.y;

  helper = this.physics.add.sprite(100, WH(70), 'pet')
  helper.setCollideWorldBounds(true)
  helper.body.setAllowGravity(false)
  helper.scale = .35;
  helper.setOrigin(.5, .7);
  helper.body.immovable =true
  this.helper = helper

  for (let i = 0; i < 10; i++) {
    let beetle = this.physics.add.sprite(i > 0 ? 1000*i : 1000, 600, 'beetle');
    beetle.health = 100;
    beetle.setCollideWorldBounds(true);
    beetle.body.setSize(200, 300, 5, 16);
    beetle.setOrigin(.5, 1)
    beetle.scale = .7
    beetle.id = i
    this.beetles.push(beetle)
    
  }



  this.physics.world.bounds.y -= 70

  // this.foreground = this.add.tileSprite(0, 0, game.config.width, 200, "foreground");
  // this.foreground.setOrigin(0, 0);
  // this.foreground.setScrollFactor(0);
  // this.foreground.y = 890




  this.cursors = this.input.keyboard.createCursorKeys();
  this.myCam = this.cameras.main;
  this.myCam.setBounds(0, 0, game.config.width * 10, game.config.height);
  this.myCam.startFollow(player);
  this.myCam.setFollowOffset(-500, 0);



  this.sounds = new Object()
  this.sounds.running = this.sound.add('runningSound', { volume: 0.1 });
  this.sounds.soundtrack = this.sound.add('soundtrack1', { volume: 0.1 });
  this.sounds.ost = this.sound.add('ost', { volume: 0.1 });
  this.sounds.ost.loop = true

  this.sounds.running.loop = true;
  this.sounds.laser = this.sound.add('laserSound', {volume: .1, allowMultiple: true})







  this.anims.create({
    key: 'standing',
    frameRate: 30,
    frames: this.anims.generateFrameNames('victor', {
      prefix: 'VictorStanding_',
      suffix: '.png',
      zeroPad: 2,
      start: 0,
      end: 59,
    }),
    repeat: -1
  })
  this.anims.create({
    key: 'flying',
    frameRate: 21,
    frames: this.anims.generateFrameNames('bird', {
      prefix: 'bird_',
      suffix: '.png',
      zeroPad: 2,
      start: 0,
      end: 21,
    }),
    repeat: -1
  })
  this.anims.create({
    key: 'beetle-walking',
    frameRate: 30,
    frames: this.anims.generateFrameNames('beetle', {
      prefix: 'Beetle_',
      suffix: '.png',
      zeroPad: 2,
      start: 0,
      end: 29,
    }),
    repeat: -1
  })
  this.anims.create({
    key: 'running',
    frameRate: 45,
    frames: this.anims.generateFrameNames('victor', {
      prefix: 'VictorRunning_',
      suffix: '.png',
      zeroPad: 2,
      start: 0,
      end: 29,
    }),
    repeat: -1
  })
  player.play('standing')

  this.beetles.forEach(b => b.play('beetle-walking'))




  this.birds.forEach((b, i) => setTimeout(() => b.play('flying'), 300 * i))

  player.body.customBoundsRectangle.width *= 10

  this.player = player

  this.player.scale = .7


  this.physics.add.collider(this.player, this.beetle, function(player,beetle) {
    console.log('bum')
  })


  




}

function update() {
  if (this.player.body.velocity) {
    this.player.body.velocity.x = 0;
    const D = this.input.keyboard.addKey('D');  // Get key object
    const A = this.input.keyboard.addKey('A');  // Get key object
    const W = this.input.keyboard.addKey('W');  // Get key object
    const SPACE = this.input.keyboard.addKey('SPACE');  // Get key object

    const right = D.isDown || this.cursors.right.isDown
    const left = A.isDown || this.cursors.left.isDown
    const up = W.isDown || this.cursors.up.isDown || SPACE.isDown
    const idle = !left && !right
    if (!jumping) {
      if (this.helper.y > WH(65)) petFly = true
      if (this.helper.y < WH(60)) petFly = false
      this.helper.body.velocity.y = petFly ? -50 : 50
  
    }

    if (idle || up) this.sounds.running.stop()

    if (right) this.player.body.velocity.x += 300

    if ((right || left || up) && !this.sounds.ost.isPlaying) //this.sounds.ost.play()
    if (right && state !== 'running') {

      this.player.play('running');
      state = 'running'
      this.sounds.running.play()
      running = true;
      this.player.scale = .75




      if (!isRight) {
        this.player.flipX = false;
        isRight = true
      }
    }
    else if (idle && state !== 'idle') {
      this.player.play('standing')
      state = 'idle'
      this.player.scale = .7
      this.player.flipX = !isRight;


    }
    if (left) this.player.body.velocity.x -= 300
    if (left && state !== 'running') {
      this.player.play('running');
      this.sounds.running.play()
      state = 'running'
      this.player.scale = .75

      if (isRight) {
        this.player.flipX = true;
        isRight = false
      }
    }
    else if (idle && state !== 'idle') {
      this.player.play('standing')
      state = 'idle'
      this.player.scale = .7
      if (isRight) {
        this.player.flipX = false
        isRight = true
      }
    }
    if (up && this.player.body.onFloor() && this.time.now > jumpTimer) {
      this.player.body.velocity.y = -1500;
      this.helper.body.setAllowGravity(true)
      setTimeout(() => this.helper.body.velocity.y = -1500, 100)
      jumpTimer = this.time.now + 750;
      if (state === 'running') {
        this.player.anims.stop(null, true)
        this.player.setFrame('VictorRunning_00.png')
        jumping = true;
        running = true;
        setTimeout(() => { this.player.anims.play(); this.sounds.running.play(); jumping = false; this.helper.body.setAllowGravity(false)

        }, 1500)
      }
    }
    // scroll the texture of the tilesprites proportionally to the camera scroll
    this.tower.x = this.myCam.scrollX * -.3 + game.config.width * 1.3;
    this.clouds.tilePositionX += .5
    this.bg_2.tilePositionX = this.myCam.scrollX * .2;
    this.bg_3.tilePositionX = this.myCam.scrollX * .4;
    this.bg_3_1.tilePositionX = this.myCam.scrollX * .35;
    this.ground.tilePositionX = this.myCam.scrollX;
    // this.foreground.tilePositionX = this.myCam.scrollX * 2;
    this.birds.forEach((b, i) => {
      if (0 < this.myCam.scrollX && this.myCam.scrollX < (game.config.width * 4) - this.myCam.width) {
        if (state === 'running' && isRight) b.x += 4 - b.scale * 10
        else if (state === 'running' && !isRight) b.x -= 4 + b.scale * 5
        else b.x -= 10 * b.scale
        if (b.x <= 0) b.x = 6000
      } else {
        b.x -= 10 * b.scale
      }
    })
  }
  let angle = Phaser.Math.Angle.Between(this.helper.x, this.helper.y, this.input.mousePointer.x + this.cameras.main.scrollX, this.input.mousePointer.y + this.cameras.main.scrollY) * (180 / Math.PI)
  if (helper.x < this.player.x - 150) {helper.x += 5; helper.flipX = false  }
  else if (helper.x < this.player.x -100) {helper.x += 3; helper.flipX = false  }
  if (helper.x > this.player.x + 150) {helper.x -= 5; helper.flipX = true}
  else if (helper.x > this.player.x + 100) {helper.x -= 3; helper.flipX = true;}
  if (isRight) this.helper.angle = angle
  else  this.helper.angle = (angle + 180) % 360
  this.beetles.map(b => {if (b) b.body.x -= 4})
}
