//import { Bullet } from './bullet.js';

// 최근 진행상황
/* 1. 작업 목표
      (1) 코드 리팩토링 하기.
          - 변수 정리
          - 함수화
      (2) 강화학습 에이젼트가 이동하고 칼을 휘두르게 하기.
*/
/* 2. 버그
      
*/
// Set up the game configuration
const config = {
    type: Phaser.AUTO,
    width: 2000,
    height: 1400,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };


  // Create the game using the configuration
  let game = new Phaser.Game(config);

  // player 상태 변수
  let player;
  let enemy;
  let bullets;
  let currentAngle;
  let currentVelocity;
  let currentPlayerDirection;

  //bullet 상태 변수
  const maxBullets = 20;
  const bulletVellocity = 700;
  let canFire = true;
  let bulletAngle;
  let gunMuzzleDirection = {
    xPos:-130,
    yPos:-50
  }


  //knife 상태 변수
  let doingKnifeAttack = false;
  let knifeAttackAnimation;
  let knifeAttackAnimationState;

  //knife 히트박스
  let knifeHitBox;
  let knifeHitBoxCalculatePosition = {
    xPos:110,
    yPos:120
  }

  let keyboard;

  let graphics;

  /*let bulletPool = this.physics.add.group({
    classType: Bullet,
    maxSize: maxBullets,
    runChildUpdate: true
  });*/

  // Preload assets
  function preload() {
    //console.log(this);
    //console.log(game);
    this.load.image('player', 'assets/player.png');
    this.load.image('enemy', 'assets/enemy_fix.png');
    this.load.image('bullet', 'assets/Top_Down_Survivor/Top_Down_Survivor/rifle/rifle-bullet.png');
    for(var i=0; i < 20; i++){
        this.load.image('player-move_rifle_'+i, 'assets/Top_Down_Survivor/Top_Down_Survivor/rifle/move/survivor-move_rifle_'+i+'.png');
    }
    this.load.spritesheet('knifeAttack','assets/Top_Down_Survivor/Top_Down_Survivor/knife/meleeattack/knife_attack.png',{ frameWidth: 349, frameHeight: 320 })
    
  }
  
  // Set up the game world and objects
  function create() {
    
    // Create the player character
    //player = this.physics.add.image(400, 300, 'player').setAngle(180);
    player = this.physics.add.sprite(450, 320, 'player').setAngle(180);
  
    // Create the enemies
    enemy = this.physics.add.sprite(500, 500, 'enemy').setAngle(180);
    enemy.body.setAllowGravity(false);
    //this.enemies = this.physics.add.group();
    
    

    // Set the ememy
    /*let x = Phaser.Math.Between(100, 700);
    let y = Phaser.Math.Between(100, 500);
    let enemy = this.physics.add.image(x, y, 'enemy');*/

    // Animation set
    knifeAttackAnimation = this.anims.create({
      key: 'knifeAttack',
      frames: this.anims.generateFrameNumbers('knifeAttack', { frames: [ 0, 1, 2, 3, 4, 5, 6, 7,8,9,10,11,12 ] }),
      frameRate: 6,
      repeat: 0
    });
    //knifeAttack 애니메이션이 끝난것을 감지합니다.
    player.on('animationcomplete', function(animation, frame) {
      if (animation.key === 'knifeAttack') {
        console.log('Knife attack animation has ended');
        doingKnifeAttack = false;
      }
    });

    // 칼 휘두를 때 히트박스 생성
    // hitBox 객체 생성
    //const hitBox = this.add.rectangle(player.x + 20, player.y + 20, 20, 20, 0xff0000, 0.5);
    /*hitBox = new Phaser.GameObjects.Rectangle(this.scene,0, 0, 220,100, 0xff0000, 1);
    this.physics.add.existing(hitBox);
    hitBox.body.setAllowGravity(false);
    hitBox.body.moves = false;*/

   /* hitBox = this.add.sprite(10, 10, 'coloredRect');
    hitBox.setOrigin(0, 0);*/

    graphics = this.add.graphics();
    //graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 220, 100);

    knifeHitBox = this.physics.add.sprite(10, 10, graphics.generateTexture());
    // 히트박스 투명화
    //knifeHitBox.setAlpha(0);
    //graphics.destroy();
    

    // enemy Knifee Attack Animation
    
    //enemy.setScale(1);
    //this.enemies.add(enemy);

    
    // Set up the player's controls
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    // A 키에 대해서 키 반복 간격을 500ms로 설정
    // Uncaught TypeError: this.aKey.setKeyRepeat is not a function 에러로 작동 하지 않음.
    //this.aKey.setKeyRepeat(500,50);
    //console.log(this.aKey);

    // Set up the player's bullets
    bullets = this.physics.add.group();
    bullets.checkWorldBounds = true;
    bullets.defaults.setCollideWorldBounds = true;

    // Create the bullet pool
    /*bulletPool = this.physics.add.group({
        classType: Bullet,
        maxSize: 20,
        runChildUpdate: true
    });*/

    //총알 발사 가능유무
    canFire = true;

    //총알과 게임맵 끝자락이 충돌시
    this.physics.world.on('worldbounds', function (body) {
        if (body.gameObject instanceof Phaser.GameObjects.Image) {
            //console.log(body.gameObject);
            //console.log(bullets.children);
            body.gameObject.disableBody(true, true);
        }
    });
    

    // 충돌처리 등록
    //this.physics.add.collider(this.enemy, player);
    //적과 플레이어가 충돌시
    this.physics.add.collider(enemy,player,(enemy,player)=>{
      //console.log("collide PLAYER AND ENEMY");
      enemy.body.stop();
      player.body.stop();
    });

    
    // 여기에서 hitBox와 적의 충돌을 감지하는 로직을 추가합니다.
    /*this.physics.overlap(enemy,hitBox, (enemy,hitBox ) => {
      // hitBox가 다른 물체와 충돌했을 때 실행되는 코드
      console.log("collide HITBOX AND ENEMY");
    });*/
  }
  
  // Update the game world
  function update() {
    // 플레이어 이동 제어.
    // Update the player's movement
    player.setVelocity(0);

    directionSet(this.cursorKeys);
    
    // Update the player's shootings
    if (this.spaceKey.isDown && canFire) {
      // Get a bullet from the pool
      let bullet;// = bulletPool.get();
      /*if (!bullet) {
        return;
      }*/
      
      canFire = false;
      setTimeout(() => {
        canFire = true;
      }, 500); // set the time to 500ms

      //console.log((player.x-130)+"..."+ (player.y));
      
      bullet = this.physics.add.image((player.x+gunMuzzleDirection.xPos), (player.y+gunMuzzleDirection.yPos), 'bullet').setDisplaySize(50, 50).setAngle(bulletAngle);
      bullet.body.onWorldBounds = true;
      bullets.add(bullet);
      bulletDirectionSet(bullet);
      // 총알 이미지의 각도가 바뀌지 않는다 왜??
      
      //console.log(bullets);
      //console.log(bullet);
      //console.log(gunMuzzleDirection);
    }
    //this.aKey.checkDown(this.aKey, 500)


    if (this.aKey.isDown) {
      //console.log(doingKnifeAttack);
      if (!doingKnifeAttack) { // 애니메이션 실행 중이 아닐 때만 실행
        doingKnifeAttack = true;
        player.anims.play('knifeAttack');

        // 애니메이션 실행 중일 때만 충돌 감지 네모형태 히트박스 생성
        // hitBox의 위치를 업데이트합니다.
        console.log("knifeHitBoxCalculatePosition.xPos: "+knifeHitBoxCalculatePosition.xPos+"knifeHitBoxCalculatePosition.yPos"+knifeHitBoxCalculatePosition.yPos);
        knifeHitBox.x = player.x +knifeHitBoxCalculatePosition.xPos;
        knifeHitBox.y = player.y +knifeHitBoxCalculatePosition.yPos;
        //graphics.fillStyle(0xff0000, 1);
        //graphics.generateTexture();
        
      }else {
        
      }
    }

    if (doingKnifeAttack) { // 애니메이션이 실행중 일때만 칼이 휘두른 것을 감지합니다.
      this.physics.overlap(enemy,knifeHitBox, (enemy,hitBox ) => {
        // hitBox가 다른 물체와 충돌했을 때 실행되는 코드
        console.log("overlap HITBOX AND ENEMY");
      });
    }
    // Check for bullet-enemy collisions
    this.physics.add.collider(bullets, this.enemies, (bullet, enemy) => {
      bullet.destroy();
      enemy.destroy();
    });

    

}

function directionSet(cursurKey){
  if (cursurKey.left.isDown) {
    currentAngle = 180;
    currentVelocity = -250;

    // 칼 히트박스 위치
    knifeDirectionSet(-150, -20);
    // 총구 및 총알 방향 설정
    gunDirectionSet(currentAngle, -130, -50);
    
    // 현재 플레이어가 가리키는 방향표시.
    currentPlayerDirection='left';

    playerMove(currentAngle, currentVelocity);

  } else if (cursurKey.right.isDown) {
    currentAngle = 0;
    currentVelocity = 250;

    // 칼 히트박스 위치
    knifeDirectionSet(150, 20);
    // 총구 및 총알 방향 설정
    gunDirectionSet(currentAngle, 130, 50);

    currentPlayerDirection='right';

    playerMove(currentAngle, currentVelocity);
  } if (cursurKey.up.isDown) {
    currentAngle = 270;
    currentVelocity = -250;

    // 칼 히트박스 위치
    knifeDirectionSet(-110, -120);
    // 총구 및 총알 방향 설정
    gunDirectionSet(currentAngle, 50, -130);
    
    currentPlayerDirection='up';
    
    playerMove(currentAngle, currentVelocity);
  } else if (cursurKey.down.isDown) {
    currentAngle = 90;
    currentVelocity = 250;

    // 칼 히트박스 위치
    knifeDirectionSet(110, 120);
    // 총구 및 총알 방향 설정
    gunDirectionSet(currentAngle, -50, 130);
    
    currentPlayerDirection='down';
    
    playerMove(currentAngle, currentVelocity);
  }
}

function playerMove(currentAngle, currentVelocity){
  // 플레이어가 움직이는 방향과 속도
  player.setAngle(currentAngle);
  if(currentPlayerDirection == 'left' || currentPlayerDirection == 'right') {
    player.setVelocityX(currentVelocity);
  } else if(currentPlayerDirection == 'up' || currentPlayerDirection == 'down') {
    player.setVelocityY(currentVelocity);
  }
}

function gunDirectionSet(angle, xPos, yPos){
  bulletAngle = angle;
  gunMuzzleDirection.xPos = xPos;
  gunMuzzleDirection.yPos = yPos;
}

function bulletDirectionSet(bullet){
  if(currentPlayerDirection=='up' || currentPlayerDirection=='down') {
    if(currentPlayerDirection=='up' ){
       
        bullet.setVelocityY(-bulletVellocity);
    }else if(currentPlayerDirection=='down' ){
        bullet.setVelocityY(bulletVellocity);
    }
  }else if(currentPlayerDirection=='left' || currentPlayerDirection=='right') {
    if(currentPlayerDirection=='left' ){
        bullet.setVelocityX(-bulletVellocity);
    }else if(currentPlayerDirection=='right' ){
        bullet.setVelocityX(bulletVellocity);
    }
  }else{
    bullet.setVelocityX(-bulletVellocity);
  }
}

function knifeDirectionSet(xPos, yPos) {
  knifeHitBoxCalculatePosition.xPos = xPos;
  knifeHitBoxCalculatePosition.yPos = yPos;
}
