var normalSound, dropSound, amplitude, cnv;
var ears = [];
var eyes = [];
var msX = [];
var msY = [];

//gradation set
var Y_AXIS = 1;
var X_AXIS = 2;
var b1, b2, c1, c2;

//background stars
var max_circles = 60; 
var circles = []; 

//filter
var fft;
var filter, filterFreq, filterRes;

var cam;
var drawMode=1;
var pixelSiz = 15;
var sizVector = 15;

var mode = 'SETTING';

function preload(){
  soundFormats('mp3', 'ogg')
  normalSound = loadSound('data/Normal Audio.mp3');
  dropSound = loadSound('data/Drop Audio.mp3');
}

function circle(x, y, vx, vy, sz, c) {    
  this.x = x;        
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.sz = sz;
  this.c = c;
  this.move = function() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x<0 || this.x>windowWidth) this.vx = -this.vx;   
    if (this.y<0 || this.y>windowHeight) this.vy = -this.vy;
  }
  this.render = function() {
    noStroke();
    fill(this.c);
    ellipse(this.x, this.y, this.sz, this.sz);
  }
}

function Ear(x1, y1, x2, y2, x3, y3, col1, col2, direc) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.x3 = x3;
  this.y3 = y3;
  this.col1 = col1;
  this.col2 = col2;
  this.direc = direc;
  this.render = function() {
    fill(this.col1);
    noStroke()
    triangle(width/2+this.direc*this.x1, height/2-this.y1, width/2+this.direc*this.x2, height/2-this.y2, width/2+this.direc*this.x3-(mouseX-width/2)/10, height/2-this.y3);
    fill(this.col2);
    triangle(width/2+this.direc*(this.x1-20), height/2-this.y1, width/2+this.direc*(this.x2+30), height/2-this.y2, width/2+this.direc*this.x3-(mouseX-width/2)/10, height/2-this.y3);
  }
}

function Eyes(col1, col2, x, y, sz) {
  this.col1 = col1;
  this.col2 = col2;
  this.x = x;
  this.y = y;
  this.sz = sz;
  this.render = function() {
    fill(this.col1);
    noStroke();
    if (mouseX>width/2) {
      var contR = 3;
    } else {
      contR = 1
    }
    if (mouseX<width/2) {
      var contL = 3;
    } else {
      contL = 1;
    }
    ellipse(width/2-this.x+(mouseX-width/2)/(5*contL), height/2-this.y, this.sz, this.sz);
    ellipse(width/2+this.x+(mouseX-width/2)/(5*contR), height/2-this.y, this.sz, this.sz);
    fill(this.col2);
    noStroke();
  }
}

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  amplitude = new p5.Amplitude();

  //cam
  cam = createCapture(VIDEO);
  cam.hide();

  //sound setting
  normalSound.loop(); dropSound.loop();
  normalSound.stop(); dropSound.stop();
  filter = new p5.LowPass();
  dropSound.disconnect();
  dropSound.connect(filter);

  fft = new p5.FFT();

  // start & stop the normalSound when canvas is clicked
  cnv.mousePressed(function() {
    if (normalSound.isPlaying()){
      normalSound.stop();
      if (dropSound.isPlaying()) {
        dropSound.stop();
      }
    } else { 
      normalSound.play();
      dropSound.play();
    }
  });

  var level = amplitude.getLevel();

  //gradation col
  b1 = color(205, 191, 207);
  b2 = color(232, 204, 223);
  c1 = color(175, 65, 77);
  c2 = color(243, 137, 116);

  //background stars
  for (var i=0; i<max_circles; i++) {
    circles[i] = new circle(
    random(0, windowWidth), random(0, windowHeight), random(-2, 2), random(-2, 2), 
    random(0, 5), color(255, 255, 255, random(0, 200)));
  }
}

function draw() {
  cam.loadPixels();
  var bRectNum = 0; 
  var wRectNum = 0;
  background(255);

  //setting text
  if (mode=='SETTING') {
    textSize(20);
    textAlign(CENTER);
    text("PLEASE SET YOUR MOUTH IN THE SQUARE BELOW", width/2, height*(1/4));
  }
  var xi=0;
  for (var x = cam.width/4; x < cam.width*(3/4); x+=pixelSiz) {
    for (var y = cam.height/3; y < cam.height*(2/3); y+=pixelSiz) {

      var id = (x + cam.width*y)*4; 
      var red = cam.pixels[id];  
      var green = cam.pixels[id];
      var blue = cam.pixels[id];
      if (red>100) {
        red = 255;
      } else {
        red = 0;
      }
      if (green>100) {
        green = 255;
      } else {
        green = 0;
      }
      if (blue>100) {
        blue = 255;
      } else {
        blue = 0;
      }
      if (red==0 || green==0 || blue==0){
        bRectNum += sizVector;
      } else {
        wRectNum += sizVector;
      }        
      var greyscale = round(red * 0.222 + green * 0.707 + blue * 0.071);
      var w=0;
      var posX = width - x*(width)/cam.width -10;
      var posY = y*height/cam.height;
        
      // greyscale to ellipse size
      w = map(greyscale, 0, 255, 20, 0);
      switch(mode){
        case 'SETTING' :
        noStroke();
        if (width/2 - 200 < posX < width/2 + 200) {
          if (height/2 -200 < posY < height/2 +200) {
            var c = color(red, green, blue);
            fill(c);
            rect(posX, posY, 20, 20);
            }
          }
        break;
        case 'NORMAL' : break;
        case 'DROP' : break;
      }
    }
  }
  //panning
  var panning = map(mouseX, 0, width, -0.8, 0.8);
  dropSound.pan(panning);

  var level = amplitude.getLevel();

  switch(mode){
    case 'SETTING' : 
    noFill();
    stroke(5);
    rect(width/4-10, height/3-10, width*(1/2)+20, height*(1/3)+20);
      
    fill(0);
    noStroke();
    ellipse(width/5,height/2,bRectNum/5,bRectNum/5);
    ellipse(width*(4/5),height/2,bRectNum/5,bRectNum/5);
    break;
    //set new background
    case 'NORMAL' : 
    setGradient(0, 0, width, height, b1, b2, Y_AXIS);
    for (var i=0; i<max_circles; i++) {
        circles[i].render();
    }
    break;
    case 'DROP' : 
    setGradient(0, 0, width, height, c1, c2, Y_AXIS);
    for (var i=0; i<max_circles; i++) {

        circles[i].render();
    }
    break;
  }

  //drop sound maping
  filterFreq = map(bRectNum/5, height/12, 0, 2300, 10); //max: 22050
  filterRes = map(bRectNum/5, 0, height/12, 5, 0);  // 15~5
  filter.set(filterFreq, filterRes);

  if (mode != 'SETTING') {
    //faceShadow
    fill(0,0,0,255*level);
    noStroke();
    ellipse(width-(width/2+(mouseX-width/2)/5), height/2+10, 550, 550);

    // ears & face
    var fColR = 37+level*50;
    var fColG = 45+level*50;
    var fColB = 49+level*50;
    if (fColR>255) {
      fColR = 255;
    }
    if (fColG>255) {
      fColR = 255;
    }
    if (fColB>255) {
      fColR = 255;
    }

    ears[0] = new Ear(200, 220, 70, 280, 90, 330, color(fColR, fColG, fColB), color(96, 111, 118), (-1));
    ears[1] = new Ear(200, 220, 70, 280, 90, 330, color(fColR, fColG, fColB), color(96, 111, 118), (1));

    fill(fColR, fColG, fColB);
    noStroke();
    ellipse(width/2, height/2, 600, 600);

    switch(mode){
      case 'NORMAL' : 
      if (bRectNum < 3) {
        bRectNum = 0
      }
      var mSizeY = map(level, 0, 1, 0, 300);
      var mSizeX = map(level, 0, 1, 200, 300);
      var eyeMove = map(level, 0.5, 1, 0, height/40);
      var eyesY = 200 + eyeMove;
      break;
      case 'DROP' : 
      var eyeMove = map(bRectNum/4, bRectNum/10, height/5, 0, height/40);
      if (eyeMove > height/40) {
        eyeMove = height/40;
      }
      if (eyeMove < 0) {
        eyeMove = 0;
      }
      var eyesY = 200 + eyeMove;

      if (normalSound.isPlaying() || dropSound.isPlaying()){
        var sizeX = bRectNum/5; var sizeY = bRectNum/5;
        var mSizeX = map(sizeX, 0, width/4, 0, width*(3/4)); var mSizeY = map(bRectNum/5, bRectNum/40, height/3, 0, height);
        if (mSizeX > width/(3.5)) {
          mSizeX = width/(3.5);
        }
        if (mSizeY > height/2) {
          mSizeY = height/2;
        }
      }else{
        mSizeY = 0; mSizeX = 0;
      }
      break;
    }

    //ears
    ears[0].render();
    ears[1].render();

    //additional effect
    if (mSizeY == height/2) {
      fill(0, 0, 0, bRectNum/5);
      rect(0, 0, width, height);
    }

    // mouth
    var makeRed = level*102;
    fill(255,153+makeRed,153+makeRed);
    ellipse(width/2+(mouseX-width/2)/5, height/2, mSizeX, mSizeY);
    //eyes    
    eyes[0] = new Eyes(color(234, 182, 36), color(0, 0, 100), 200, eyesY, 70);
    eyes[0].render();
  }
}

function keyPressed() {
  switch(key) {
    case '1' : mode = "SETTING";
    break;
    case '2' : mode = "NORMAL";
    break;
    case '3' : mode = "DROP";
    break;
    default : mode = "NORMAL";
    break;
  }
  print(mode);
}

function setGradient(x, y, w, h, c1, c2, axis) {

  noFill();

  if (axis == Y_AXIS) {  // Top to bottom gradient
    for (var i = y; i <= y+h; i++) {
      var inter = map(i, y, y+h, 0, 1);
      var c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x+w, i);
    }
  }  
  else if (axis == X_AXIS) {  // Left to right gradient
    for (var i = x; i <= x+w; i++) {
      var inter = map(i, x, x+w, 0, 1);
      var c = lerpColor(c1, c2, inter);
      stroke(c);
      line(i, y, i, y+h);
    }
  }
}

