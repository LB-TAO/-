// 初始化弹幕数据
let data = [
    {value:'周杰伦的听妈妈的话',time:1,color:'red',speed:1,fontSize:22},
    {value:'想快快长大',time:2,color:'#00a1f5',speed:1,fontSize:30},
    {value:'听妈妈的话',time:1.5}
];

let doc = document;
let canvas = doc.getElementById('canvas');
let video = doc.getElementById('video');
let $txt = doc.getElementById('text');
let $btn = doc.getElementById('btn');
let $color = doc.getElementById('color');
let $range = doc.getElementById('range');


// 弹幕实例类
class Barrage{
    constructor(obj,ctx){
        this.value = obj.value;
        this.time = obj.time;
        this.obj = obj;
        this.context = ctx;
    }

    init(){
        this.color = this.obj.color || this.context.color;
        this.speed = this.obj.speed || this.context.speed;
        this.opacity = this.obj.opacity || this.context.opacity;
        this.fontSize = this.obj.fontSize || this.context.fontSize;

        let p = document.createElement('p');
        p.style.fontSize = this.fontSize + 'px';
        p.innerHTML = this.value;
        document.body.appendChild(p);

        this.width = p.clientWidth;
        document.body.removeChild(p);

        this.x = this.context.canvas.width;
        this.y = this.context.canvas.height * Math.random();
        if(this.y < this.fontSize){
            this.y = this.fontSize;
        }else if(this.y > this.context.canvas.height - this.fontSize){
            this.y = this.context.canvas.height - this.fontSize;
        }
    }

    render(){
        this.context.ctx.font = `${this.fontSize}px Arial`;
        this.context.ctx.fillStyle = this.color;
        this.context.ctx.fillText(this.value,this.x,this.y);
    }
}

class CanvasBarrage{
    constructor(canvas,video,opts={}){
        if(!canvas||!video) return;
        this.video = video;
        this.canvas = canvas;
        this.canvas.width = video.width;
        this.canvas.height = video.height;
        this.ctx = canvas.getContext('2d');

        let defOpts = {
            color:'#e91e63',
            speed:1.5,
            opacity:0.5,
            fontSize:20,
            data:[]
        };

        Object.assign(this,defOpts,opts);
        this.isPaused = true;
        this.barrages = this.data.map(item=>new Barrage(item,this));
        this.render();
        console.log(this);
    }

    render() {
        this.clear();
        this.renderBarrage();
        if(this.isPaused === false){
            requestAnimationFrame(this.render.bind(this));
        }
    };

    clear(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    }

    add(obj){
        this.barrages.push(new Barrage(obj,this));
    }

    repaly(){
        this.clear();
        let time = this.video.currentTime;
        this.barrages.forEach(barrage => {
            barrage.flag = false;
            if(time <= barrage.time){
                barrage.isInit = false;
            }else{
                barrage.flag = true;
            }
        })
    }

    renderBarrage(){
        let time = this.video.currentTime;
        this.barrages.forEach(barrage => {
            if(!barrage.flag && time>=barrage.time){
                if(!barrage.isInit){
                    barrage.init();
                    barrage.isInit=true;
                }
            }

            barrage.x -= barrage.speed;
            barrage.render();

            if(barrage.x < -barrage.width){
                barrage.flag = true;
            }
        })
    }
}

let canvasBarrage = new CanvasBarrage(canvas,video,{data});

video.addEventListener('play',()=>{
    canvasBarrage.isPaused = false;
    canvasBarrage.render();
})

// 发送弹幕
function send(){
    let value = $txt.value;
    let time = video.currentTime;
    let color = $color.value;
    let fontSize = $range.value;
    let obj = {value,time,color,fontSize};
    canvasBarrage.add(obj);
    $txt.value = '';
}
$btn.addEventListener('click',send);
$txt.addEventListener('keyup',e=>{
    let key = e.keyCode;
    key === 13 && send();
});

// 播放
video.addEventListener('play',()=>{
    canvasBarrage.isPaused = false;
    canvasBarrage.render();
})
// 停止
video.addEventListener('pause',()=>{
    canvasBarrage.isPaused = true;
})
// 重新渲染
video.addEventListener('seeked',()=>{
    canvasBarrage.replay();
})