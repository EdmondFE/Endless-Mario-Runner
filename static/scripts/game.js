
const FLOOR_HEIGHT = 48;
const JUMP_FORCE = 800;
let SPEED = 480;
//initialize user connecting
let userName = '';

socket.on('userName', function(data){
    userName = data.name;
});
//initialize context
kaboom({
    scale: 1.4,
    background: [ 128, 180, 255 ],
    canvas: document.querySelector("#game"),
    width: 800,
    height: 510
});

//ASSETS
loadSound('gameover', "./sounds/gameover.mp3");
loadSound('death', "./sounds/death.mp3");
loadSound('jump', "./sounds/jump.mp3");
loadSound('bgm', "./sounds/bgm.mp3");
loadSound('menu', "./sounds/menu.mp3");
//Sprites
loadSprite("mario", "./sprites/mario.png", {
    sliceX: 8,
    anims: {
        "run": {
            from: 0,
            to: 7,
            speed: 10,
            loop: true
        }
    }
});
loadSprite('sun', "./sprites/sun1.png",{
    sliceX: 33,
    anims: {
        "idle": {
            from: 0,
            to: 32,
            speed: 6,
            loop: true
        }
    }
});
loadSprite('missile', "./sprites/missile.png",{
    sliceX: 8,
    anims: {
        "fire": {
            from: 1,
            to: 6,
            speed: 5,
            loop: true
        }
    }
});
loadSprite('floor', "./sprites/floor.png");
loadSprite('pipe', "./sprites/pipe.png");
loadSprite('cloud', "./sprites/cloud.png");
loadSprite('mountain', "./sprites/mountain.png");
loadSprite('grass1', "./sprites/grass.png");
loadSprite('grass2', "./sprites/grass2.png");
loadSprite('grass3', "./sprites/grass3.png");
loadSprite('menu', "./sprites/menu.jpg");
loadSprite('logo', "./sprites/menulogo.png");

//menu
scene("menu", ()=>{
    const menuBGM = play("menu", {
        volume: 1,
        loop: true
    });

   const menu = add([
        rect(480, 150),
        origin("center"),
        pos(width() / 2, 400),
        outline(4),
        color(184,106,2)
    ]);
    add([
        sprite("logo",{
            width:250,
            height: 250
        }),
        pos(width()/2, 150),
        origin("center")
    ]);
    add([
        sprite('menu',{
            width: 800,
            height:510
        }),
        origin("center"),
        pos(width()/2, height()/2),
        z(-100)
    ]);
    add([
        text('Controls: A -> move right\n D -> move left\n Space or LMB -> to jump\n\nBeat the leaderboard\n\n[Press "Space" to Start...].wavy',{
            size: 17,
            font: "sinko",
            styles: {
                wavy:  (idx, ch) => ({
                    color: hsl2rgb((time() * 0.2 + idx * 0.1) % 1, 0.7, 0.8),
                    pos: vec2(0, wave(-4, 4, time() * 4 + idx * 0.5)),
                    scale: wave(1, 1.2, time() * 3 + idx),
                    angle: wave(-9, 9, time() * 3 + idx),
                })
            }
           
        }),
        pos(menu.pos),
        origin("center")
    ]);
      
    onLoad(()=> menuBGM.play());
    onKeyPress("space", ()=> {go("game"); menuBGM.pause();});
});


//GAME
scene("game", () => {

    //play BGM
    const music = play("bgm", {
        volume: 1.5,
        loop: true
    });
 
    // define gravity
    gravity(2400)
    //speed up
    wait(60, ()=>{
        SPEED +10;
    });
    // add a game object to screen
    const player = add([
        // list of components
        sprite('mario'),
        pos(180, 40),
        area(),
        body(),
        origin('center'),
    ]);

    player.onGround(()=>player.play('run'));//sprite animation
    //function for jumping
    function jump() {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE);
            play('jump',{
                volume:0.5
            });
        }
    }
    //player controls
    onKeyDown("d", ()=>{
        player.move(250, 0);
    });
    onKeyDown("a", ()=>{
        player.move(-250, 0);
    });
    // jump when user press space
    onKeyPress("space", jump);
    onClick(jump);
    //camera
    // player.onUpdate(() => {
    //     // Set the viewport center to player.pos
    //     camPos(player.pos)
    // })

    //player name
    const name = add([
        text(userName,{
            font: "sinko",
            size: 16
        }),
        pos()
    ]);
    player.onUpdate(()=>{
        name.pos.x = player.pos.x-10;
        name.pos.y = player.pos.y-40;
    });




    // floor
    add([
        sprite('floor', {
        width: width(),
        height: FLOOR_HEIGHT  
        }),
        pos(0, height()),
        area(),
        solid(),
        origin("botleft"),
    ]);
    //mountain
    add([
        sprite('mountain', width()),
        outline(4),
        pos(0, height()-FLOOR_HEIGHT),
        area(),
        origin("botleft"),
        z(-100)
    ]);
    //sun
    const sun =	add([
        sprite("sun",{
            width: 130,
            height: 130
        }),
        origin("center"),
        pos(650, 120),
        z(-90),
    ])
    sun.play('idle');

    //Obstacles/Spawnables
    function spawnTree() {
        // add tree obj rect(48, rand(32, 96))
        add([
            sprite("pipe",{
                width: 48,
                height: rand(32, 96)
            }),
            area(),
            pos(width(), height() - FLOOR_HEIGHT),
            origin("botleft"),
            move(LEFT, SPEED),
            cleanup(),
            "tree",
            z(-20)
        ]);
        // wait a random amount of time to spawn next tree
        wait(rand(0.6, 1.5), spawnTree);
    }
    // start spawning trees
    spawnTree();

    function spawnMissile() {
        // add tree obj rect(48, rand(32, 96))
      const missile =  add([
            sprite("missile",{
                width: 60,
                height: 45
            }),
            area(),
            pos(width(), height()-rand(205, 230)),
            origin("botleft"),
            move(LEFT, rand(500, 570)),
            cleanup(),
            "missile",
            z(-20)
        ]);
        missile.play('fire');
        // wait a random amount of time to spawn next tree
        wait(rand(8,12), spawnMissile);
    }
    wait(26, spawnMissile);

    function spawnFoliage(){
        const arr = ['grass1', 'grass2', 'grass3'];
        const randNum = Math.floor(Math.random()* arr.length);
        add([
            sprite(arr[randNum],{
                height: 50,
                width: 100
            }),
            origin("botleft"),
            area(),
            pos(width(), height() - FLOOR_HEIGHT),
            move(LEFT, SPEED),
            cleanup(),
            z(-10)
        ]);
        wait(rand(2,4), spawnFoliage);
    }
    //spawn Foliage
    spawnFoliage();

    //spawn cloud
    function spawnCloud() {

    const dir = choose([LEFT, RIGHT])

        add([
            sprite("cloud", { 
                flipX: dir.eq(LEFT),
                width: rand(250, 420),
                height: rand(120, 280)
            
            }),
            move(LEFT, rand(100, 190)),
            cleanup(),
            pos(width(), rand(-20, 140)),
            origin("topleft"),
            area(),
            z(-50),
        ]);
        wait(rand(2, 7), spawnCloud);
       
    }
    // start spawning cloud
    spawnCloud();

    //Player lose conditions
    player.onCollide("tree", () => {
        // go to "lose" scene and pass the score
       // play('death');
       // player.jump(JUMP_FORCE);
       go("lose", score);
        //wait(3.5, ()=> go("lose", score));
        music.pause();
    // addKaboom(player.pos);
    });
    player.onCollide("missile", ()=>{
        go("lose", score);
        music.pause();
        addKaboom(player.pos);
    });
    player.onUpdate(() => {
		if (player.pos.x >= 800 || player.pos.x <= 0) {
			// switch to "lose" scene
			go("lose", score);
            music.pause();
		}
	})
    // keep track of score
    let score = 0;

    const scoreLabel = add([
        text(score,{
            size: 32,
            font: 'sinko'
        }),
        pos(60, 24)
    ]);

    // increment score every frame
    onUpdate(() => {
        score++
        scoreLabel.text = score
    });

})

//Game Over Scene
scene("lose", (score) => {
    const gameover = play('gameover');
   const player = add([
        sprite('mario'),
        pos(width() / 2, height() / 2 - 80),
        scale(2),
        origin("center"),
    ]);
    player.play('run');
    // display score
    add([
        text("Your Score: "+score+
        "\n\nGame Over!"+
        "\nPress R to Restart",{
            size: 15,
            font: 'sinko'
        }),
        pos(width() / 2, height() / 2 + 80),
        scale(2),
        origin("center"),
        gameover.play()
        
    ]);

    // go back to game with r is pressed
    onKeyPress("r", () => {
        go("game"); 
        gameover.pause();}
    );
    //onClick(() => go("game"))
    onKeyPress("f5", () => {
        go("menu");
        gameover.pause();
    });
    socket.emit('score',{score: score, name: userName});
});

//start from menu
go('menu');
