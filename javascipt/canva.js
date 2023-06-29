//
const $ = (id) => 
document.getElementById(id)

//state
const POINT = "point";
const DRAW = "draw";
const ERASE = "erase";
const TEXT = "text";
const CIRCLE = "circle";
const RECTANGLE = "rectangle";
const TRIANGLE = "triangle"
let state = POINT;//record what state
//undo redo
let undo = [];
let redo = [];
let cur_json;

//background
let background = null;
//mousedown mouseup
window.addEventListener("load", todo);
//some arrtibute
let CANVAS_FONTSIZE = 50;
let CANVAS_COLOR = 'black';
let CANVAS_PENW = 30;
let CANVAS_FONT = 'Arial';
//drag shape
let origX, origY;
let shape_start = false;

function todo(){
    console.log("start");
    const canvas = new fabric.Canvas('canvas', {
        width: 1100,
        height: 500,
        isDrawingMode: false,
        backgroundColor: '#fff9f9'
    });
    //point button
    const pointBTN = $('point')
    pointBTN.addEventListener('click', function(e){
        state = POINT;
        canvas.selection = true;
        canvas.isDrawingMode = false;
    });
    //draw button
    const drawBtN = $('draw');
    drawBtN.addEventListener('click', function(e){
        state = DRAW;
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = CANVAS_PENW;
        canvas.freeDrawingBrush.color = CANVAS_COLOR;
        console.log("change to pencil");
    });
    //brush button
    const brushBTN = $('brush');
    brushBTN.addEventListener('click', function(e){
        state = DRAW;
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
        canvas.freeDrawingBrush.width = CANVAS_PENW;
        canvas.freeDrawingBrush.color = CANVAS_COLOR;
        console.log("change to brush");
    })
    //erase button
    const eraseBTN = $('erase');
    eraseBTN.addEventListener('click', function(e){
        state = ERASE;
        canvas.selection = true;
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
        canvas.freeDrawingBrush.width = CANVAS_PENW;
        console.log("change to erase");
    })
    //redo button
    const redoBTN = $('redo');
    redoBTN.addEventListener('click', function(){
        replay(redo, undo);
        console.log("redo");
    });
    //undo button
    const undoBTN = $('undo');
    undoBTN.addEventListener('click', function(){
        replay(undo, redo);
        console.log("undo");
    });
    //reset button
    const resetBTN = $('reset');
    resetBTN.addEventListener('click', function(){
        clear_history();
        canvas.setBackgroundImage(background, canvas.renderAll.bind(canvas));
        console.log("reset");
    });
    //text button
    const textBTN = $('text');
    textBTN.addEventListener('click', function(){
        state = TEXT;
        canvas.isDrawingMode = false;
        console.log("change to text");
    })
    //download button
    const downlaodBTN = $('download');
    downlaodBTN.addEventListener('click', function(e){
        let a = document.createElement('a');
        a.href = canvas.toDataURL("image/png");
        a.download = "canvas.png";
        a.click();
        console.log("download successful");
    })
    //upload button
    const uploadBTN = $('upload');
    uploadBTN.addEventListener('click', function(e){
        let file = document.createElement('input');
        file.type = "file";
        file.click();
        file.addEventListener('change', function(e) {
            let F = e.target.files[0];
            let reader = new FileReader();
            reader.onload = function(f) {
                const MAX_width = 1100;
                const MAX_height = 500;
                let img = new Image();
                img.src = f.target.result;
                img.onload = function(){
                    let sX, sY;
                    let sW, sH;
                    if (this.width > MAX_width) {
                        sX = MAX_width / this.width;
                        sW = 1100;
                    } else {
                        sX = 1;
                        sW = this.width;
                    }
                    if (this.height > MAX_height) {
                        sY = MAX_height / this.height;
                        sH = 500
                    } else {
                        sY = 1;
                        sH = this.height;
                    }
                    background = new fabric.Image(this, {
                        erasable: false,
                        scaleX: sX,
                        scaleY: sY,
                    })
                    canvas.setHeight(sH);
                    canvas.setWidth(sW);
                    clear_history();
                    canvas.setBackgroundImage(background, canvas.renderAll.bind(canvas));
                }
            }
            reader.readAsDataURL(F);
            return;
        })
    })
    //circle button
    const circleBTN = $('circle');
    circleBTN.addEventListener('click', function(){
        state = CIRCLE;
        canvas.selection = false;
        canvas.isDrawingMode = false;
        canvas.forEachObject(function(object){ 
            object.selectable = false; 
        });
        console.log("change to circle");
    })
    //rectangle button
    const rectangleBTN = $('rectangle');
    rectangleBTN.addEventListener('click', function(){
        state = RECTANGLE;
        canvas.selection = false;
        canvas.isDrawingMode = false;
        canvas.forEachObject(function(object){ 
            object.selectable = false; 
        });
        console.log("change to rectangle");
    })
    //triangle button
    const triangleBTN = $('triangle');
    triangleBTN.addEventListener('click', function(){
        state = TRIANGLE;
        canvas.selection = false;
        canvas.isDrawingMode = false;
        canvas.forEachObject(function(object){ 
            object.selectable = false; 
        });
        console.log("change to triangle");
    })
    //pen width input
    const penwidthINPUT = $('penwidth');
    penwidthINPUT.addEventListener('change', function(){
        CANVAS_PENW = parseInt(penwidthINPUT.value, 10) || 1;
        canvas.freeDrawingBrush.width = CANVAS_PENW;
        let getValRange = this.value;
        $('pen_width_span').textContent = getValRange + '%';
        console.log("change pen width to " + CANVAS_PENW);
    })

    //fontsize input
    const fontsizeINPUT = $('fontsize');
    fontsizeINPUT.addEventListener('change', function(){
        CANVAS_FONTSIZE = fontsizeINPUT.value;
        let getValRange = this.value;
        $('pen_fontsize_span').textContent = getValRange + '%';
        console.log("change font size to " + CANVAS_FONTSIZE);
    })
    //font input
    const fontSEL = $('font');
    fontSEL.addEventListener('change', function(e){
        CANVAS_FONT = e.target.value;
        console.log("chabge font to " + CANVAS_FONT);
    })
    //undo redo
    canvas.on('object:modified', function(){
        console.log("something has been modified");
        save();
    })
    canvas.on('mouse:down', function(event){
        if (undo.length == 0) {
            save();
        }//save the initial canva
        let pointer = canvas.getPointer(event.e);//get the cursor's location
        let x = parseInt(pointer.x);
        let y = parseInt(pointer.y);
        switch (state) {
            case TEXT:
                let text = new fabric.IText('Enter', {
                    top: y,
                    left: x,
                    fill: CANVAS_COLOR,
                    fontFamily: CANVAS_FONT,
                    fontSize: CANVAS_FONTSIZE,
                })
                text.setCoords();
                console.log(text);
                canvas.add(text);
                break;
            case CIRCLE:
                shape_mousedown(event, CIRCLE);
                break;
            case RECTANGLE:
                shape_mousedown(event, RECTANGLE);
                break;
            case TRIANGLE:
                shape_mousedown(event, TRIANGLE);
                break;
            default:
                break;
        }
    })
    canvas.on('mouse:move', function(event){
        switch(state){
            case RECTANGLE:
                shape_mousemove(event, RECTANGLE);
                break;
            case CIRCLE:
                shape_mousemove(event, CIRCLE);
                break;
            case TRIANGLE:
                shape_mousemove(event, TRIANGLE);
                break;
            default:
                break;
        }
    })
    canvas.on('mouse:up', function(event){
        switch (state) {
            case DRAW:
                save();
                break;
            case ERASE:
                save();
                break;
            case TEXT:
                save();
                state = POINT;
                break;
            case CIRCLE:
                shape_mouseup();
                save();
                canvas.forEachObject(function(object){ 
                    object.selectable = true; 
                });
                state = POINT;
                break;
            case RECTANGLE:
                shape_mouseup();
                save();
                canvas.forEachObject(function(object){ 
                    object.selectable = true; 
                });
                state = POINT;
                break;
            case TRIANGLE:
                shape_mouseup();
                save();
                canvas.forEachObject(function(object){ 
                    object.selectable = true; 
                });
                state = POINT;
                break;
            default:
                break;
        }
    })
    //save function
    function save(){
        redo = [];
        if (cur_json) {
            if (undo.length >= 10) {
                undo.shift();
            }
            undo.push(cur_json);
        }
        cur_json = JSON.stringify(canvas);
        console.log("save!");
    }
    //replay function
    function replay(playstack, savestack){
        if (playstack.length <= 0) {
            return;
        }
        savestack.push(cur_json);
        cur_json = playstack.pop();
        canvas.clear();
        canvas.loadFromJSON(cur_json, function(){
            canvas.renderAll();
        })
        console.log("redo : " + redo.length);
        console.log("undo : " + undo.length);
    }
    function clear_history(){
        redo = [];
        undo = [];
        cur_json = null;
        canvas.clear();
        canvas.backgroundColor = '#fff9f9';
    }
    //shape
    function shape_mousedown(event, shape) {
        let mouse = canvas.getPointer(event.e);
        let OB;
        shape_start = true;
        origX = mouse.x;
        origY = mouse.y;

        switch (shape) {
            case RECTANGLE:
                OB = new fabric.Rect({
                    width:0, 
                    height: 0, 
                    left: origX, 
                    top: origY, 
                    fill: CANVAS_COLOR
                })        
                break;
            case CIRCLE:
                OB = new fabric.Circle({
                    radius:0,
                    top:origY,
                    left:origX,
                    fill: CANVAS_COLOR
                })
                break;
            case TRIANGLE:
                OB = new fabric.Triangle({
                    width:0,
                    height:0,
                    left:origX,
                    top:origY,
                    fill: CANVAS_COLOR
                })
                break;
            default:
                break;
        }

        
        canvas.add(OB);
        canvas.renderAll();
        canvas.setActiveObject(OB);
    }

    function shape_mousemove(event, shape){
        if(!shape_start){
            return false;
        }
        let mouse = canvas.getPointer(event.e);
        let w = Math.abs(mouse.x - origX);
        let h = Math.abs(mouse.y - origY);
        if (!w||!h) {
            return false;
        }
        let OB = canvas.getActiveObject();
        switch (shape) {
            case RECTANGLE:
                OB.set('width', w).set('height', h);
                if(origX>mouse.x){
                    OB.set({ left: Math.abs(mouse.x) });
                }
                if(origY>mouse.y){
                    OB.set({ top: Math.abs(mouse.y) });
                }
                break;
            case CIRCLE:
                OB.set('radius', (w+  h)/4);
                if(origX>mouse.x){
                    OB.set({ left: Math.abs(mouse.x) });
                }
                if(origY>mouse.y){
                    OB.set({ top: Math.abs(mouse.y) });
                }
                break;
            case TRIANGLE:
                OB.set('width', w).set('height', h);
                if(origX>mouse.x){
                    OB.set({ left: Math.abs(mouse.x) });
                }
                if(origY>mouse.y){
                    OB.set({ top: Math.abs(mouse.y) });
                }
                break;
            default:
                break;
        }
        
        
        canvas.renderAll();
    }
    function shape_mouseup(){
        if (shape_start) {
            shape_start = false;
        }
        let OB = canvas.getActiveObject();
        OB.setCoords();
    }
    //solor selector
    let colorBlock = document.getElementById('color_block');
    let ctx1 = colorBlock.getContext('2d');
    let width1 = colorBlock.width;
    let height1 = colorBlock.height;

    let colorStrip = document.getElementById('color_strip');
    let ctx2 = colorStrip.getContext('2d');
    let width2 = colorStrip.width;
    let height2 = colorStrip.height;

    let colorType = document.getElementById('color_type');

    let x = 0;
    let y = 0;
    let drag = false;

    ctx1.rect(0, 0, width1, height1);
    fillGradient();

    ctx2.rect(0, 0, width2, height2);
    let grd1 = ctx2.createLinearGradient(0, 0, 0, height1);
    grd1.addColorStop(0, 'rgba(255, 0, 0, 1)');
    grd1.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
    grd1.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
    grd1.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
    grd1.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
    grd1.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
    grd1.addColorStop(1, 'rgba(255, 0, 0, 1)');
    ctx2.fillStyle = grd1;
    ctx2.fill();

    function click(e) {
      x = e.offsetX;
      y = e.offsetY;
      let imageData = ctx2.getImageData(x, y, 1, 1).data;
      CANVAS_COLOR = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
      fillGradient();
    }

    function fillGradient() {
      ctx1.fillStyle = CANVAS_COLOR;
      ctx1.fillRect(0, 0, width1, height1);

      let grdWhite = ctx2.createLinearGradient(0, 0, width1, 0);
      grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
      grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
      ctx1.fillStyle = grdWhite;
      ctx1.fillRect(0, 0, width1, height1);

      let grdBlack = ctx2.createLinearGradient(0, 0, 0, height1);
      grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
      grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
      ctx1.fillStyle = grdBlack;
      ctx1.fillRect(0, 0, width1, height1);
    }

    function mousedown(e) {
      drag = true;
      changeColor(e);
    }

    function mousemove(e) {
      if (drag) {
        changeColor(e);
      }
    }

    function mouseup(e) {
      drag = false;
    }

    function changeColor(e) {
      x = e.offsetX;
      y = e.offsetY;
      let imageData = ctx1.getImageData(x, y, 1, 1).data;
      CANVAS_COLOR = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
      canvas.freeDrawingBrush.color = CANVAS_COLOR;
      colorType.style.backgroundColor = CANVAS_COLOR;
    }

    colorStrip.addEventListener("click", click, false);

    colorBlock.addEventListener("mousedown", mousedown, false);
    colorBlock.addEventListener("mouseup", mouseup, false);
    colorBlock.addEventListener("mousemove", mousemove, false);
};
        