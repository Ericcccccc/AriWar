/*
 * author: liu shui yong
 */

(function($){
	var source = []; // 游戏资源，图片和声音
	var canvas = $('#game-box'); // 游戏容器
	var cxt = canvas.get(0).getContext('2d'); // 构造画布
	var canvas_width, canvas_height; // 画布宽和高
	var musicSwitch;


	var PAUSE_FLAG = false;

	// 游戏结束提示框
	var box = {
		'show' : function (s) {
			$('#content').html(s);
			$('#box').removeClass('hide');	
		},
		'hide' : function () {
			$('#box').addClass('hide');
		}
	};
	var startBox = {
		'show' : function () {
			$('#start').removeClass('hide');
		},
		'hide' : function () {
			$('#start').addClass('hide');
		}
	}
	var settingBox = {
		'show' : function () {
			$('#setting').removeClass('hide');
		},
		'hide' : function () {
			$('#setting').addClass('hide');
		}
	}
	var pause = {
		'show' : function () {
			$('#pause').removeClass('hide');
		},
		'hide' : function () {
			$('#pause').addClass('hide');
		}
	}
	// 游戏配置 
	var config = {
		'imgSrc': 'img/',      // 图片地址前缀
		'soundSrc': 'sounds/', // 声音地址前缀
		'loadImg': ['bg.jpg', 'loading1.png', 'loading2.png', 'loading3.png', 'logo.png'], // 等待动画图片资源
		'gameImg': ['cartridge.png', 'cartridge_power.png', 'die1.png', 'die2.png', 'me.png', 'plain1.png', 'plain2.png', 'plain3.png', 'plain2_hurt.png', 'plain3_hurt.png', 'plain1_die1.png', 'plain1_die2.png', 'plain1_die3.png', 'plain2_die1.png', 'plain2_die2.png', 'plain2_die3.png', 'plain2_die4.png', 'plain3_die1.png', 'plain3_die2.png', 'plain3_die3.png', 'plain3_die4.png', 'plain3_die5.png', 'plain3_die6.png', 'me_die1.png', 'me_die2.png', 'me_die3.png', 'me_die4.png', 'prop1.png', 'prop2.png', 'bomb.png', 'me_2.png', 'plain3_2.png'], // 游戏图片资源
		'gameSound': ['achievement.mp3', 'plain2_die.mp3', 'plain3_die.mp3', 'fire_bullet.mp3', 'game_music.mp3', 'game_over.mp3', 'get_bomb.mp3', 'get_double_laser.mp3', 'show_prop.mp3', 'plain1_die.mp3', 'use_bomb.mp3'], // 游戏声音资源
		'gameSpeed': 8, // 游戏速度
		'cartridgeSpeed': 5, // 子弹速度
		'isPhone': navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|mobile)/) // 检测是否为手机
	};
	main();
	
	// 新建图片
	function creatImg(src){
		if (typeof source[src] != 'undefined') {
			return source[src];
		};
		source[src] = new Image();
		source[src].src = config.imgSrc + src;
		return source[src];
	}

	// 新建声音函数 
	function creatAudio(src) {
		if (typeof source[src] != 'undefined') {
			return source[src];
		};
		source[src] = new Audio();
		source[src].src = config.soundSrc + src;
	}


	// 播放声音方法 
	function playAudio(src) {
		if (musicSwitch) {
			// console.log(musicSwitch);
			return;
		};
		if (config.isPhone) {
			return; // 判断为手机
		};
		var media = creatAudio(src);
		media.currentTime = 0;
		media.play(); 
	}

	// 图片预载
	function loadImage(images,callback){
		var toLoadLength = images.length; // 需加载的长度
		var loadLength = 0; // 已加载的长度

		for (var i = toLoadLength; i--;) {
			var src = images[i];
			source[src] = new Image();
			source[src].onload = function () {
				loadLength++;
				if (toLoadLength == loadLength) {
					callback();
				};
			};
			source[src].src = config.imgSrc + src;
		};
	};

	// 声音预载 
	function loadSound(sounds,callback){
		var toLoadLength = sounds.length;
		var loadLength = 0;
		for (var i = toLoadLength; i--;) {
			var src = sounds[i];
			source[src] = new Audio();
			source[src].addEventListener('canplaythrough',function () {
				loadLength++;
				if (toLoadLength == loadLength) {
					callback();
				};
			})
			source[src].src = config.soundSrc + src;
		};
	};


	// 游戏主事件
	function main() {
		loadImage(config.loadImg,loading);
		resize();
		$(window).on('resize',resize);	

		function resize(){
			var screenWidth = $(window).width(); // 获取屏幕宽
			var screenHeight = $(window).height(); // 获取屏幕高
			// alert(screenWidth);
			// alert(screenHeight);
			canvas_width = screenWidth < 480 ? screenWidth : 480; // 判断屏幕宽是否小于480？成立画布宽等于屏幕宽，否则画布宽等于480
			canvas_height = screenHeight < 800 ? screenHeight : 800; // 判断屏幕高是否小于800？成立画布宽等于屏幕宽，否则画布宽等于800
			
			canvas.attr({
				width: canvas_width,
				height: canvas_height
			}).offset({
				top: (screenHeight - canvas_height) / 2
			});
			cxt.font = '30px Microsoft YaHei';
			cxt.fillStyle = '#333';
		};
	}

	// 等待事件
	function loading(){

		var loadingTime = 0; // 等待时间

		// 等待动画刷新事件
		function refresh() {
			drawBg();
			drawLogo();
			load();
			loadingTime++;
		}

		// 绘制背景 
		function drawBg(){
			var bg_img = creatImg('bg.jpg');
			var bg_img_width = bg_img.width;
			var bg_img_height = bg_img.height;
			cxt.drawImage(bg_img,0,0,bg_img_width,bg_img_height);			
		}

		// 绘制logo 
		function drawLogo() {
			var logo_img = creatImg('logo.png');
			var logo_img_width = logo_img.width;
			var logo_img_height = logo_img.height;

			var x = (canvas_width - logo_img_width)	/ 2;
			var y = 100;
			cxt.drawImage(logo_img,x,y,logo_img_width,logo_img_height);
		}

		// 等待动画
		function load(){
			if (loadingTime == 600) { 
				loadingTime = 0;
			}
			// loadingTime每隔200换一张图，实现等待动画
			var pic = creatImg('loading' + (parseInt(loadingTime / 200) + 1) + '.png');
			var pic_width = pic.width;
			var pic_height = pic.height;

			var x = (canvas_width - pic_width) / 2;
			var y = 220;
			cxt.drawImage(pic,x,y,pic_width,pic_height); 
		}

		// 游戏开始控制
		function gameControl() {
			var start = $('#start .start');
			var setting = $('#start .setting');
			var musicOn = $('#setting .musicOn');
			var musicOff = $('#setting .musicOff');
			var exit = $('#start .exit');
			var bgMusic = creatAudio('game_music.mp3');
			bgMusic.loop = true;
			
			start.on('click',function(){
				clearInterval(loadingClock);
				startBox.hide();
				game();
			})

			setting.on('click',function(){
				startBox.hide();
				settingBox.show();
			});
			musicOn.on('click',function(){
				// 音乐开启 
				musicSwitch = false;
				settingBox.hide();
				startBox.show();
				if (!musicSwitch) {
					bgMusic.play();
				};
			});
			musicOff.on('click',function(){
				// 音乐关闭
				musicSwitch = true;
				settingBox.hide();
				startBox.show();
				if (musicSwitch) {
					bgMusic.pause();
				};
			});
			exit.on('click',function(){
				window.close();
			});
		};

		// 开始动画 
		var loadingClock = setInterval(refresh,1);

		loadSound(config.gameSound,function(){
			loadImage(config.gameImg,function(){
				startBox.show();
				gameControl();
			});
		});
	}

	// 游戏
	function game() {
		// 玩家飞机对象
		var player = {};
		player.x;
		player.y;
		player.lastX;
		player.lastY;
		player.bomb = 0;
		player.status = true;
		player.model = creatImg('me.png');
		player.model2 = creatImg('me_2.png');
		
		player.width = canvas_width / 480 * player.model.width; // 玩家飞机大小随屏幕宽度大小而变化
		player.height = player.width / player.model.width * player.model.height; // 玩家飞机高度随玩家飞机的大小而变化

		player.move = function (x,y) {
			player.lastX = player.x;
			player.lastY = player.y;
			player.x = x - player.width / 2;
			player.y = y - player.height / 2;

			player.x = player.x > canvas_width - player.width ? canvas_width - player.width : player.x; // player.x最大为canvas_width - player.width之差
			player.x = player.x < 0 ? 0 : player.x; // player.x 最小为0

			player.y = player.y > canvas_height - player.height ? canvas_height - player.height : player.y; 
			player.y = player.y < 0 ? 0 : player.y;  
		}

		player.moving = function () {
			if (!player.status) {
				return; 
			}; 	

			cxt.drawImage(game.time % 30 > 15 ? player.model : player.model2, player.x, player.y, player.width, player.height);
			player.attacking();
		}		

		player.cartridges = [];
		player.attackTime = 0; 
		player.attackPower = false; // 火力是否加强

		player.attack = function () {
			if (!player.status) {
				return;
			};
			player.attackTime++;
			if ( (player.attackTime * game.refreshInterval) % (game.refreshInterval * 20) != 0 ) { 
				return; // 实现子弹间隔发射效果
			};

			player.attackTime = 0;

			playAudio('fire_bullet.mp3');

			var cartridges;
			if (player.attackPower) {
			 	cartridges = [(new cartridge(player.x - (player.width / 5), player.y, 2, player)),(new cartridge(player.x + (player.width / 5), player.y, 2, player))];	
			} else {
				cartridges = [new cartridge(player.x, player.y, 1, player)]
			}
			Array.prototype.push.apply(player.cartridges,cartridges); // 向player.cartridges数组添加cartridges,以便改变子弹
		}
		player.attacking = function () {
			player.attack();
			var cartridgeSpeed = config.cartridgeSpeed; // 5
			var cartridges_length = player.cartridges.length; 
			firstloop : for (var i = cartridges_length; i--;) {
				var cartridge = player.cartridges[i];
				cxt.drawImage(cartridge.model, cartridge.x, cartridge.y, cartridge.width, cartridge.height);
				if (cartridge.y <= 0) {
					player.cartridges.splice(i,1);
					continue firstloop;
				};
				var plain_length = game.plains.length;
				secondloop : for (var j = plain_length; j--;) {
					var plain = game.plains[j];
					var X = cartridge.x;
					var Y = cartridge.y;
					var nextY = Y - cartridgeSpeed;
					if (
						X > plain.x && X < (plain.x + plain.width) && nextY < (plain.y + plain.height + plain.speed) && Y >= (plain.y + plain.height)
					) {
						plain.byAttack();
						player.cartridges.splice(i,1);
						continue firstloop;
					};
				};
				cartridge.y = cartridge.y - cartridgeSpeed; // 子弹向上移动
			};
		};

		player.useBomb = function () {
			if (game.player.bomb <= 0) {
				return;
			};
			game.player.bomb--;
			playAudio('use_bomb.mp3');
			var plains_length = game.plains.length;
			for (var i = plains_length; i--;) {
				var plain = game.plains[i];
				plain.die();
			};
		};

		player.die = function () {
			if (!player.status) {
				return;
			};
			player.status = false;
			playAudio('game_over.mp3');

			var dieSpeed = 20;
			
			var x = player.x;
			var y = player.y;
			var w = player.width;
			var h = player.height;

			game.plainsDies.push((new playerDie()));

			function playerDie() {
				var dieTime = 4 * dieSpeed;
				this.animationTime = 4 * dieSpeed;

				this.call = function () {
					if (this.animationTime == 1) {
						game.over();
					};
					var dieModel = creatImg('me_die' + (parseInt((dieTime - this.animationTime) / dieSpeed) + 1) + '.png');
					cxt.drawImage(dieModel, x, y, w, h);
					this.animationTime--;
				};
			};
		};


		// 游戏对象
		
		var game = {};
		game.score = 0;
		game.time = 0;
		game.player = player;
		game.bgImg = creatImg('bg.jpg');
		game.refreshInterval = config.gameSpeed;
		game.bgScrollTime = 0;
		game.props = [];
		game.plains = [];
		game.plainsNum = 0;
		game.plainsDies = [];
		game.music = creatAudio('game_music.mp3');

		$("#box").on("click", ".again", function () {
			game.start();
			
		});
		$('#box').on('click', '.exit', function () {
			window.close();
		})
		$('#box').on('click', '.music', function () {
			if (musicSwitch) {
				musicSwitch = false;
			} else {
				musicSwitch = true;
			}
		})

		//刷新画布
		game.refresh = function () {
			game.time++;
			game.bgScroll();      // 背景图滚动
			game.plainsScroll();  // 飞机运动
			game.plainsDying();   // 飞机死亡动画
			game.player.moving(); // 玩家飞机运动
			game.propShow();      // 道具出现
			game.refreshMessage() // 刷新游戏信息

		}

		game.bgScroll = function () {
			var bg_img_width = game.bgImg.width;
			var bg_img_height = game.bgImg.height;
			game.bgScrollTime += 0.5;
			if (game.bgScrollTime > bg_img_height) {
				game.bgScrollTime = 0;
			};
			cxt.drawImage(game.bgImg, 0, game.bgScrollTime - bg_img_height, bg_img_width, bg_img_height); // 消失的 
			cxt.drawImage(game.bgImg, 0, game.bgScrollTime, bg_img_width,bg_img_height); // 出来的
		}

		game.addProp = function () {
			var interval = 10;
			if ((game.time * game.refreshInterval) % (interval * 1000) == 0) {
				game.props.push((new prop(parseInt(Math.random() * 1.8 + 1.1))));
				playAudio('show_prop.mp3');
			};
		};
		game.propShow = function () {
			game.addProp();
			var props_length = game.props.length;
			for (var i = props_length;i--;) {
				var prop = game.props[i];
				if (prop.isDeleted == true) {
					game.props.splice(i, 1);
					continue;
				};
				prop[prop.status]();

				if (prop.y > canvas_height) {
					game.props.splice(i,1);
					continue;
				};
			};
		};
		game.addPlain = function () {
			if (game.time % 60 != 0) {
				return;
			};
			if (game.plainsNum == 26) {
				game.plainsNum = 0;
			};
			game.plainsNum++;
			switch (true) {
				case game.plainsNum % 13 == 0:
					game.plains.push(new plain(3));
					break;
				case game.plainsNum % 6 == 0:
					game.plains.push(new plain(2));
					break;
				default:
					game.plains.push(new plain(1));
					break;
			}
		}

		game.plainsScroll = function () {
			game.addPlain();
			var removePlain = [];
			var plains_length = game.plains.length;
			for (var i = plains_length; i--;) {
				var plain = game.plains[i];
				if (plain.y > canvas_height || plain.status == false) {
					game.plains.splice(i,1);
					continue;
				};

				plain.show();
				
				if (isCollide(plain)) {
					game.player.die();
				}; 
				plain.y = plain.y + plain.speed; // 飞机向下运动
			};	
			// 判断是否和玩家飞机碰撞
			function isCollide(plain) {
				var plainTopLeft = [plain.x, plain.y];
				var plainBottomRight = [plain.x + plain.width, plain.y + plain.height];
				var meTopLeft = [game.player.x + game.player.width / 3, game.player.y];
				var meBottomRight = [game.player.x + (game.player.width * 2 / 3), game.player.y + (game.player.height * 2 / 3)];
			
				var collideTopLeft = [Math.max(plainTopLeft[0],meTopLeft[0]),Math.max(plainTopLeft[1],meTopLeft[1])];
				var collideBottomRight = [Math.min(plainBottomRight[0],meBottomRight[0]), Math.min(plainBottomRight[1],meBottomRight[1])];
				
				if (collideTopLeft[0] < collideBottomRight[0] && collideTopLeft[1] < collideBottomRight[1]) {
					return true; // 碰撞
				};
				return false; // 未碰撞
			}
		}
		game.plainsDying = function () {
			var plainsDies_length = game.plainsDies.length;
			for (var i = plainsDies_length; i-- ;) {
				var plainDie = game.plainsDies[i];
				if (plainDie.animationTime == 0) {
					game.plainsDies.splice(i,1);
					continue;
				};
				plainDie.call();
			};
		};
		game.over = function () {
			game.music.pause();
			canvas.removeClass('playing');
			pause.hide();
			if (config.isPhone) {
				canvas.get(0).removeEventListener('touchmove');
			} else {
				canvas.off('mousemove');
			}
			canvas.off('click');
			clearInterval(game.clock);
			box.show(game.score);
		}
		game.clear = function () {
			game.player.x = (canvas_width - game.player.width) / 2;
			game.player.y = canvas_height - game.player.height;
			
			game.plains = [];
			game.plainsDies = [];
			game.plainsNum = 0;
			game.time = 0;
			game.bgScrollTime = 0;
			game.score = 0;
			game.player.status = true;
			game.player.bomb = 0;
			game.player.attackPower = false;
			clearTimeout(game.player.attackPowerClock);
		}
		game.start = function () {
			game.music.currentTime = 0;
			game.music.loop = true;
			if (!musicSwitch) {
				game.music.play();
			}

			canvas.addClass('playing');
			pause.hide();

			canvas.on('click', game.player.useBomb);
			canvas.on('dblclick',function () {
				// 游戏暂停

				// pause.show();

				// alert('暂停功能待完善，敬请谅解！')
			})

			if (config.isPhone) {
				canvas.get(0).addEventListener('touchmove',function (e) {
					e.preventDefault();
					var touch = e.targetTouches[0];
					var x = touch.pageX - canvas.offset().left;
					var y = touch.pageY - canvas.offset().top;
					game.player.move(x,y);
				});
			} else {
				canvas.on('mousemove',function (e) {
					var e = e ? e : window.event;
					var x = e.clientX - canvas.offset().left;
					var y = e.clientY - canvas.offset().top;
					game.player.move(x,y);
				})
			}
			box.hide();
			game.clear();
			game.clock = setInterval(function () {
				game.refresh();
			}, game.refreshInterval);
		}

		game.refreshMessage = function () {
			cxt.fillText(game.score, 20, 44);
			cxt.fillText('双击暂停', 400, 44, 60);
			cxt.font = '18px Microsoft YaHei';
			if (game.player.bomb > 0) {
				var bombModel = creatImg('bomb.png');
				cxt.drawImage(bombModel, 10, canvas_height - bombModel.height - 10, bombModel.width, bombModel.height);
				cxt.fillText(game.player.bomb, 20 + bombModel.width, canvas_height - bombModel.height + 28);
			};
		};
		
		game.start();

		function prop(type) {
			this.type = type;
			this.status = 'show';
			this.isDeleted = false;
			this.modelImg;
			this.getSound;

			switch (type) {
				case 1:
					this.modelImg = 'prop1.png';
					this.getSound = 'get_bomb.mp3';
					break;
				case 2:
					this.modelImg = 'prop2.png';
					this.getSound = 'get_double_laser.mp3';
					break;
			}
			this.model = creatImg(this.modelImg);
			this.width = canvas_width / 480 * this.model.width;
			this.height = this.width / this.model.width * this.model.height;

			this.x = Math.random() * (canvas_width - this.width);
			this.y = -this.height;

			var speed = this.speed = 6;
			var animateTime = this.animateTime = 70;
			this.showType = 'down';

			this.show = function () {
				if (this.animateTime <= animateTime / 2) {
					this.showType = 'up';
				};

				cxt.drawImage(this.model, this.x, this.y, this.width, this.height);

				if (isGain(this)) {
					this.isDeleted = true;
					this.byGain();
					return;
				};
				var move = ((canvas_height + this.height) / 3) / (animateTime / 2);
				this.speed = move;

				if (this.showType == 'down') {
					this.y += move;
				} else {
					this.y -= move;
				}
				this.animateTime--;
				if (this.animateTime <= 0) {
					this.speed = speed;
					this.status = 'move';
				};
			};
			this.move = function () {
				this.y += this.speed;
				cxt.drawImage(this.model,this.x, this.y, this.width, this.height);
				if (isGain(this)) {
					this.isDeleted = true;
					this.byGain();
					return;
				};
			}
			this.byGain = function () {
				switch (this.type) {
					case 1: 
						game.player.bomb++;
						break;
					case 2 :
						game.player.attackPower = true;
						game.player.attackPowerClock = setTimeout(function () {
							game.player.attackPower = false;
						},15000);
						break;
				}
				playAudio(this.getSound);
			}

			// 判断有没有吃到道具
			var isGain = function (prop) {
				var leftX = prop.x;
				var rightX = prop.x + prop.width;
				if (rightX < game.player.x || leftX > (game.player.x + game.player.width)) {
					return false;
				};　
				var removing = prop.status == 'move' ? prop.speed : (prop.showType == 'down' ? prop.speed : -prop.speed);
				var nextY = prop.y + removing;
				if (((prop.y + prop.height) > game.player.y || (nextY + prop.height) < game.player.y) && game.player.lastY > (prop.y + prop.height)) {
					return false;
				};
				return true;
			}
		}

		function plain(type) {
			this.type = type;
			this.hp; // 飞机生命值
			this.width;
			this.height;
			this.maxSpeed;
			this.dieTime;
			this.status = true; // 飞机是否死亡
			var dieSpeed = 20; // 飞机死亡动画播放速度

			switch (type) {
				case 1:
					this.hp = 1;
					this.score = 1000;
					this.maxSpeed = 5;
					this.dieTime = dieSpeed * 3;
					break;
				case 2:
					this.hp = 8;
					this.score = 8000;
					this.maxSpeed = 2;
					this.dieTime = dieSpeed * 4;
					break;
				case 3:
					this.hp = 18;
					this.score = 30000;
					this.maxSpeed = 1;
					this.dieTime = dieSpeed * 6;
					break;		
			}
			this.dieSound = 'plain' + this.type + '_die.mp3';
			this.modelimg = 'plain' + this.type + '.png';
			this.model = creatImg(this.modelimg);
			if (this.type == 3) {
				this.modelimg2 = 'plain3_2.png';
				this.model2 = creatImg(this.modelimg2); 
			};
			this.width = canvas_width / 480 * this.model.width;
			this.height = this.width / this.model.width * this.model.height;

			this.x = Math.random() * (canvas_width - this.width);
			this.y = -(this.height); 

			var maxSpeed = game.time / 1000 > 10 ? 10 : game.time / 1000;           // ?
			this.speed = Math.random() * (maxSpeed - 1) + 1;                        // ?
			this.speed = this.speed < 0.5 ? Math.random() * 0.5 + 0.5 : this.speed; // ?
			this.speed = this.speed > this.maxSpeed ? this.maxSpeed : this.speed;

			this.show = function () {
				if (this.type == 3) {
					cxt.drawImage(game.time % 30 > 15 ? this.model : this.model2, this.x, this.y, this.width, this.height);
					return;
				};
				cxt.drawImage(this.model, this.x, this.y, this.width, this.height);
			}

			this.die = function () {
				var plainType = this.type;
				var plainX = this.x;
				var plainY = this.y;
				var plainW = this.width;
				var plainH = this.height;

				game.plainsDies.push((new die(this.dieTime)));
				game.score += this.score; // 得分 
				this.status = false; // 飞机死亡

				function die(dieTime) {
					var dieTime = dieTime;
					this.animationTime = dieTime;

					this.call = function () {
						if (this.animationTime <= 0) {
							return;
						};
						var dieModel = creatImg('plain' + plainType + '_die' + (parseInt((dieTime - this.animationTime) / dieSpeed) + 1) + '.png');
						cxt.drawImage(dieModel, plainX, plainY, plainW, plainH);
						this.animationTime--;
					}
				}
			}
			var hp = this.hp;
			this.byAttack = function () {
				this.hp--;
				if (this.hp <= 0) {
					this.die();
					playAudio(this.dieSound);
					return;
				}

				if (this.hp <= hp / 3) {
					this.model = creatImg('plain' + this.type + '_hurt.png');
				};
			};
		};


		function cartridge(x,y,type,player){
			this.model = creatImg(type == 2 ? 'cartridge_power.png' : 'cartridge.png');

			this.width = canvas_width / 480 * this.model.width; // 子弹的宽度随屏幕宽度而变化
			this.height = this.width / this.model.width * this.model.height; // 子弹高度随宽度而变化
			this.x = x + (player.width - this.width) / 2;
			this.y = y - this.height;
		}
	}
})(jQuery);