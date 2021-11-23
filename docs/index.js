// Extend array function, Implement groupBy function, f is the predicate
Array.prototype.groupBy = function(f) {
  return this.reduce(function(groups, item) {
    var val = f(item);
    groups[val] = groups[val] || [];
    groups[val].push(item);
    return groups;
  }, []);
}

// UI functions
function getWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}

indexToColorClass = function(index){
  var i = index % 7
  var base = "ball "
  switch (i) {
  case 0:
    return `${base}red`
  case 1:
    return `${base}orange`
  case 2:
    return `${base}yellow`
  case 3:
    return `${base}green`
  case 4:
    return `${base}cyan`
  case 5:
    return `${base}blue`
  case 6:
    return `${base}magenta`
  }
}

// Random functions
randomNumbers = function(lower) {
  return function(upper){
    return function(count){
      var outList = new Set()
      for(var i = 0;i< count; i++){
        var randomNumber = Math.floor( lower+Math.random()*(upper - lower + 1))
        if(outList.has(randomNumber)){
          i--;
        }else{
          outList.add(randomNumber)
        }
      }
      return Array.from(outList);
    }
  }
}

randomFromOne = randomNumbers(1)

function* sequenceRandomNumber(lower,upper,size){
  for(var i = 0; (size * (i+1)) <= upper; i++){
    yield randomNumbers(lower+size * i)(lower+size * (i+ 1) - 1)(size)
  }
}

// Render functions
createBall = function(numberList){
  var html = ""
  return numberList.reduce(function(acc,value,index){
    var color = indexToColorClass(index)
    if(index % 16 == 0)
      return `${acc}
<div class='lottory'>
      <div class="${color}">
        <div><span>${value}</span></div>
      </div>`
    else if(index % 16 == 15)
      return `${acc}
      <div class="${color}">
        <div><span>${value}</span></div>
      </div>
      </div>`
    else
      return `${acc}
        <div class="${color}">
          <div><span>${value}</span></div>
        </div>`
  },"")
}

$(document).ready(function(){
  var grid = new Grid();
  grid.init();
  console.log(grid)
  $('#resetBtn').on('click',function(){
    $('#playBtn').removeAttr("disabled")
    grid.generate()
  });
  $('#playBtn').on('click',function(){
    play(grid)
  })
})

// Game Process functions
function play(grid){
  grid.play()
  $('#playBtn').attr("disabled", "disabled");
  $('#resetBtn').attr("disabled", "disabled");
  numberList = randomFromOne(75)(32);
  var html = createBall(numberList)
  $('#balls').html(html)
  var $ball = $('#balls >div> div'),
      diameter = $ball.height(),
      perimeter = Math.PI * diameter,
      n = $ball.length,
      i = 0,
      itv;

  itv = setInterval(function(){
    if(i>n){
      clearInterval(itv)
      grid.calculate()
      $('#resetBtn').removeAttr("disabled")
    };
    rotateBall( getWidth()-(diameter*(i%16)));
    grid.set(numberList[i])
    i++;
  },500);

  function rotateBall(distance) {
    console.log( distance );
    var degree = distance * 360 / perimeter;
    $ball.eq(i).on("transitionend",function(){
      $ball.eq(i).css({
        transition: "1s cubic-bezier(1.000, 1.450, 0.185, 0.850)",
        transform: 'translateY('+ (-perimeter) +'px)'
      }).find('div').css({
        transition: "1s cubic-bezier(1.000, 1.450, 0.185, 0.850)",
        transform: 'rotate(' + 360 + 'deg)'
      })})
      .css({
        transition: "1s cubic-bezier(1.000, 1.450, 0.185, 0.850)",
        transform: 'translateX('+ distance +'px)'
      }).find('div').css({
        transition: "1s cubic-bezier(1.000, 1.450, 0.185, 0.850)",
        transform: 'rotate(' + degree + 'deg)'
      });

  }
}


//  Grid index map
//  ------------------------
//  | 0 | 5 | 10 | 15 | 20 |
//  ------------------------
//  | 1 | 6 | 11 | 16 | 21 |
//  ------------------------
//  | 2 | 7 | 12 | 17 | 22 |
//  ------------------------
//  | 3 | 8 | 13 | 18 | 23 |
//  ------------------------
//  | 4 | 9 | 14 | 19 | 24 |
//  ------------------------
function Grid(){
  this.money = 500,
  this.finder = [],
  this.init = function(){
    this.generate()
    this.display()
  }
  this.play = function(){
    this.money -= 1;
    this.display()
  },
  this.display = function(){
    $('#money').html(this.money)
  },
  this.bashCheck= function(x){
    console.log(x)
    return x.reduce((acc,value) => {
      if(value.every(x =>this.getStatus(x))){
        value.map(x => this.markWin(x))
        return acc + 1
      }
      else
        return acc
    },0)
  },
  this.markWin = function(position){
    let s = null
    this.finder.forEach((el) => {
      if(el && el.postion == position ){
        s = el.selector
      }
    })
    if(s){
      s.addClass('win')
    }
  }
  this.getStatus = function(position){
      let s = false
      this.finder.forEach((el) => {
      if(el && el.postion == position ){
        s = el.status
      }
      })
    return s;
  },
  this.calculate = function(){
    var totalRow = 0
    var totalCol = 0
    var totalDia = 0
    var gridWin = false
    for(var j = 0;j<3;j++){
      var winRowCounter =0
      var winColCounter =0
      var winDiaCounter =0
      var base = Array.from({length: 25}, (x,i) => i + j*25);
      //check row

      var row = base.groupBy((x)=> Math.floor(x / 5))
      winRowCounter =  this.bashCheck(row)
      console.log(winRowCounter)
      //check col

      var col = base.groupBy((x)=> x % 5)
      winColCounter =  this.bashCheck(col)
      console.log(winColCounter)
      //check dia
      var dia = [[0,6,12,18,24].map(x=> x+j*25)
                 ,[4,8,12,16,20].map(x=> x+j*25)]
      winDiaCounter =  this.bashCheck(dia)
      if(winRowCounter == 5 && winColCounter == 5 && winDiaCounter == 2)
      {
        gridWin = true
      }else{
        totalRow += winRowCounter;
        totalCol += winColCounter;
        totalDia += winDiaCounter;
      }
    }
    this.money += 2 * totalDia
    this.money += 2 * totalCol
    this.money += 2 * totalRow
    if(gridWin)
    {
      this.money += 1000
    }
    this.display()
  },
  this.draw =function(){
  },
  this.set = function(number){
    ob = this.finder[number];
    if(ob != undefined && ob.selector && ob.status == false){
      ob.selector.addClass('active')
      ob.status = true
    }
  },
  this.generate = function(){
    this.finder = []
    var randomGenerater = sequenceRandomNumber(1,75,15)
    var randomCol1 = randomGenerater.next().value
    var randomCol2 = randomGenerater.next().value
    var randomCol3 = randomGenerater.next().value
    var randomCol4 = randomGenerater.next().value
    var randomCol5 = randomGenerater.next().value
    var $grids = $('.flex-container >div')
    $grids.each(function(index,el){
      var j = Math.floor((index) /5 %5 )
      $(el).removeClass('active')
      $(el).removeClass('win')
      switch (j){
      case 0:
        $(el).html(randomCol1.pop())
        this.finder[parseInt($(el).html())] = {selector: $(el), status: false, postion: index}
        break;
      case 1:
        $(el).html(randomCol2.pop())
        this.finder[parseInt($(el).html())] = {selector: $(el), status: false, postion: index}
        break;
      case 2:
        $(el).html(randomCol3.pop())
        this.finder[parseInt($(el).html())] = {selector: $(el), status: false, postion: index}
        if((index % 5) == 2){
          this.finder[parseInt($(el).html())] = {selector: $(el), status: true, postion: index}
          $(el).html("Free")
        }
        break;
      case 3:
        $(el).html(randomCol4.pop())
        this.finder[parseInt($(el).html())] = {selector: $(el), status: false, postion: index}
        break;
      case 4:
        $(el).html(randomCol5.pop())
        this.finder[parseInt($(el).html())] = {selector: $(el), status: false, postion: index}
        break;
      default:
        break;
      }
    }.bind(this))
  }
}
