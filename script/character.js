class Position {

  static calcLength(x, y) {
    return Math.sqrt(x * x + y * y);
  }
  static calcNormal(x, y) {
    let len = Position.calcLength(x, y);
    return new Position(x / len, y / len);
  }
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    if(x != null) {this.x = x;}
    if(y != null) {this.y = y;}
  }

  distance(target) {
    let x = this.x - target.x;
    let y = this.y - target.y;
    return Math.sqrt(x * x + y * y);
  }

  cross(target) {
    return this.x * target.y - this.y * target.x;
  }

  normalize(){
    let l = Math.sqrt(this.x * this.x + this.y * this.y);
    if(l === 0) {
      return new Position(0, 0);
    }
    let x = this.x / l;
    let y = this.y / l;
    return new Position(x, y);
  }

  rotate(radian) {
    let s = Math.sin(radian);
    let c = Math.cos(radian);
    this.x = this.x * c + this.y * -s;
    this.y = this.x * s + this.y * c;
  }
}

class Character {
  constructor(ctx, x, y, w, h, life, imagePath) {
    this.ctx = ctx;
    this.position = new Position(x, y);
    this.vector = new Position(0.0, -1.0);
    this.angle = 270 * Math.PI / 180;
    this.width = w;
    this.height = h;
    this.life = life;
    this.ready = false;
    this.image = new Image();
    this.image.addEventListener("load", () => {
      this.ready = true;
    }, false);
    this.image.src = imagePath;

    this.control = false;
  }

  setExplosions(targets) {
    if(targets != null && Array.isArray(targets) === true && targets.length > 0) {
      this.explosionArray = targets;
    }
  }

  setSound(sound) {
    this.sound = sound;
  }

  setVector(x, y) {
    this.vector.set(x, y);
  }

  setVectorFromAngle(angle) {
    this.angle = angle;
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    this.vector.set(cos, sin);
  }

  draw() {
    let offsetX = this.width / 2;
    let offsetY = this.height / 2;
    if(this.life > 0) {
      this.ctx.drawImage(
        this.image,
        this.position.x - offsetX,
        this.position.y - offsetY,
        this.width,
        this.height
      );
    }
  }

  rotationDraw() {
    this.ctx.save();
    this.ctx.translate(this.position.x, this.position.y);
    this.ctx.rotate(this.angle - Math.PI * 1.5);
    let offsetX = this.width / 2;
    let offsetY = this.height / 2;
    this.ctx.drawImage(
      this.image,
      -offsetX,
      -offsetY,
      this.width,
      this.height
    );
    this.ctx.restore();
  }
}

class Item extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath);
    this.girl = null;
  }

  set(x, y) {
    this.position.set(x, y);
    this.life = 1;
  }

  setGirl(girl) {
    this.girl = girl;
  }

  update() {
    if(this.life === 0) {return;}
    this.position.y += 2.0;
    let dist = this.position.distance(this.girl.position);
    if(dist <= this.girl.height / 2) {
      this.girl.hp += 1;
      if(this.sound != null){
        this.sound.play();
      }
      if(this.girl.hp >= 6) {
        this.girl.hp = 6;
      }
      this.life = 0;
    }
    this.draw();
  }
}

class Cursor extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 1, imagePath);

    this.upCount = 0;
  }

  setGirl(girl) {
    this.girl = girl;
  }

  update() {
    if(this.upCount >= 30) {
      this.girl.strongestMode = true;
    }
    if(this.control === true) {
      if(window.isKeyDown.key_ArrowUp === true) {
        this.position.y -= 100;
        if(this.sound != null){
          this.sound.play();
        }
        window.isKeyDown.key_ArrowUp = false;
      }
      if(window.isKeyDown.key_ArrowDown === true) {
        this.position.y += 100;
        if(this.sound != null){
          this.sound.play();
        }
        window.isKeyDown.key_ArrowDown = false;
      }
      if(this.position.y < 100) {
        this.position.y = 100;
        this.upCount += 1;
      }
      if(this.position.y > 400) {
        this.position.y = 400;
      }
    }
    this.draw();
  }
}

class Girl extends Character {
  constructor(ctx, util, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath);

    this.speed = 6;
    this.hp = 3;
    this.util = util;
    this.shotCheckCounter = 0;
    this.shotInterval = 20;
    this.bombCheckCounter = 0;
    this.bombInterval = 10;
    this.isComing = false;
    this.comingStart = null;
    this.comingStartPosition = null;
    this.comingEndPosition = null;
    this.shotArray = null;
    this.miniShotArray = null;
    this.beam = null;
    this.bombArray = null;
    this.timer = 0;
    this.immortal = false;
    this.heartarray = [];
    this.devilMode = false;
  }

  setComing(startX, startY, endX, endY) {
    this.life = 1;
    this.isComing = true;
    this.comingStart = Date.now();
    this.position.set(startX, startY);
    this.comingStartPosition = new Position(startX, startY);
    this.comingEndPosition = new Position(endX, endY);
    this.timer = Date.now();
    this.immortal = true;
  }

  setSword(sword) {
    this.sword = sword;
  }

  setBeam(beam) {
    this.beam = beam;
  }

  setShotArray(shotArray, miniShotArray) {
    this.shotArray = shotArray;
    this.miniShotArray = miniShotArray;
  }

  setBombArray(bombArray) {
    this.bombArray = bombArray;
  }

  setHeartArray(heartArray) {
    this.heartArray = heartArray;
  }

  radCW(angle) {
    return angle * Math.PI / 180;
  }


  update() {
    if(this.strongestMode === true) {
      for(let i = 0; i < this.shotArray.length; ++i) {
        this.shotArray[i].power = 250;
      }
      for(let i = 0; i < this.miniShotArray.length; ++i) {
        this.miniShotArray[i].power = 200;
      }
      this.beam.power = 50;
      this.sword.power = 1000;
      for(let i = 0; i < this.bombArray.length; ++i) {
        this.bombArray[i].power = 1000;
      }
    }

    for(let i = this.hp; i < this.heartArray.length; ++i) {
      this.heartArray[i].life = 0;
    }
    for(let i = 0; i < this.hp; ++i) {
      this.heartArray[i].life = 1;
    }
    if(this.life <= 0){return;}

    let justTime = Date.now();

    if(this.isComing === true) {
      let comingTime = (justTime - this.comingStart);
      let y = this.comingStartPosition.y - comingTime;
      if(y <= this.comingEndPosition.y) {
        y = this.comingEndPosition.y;
        this.isComing = false;
      }
      this.position.set(this.position.x, y);

      if(justTime % 100 < 50) {
        this.ctx.globalAlpha = 0.5;
      }
    }else{
      if(this.control === true) {
        if(window.isKeyDown.key_ArrowLeft === true) {
          this.position.x -= this.speed;
        }
        if(window.isKeyDown.key_ArrowRight === true) {
          this.position.x += this.speed;
        }
        if(window.isKeyDown.key_ArrowUp === true) {
          this.position.y -= this.speed;
        }
        if(window.isKeyDown.key_ArrowDown === true) {
          this.position.y += this.speed;
        }
        let canvasWidth = this.ctx.canvas.width;
        let canvasHeight = this.ctx.canvas.height;
        let tx = Math.min(Math.max(this.position.x, 0), canvasWidth);
        let ty = Math.min(Math.max(this.position.y, 0), canvasHeight);
        this.position.set(tx, ty);
  
        if(window.isKeyDown.key_z === true) {
          switch(cursor.position.y) {
            case 100:
              if(this.shotCheckCounter >= 0) {
                let i;
                for(i = 0; i < this.shotArray.length; ++i) {
                  if(this.shotArray[i].life <= 0) {
                    this.shotArray[i].set(this.position.x, this.position.y - this.height / 2);
                    this.shotCheckCounter = -this.shotInterval;
                    break;
                  }
                }
                for(i = 0; i < this.miniShotArray.length; ++i) {
                  if(this.miniShotArray[i * 6].life <= 0 && this.miniShotArray[i * 6 + 1].life <= 0 &&
                    this.miniShotArray[i * 6 + 2].life <= 0 && this.miniShotArray[i * 6 + 3].life <= 0 &&
                    this.miniShotArray[i * 6 + 4].life <= 0 && this.miniShotArray[i * 6 + 5].life <= 0) {

                    this.miniShotArray[i * 6].set(this.position.x, this.position.y - this.height / 2, 8, 20);
                    this.miniShotArray[i * 6].setVectorFromAngle(this.radCW(280));
                    this.miniShotArray[i * 6 + 1].set(this.position.x, this.position.y - this.height / 2, 8, 20);
                    this.miniShotArray[i * 6 + 1].setVectorFromAngle(this.radCW(290));
                    this.miniShotArray[i * 6 + 2].set(this.position.x, this.position.y - this.height / 2, 8, 20);
                    this.miniShotArray[i * 6 + 2].setVectorFromAngle(this.radCW(300));
                    this.miniShotArray[i * 6 + 3].set(this.position.x, this.position.y - this.height / 2, 8, 20);
                    this.miniShotArray[i * 6 + 3].setVectorFromAngle(this.radCW(260));
                    this.miniShotArray[i * 6 + 4].set(this.position.x, this.position.y - this.height / 2, 8, 20);
                    this.miniShotArray[i * 6 + 4].setVectorFromAngle(this.radCW(250));
                    this.miniShotArray[i * 6 + 5].set(this.position.x, this.position.y - this.height / 2, 8, 20);
                    this.miniShotArray[i * 6 + 5].setVectorFromAngle(this.radCW(240));
                    this.shotCheckCounter = -this.shotInterval;
                    break;
                  }
                }
              }
              break;
            case 200:
              this.beam.set(this.position.x, this.position.y - this.height / 2);
              break;
            case 300:
              this.sword.set(this.position.x, this.position.y);
              break;
            case 400:
              if(this.bombCheckCounter >= 0) {
                let i;
                for(i = 0; i < this.bombArray.length; ++i) {
                  if(this.bombArray[i].life <= 0) {
                    this.bombArray[i].set(this.position.x, this.position.y - this.height / 2);
                    this.bombCheckCounter = -this.bombInterval;
                    break;
                  }
                }
              }
          }
        }
        ++this.shotCheckCounter;
        ++this.bombCheckCounter;

        if(window.isKeyDown.key_x === true) {
          this.speed = 2.5;
          this.util.drawCircle(this.position.x, this.position.y, 8, "#ff0000");
          this.ctx.globalAlpha = 0.5;
        }else{
          this.speed = 6;
        }
      }
    }
    this.draw();
    this.ctx.globalAlpha = 1.0;
  }
}

class Enemy extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath);

    this.type = "default";
    this.frame = 0;
    this.speed = 3;
    this.power = 1;
    this.shotArray = [];
    this.attackTarget = null;
    this.targetArray = [];
    this.itemHeartArray = [];
    this.rushVector = 0;
  }

  set(x, y, life = 1, type = "default") {
    this.position.set(x, y);
    this.life = life;
    this.type = type;
    this.frame = 0;
  }

  setItemHeartArray(itemHeartArray) {
    this.itemHeartArray = itemHeartArray;
  }

  setShotArray(shotArray) {
    this.shotArray = shotArray;
  }

  setAttackTarget(target) {
    this.attackTarget = target;
  }

  setTargets(targets) {
    if(targets != null && Array.isArray(targets) === true && targets.length > 0) {
      this.targetArray = targets;
    }
  }

  update() {
    if(this.life <= 0) {return;}

    this.targetArray.map((v) => {
      if(this.life <= 0 || v.life <= 0) {return;}
      let dist = this.position.distance(v.position);
      if(dist <= (this.width + v.width) / 4) {
        if(v instanceof Girl === true){
          if(v.isComing === true){return;}
        }
        if(v.timer + 3000 < Date.now()) {
          v.immortal =false;
        }
        if(v.immortal === false) {
          v.life -= this.power;
        }
        if(v.life <= 0) {
          v.hp -= 1;
          if(v.hp >= 1) {
            v.setComing(v.position.x, v.position.y, v.position.x, v.position.y);
          }
          for(let i = 0; i < this.explosionArray.length; ++i) {
            if(this.explosionArray[i].life !== true) {
              this.explosionArray[i].setSound(this.sound);
              this.explosionArray[i].set(v.position.x, v.position.y);
              break;
            }
          }
        }
      }
    });

    switch(this.type) {

      case "wave":
        if(this.frame % 20 === 0) {
          let tx = this.attackTarget.position.x - this.position.x;
          let ty = this.attackTarget.position.y - this.position.y;
          let tv = Position.calcNormal(tx, ty);
          this.fire(tv.x, tv.y, 8.0);
        }
        this.position.x += Math.sin(this.frame / 10);
        this.position.y += 3.0

        if(this.position.y - this.height > this.ctx.canvas.height) {
          this.life = 0;
        }
        break;

      case "rush":
        this.position.y += 8.0;
        if(this.position.y === this.ctx.canvas.height + this.height / 2) {
          this.position.y = -this.height / 2;
        }
        if(this.frame === 1000) {
          let tx = this.attackTarget.position.x / 2 - this.position.x;
          let ty = this.attackTarget.position.y - this.position.y;
          let tv = Position.calcNormal(tx, ty);
          this.rushVector = 0;
          if(tv.x > 0) {
            this.rushVector = 10.0;
          }else{
            this.rushVector = -10.0;
          }
        }
        this.position.x += this.rushVector;
        if(this.position.x + this.width < 0 ||
          this.position.x - this.width > this.ctx.canvas.width) {
            this.life = 0;
            this.rushVector = 0;
          }
        break;

      case "wall":
        if(this.frame % 40 === 0) {
          let tx = this.attackTarget.position.x - this.position.x;
          let ty = this.attackTarget.position.y - this.position.y;
          let tv = Position.calcNormal(tx, ty);
          if(tv.x > 0) {
            this.fire(1.0, 0, 8.0);
          }else{
            this.fire(-1.0, 0, 8.0);
          }
        }
        this.position.y += 1.0;
        if(this.position.y - this.height > this.ctx.canvas.height) {
          this.life = 0;
        }
        break;

      case "large":
        this.position.y += 1.0;
        if(this.frame < 1000) {
          if(this.position.y >= this.ctx.canvas.height / 2) {
            this.position.y = this.ctx.canvas.height / 2;
          }
          if(this.frame % 50 === 0) {
            for(let i = 0; i < 360; i += 15) {
              let r = i * Math.PI / 180;
              let s = Math.sin(r);
              let c = Math.cos(r);
              this.fire(c, s, 3.0);
              let tx = this.attackTarget.position.x - this.position.x;
              let ty = this.attackTarget.position.y - this.position.y;
              let tv = Position.calcNormal(tx, ty);
              this.fire(tv.x, tv.y, 3.0);
            }
          }
        }

        if(this.position.y - this.height > this.ctx.canvas.height) {
          this.life = 0;
        }
        break;

        case "large2":
          this.position.y += 1.0;
          if(this.frame < 1000) {
            if(this.position.y >= this.ctx.canvas.height / 3) {
              this.position.y = this.ctx.canvas.height / 3;
            }
            if(this.frame % 50 === 0) {
              for(let i = 7.5; i < 360; i += 15) {
                let r = i * Math.PI / 180;
                let s = Math.sin(r);
                let c = Math.cos(r);
                this.fire(c, s, 3.0);
                let tx = this.attackTarget.position.x - this.position.x;
                let ty = this.attackTarget.position.y - this.position.y;
                let tv = Position.calcNormal(tx, ty);
                this.fire(tv.x, tv.y, 3.0);
              }
            }
          }



          if(this.position.y - this.height > this.ctx.canvas.height) {
            this.life = 0;
          }else{
            if(this.life === 0) {

            }
          }
          break;

      case "default2":
        if(this.frame % 20 === 0) {
          for(let i = 90; i < 180; i += 45) {
            let r = i * Math.PI / 180;
            let s = Math.sin(r);
            let c = Math.cos(r);
            this.fire(c, s, 3.0);
          }
        }
        this.position.x += this.vector.x * this.speed;
        this.position.y += this.vector.y * this.speed;
        if(this.position.y - this.height > this.ctx.canvas.height) {
          this.life = 0;
        }
        break;

      case "default":
      default:
        if(this.frame % 20 === 0) {
          for(let i = 90; i > 0; i -= 45) {
            let r = i * Math.PI / 180;
            let s = Math.sin(r);
            let c = Math.cos(r);
            this.fire(c, s, 3.0);
          }
        }
        this.position.x += this.vector.x * this.speed;
        this.position.y += this.vector.y * this.speed;
        if(this.position.y - this.height > this.ctx.canvas.height) {
          this.life = 0;
        }
        break;
    }
    this.draw();
    ++this.frame;
  }
  fire(x = 0.0, y = 1.0, speed = 5.0) {
    for(let i = 0; i < this.shotArray.length; ++i) {
      if(this.shotArray[i].life <= 0) {
        this.shotArray[i].set(this.position.x, this.position.y);
        this.shotArray[i].setSpeed(speed);
        this.shotArray[i].setVector(x, y);
        break;
      }
    }
  }
}

class Boss extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath);
    this.mode = "";
    this.frame = 0;
    this.power = 1;
    this.speed = 3;
    this.shotArray = null;
    this.homingArray = null;
    this.attackTarget = null;
    this.immortalFlg = false;
    this.posFlg = false;
    this.rainyVectorR = 270;
    this.rainyVectorL = 270;
    this.posTopFlg = false;
    this.fallFlg = false;
    this.callRush = false;
    this.escapeStartTime;
  }

  set(x, y, life = 1) {
    this.position.set(x, y);
    this.life = life;
    this.frame = 0;
  }

  setSoundShock(soundShock) {
    this.soundShock = soundShock;
  }

  setShotArray(shotArray) {
    this.shotArray = shotArray;
  }

  setHomingArray(homingArray) {
    this.homingArray = homingArray;
  }

  setAttackTarget(target) {
    this.attackTarget = target;
  }

  setMode(mode) {
    this.mode = mode;
  }

  update() {
    if(this.life <= 0){return;}
    if(this.posFlg === "false") {
      this.immortalFlg = true;
    }
    

    let v = this.attackTarget;
    if(this.life <= 0 || v.life <= 0) {return;}
    let dist = this.position.distance(v.position);

    if(dist <= this.width / 2 + v.width / 6) {
    if(v.isComing === true){return;}
      if(v.timer + 3000 < Date.now()) {
        v.immortal =false;
      }
      if(v.immortal === false) {
        v.life -= this.power;
      }
      if(v.life <= 0) {
        if(this.mode === "BIG!!") {
          v.hp = 0;
        }else{
          v.hp -= 1;
        }
        if(v.hp >= 1) {
          v.setComing(v.position.x, v.position.y, v.position.x, v.position.y);
        }
        for(let i = 0; i < this.explosionArray.length; ++i) {
          if(this.explosionArray[i].life !== true) {
            this.explosionArray[i].setSound(this.sound);
            this.explosionArray[i].set(v.position.x, v.position.y);
            break;
          }
        }
      }
    }
    let tx = this.ctx.canvas.width / 2 - this.position.x;

    this.setVectorFromAngle(-this.frame / 10);

    switch(this.mode){

      case "rainy":
        if(this.posFlg === false) {
          this.immortalFlg = true;
          this.position.x = Math.floor(this.position.x);
          if(tx > 0){
            this.position.x += 1.0;
          }else{
            this.position.x -= 1.0;
          }
          if(this.position.x === this.ctx.canvas.width / 2) {
            this.posFlg = true;
            this.immortalFlg = false;
            this.frame = -1;
          } 
        }else{
          this.position.x += Math.cos(this.frame / 100) * 2;
          let i;
          if(this.frame % 12 === 0) {
            for(i = this.ctx.canvas.width / 20; i < this.ctx.canvas.width; i += this.ctx.canvas.width / 4) {
              if(this.frame % 24 === 0) {
                this.rainy(Math.random() * 480, 0, 75, 4.0);
              }else{
                this.rainy(Math.random() * 480, 0, 105, 4.0);
              }
            }
          }
          let tx = this.attackTarget.position.x - this.position.x;
          let ty = this.attackTarget.position.y - this.position.y;
          let tv = Position.calcNormal(tx, ty);
          let r = Math.PI / 180;



          this.rainyVectorR += 1;
          this.rainyVectorL -= 1;

          if(this.rainyVectorR >= 435) {
            this.rainyVectorR = 435;
          }
          if(this.rainyVectorL <= 105) {
            this.rainyVectorL = 105;
          }
          if(this.frame % 5 === 0) {
            this.fire(this.position.x, this.position.y, Math.cos(r * this.rainyVectorR), Math.sin(r * this.rainyVectorR), 8.0);
            this.fire(this.position.x, this.position.y, Math.cos(r * this.rainyVectorL), Math.sin(r * this.rainyVectorL), 8.0);
          }
        }

        break;
      case "rampage":

        if(this.posFlg === false) {
          this.immortalFlg = true;
          this.position.x = Math.floor(this.position.x);
          if(tx > 0){
            this.position.x += 1.0;
          }else{
            this.position.x -= 1.0;
          }
          if(this.position.x === this.ctx.canvas.width / 2) {
            this.posFlg = true;
            this.immortalFlg = false;
            this.frame = -1;
          }
        }else{
          this.position.y -= 3.0;
          if(this.fallFlg === false) {
            this.position.x += Math.cos(this.frame / 100) * 2;
          }


          if(this.position.y < this.height / 2) {
            this.position.y = this.height / 2;
            this.posTopFlg = true;
          }

          if(this.frame >= 50) {

            if(this.posTopFlg === true) {
              if(this.fallFlg === true) {
                this.position.y += 15.0;
                --this.frame;
              }
              if(this.attackTarget.position.x > this.position.x - this.width / 2 &&
                 this.attackTarget.position.x < this.position.x + this.width / 2 &&
                 this.attackTarget.position.y > this.position.y) {
                this.fallFlg = true;
              }
            }
  
            if(this.position.y > this.ctx.canvas.height) {
              this.posTopFlg = false;
              this.fallFlg = false;
              this.position.y = this.ctx.canvas.height;
              if(this.soundShock != null){
                this.soundShock.play();
              }
              for(let i = 180; i < 361; i += 7.5) {
                let r = i * Math.PI / 180;
                let s = Math.sin(r);
                let c = Math.cos(r);
                this.splinter(this.position.x, this.ctx.canvas.height - this.shotArray[0].height / 2, c, s, 6.0);
              }
            }
          }
        }
        break;
      case "BIG!!":
        if(this.posFlg === false) {
          this.immortalFlg = true;
          this.position.x = this.ctx.canvas.width / 2;
          let ty = this.ctx.canvas.height * 0.2 - this.position.y;
          if(ty > 0) {
            if(this.position.y + this.height / 2 < 0) {
              this.position.y += 10.0;
            }else{
              this.position.y += 1.0;
            }
          }else{
            this.position.y -= 1.0;
          }
          this.position.x = Math.floor(this.position.x);

          if(this.position.y === this.ctx.canvas.height * 0.2) {
            this.position.y = this.ctx.canvas.height * 0.2;
            if(this.position.x === this.ctx.canvas.width / 2) {
              this.posFlg = true;
              this.immortalFlg = false;
            }
          }
        }else{
          this.setVectorFromAngle(-this.frame / 4);
          this.width += 1.0;
          this.height += 1.0;
        }
        break;
      case 'coming':
        this.position.y += this.speed;
        if(this.position.y > 100){
          this.position.y = 100;
          this.mode = 'floating';
          this.frame = 0;
          this.immortalFlg = false;
        }else{
          this.immortalFlg = true;
        }
        break;
      case 'escape':
        this.frame = -1;
        this.position.y -= this.speed * 3;
        this.immortalFlg = true;
        break;
      case 'floating':
        if(this.frame % 1000 < 500){
          if(this.frame % 10 === 0){
            let tx = this.attackTarget.position.x - this.position.x;
            let ty = this.attackTarget.position.y - this.position.y;
            let tv = Position.calcNormal(tx, ty);
            this.fire(this.position.x, this.position.y, tv.x, tv.y, 3.0);
          }
        }else{
          if(this.frame % 30 === 0){
            this.homingFire(0, 1, 3.5);
          }
        }
        this.position.x += Math.cos(this.frame / 100) * 2.0;
        break;
      default:
        break;
    }


    this.rotationDraw();
    ++this.frame;
  }

  rainy(setX = this.position.x, setY = this.position.y, angle, speed = 5.0) {
    for(let i = 1000; i < this.shotArray.length; ++i) {
      if(this.shotArray[i].life <= 0) {
        this.shotArray[i].set(setX, setY);
        this.shotArray[i].setSpeed(speed);
        this.shotArray[i].setVectorFromAngle(angle * Math.PI / 180);
        break;
      }
    }
  }

  splinter(setX = this.position.x, setY = this.position.y, x = 0.0, y = 1.0, speed = 5.0) {
    for(let i = 0; i < this.shotArray.length; ++i) {
      if(this.shotArray[i].life <= 0) {
        this.shotArray[i].set(setX, setY);
        this.shotArray[i].setSpeed(speed);
        this.shotArray[i].setVector(x, y);
        break;
      }
    }
  }

  fire(setX = this.position.x, setY = this.position.y, x = 0.0, y = 1.0, speed = 5.0) {
    for(let i = 0; i < this.shotArray.length; ++i) {
      if(this.shotArray[i].life <= 0) {
        this.shotArray[i].set(setX, setY);
        this.shotArray[i].setSpeed(speed);
        this.shotArray[i].setVector(x, y);
        break;
      }
    }
  }

  homingFire(x = 0.0, y = 1.0, speed = 3.0) {
    for(let i = 0; i < this.homingArray.length; ++i){
      if(this.homingArray[i].life <= 0){
          this.homingArray[i].set(this.position.x, this.position.y);
          this.homingArray[i].setSpeed(speed);
          this.homingArray[i].setVector(x, y);
          break;
      }
  }
  }
}

class Shot extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath);
    this.speed = 8;
    this.power = 25;
    this.targetArray = [];
    this.explosionArray = [];
  }

  set(x, y, speed, power) {
    this.position.set(x, y);
    this.life = 1;
    this.setSpeed(speed);
    this.setPower(power);

  }

  setSpeed(speed) {
    if(speed != null && speed > 0) {
      this.speed = speed;
    }
  }

  setPower(power) {
    if(power != null && power > 0) {
      this.power = power;
    }
  }

  setTargets(targets) {
    if(targets != null && Array.isArray(targets) === true && targets.length > 0) {
      this.targetArray = targets;
    }
  }


  update() {
    if(this.life <= 0) {return;}
    if(
      this.position.x + this.width < 0 ||
      this.position.x - this.width > this.ctx.canvas.width ||
      this.position.y + this.height < 0 ||
      this.position.y - this.height > this.ctx.canvas.height
    ){
      this.life = 0;
    }

    this.position.x += this.vector.x * this.speed;
    this.position.y += this.vector.y * this.speed;

    this.targetArray.map((v) => {
      if(this.life <= 0 || v.life <= 0) {return;}
      if(v instanceof Boss === true) {
        if(v.immortalFlg　=== true) {
          return;
        }
      }
      let dist = this.position.distance(v.position);

      if(dist <= this.width / 2 + v.width / 2) {

        if(v instanceof Girl === true){
          if(v.isComing === true){return;}
          if(dist <= v.width / 4) {
            if(v.timer + 3000 < Date.now()) {
              v.immortal = false;
            }
            if(v.immortal === false) {
              v.life -= this.power;
              if(v.life <= 0) {
                for(let i = 0; i < this.explosionArray.length; ++i) {
                  if(this.explosionArray[i].life !== true) {
                    this.explosionArray[i].set(v.position.x, v.position.y);
                    break;
                  }
                }
                v.hp -= 1;
                if(v.hp >= 1) {
                  v.setComing(v.position.x, v.position.y, v.position.x, v.position.y);
                }
              }
            }
            this.life = 0;
          }


        }else{
          v.life -= this.power;
          if(this.sound != null){
            this.sound.play();
          }
          this.life = 0;
        }

        console.log(v.life);
        if(v.life <= 0) {
          for(let i = 0; i < this.explosionArray.length; ++i) {
            if(this.explosionArray[i].life !== true) {
              this.explosionArray[i].setSound(this.sound);
              this.explosionArray[i].set(v.position.x, v.position.y);
              break;
            }
          }
          if(v instanceof Enemy === true){
            let score = 100;
            if(v.type === "large") {
              score = 1000;
            }else if(v.type === "large2") {
              score = 1000;
              for(let i = 0; i < v.itemHeartArray.length; ++i) {
                if(v.itemHeartArray[i].life === 0) {
                  v.itemHeartArray[i].set(v.position.x, v.position.y);
                  break;
                }
              }
            }
            gameScore = Math.min(gameScore + score, 99999);
          }else if(v instanceof Boss === true) {
            gameScore = Math.min(gameScore + 10000, 99999);
          }
        }
      }
    });
    this.rotationDraw();
  }
}

class Homing extends Shot {
  constructor(ctx, x, y, w, h, imagePath){
      super(ctx, x, y, w, h, imagePath);
      this.frame = 0;
  }

  set(x, y, speed, power){
      this.position.set(x, y);
      this.life = 1;
      this.setSpeed(speed);
      this.setPower(power);
      this.frame = 0;

      if(this.sound != null){
        this.sound.play();
      }
  }

  update(){
      if(this.life <= 0){return;}
      if(
          this.position.x + this.width < 0 ||
          this.position.x - this.width > this.ctx.canvas.width ||
          this.position.y + this.height < 0 ||
          this.position.y - this.height > this.ctx.canvas.height
      ){
          this.life = 0;
      }
      let target = this.targetArray[0];
      if(this.frame < 100){
          let vector = new Position(
              target.position.x - this.position.x,
              target.position.y - this.position.y
          );
          let normalizedVector = vector.normalize();
          this.vector = this.vector.normalize();
          let cross = this.vector.cross(normalizedVector);
          let rad = Math.PI / 180.0;
          if(cross > 0.0){
              this.vector.rotate(rad);
          }else if(cross < 0.0){
              this.vector.rotate(-rad);
          }
      }
      this.position.x += this.vector.x * this.speed;
      this.position.y += this.vector.y * this.speed;
      this.angle = Math.atan2(this.vector.y, this.vector.x);

      this.targetArray.map((v) => {
          if(this.life <= 0 || v.life <= 0){return;}
          let dist = this.position.distance(v.position);
          if(dist <= (this.width + v.width) / 4){
              if(v instanceof Girl === true){
                  if(v.isComing === true){return;}
              }
              if(v.timer + 3000 < Date.now()) {
                v.immortal =false;
              }
              if(v instanceof Girl === true) {
                if(v.immortal === false) {
                  v.life -= this.power;
                }
              }else{
                v.life -= this.power;
              }
              if(v.life <= 0){
                v.hp -= 1;
                if(v.hp >= 1) {
                  v.setComing(v.position.x, v.position.y, v.position.x, v.position.y);
                }
                  for(let i = 0; i < this.explosionArray.length; ++i){
                      if(this.explosionArray[i].life !== true){
                          this.explosionArray[i].set(v.position.x, v.position.y);
                          break;
                      }
                  }
              }
              this.life = 0;
          }
      });
      this.rotationDraw();
      ++this.frame;
  }
}


class Beam extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath);
    this.vector = new Position(0.0, -1.0);
    this.power = 5;
    this.targetArray = [];
    this.explosionArray = [];
  }

  draw() {
    let offsetX = this.width / 2;

    this.ctx.drawImage(
      this.image,
      this.position.x - offsetX,
      this.position.y - this.height,
      this.width,
      this.height
    );
  }

  set(x, y, power) {
    this.position.set(x, y);
    this.life = 1;
    this.setPower(power);
  }

  setPower(power) {
    if(power != null && power > 0) {
      this.power = power;
    }
  }


  setTargets(targets) {
    if(targets != null && Array.isArray(targets) === true && targets.length > 0) {
      this.targetArray = targets;
    }
  }

  update() {
    if(window.isKeyDown.key_z === true) {
      if(this.life >= 1) {
        this.draw();
        this.targetArray.map((v) => {
          if(this.life <= 0 || v.life <= 0) {return;}
          if(v instanceof Boss === true) {
            if(v.immortalFlg) {
              return;
            }
          }
          if(this.position.y >= v.position.y && v.position.y + v.height / 2 > 0) {
            if(this.position.x + (this.width + v.width) / 2 > v.position.x &&
               this.position.x - (this.width + v.width) / 2 < v.position.x) {
              v.life -= this.power;
              console.log(v.life);
              if(v.life <= 0) {
                for(let i = 0; i < this.explosionArray.length; ++i) {
                  if(this.explosionArray[i].life !== true) {
                    this.explosionArray[i].setSound(this.sound);
                    this.explosionArray[i].set(v.position.x, v.position.y);
                    break;
                  }
                }
                if(v instanceof Enemy === true){
                  let score = 100;
                  if(v.type === "large") {
                    score = 1000;
                  }else if(v.type === "large2") {
                    score = 1000;
                    for(let i = 0; i < v.itemHeartArray.length; ++i) {
                      if(v.itemHeartArray[i].life === 0) {
                        v.itemHeartArray[i].set(v.position.x, v.position.y);
                        break;
                      }
                    }
                  }

                  gameScore = Math.min(gameScore + score, 99999);
                }else if(v instanceof Boss === true) {
                  gameScore = Math.min(gameScore + 10000, 99999);
                }
              }
            }
          }
        });
        this.life = 0;
      }
    }

  }
}

class Sword extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath);
    this.vector = new Position(0.0, -1.0);
    this.power = 100;
    this.frame = 3.14;
    this.ccwControlNum = 0.1;
    this.intFrame = 0;
    this.targetArray = [];
    this.explosionArray = [];
  }

  set(x, y, power) {
    this.position.set(x, y);
    this.life = 1;
    this.setPower(power);
  }

  setPower(power) {
    if(power != null && power > 0) {
      this.power = power;
    }
  }

  setGirl(girl) {
    this.girl = girl;
  }

  setTargets(targets) {
    if(targets != null && Array.isArray(targets) === true && targets.length > 0) {
      this.targetArray = targets;
    }
  }

  rotationDraw() {
    this.ctx.save();
    this.ctx.translate(this.position.x, this.position.y - this.height / 4);
    this.ctx.rotate(this.angle - Math.PI * 0.5);
    let offsetX = this.width / 2;
    let offsetY = this.height / 2;
    this.ctx.drawImage(
      this.image,
      -offsetX,
      -offsetY,
      this.width,
      this.height
    );
    this.ctx.restore();
  }

  update() {

    if(window.isKeyDown.key_z === true) {

      this.intFrame = Math.floor(this.frame);

      switch(this.intFrame) {
        case -1:
          this.frame = 3.14;
          this.targetArray.map((v) => {
            if(this.life <= 0 || v.life <= 0) {return;}
            if(v instanceof Boss === true) {
              if(v.immortalFlg) {
                return;
              }
            }
            let dist = this.girl.position.distance(v.position);
            if(dist <= (this.height / 2 + this.girl.height / 2 + v.width / 2)) {
              if(this.position.y >= v.position.y) {
                if(this.position.x + (this.height + v.width) / 2 > v.position.x &&
                   this.position.x - (this.height + v.width) / 2 < v.position.x) {
                  v.life -= this.power;
                  if(this.sound != null){
                    this.sound.play();
                  }
                  console.log(v.life);
                  if(v.life <= 0) {
                    for(let i = 0; i < this.explosionArray.length; ++i) {
                      if(this.explosionArray[i].life !== true) {
                        this.explosionArray[i].set(v.position.x, v.position.y);
                        break;
                      }
                    }
                    if(v instanceof Enemy === true){
                      let score = 200;
                      if(v.type === "large") {
                        score = 2000;
                      }else if(v.type === "large2") {
                        score = 2000;
                        for(let i = 0; i < v.itemHeartArray.length; ++i) {
                          if(v.itemHeartArray[i].life === 0) {
                            v.itemHeartArray[i].set(v.position.x, v.position.y);
                            break;
                          }
                        }
                      }

                      gameScore = Math.min(gameScore + score, 99999);
                    }else if(v instanceof Boss === true) {
                      gameScore = Math.min(gameScore + 10000, 99999);
                    }
                  }
                }
              }
            }
          });
          break;
        case 3:
          this.ccwControlNum = -0.2;
          break;
      }

      this.frame += this.ccwControlNum;

      if(this.life >= 1) {

        this.setVectorFromAngle(this.frame);
        this.rotationDraw();
      }
      this.life = 0;
    }else{
      this.frame = 3.14;
    }
  }
}

class Bomb extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath);
    this.power = 150;
    this.targetArray = [];
    this.explosionArray = [];
    this.timeBombArray = [];

  }

  set(x, y, power) {
    this.position.set(x, y);
    this.life = 1;
    this.setPower(power);
    this.timer = Date.now();

  }

  setPower(power) {
    if(power != null && power > 0) {
      this.power = power;
    }
  }

  setTargets(targets) {
    if(targets != null && Array.isArray(targets) === true && targets.length > 0) {
      this.targetArray = targets;
    }
  }

  setTimeBombArray(timeBombArray) {
    this.timeBombArray = timeBombArray;
  }

  update() {

    if(this.life <= 0) {return;}
    this.ctx.globalAlpha = 0.5;

    if(this.timer + 3000 < Date.now()){
      for(let i = 0; i < this.timeBombArray.length; ++i) {
        if(this.timeBombArray[i].life !== true) {
          this.timeBombArray[i].set(this.position.x, this.position.y);
          this.targetArray.map((v) => {
            if(v instanceof Boss === true) {
              if(v.immortalFlg) {
                return;
              }
            }
            if(v.life <= 0) {return;}
            let dist = this.position.distance(v.position);
            if(dist <= this.timeBombArray[i].radius + this.timeBombArray[i].fireSize + v.width / 2) {
              if(v.type === "wall") {
                v.life -= this.power * 10;
              }else{
                v.life -= this.power;
              }
              console.log(v.life);
              if(v.life <= 0) {
                for(let i = 0; i < this.explosionArray.length; ++i) {
                  if(this.explosionArray[i].life !== true) {
                    this.explosionArray[i].setSound(this.sound);
                    this.explosionArray[i].set(v.position.x, v.position.y);
                    break;
                  }
                }
                if(v instanceof Enemy === true){
                  let score = 100;
                  if(v.type === "large") {
                    score = 1000;
                  }else if(v.type === "large2") {
                    score = 1000;
                    for(let i = 0; i < v.itemHeartArray.length; ++i) {
                      if(v.itemHeartArray[i].life === 0) {
                        v.itemHeartArray[i].set(v.position.x, v.position.y);
                        break;
                      }
                    }
                  }

                  gameScore = Math.min(gameScore + score, 99999);
                }else if(v instanceof Boss === true) {
                  gameScore = Math.min(gameScore + 10000, 99999);
                }
              }
            }
          });
          break;
        }
      }

      this.life = 0;
    }
    this.draw();
  }
}

class Explosion {
  constructor(ctx, radius, count, size, timeRange, color = "#ff0000") {
    this.ctx = ctx;
    this.life = false;
    this.color = color;
    this.position = null;
    this.radius = radius;
    this.count = count;
    this.startTime = 0;
    this.timeRange = timeRange;
    this.fireBaseSize = size;
    this.fireSize = [];
    this.firePosition = [];
    this.fireVector = [];
    this.sound = null;
  }

  set(x, y) {
    for(let i = 0; i < this.count; ++i) {
      this.firePosition[i] = new Position(x, y);
      let vr = Math.random() * Math.PI * 2.0;
      let s = Math.sin(vr);
      let c = Math.cos(vr);
      let mr = Math.random();
      this.fireVector[i] = new Position(c * mr, s * mr);
      this.fireSize[i] = (Math.random() * 0.5 + 0.5) * this.fireBaseSize;
    }
    this.life = true;
    this.startTime = Date.now();

    if(this.sound != null){
      this.sound.play();
    }
  }

  setSound(sound) {
    this.sound = sound;
  }

  setSoundDefault(soundDefault) {
    this.soundDefault = soundDefault;
  }

  update() {
    if(this.life !== true) {return;}
    this.sound = this.soundDefault;
    this.ctx.fillStyle = this.color;
    this.ctx.globalAlpha = 0.5;
    let time = (Date.now() - this.startTime) / 1000;
    let ease = simpleEaseIn(1.0 - Math.min(time / this.timeRange, 1.0));
    let progress = 1.0 - ease;

    for(let i = 0; i < this.firePosition.length; ++i) {
      let d = this.radius * progress;
      let x = this.firePosition[i].x + this.fireVector[i].x * d;
      let y = this.firePosition[i].y + this.fireVector[i].y * d;
      let s = 1.0 - progress;
      this.ctx.fillRect(
          x - (this.fireSize[i] * s) / 2,
          y - (this.fireSize[i] * s) / 2,
          this.fireSize[i] * s,
          this.fireSize[i] * s
      );
    }

    if(progress >= 1.0) {
      this.life = false;
    }
  }
}

class BombExplosion extends Explosion {
  constructor(ctx, radius, count, size, timeRange, color = "#ff0000") {
    super(ctx, radius, count, size,timeRange, color);

    this.fireSize = size;
  }

  set(x, y) {
    for(let i = 0; i < this.count; ++i) {
      this.firePosition[i] = new Position(x, y);
      let r = Math.random() * Math.PI * 2.0;
      let s = Math.sin(r);
      let c = Math.cos(r);
      this.fireVector[i] = new Position(c, s);
    }
    this.life = true;
    this.startTime = Date.now();

    if(this.sound != null){
      this.sound.play();
    }
  }

  update() {
    if(this.life !== true) {return;}
    this.ctx.fillStyle = this.color;
    this.ctx.globalAlpha = 0.5;
    let time = (Date.now() - this.startTime) / 1000;
    let progress = Math.min(time / this.timeRange, 1.0);

    for(let i = 0; i < this.firePosition.length; ++i) {
      let d = this.radius * progress;
      let x = this.firePosition[i].x + this.fireVector[i].x * d;
      let y = this.firePosition[i].y + this.fireVector[i].y * d;
      this.ctx.fillRect(
          x - this.fireSize / 2,
          y - this.fireSize / 2,
          this.fireSize,
          this.fireSize
      );
    }

    if(progress >= 1.0) {
      this.life = false;
    }
  }
}

class BackgroundStar {
  constructor(ctx, size, speed, color = "#ffffff") {
    this.ctx = ctx;
    this.size = size;
    this.speed = speed;
    this.color = color;
    this.position = null;
  }

  set(x, y) {
    this.position = new Position(x, y);
  }

  update() {
    this.ctx.fillStyle = this.color;
    this.position.y += this.speed;
    this.ctx.fillRect(
      this.position.x - this.size / 2,
      this.position.y - this.size / 2,
      this.size,
      this.size
    );
    if(this.position.y + this.size > this.ctx.canvas.height) {
      this.position.y = -this.size;
    }
  }
}

function simpleEaseIn(t){
  return t * t * t * t;
}