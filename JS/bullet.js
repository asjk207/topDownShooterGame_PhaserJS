export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, angle) {
      super(scene, x, y, 'bullet');
      scene.add.existing(this);
      scene.physics.add.existing(this);
      this.setVelocity(Math.cos(angle) * 400, Math.sin(angle) * 400);
      this.setAngle(angle);
    }
  }