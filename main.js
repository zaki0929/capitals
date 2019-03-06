var CT = CT || {};

window.addEventListener("load", function(){
    CT.isMobile = navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i);
    CT.mytap = CT.isMobile? "touchstart": "click";

    CT.width  = window.innerWidth;
    CT.height = window.innerHeight;

    CT.stage = new Konva.Stage({
        container: 'container',
        width:  CT.width,
        height: CT.height
    });

    CT.mainLayer = new Konva.Layer();
    CT.stage.add(CT.mainLayer);

    CT.capitalGroup = new Konva.Group();
    CT.tooltipGroup = new Konva.Group();
    CT.mainLayer.add(CT.capitalGroup);
    CT.mainLayer.add(CT.tooltipGroup);

    CT.capitalArray = [];
    
    CT.core = {
        lat: 35.709026,
        lng: 139.731992
    }

    CT.r = 8;
    CT.k = 90;

    CT.opt = {
        default: {
            displayName: false
        },

        getParam: function() {
            var urlParam = location.search.substring(1);
            var paramObj = {};
            if(urlParam) {
                var param = urlParam.split('&');
                for (i = 0; i < param.length; i++) {
                    var paramItem = param[i].split('=');
                    if (paramItem[1] == "true") {
                        paramItem[1] = true;
                    }
                    if (paramItem[1] == "false") {
                        paramItem[1] = false;
                    }
                    paramObj[paramItem[0]] = paramItem[1];
                }
            }
            return paramObj;
        },

        setData: function() {
            var param = this.getParam();
            for (var key in this.default) {
                if (!(key in param)) {
                    param[key] = this.default[key];
                }
            }
            this.data = param;
        }
    }

    CT.degToRad = function(deg) {
        return deg * (Math.PI / 180);
    }
    
    CT.calcPos = function(core, lat, lng) {
        var p1 = CT.degToRad(core.lat);
        var l0 = CT.degToRad(core.lng);

        var p = CT.degToRad(lat);
        var l = CT.degToRad(lng);

        var c = Math.acos(Math.sin(p1)*Math.sin(p)+Math.cos(p1)*Math.cos(p)*Math.cos(l-l0));

        var k = CT.k;
        if (Math.sin(c) != 0) {
            k *= c/Math.sin(c);
        }

        var pos = {
            x: k*Math.cos(p)*Math.sin(l-l0),
            y: k*(Math.cos(p1)*Math.sin(p)-Math.sin(p1)*Math.cos(p)*Math.cos(l-l0))
        }

        return pos;
    }
    
    CT.buildCapital = function(name, isCore, lat, lng, color) {
        var r = CT.r; 

        var pos = CT.calcPos(CT.core, lat, lng);

        var capital = new Konva.Circle({
            x:  pos.x + CT.width/2,
            y: -pos.y + CT.height/2,
            radius: r,
            fill: color,
            stroke: color,
            strokeWidth: r*0.2 
        });
        CT.capitalGroup.add(capital);
        
        capital.name   = name;
        capital.lat    = lat;
        capital.lng    = lng;
        capital.color  = color;
        capital.r      = r;
        capital.isCore = isCore;
        
        var tooltip = new Konva.Text({
            text: capital.name,
            fontFamily: "Calibri",
            fontSize: 20,
            padding: 5,
            textFill: capital.color,
            fill: capital.color,
            alpha: 0.75,
            visible: false
        });
        CT.tooltipGroup.add(tooltip);

        capital.on('mouseover', function() {	
            this.setRadius(this.r*1.4);
            this.setStrokeWidth(this.r*0.2*1.4);
            tooltip.position({
                x: this.getX() + r,
                y: this.getY() - (r+25) 
            });
            if (CT.opt.data.displayName) {
                tooltip.show();
            }
            this.getLayer().draw();
        });
        
        capital.on('mouseout' , function() {
            this.setRadius(this.r);
            this.setStrokeWidth(this.r*0.2);
            tooltip.hide();
            this.getLayer().draw();
        });

        capital.on(CT.mytap, function() {
            if (!this.isCore) {
                tooltip.hide();
                tooltip.getLayer().draw();
                for (var i=0; i<CT.capitalArray.length; i++) {
                    var c = CT.capitalArray[i];
                    c.isCore = false;
                    c.r = this.r;
                    c.setFill(c.color);
                    c.setRadius(c.r);
                    c.setStrokeWidth(c.r*0.2);
                }
                this.isCore = true;
                CT.core = {
                    lat: this.lat,
                    lng: this.lng
                }
                CT.update();
            }
        });

        CT.capitalArray.push(capital);
    }

    CT.update = function() {
        for (var i=0; i<CT.capitalArray.length; i++) {
            var c = CT.capitalArray[i];
            var pos = CT.calcPos(CT.core, c.lat, c.lng);
            var tween = new Konva.Tween({
                node: c,
                duration: 0.5,
                x:  pos.x + CT.width /2,
                y: -pos.y + CT.height/2
            });
            tween.play();
        }
        CT.mainLayer.draw();
    }

    
    CT.opt.setData();
    CT.buildCapital('Tokyo / Japan'            , true ,  35.709026,  139.731992, '#f00');
    CT.buildCapital('Canberra / Australia'     , false, -35.308129,  149.124402, '#fa0');
    CT.buildCapital('Washington, D.C. / U.S.A.', false,  38.907192, -77.036871 , '#afa');
    CT.buildCapital('London / U.K.'            , false,  51.507351, -0.127758  , '#faf');
    CT.buildCapital('Brasilia / Brazil'        , false, -15.794392, -47.882004 , '#f0a');
    CT.buildCapital('Pretoria / South Africa'  , false, -25.747868,  28.229271 , '#0af');
    CT.buildCapital('Beijing / China'          , false,  39.904200,  116.407396, '#aaf');
    CT.buildCapital('Reykjavík / Iceland'      , false,  64.126521, -21.817439 , '#faa');
    CT.buildCapital('Wellington / New Zealand' , false, -41.286460,  174.776236, '#0ff');
    CT.buildCapital('Cairo / Egypt'            , false,  30.044420,  31.235712 , '#f0f');
    CT.buildCapital('New Delhi / India'        , false,  28.613939,  77.209021 , '#af0');
    CT.buildCapital('Mexico City / Mexico'     , false,  19.432608, -99.133208 , '#00f');

    CT.mainLayer.draw();
});
