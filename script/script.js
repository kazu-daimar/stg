(() => {
  window.isKeyDown = {};
  window.gameScore = 0;
  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 640;
  const CANVAS2_WIDTH = 128;
  const CANVAS2_HEIGHT = 640;
  const SHOT_MAX_COUNT = 20;
  const ENEMY_RED_MAX_COUNT = 100;
  const ENEMY_BLUE_MAX_COUNT = 100;
  const ENEMY_LARGE_MAX_COUNT = 10;
  const ENEMY_SHOT_MAX_COUNT = 1000;
  const HOMING_MAX_COUNT = 50;
  const EXPLOSION_MAX_COUNT = 300;
  const BOMB_MAX_COUNT = 10;
  const BACKGROUND_STAR_MAX_COUNT = 100;
  const BACKGROUND_STAR_MAX_SIZE = 3;
  const BACKGROUND_STAR_MAX_SPEED = 4;
  const HP_MAX_COUNT = 6;
  const HEART_MAX_COUNT = 5;
  let util = null;
  let canvas = null;
  let ctx = null;
  let util2 = null;
  let canvas2 = null;
  let ctx2 = null;
  let scene = null;
  let startTime = null;
  let girl = null;
  let boss = null;
  let enemyArray = [];
  let shotArray = [];
  let miniShotArray = [];
  let enemyShotArray = [];
  let homingArray = [];
  let explosionArray = [];
  let bombArray = [];
  let timeBombArray = [];
  let backgroundStarArray = [];
  let restart = false;
  let heartArray = [];
  let itemHeartArray = [];

  window.addEventListener("load", () => {
    util = new Canvas2DUtility(document.body.querySelector("#main_canvas"));
    canvas = util.canvas;
    ctx = util.context;
    util2 = new Canvas2DUtility(document.body.querySelector("#sub_canvas"));
    canvas2 = util2.canvas;
    ctx2 = util2.context;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas2.width = CANVAS2_WIDTH;
    canvas2.height = CANVAS2_HEIGHT;

    let button = document.body.querySelector("#start_button");

    button.addEventListener("click", () => {

      let spinner = document.body.querySelector('#loading-spinner');
      spinner.classList.remove("start");
      spinner.classList.add("spinner");
      button.disabled = true;
      damageSound = new Sound();
      itemHeartSound = new Sound();
      beamSound = new Sound();
      bombSound = new Sound();
      cursorSound = new Sound();
      fireSound = new Sound();
      swordSound = new Sound();
      bossBigSound = new Sound();
      clearSound = new Sound();
      damageSound.load("./sound/damage.mp3", (error) => {
        if(error != null) {
          alert("ファイルの読み込みエラーです");
          return;
        }
        itemHeartSound.load("./sound/itemHeart.mp3", (error) => {
          if(error != null) {
            alert("ファイルの読み込みエラーです");
            return;
          }
          beamSound.load("./sound/beam.mp3", (error) => {
            if(error != null) {
              alert("ファイルの読み込みエラーです");
              return;
            }
            bombSound.load("./sound/bomb.mp3", (error) => {
              if(error != null) {
                alert("ファイルの読み込みエラーです");
                return;
              }
              cursorSound.load("./sound/cursor.mp3", (error) => {
                if(error != null) {
                  alert("ファイルの読み込みエラーです");
                  return;
                }
                fireSound.load("./sound/fire.mp3", (error) => {
                  if(error != null) {
                    alert("ファイルの読み込みエラーです");
                    return;
                  }
                  swordSound.load("./sound/sword.mp3", (error) => {
                    if(error != null) {
                      alert("ファイルの読み込みエラーです");
                      return;
                    }
                    bossBigSound.load("./sound/big.mp3", (error) => {
                      if(error != null) {
                        alert("ファイルの読み込みエラーです");
                        return;
                      }
                      clearSound.load("./sound/clear.mp3", (error) => {
                        if(error != null) {
                          alert("ファイルの読み込みエラーです");
                          return;
                        }
                        initialize();
                        loadCheck();
                        spinner.classList.add("loaded");
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    }, false);
  }, false);

  function initialize() {
    let i;

    scene = new SceneManager();

    cursor = new Cursor(ctx2, CANVAS2_WIDTH / 2, 100, CANVAS2_WIDTH, 64, "./image/cursor.png");
    cursor.setSound(cursorSound);
    weapon1 = new Character(ctx2, CANVAS2_WIDTH / 2, 100, 64, 64, 1, "./image/fire.png");
    weapon2 = new Character(ctx2, CANVAS2_WIDTH / 2, 200, 64, 64, 1, "./image/beam.png");
    weapon3 = new Character(ctx2, CANVAS2_WIDTH / 2, 300, 64, 64, 1, "./image/sword2.png");
    weapon4 = new Character(ctx2, CANVAS2_WIDTH / 2, 400, 64, 64, 1, "./image/bomb.png");
    for(i = 0; i < HP_MAX_COUNT / 2; ++i) {
      heartArray[i] = new Character(ctx2, CANVAS2_WIDTH / 4 + 32 * i, CANVAS2_HEIGHT * 0.8, 32, 32, 1, "./image/heart.png");
      heartArray[i + 3] = new Character(ctx2, CANVAS2_WIDTH / 4 + 32 * i, CANVAS2_HEIGHT * 0.85, 32, 32, 0, "./image/heart.png");
    }
    girl = new Girl(ctx, util, 0, 0, 48, 48, "./image/girl.png");
    girl.setHeartArray(heartArray);
    girl.setComing(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT + 50,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 100
    );
    cursor.setGirl(girl);

    for(i = 0; i < HEART_MAX_COUNT; ++i) {
      itemHeartArray[i] = new Item(ctx, 0, 0, 32, 32, "./image/heart.png");
      itemHeartArray[i].setGirl(girl);
      itemHeartArray[i].setSound(itemHeartSound);
    }


    for(i = 0; i < EXPLOSION_MAX_COUNT; ++i) {
      explosionArray[i] = new Explosion(ctx, 100.0, 100, 10.0, 0.25);
      explosionArray[i].setSound(damageSound);
      explosionArray[i].setSoundDefault(damageSound);
    }
    bossExplosion = new Explosion(ctx, 240.0, 1000, 50.0, 2.0);
    bossExplosion.setSound(bombSound);

    for(i = 0; i < ENEMY_SHOT_MAX_COUNT; ++i) {
      enemyShotArray[i] = new Shot(ctx, 0, 0, 24, 24, "./image/enemy_shot2.png");
      enemyShotArray[i + ENEMY_SHOT_MAX_COUNT] = new Shot(ctx, 0, 0, 9, 18, "./image/enemy_shot3.png");
      enemyShotArray[i].setTargets([girl]);
      enemyShotArray[i].setExplosions(explosionArray);
      enemyShotArray[i + ENEMY_SHOT_MAX_COUNT].setTargets([girl]);
      enemyShotArray[i + ENEMY_SHOT_MAX_COUNT].setExplosions(explosionArray);
    }

    for(i = 0; i < HOMING_MAX_COUNT; ++i) {
      homingArray[i] = new Homing(ctx, 0, 0, 32, 32, "./image/enemy_shot.png");
      homingArray[i].setTargets([girl]);
    }

    boss = new Boss(ctx, 0, 0, 128, 128, "./image/purple.png");
    boss.setShotArray(enemyShotArray);
    boss.setHomingArray(homingArray);
    boss.setAttackTarget(girl);
    boss.setExplosions(explosionArray);
    boss.setSound(damageSound);
    boss.setSoundShock(bombSound);

    for(i = 0; i < ENEMY_RED_MAX_COUNT; ++i) {
      enemyArray[i] = new Enemy(ctx, 0, 0, 32, 32, "./image/red.png");
      enemyArray[i].setShotArray(enemyShotArray);
      enemyArray[i].setTargets([girl]);
      enemyArray[i].setExplosions(explosionArray);
      enemyArray[i].setAttackTarget(girl);
    }

    for(i = 0; i < ENEMY_BLUE_MAX_COUNT; ++i) {
      enemyArray[ENEMY_RED_MAX_COUNT + i] = new Enemy(ctx, 0, 0, 32, 32, "./image/blue.png");
      enemyArray[ENEMY_RED_MAX_COUNT + i].setShotArray(enemyShotArray);
      enemyArray[ENEMY_RED_MAX_COUNT + i].setTargets([girl]);
      enemyArray[ENEMY_RED_MAX_COUNT + i].setExplosions(explosionArray);
      enemyArray[ENEMY_RED_MAX_COUNT + i].setAttackTarget(girl);
    }

    for(i = 0; i < ENEMY_LARGE_MAX_COUNT; ++i) {
      enemyArray[ENEMY_RED_MAX_COUNT + ENEMY_BLUE_MAX_COUNT + i] = new Enemy(ctx, 0, 0, 64, 64, "./image/red.png");
      enemyArray[ENEMY_RED_MAX_COUNT + ENEMY_BLUE_MAX_COUNT + i].setShotArray(enemyShotArray);
      enemyArray[ENEMY_RED_MAX_COUNT + ENEMY_BLUE_MAX_COUNT + i].setTargets([girl]);
      enemyArray[ENEMY_RED_MAX_COUNT + ENEMY_BLUE_MAX_COUNT + i].setExplosions(explosionArray);
      enemyArray[ENEMY_RED_MAX_COUNT + ENEMY_BLUE_MAX_COUNT + i].setAttackTarget(girl);
      enemyArray[ENEMY_RED_MAX_COUNT + ENEMY_BLUE_MAX_COUNT + i].setItemHeartArray(itemHeartArray);
    }
    for(i = 0; i < ENEMY_RED_MAX_COUNT + ENEMY_BLUE_MAX_COUNT; ++i) {
      enemyArray[i].setSound(damageSound);
    }

    let concatEnemyArray = enemyArray.concat([boss]);

    for(i = 0; i < SHOT_MAX_COUNT; ++i) {
      shotArray[i] = new Shot(ctx, 0, 0, 32, 32, "./image/fire.png");
      miniShotArray[i * 6] = new Shot( ctx, 0, 0, 24, 24, "./image/fire.png");
      miniShotArray[i * 6 + 1] = new Shot( ctx, 0, 0, 24, 24, "./image/fire.png");
      miniShotArray[i * 6 + 2]= new Shot( ctx, 0, 0, 24, 24, "./image/fire.png");
      miniShotArray[i * 6 + 3]= new Shot( ctx, 0, 0, 24, 24, "./image/fire.png");
      miniShotArray[i * 6 + 4]= new Shot( ctx, 0, 0, 24, 24, "./image/fire.png");
      miniShotArray[i * 6 + 5]= new Shot( ctx, 0, 0, 24, 24, "./image/fire.png");
      girl.setShotArray(shotArray, miniShotArray);
    }
    for(i = 0; i < SHOT_MAX_COUNT; ++i) {
      shotArray[i].setTargets(concatEnemyArray);
      miniShotArray[i * 6].setTargets(concatEnemyArray);
      miniShotArray[i * 6 + 1].setTargets(concatEnemyArray);
      miniShotArray[i * 6 + 2].setTargets(concatEnemyArray);
      miniShotArray[i * 6 + 3].setTargets(concatEnemyArray);
      miniShotArray[i * 6 + 4].setTargets(concatEnemyArray);
      miniShotArray[i * 6 + 5].setTargets(concatEnemyArray);

      shotArray[i].setExplosions(explosionArray);
      miniShotArray[i * 6].setExplosions(explosionArray);
      miniShotArray[i * 6 + 1].setExplosions(explosionArray);
      miniShotArray[i * 6 + 2].setExplosions(explosionArray);
      miniShotArray[i * 6 + 3].setExplosions(explosionArray);
      miniShotArray[i * 6 + 4].setExplosions(explosionArray);
      miniShotArray[i * 6 + 5].setExplosions(explosionArray);

      shotArray[i].setSound(fireSound);
      miniShotArray[i].setSound(fireSound);
    }

    for(i = 0; i < BOMB_MAX_COUNT; ++i) {
      bombArray[i] = new Bomb(ctx, 0, 0, 48, 48, "./image/bomb.png");
      girl.setBombArray(bombArray);
      timeBombArray[i] = new BombExplosion(ctx, 150, 1000, 8, 0.25, "#ffa500");
      timeBombArray[i].setSound(bombSound);
    }

    for(i = 0; i < BOMB_MAX_COUNT; ++i) {
      bombArray[i].setTimeBombArray(timeBombArray);
      bombArray[i].setTargets(concatEnemyArray);
      bombArray[i].setExplosions(explosionArray);
    }

    beam = new Beam(ctx, 0, 0, 32, 640, "./image/beam.png");
    girl.setBeam(beam);
    beam.setTargets(concatEnemyArray);
    beam.setExplosions(explosionArray);
    beam.setSound(beamSound);

    sword = new Sword(ctx, 0, 0, 60, 120, "./image/sword.png");
    girl.setSword(sword);
    sword.setGirl(girl);
    sword.setTargets(concatEnemyArray);
    sword.setExplosions(explosionArray);
    sword.setSound(swordSound);


    for(i = 0; i < BACKGROUND_STAR_MAX_COUNT; ++i){
      let size  = 1 + Math.random() * (BACKGROUND_STAR_MAX_SIZE - 1);
      let speed = 1 + Math.random() * (BACKGROUND_STAR_MAX_SPEED - 1);
      backgroundStarArray[i] = new BackgroundStar(ctx, size, speed);
      let x = Math.random() * CANVAS_WIDTH;
      let y = Math.random() * CANVAS_HEIGHT;
      backgroundStarArray[i].set(x, y);
    }
  }

  function loadCheck() {
    let ready = true;
    ready = ready && girl.ready;
    enemyArray.map((v) => {
      ready = ready && v.ready;
    });
    shotArray.map((v) => {
      ready = ready && v.ready;
    });
    homingArray.map((v) => {
      ready = ready && v.ready;
    });
    miniShotArray.map((v) => {
      ready = ready && v.ready;
    })
    enemyShotArray.map((v) => {
      ready = ready && v.ready;
    });
    bombArray.map((v) => {
      ready = ready && v.ready;
    });
    ready = ready && beam.ready;
    ready = ready && sword.ready;

    if(ready === true) {
      eventSetting();
      sceneSetting();
      startTime = Date.now();
      render();
    }else{
      setTimeout(loadCheck, 100);
    }
  }

  function eventSetting() {
    window.addEventListener("keydown", (event) => {
      isKeyDown[`key_${event.key}`] = true;
      if(event.key === "Enter") {
        if(girl.life <= 0) {
          for(let i = 0; i < ENEMY_RED_MAX_COUNT + ENEMY_BLUE_MAX_COUNT + ENEMY_LARGE_MAX_COUNT; ++i) {
            enemyArray[i].life = 0;
          }
          for(i = 0; i < ENEMY_SHOT_MAX_COUNT * 2; ++i) {
            enemyShotArray[i].life = 0;
          }
          for(i = 0; i < HOMING_MAX_COUNT; ++i) {
            homingArray[i].life = 0;
          }
          for(i = 0; i < HP_MAX_COUNT; ++i) {
            heartArray[i].life = 1;
          }
          for(i = 0; i < BOMB_MAX_COUNT; ++i) {
            bombArray[i].life = 0;
          }
          boss.posFlg = false;
          boss.rainyVectorR = 270;
          boss.rainyVectorL = 270;
          boss.height = 128;
          boss.width = 128;
          boss.life = 0;
          girl.hp = 3;
          restart = true;
          bossBigSound.stop();
        }
      }
    }, false);

    window.addEventListener("keyup", (event) => {
      isKeyDown[`key_${event.key}`] = false;
    }, false);
  }

  function sceneSetting() {
    scene.add("opening", () => {
      ctx.font = "bold 72px sans-serif";
      util.drawText("Sキーを押してゲームスタート！", 5, CANVAS_HEIGHT / 2, "#ffffff", CANVAS_WIDTH);
      ctx.font = "bold 20px sans-serif";
      util.drawText("※注意  音が出ます", 5, CANVAS_HEIGHT - 5, "#ffffff", CANVAS_WIDTH);
      if(window.isKeyDown.key_s === true) {
        scene.use("intro");
      }
    })

    scene.add("intro", (time) => {
      if(time > 3.0) {
        scene.use("block_default_type");
      }
    });

    scene.add("block_default_type", () => {
      if(scene.frame % 30 === 0) {
        for(let i = 0; i < ENEMY_RED_MAX_COUNT; ++i) {
          if(enemyArray[i].life <= 0) {
            let e = enemyArray[i];
            e.set(-e.width, 30, 70, "default");
            e.setVectorFromAngle(degreesToRadians(15));
            break;
          }
        }
      }
      if(scene.frame === 120) {
        scene.use("blank");
      }
      if(girl.life <= 0) {
        scene.use("gameover");
      }
    });

    scene.add("blank", (time) => {
      if(scene.frame === 50) {
        scene.use("block_default_type2");
      }
      if(girl.life <= 0) {
        scene.use("gameover");
      }
    });


    scene.add("block_default_type2", () => {
      if(scene.frame % 30 === 0) {
        for(let i = 5; i < ENEMY_RED_MAX_COUNT; ++i) {
          if(enemyArray[i].life <= 0) {
            let e = enemyArray[i];
            e.set(CANVAS_WIDTH + e.width, 30, 70, "default2");
            e.setVectorFromAngle(degreesToRadians(165));
            break;
          }
        }
      }
      if(scene.frame === 120) {
        scene.use("blank2");
      }
      if(girl.life <= 0) {
        scene.use("gameover");
      }
    });

    scene.add("blank2", (time) => {
      if(scene.frame === 50) {
        scene.use("block_wave_move_type");
      }
      if(girl.life <= 0) {
        scene.use("gameover");
      }
    });

    scene.add("block_wave_move_type", () => {
      if(scene.frame % 50 === 0) {
        for(let i = 10; i < ENEMY_RED_MAX_COUNT; ++i) {
          if(enemyArray[i].life <= 0) {
            let e = enemyArray[i];
            if(scene.frame <= 200) {
              e.set(CANVAS_WIDTH * 0.2, -e.height, 100, "wave");
            }else if(scene.frame <= 450){
              e.set(CANVAS_WIDTH * 0.8, -e.height, 100, "wave");
            }
            break;
          }
        }
      }
      if(scene.frame === 450) {
        scene.use("wall");
      }
      if(girl.life <= 0) {
        scene.use("gameover");
      }
    });

    scene.add("wall", () => {
      if(scene.frame % 50 === 0){
        for(let i = 101; i < ENEMY_RED_MAX_COUNT + ENEMY_BLUE_MAX_COUNT; i += 2) {
          if(enemyArray[i].life <= 0 && enemyArray[i + 1].life <= 0) {
            enemyArray[i].set(CANVAS_WIDTH * 0.1, -enemyArray[i].height, 1000, 'wall');
            enemyArray[i + 1].set(CANVAS_WIDTH * 0.9, -enemyArray[i + 1].height, 1000, 'wall');
            break;
          }
        }
      }
      if(scene.frame === 350){
        scene.use('blank3');
      }
      if(girl.life <= 0){
        scene.use('gameover');
      }
    });
    scene.add("blank3", () => {
      if(scene.frame === 100) {
        scene.use("block_large_type");
      }
      if(girl.life <= 0) {
        scene.use("gameover");
      }
    });

    scene.add('block_large_type', () => {
      if(scene.frame === 100){
          let i = ENEMY_RED_MAX_COUNT + ENEMY_BLUE_MAX_COUNT + ENEMY_LARGE_MAX_COUNT;
          for(let j = ENEMY_RED_MAX_COUNT + ENEMY_BLUE_MAX_COUNT; j < i; ++j){
              if(enemyArray[j].life <= 0){
                  let e = enemyArray[j];
                  e.set(CANVAS_WIDTH / 2, -e.height, 700, 'large');
                  break;
              }
          }
      }
      if(scene.frame === 100){
          scene.use('block_large_type2');
      }
      if(girl.life <= 0){
          scene.use('gameover');
      }
    });
    scene.add('block_large_type2', () => {
      if(scene.frame === 100){
          let i = ENEMY_RED_MAX_COUNT + ENEMY_BLUE_MAX_COUNT + ENEMY_LARGE_MAX_COUNT;
          for(let j = ENEMY_RED_MAX_COUNT + ENEMY_BLUE_MAX_COUNT + 1; j < i; ++j){
              if(enemyArray[j].life <= 0){
                  enemyArray[j].set(CANVAS_WIDTH * 0.2, -enemyArray[j].height, 700, 'large2');
                  enemyArray[j+1].set(CANVAS_WIDTH * 0.8, -enemyArray[j].height, 700, 'large2');
                  break;
              }
          }
      }
      if(scene.frame === 500){
          scene.use('rush');
      }
      if(girl.life <= 0){
          scene.use('gameover');
      }
    });

    scene.add('rush', () => {
      if(scene.frame === 0) {
        for(let i = 0; i < 21; ++i) {
          let eL = enemyArray[i * 2];
          let eR = enemyArray[i * 2 + 1];
          if(eL.life <= 0 && eR.life <= 0) {
            eL.set(eL.width / 2, eL.height * i + eL.height / 2 - CANVAS_HEIGHT, 100, "rush");
            eR.set(CANVAS_WIDTH - eR.width / 2, eR.height * i +eR.height / 2 - CANVAS_HEIGHT, 100, "rush");
          }
        }
      }

      if(scene.frame === 500){
          scene.use('boss_coming');
      }
      if(girl.life <= 0){
          scene.use('gameover');
      }
    });

    scene.add("boss_coming", () => {
      if(scene.frame === 0){
        boss.set(CANVAS_WIDTH / 2, -boss.height, 20000);
        boss.setMode('coming');
      }

      if(boss.life > 10000 && boss.life <= 15000) {
        boss.setMode("rainy");
      }

      if(boss.life > 5000 && boss.life <= 10000) {
        if(boss.mode === "rainy") {
          boss.posFlg = false;
          itemHeartArray[0].set(boss.position.x, boss.position.y);
        }
        boss.setMode("rampage");
      }

      if(boss.life <= 5000) {
        if(boss.mode === "rampage") {
          boss.escapeStartTime = Date.now();
          boss.posFlg = false;
          boss.callRush = true;
          bossBigSound.play();
        }

        if(boss.escapeStartTime + 10000 > Date.now()) {
          boss.setMode("escape");

          if(boss.escapeStartTime + 2000 < Date.now()) {
            if(boss.callRush === true) {
              for(let i = 0; i < 21; ++i) {
                let eL = enemyArray[i * 4];
                let eL2 = enemyArray[i * 4 + 1];
                let eR = enemyArray[i * 4 + 2];
                let eR2 = enemyArray[i * 4 + 3];
      
                if(eL.life <= 0 && eR.life <= 0) {
                  eL.set(eL.width / 2, eL.height * i + eL.height / 2 - CANVAS_HEIGHT, 100, "rush");
                  eL2.set(eL.width * 1.5, eL.height * i + eL.height / 2 - CANVAS_HEIGHT, 100, "rush");
                  eR.set(CANVAS_WIDTH - eR.width / 2, eR.height * i +eR.height / 2 - CANVAS_HEIGHT, 100, "rush");
                  eR2.set(CANVAS_WIDTH - eR.width * 1.5, eR.height * i +eR.height / 2 - CANVAS_HEIGHT, 100, "rush");
                }
              }
              boss.callRush = false;
            }
          }

          if(scene.frame % 50 === 0){
            for(let i = 100; i < ENEMY_RED_MAX_COUNT + ENEMY_BLUE_MAX_COUNT; i += 2) {
              if(enemyArray[i].life <= 0 && enemyArray[i + 1].life <= 0) {
                enemyArray[i].set(CANVAS_WIDTH * 0.1, -enemyArray[i].height, 1000, 'wall');
                enemyArray[i + 1].set(CANVAS_WIDTH * 0.9, -enemyArray[i + 1].height / 2, 1000, 'wall');
                console.log(i);
                break;
              }
            }
          }

          if(boss.escapeStartTime + 4000 < Date.now()) {
            boss.setMode('BIG!!');
          }
        }
      }


      if(girl.life <= 0){
        scene.use('gameover');
      }

      if(boss.life <= 0){
        scene.use('gameclear');
        bossBigSound.stop();
        bossExplosion.set(boss.position.x, boss.position.y);
      }
    });

    scene.add("gameclear", (time) => {
      if(scene.frame === 200) {
        clearSound.play();
      }
      if(scene.frame >= 200) {
        let textWidth = CANVAS_WIDTH / 2;
        let loopHeight = CANVAS_HEIGHT;
        let y = (scene.frame * 4) % loopHeight;
        ctx.font = "bold 72px sans-serif";
  
        util.drawText("ゲームクリア", CANVAS_WIDTH / 4, y, `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`, textWidth);
      }
      for(i = 0; i < ENEMY_RED_MAX_COUNT + ENEMY_BLUE_MAX_COUNT + ENEMY_LARGE_MAX_COUNT; ++i) {
        if(enemyArray[i].life !== 0) {
          enemyArray[i].life = 0;
        }
      }

    });

    scene.add("gameover", (time) => {
      let textWidth = CANVAS_WIDTH / 2;
      let loopWidth = CANVAS_WIDTH + textWidth;
      let x = CANVAS_WIDTH - (scene.frame * 2) % loopWidth;
      ctx.font = "bold 72px sans-serif";
      util.drawText("ゲームオーバー", x, CANVAS_HEIGHT / 2, "#0000ff", textWidth);
      if(restart === true) {
        restart = false;
        gameScore = 0;
        girl.setComing(
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT + 50,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT - 100
        );
        scene.use("opening");
      }
    })
    scene.use("opening");
  }

  function selectWeapon() {
    switch(window.isKeyDown.key_c) {
      case true:
        cursor.control = true;
        girl.control = false;
        break;
      default:
        cursor.control = false;
        girl.control = true;
        break;
    }
    cursor.update();
  }

  function infomation() {
    if(girl.strongestMode === true) {
      ctx2.font = "bold 20px sans-serif";
      util2.drawText("最強モード発動中", 0, 50, "#f000f0", CANVAS2_WIDTH);
      gameScore = 0;
    }
  }

  function render() {

    ctx.globalAlpha = 1.0;
    util.drawRect(0, 0, canvas.width, canvas.height, "#111122");
    util2.drawRect(0, 0, canvas2.width, canvas2.height, "#111122");

    ctx2.font = "bold 24px monospace";
    util2.drawText(zeroPadding(gameScore, 5), 24, 600, "#ffffff");

    scene.update();

    backgroundStarArray.map((v) => {
      v.update();
    });

    girl.update();
    boss.update();
    itemHeartArray.map((v) => {
      v.update();
    });
    weapon1.draw();
    weapon2.draw();
    weapon3.draw();
    weapon4.draw();

    selectWeapon();
    beam.update();
    sword.update();

    heartArray.map((v) => {
      v.draw();
    });
    enemyArray.map((v) => {
      v.update();
    });
    shotArray.map((v) => {
      v.update();
    });
    homingArray.map((v) => {
      v.update();
    })
    miniShotArray.map((v) => {
      v.update();
    });
    enemyShotArray.map((v) => {
      v.update();
    });
    bombArray.map((v) => {
      v.update();
    });
    explosionArray.map((v) => {
      v.update();
    });
    bossExplosion.update();
    timeBombArray.map((v) => {
      v.update();
    });

    infomation();

    requestAnimationFrame(render);
  }

  function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  function zeroPadding(number, count) {
    let zeroArray = new Array(count);
    let zeroString = zeroArray.join("0") + number;
    return zeroString.slice(-count);
  }

})();