/*global YAHOO */
/**
 * WireIt provide classes to build wirable interfaces
 * @module WireIt
 */
/**
 * @class WireIt
 * @static
 * @namespace WireIt
 */
var WireIt = {
	
	
	
	defaultWireClass: "WireIt.BezierWire",
	
	wireClassFromXtype: function(xtype) {
		return this.classFromXtype(xtype, this.defaultWireClass);
	},
	
	
	defaultTerminalClass: "WireIt.Terminal",
	
	terminalClassFromXtype: function(xtype) {
		return this.classFromXtype(xtype, this.defaultTerminalClass);
	},
	

	defaultContainerClass: "WireIt.Container",
	
	containerClassFromXtype: function(xtype) {
		return this.classFromXtype(xtype, this.defaultContainerClass);
	},
	
	/**
	 * default
	 */
	classFromXtype: function(xtype, defaultXtype) {
		var path = (xtype || defaultXtype).split('.');
		var klass = window;
		for(var i = 0 ; i < path.length ; i++) {
			klass = klass[path[i]];
		}
		
      if(!YAHOO.lang.isFunction(klass)) {
         throw new Error("WireIt unable to find klass from xtype: '"+xtype+"'");
      }

		return klass;
	},
   
   /**
    * Get a css property in pixels and convert it to an integer
    * @method getIntStyle
    * @namespace WireIt
    * @static
    * @param {HTMLElement} el The element
    * @param {String} style css-property to get
    * @return {Integer} integer size
    */
   getIntStyle: function(el,style) {
      var sStyle = YAHOO.util.Dom.getStyle(el, style);
      return parseInt(sStyle.substr(0, sStyle.length-2), 10);
   },

   /**
    * Helper function to set DOM node attributes and style attributes.
    * @method sn
    * @static
    * @param {HTMLElement} el The element to set attributes to
    * @param {Object} domAttributes An object containing key/value pairs to set as node attributes (ex: {id: 'myElement', className: 'myCssClass', ...})
    * @param {Object} styleAttributes Same thing for style attributes. Please use camelCase for style attributes (ex: backgroundColor for 'background-color')
    */
   sn: function(el,domAttributes,styleAttributes){
      if(!el) { return; }
		var i;
      if(domAttributes){
         for(i in domAttributes){
				if(domAttributes.hasOwnProperty(i)) {
					var domAttribute = domAttributes[i];
	            if(typeof (domAttribute)=="function"){continue;}
	            if(i=="className"){
	               i="class";
	               el.className=domAttribute;
	            }
	            if(domAttribute!==el.getAttribute(i)){
	               if(domAttribute===false){
	                  el.removeAttribute(i);
	               }else{
	                  el.setAttribute(i,domAttribute);
	               }
	            }
				}
         }
      }
      if(styleAttributes){
         for(i in styleAttributes){
				if(styleAttributes.hasOwnProperty(i)) {
					if(typeof (styleAttributes[i])=="function"){ continue; }
					if(el.style[i]!=styleAttributes[i]){
						el.style[i]=styleAttributes[i];
					}
				}
         }
      }
   
   },


   /**
    * Helper function to create a DOM node. (wrapps the document.createElement tag and the inputEx.sn functions)
    * @method cn
    * @static
    * @param {String} tag The tagName to create (ex: 'div', 'a', ...)
    * @param {Object} [domAttributes] see inputEx.sn
    * @param {Object} [styleAttributes] see inputEx.sn
    * @param {String} [innerHTML] The html string to append into the created element
    * @return {HTMLElement} The created node
    */
   cn: function(tag, domAttributes, styleAttributes, innerHTML){
      var el=document.createElement(tag);
      this.sn(el,domAttributes,styleAttributes);
      if(innerHTML){ el.innerHTML = innerHTML; }
      return el;
   },
   
   /**
    * indexOf replace Array.indexOf for cases where it isn't available (IE6 only ?)
    * @method indexOf
    * @static
    * @param {Any} el element to search for
    * @param {Array} arr Array to search into
    * @return {Integer} element index or -1 if not found
    */
   indexOf: YAHOO.lang.isFunction(Array.prototype.indexOf) ? 
                        function(el, arr) { return arr.indexOf(el);} : 
                        function(el, arr) {
                           for(var i = 0 ;i < arr.length ; i++) {
                              if(arr[i] == el) {return i;}
                           }
                           return -1;
                        },

   /**
    * compact replace Array.compact for cases where it isn't available
    * @method compact
    * @static
    * @param {Array} arr Array to compact
    * @return {Array} compacted array
    */
   compact: YAHOO.lang.isFunction(Array.prototype.compact) ? 
                        function(arr) { return arr.compact();} :          
                        function(arr) {
                           var n = [];
                           for(var i = 0 ; i < arr.length ; i++) {
                              if(arr[i]) {
                                 n.push(arr[i]);
                              }
                           }
                           return n;
                        }
};


/**
 * WireIt.util contains utility classes
 */
WireIt.util = {};
/*global YAHOO,WireIt,G_vmlCanvasManager,document */
(function () {
   
   // Shortcuts
   var Event = YAHOO.util.Event, UA = YAHOO.env.ua;

   /**
    * Create a canvas element and wrap cross-browser hacks to resize it
    * @class CanvasElement
    * @namespace WireIt
    * @constructor
    * @param {HTMLElement} parentNode The canvas tag will be append to this parent DOM node.
    */
   WireIt.CanvasElement = function(parentNode) {
      
      /**
       * The canvas element
       * @property element
       * @type HTMLElement
       */
      this.element = document.createElement('canvas');
      
      // Append to parentNode
      parentNode.appendChild(this.element);
      
      // excanvas.js for dynamic canvas tags
      if(typeof (G_vmlCanvasManager)!="undefined"){
         this.element = G_vmlCanvasManager.initElement(this.element);
      }
      
   };
   
   WireIt.CanvasElement.prototype = {
      
      /**
       * Get a drawing context
       * @method getContext
       * @param {String} [mode] Context mode (default "2d")
       * @return {CanvasContext} the context
       */
      getContext: function(mode) {
       return this.element.getContext(mode || "2d");
      },
      
      /**
       * Purge all event listeners and remove the component from the dom
       * @method destroy
       */
      destroy: function() {
         var el = this.element;

         // Remove from DOM
         if(YAHOO.util.Dom.inDocument(el)) {
            el.parentNode.removeChild(el);
         }

         // recursively purge element
         Event.purgeElement(el, true);
      },
      
      /**
       * Set the canvas position and size.
       * <b>Warning:</b> This method changes the <i>element</i> property under some brother. Don't copy references !
       * @method SetCanvasRegion
       * @param {Number} left Left position
       * @param {Number} top Top position
       * @param {Number} width New width
       * @param {Number} height New height
       */
      SetCanvasRegion: UA.ie ? 
               // IE
               function(left,top,width,height){
                  var el = this.element;
                  WireIt.sn(el,null,{left:left+"px",top:top+"px",width:width+"px",height:height+"px"});
                  el.getContext("2d").clearRect(0,0,width,height);
                  this.element = el;
               } : 
               ( (UA.webkit || UA.opera) ? 
                  // Webkit (Safari & Chrome) and Opera
                  function(left,top,width,height){
                     var el = this.element;
                     var newCanvas=WireIt.cn("canvas",{className:el.className || el.getAttribute("class"),width:width,height:height},{left:left+"px",top:top+"px"});
                     var listeners=Event.getListeners(el);
                     for(var listener in listeners){
								if(listeners.hasOwnProperty(listener)) {
									var l=listeners[listener];
									Event.addListener(newCanvas,l.type,l.fn,l.obj,l.adjust);
								}
                     }
                     Event.purgeElement(el);
                     el.parentNode.replaceChild(newCanvas,el);
                     this.element = newCanvas;
                  } :  
                  // Other (Firefox)
                  function(left,top,width,height){
                     WireIt.sn(this.element,{width:width,height:height},{left:left+"px",top:top+"px"});
                  })
   };
   
})();/*global YAHOO */
/**
 * The wire widget that uses a canvas to render
 * @class Wire
 * @namespace WireIt
 * @extends WireIt.CanvasElement
 * @constructor
 * @param  {WireIt.Terminal}    terminal1   Source terminal
 * @param  {WireIt.Terminal}    terminal2   Target terminal
 * @param  {HTMLElement} parentEl    Container of the CANVAS tag
 * @param  {Obj}                options      Wire configuration (see options property)
 */
WireIt.Wire = function( terminal1, terminal2, parentEl, options) {
   
   /**
    * Reference to the parent dom element
    * @property parentEl
    * @type HTMLElement
    */
   this.parentEl = parentEl;
   
   /**
    * Source terminal
    * @property terminal1
    * @type WireIt.Terminal
    */
   this.terminal1 = terminal1;
   
   /**
    * Target terminal
    * @property terminal2
    * @type WireIt.Terminal || WireIt.TerminalProxy
    */
   this.terminal2 = terminal2;

	
   /**
    * Event that is fired when a wire is clicked (on the wire, not the canvas)
    * You can register this event with myWire.eventWireClick.subscribe(function(e,params) { var wire = params[0], xy = params[1];}, scope);
    * @event eventMouseClick
    */
   this.eventMouseClick = new YAHOO.util.CustomEvent("eventMouseClick");

	/**
    * Event that is fired when the mouse enter the wire
    * You can register this event with myWire.eventMouseIn.subscribe(function(e,params) { var wire = params[0], xy = params[1];}, scope);
    * @event eventMouseIn
    */
	this.eventMouseIn = new YAHOO.util.CustomEvent("eventMouseIn");
	
	/**
    * Event that is fired when the mouse exits the wire
    * You can register this event with myWire.eventMouseOut.subscribe(function(e,params) { var wire = params[0], xy = params[1];}, scope);
    * @event eventMouseOut
    */
	this.eventMouseOut = new YAHOO.util.CustomEvent("eventMouseOut");
	
	/**
    * Event that is fired when the mouse moves inside the wire
    * You can register this event with myWire.eventMouseMove.subscribe(function(e,params) { var wire = params[0], xy = params[1];}, scope);
    * @event eventMouseMove
    */
	this.eventMouseMove = new YAHOO.util.CustomEvent("eventMouseMove");


   
   // Init the options property
   this.setOptions(options || {});
   
   // Create the canvas element and append it to parentEl
   WireIt.Wire.superclass.constructor.call(this, this.parentEl);
   
   // CSS classname
   YAHOO.util.Dom.addClass(this.element, this.options.className);
   
   // Call addWire on both terminals
   this.terminal1.addWire(this);
   this.terminal2.addWire(this);
};


YAHOO.lang.extend(WireIt.Wire, WireIt.CanvasElement, {
   
   /**
    * Build options object and set default properties
    * @method setOptions
    */
   setOptions: function(options) {
      /**
       * Wire styling, and properties:
       * <ul>
       *   <li>className: CSS class name of the canvas element (default 'WireIt-Wire')</li>
       *   <li>cap: default 'round'</li>
       *   <li>bordercap: default 'round'</li>
       *   <li>width: Wire width (default to 3)</li>
       *   <li>borderwidth: Border Width (default to 1)</li>
       *   <li>color: Wire color (default to rgb(173, 216, 230) )</li>
       *   <li>bordercolor: Border color (default to #0000ff )</li>
       * </ul>
       * @property options
       */
      this.options = {};
      this.options.className = options.className || 'WireIt-Wire';

      // Syling
      this.options.cap = options.cap || 'round';
      this.options.bordercap = options.bordercap || 'round';
      this.options.width = options.width || 3;
      this.options.borderwidth = options.borderwidth || 1;
      this.options.color = options.color || 'rgb(173, 216, 230)';
      this.options.bordercolor = options.bordercolor || '#0000ff';

		// Label
		this.options.label = options.label;
   },
   
   /**
    * Remove a Wire from the Dom
    * @method remove
    */
   remove: function() {
   
      // Remove the canvas from the dom
      this.parentEl.removeChild(this.element);
   
      // Remove the wire reference from the connected terminals
    	if(this.terminal1 && this.terminal1.removeWire) {
			this.terminal1.removeWire(this);
    	}
    	if(this.terminal2 && this.terminal2.removeWire) {
			this.terminal2.removeWire(this);
    	}

    	// Remove references to old terminals
    	this.terminal1 = null;
    	this.terminal2 = null;
   },


   /**
    * This function returns terminal1 if the first argument is terminal2 and vice-versa
    * @method getOtherTerminal
    * @param   {WireIt.Terminal} terminal    
    * @return  {WireIt.Terminal} terminal    the terminal that is NOT passed as argument
    */
   getOtherTerminal: function(terminal) {
      return (terminal == this.terminal1) ? this.terminal2 : this.terminal1;
   },
   
   
   
   /**
    * Drawing method
    */
   draw: function() {
      var margin = [4,4];

      // Get the positions of the terminals
      var p1 = this.terminal1.getXY();
      var p2 = this.terminal2.getXY();

      var min=[ Math.min(p1[0],p2[0])-margin[0], Math.min(p1[1],p2[1])-margin[1]];
      var max=[ Math.max(p1[0],p2[0])+margin[0], Math.max(p1[1],p2[1])+margin[1]];
      
      // Redimensionnement du canvas
      var lw=Math.abs(max[0]-min[0]);
      var lh=Math.abs(max[1]-min[1]);

      // Convert points in canvas coordinates
      p1[0] = p1[0]-min[0];
      p1[1] = p1[1]-min[1];
      p2[0] = p2[0]-min[0];
      p2[1] = p2[1]-min[1];

      this.SetCanvasRegion(min[0],min[1],lw,lh);

      var ctxt=this.getContext();
      
      // Draw the border
      ctxt.lineCap=this.options.bordercap;
      ctxt.strokeStyle=this.options.bordercolor;
      ctxt.lineWidth=this.options.width+this.options.borderwidth*2;
      ctxt.beginPath();
      ctxt.moveTo(p1[0],p1[1]);
      ctxt.lineTo(p2[0],p2[1]);
      ctxt.stroke();

      // Draw the inner bezier curve
      ctxt.lineCap=this.options.cap;
      ctxt.strokeStyle=this.options.color;
      ctxt.lineWidth=this.options.width;
      ctxt.beginPath();
      ctxt.moveTo(p1[0],p1[1]);
      ctxt.lineTo(p2[0],p2[1]);
      ctxt.stroke();
   },

   /**
    * Redraw the wire and label
    * @method redraw
    */
   redraw: function() {
				
      this.draw();

		if(this.options.label) {
			this.drawLabel();
		}
   },

	drawLabel: function(positions) {
		
		var p1 = positions[0];
		var p2 = positions[1];
		var t1 = positions[2];
		var t2 = positions[3];
		
		var winkel = 0;
		var distance = 15;
		
		var ctxt=this.getContext();
		ctxt.save();
		
		//1.Quadrant
      if ((p1[0]<p2[0])&&(p1[1]>p2[1])){
         winkel=Math.PI*1.5+winkel;
         ctxt.translate(t1[0],t1[1]);
      }
      //2. Quadrant
      else if ((p1[0]<p2[0])&&(p1[1]<p2[1])){
         winkel = Math.PI/2-winkel;
         ctxt.translate(t1[0],t1[1]);
      }
      //3. Quadrant
      else if ((p1[0]>p2[0])&&(p1[1]<p2[1])){
         //winkel = Math.PI/2+winkel;
        winkel = Math.PI*1.5+winkel;
        ctxt.translate(t2[0],t2[1]);
      }
      //4. Quadrant
      else if ((p1[0]>p2[0])&&(p1[1]>p2[1])){
         winkel=Math.PI*0.5-winkel;
         ctxt.translate(t2[0],t2[1]);
      }

       ctxt.rotate(winkel);

      ctxt.font = "14px Arial";
      ctxt.fillStyle = "Black";
      ctxt.translate((distance-(ctxt.measureText(this.options.label)).width)/2,0);
      ctxt.fillText(this.options.label, 0, 0);
      ctxt.restore();
	},
   
   /**
    * Determine if the wire is drawn at position (x,y) relative to the canvas element. This is used for mouse events.
    * @method wireDrawnAt
    * @return {Boolean} true if the wire is drawn at position (x,y) relative to the canvas element
    */
   wireDrawnAt: function(x,y) {
      var ctxt = this.getContext();
	   var imgData = ctxt.getImageData(x,y,1,1);
	   var pixel = imgData.data;
	   return !( pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0 && pixel[3] === 0 );
   },
   
   /**
    * Called by the Layer when the mouse moves over the canvas element.
    * Note: the event is not listened directly, to receive the event event if the wire is behind another wire
    * @method onMouseMove
    * @param {Integer} x left position of the mouse (relative to the canvas)
    * @param {Integer} y top position of the mouse (relative to the canvas)
    */
   onMouseMove: function(x,y) {
      
      if(typeof this.mouseInState === undefined) {
         this.mouseInState = false;
      }

	   if( this.wireDrawnAt(x,y) ) {
			if(!this.mouseInState) {
			   this.mouseInState=true;
			   this.onWireIn(x,y);
			}	
			
			this.onWireMove(x,y);
	   }
	   else {
	      if(this.mouseInState) {
	         this.mouseInState=false;
			   this.onWireOut(x,y);
	      }
	   }
      
   },
   
   /**
    * When the mouse moves over a wire
    * Note: this will only work within a layer
    * @method onWireMove
    * @param {Integer} x left position of the mouse (relative to the canvas)
    * @param {Integer} y top position of the mouse (relative to the canvas)
    */
   onWireMove: function(x,y) {
		this.eventMouseMove.fire(this, [x,y]);
   },
   
   /**
    * When the mouse comes into the wire
    * Note: this will only work within a layer
    * @method onWireIn
    * @param {Integer} x left position of the mouse (relative to the canvas)
    * @param {Integer} y top position of the mouse (relative to the canvas)
    */
   onWireIn: function(x,y) {
		this.eventMouseIn.fire(this, [x,y]);
   },
   
   /**
    * When the mouse comes out of the wire
    * Note: this will only work within a layer
    * @method onWireOut
    * @param {Integer} x left position of the mouse (relative to the canvas)
    * @param {Integer} y top position of the mouse (relative to the canvas)
    */
   onWireOut: function(x,y) {
		this.eventMouseOut.fire(this, [x,y]);
   },
   
   /**
    * When the mouse clicked on the canvas
    * Note: this will only work within a layer
    * @method onClick
    * @param {Integer} x left position of the mouse (relative to the canvas)
    * @param {Integer} y top position of the mouse (relative to the canvas)
    */
   onClick: function(x,y) {
		if( this.wireDrawnAt(x,y) ) {
			this.onWireClick(x,y);
      }
   },
   
   /**
    * When the mouse clicked on the wire
    * Note: this will only work within a layer
    * @method onWireClick
    * @param {Integer} x left position of the mouse (relative to the canvas)
    * @param {Integer} y top position of the mouse (relative to the canvas)
    */
   onWireClick: function(x,y) {
		this.eventMouseClick.fire(this, [x,y]);
   },


	/**
    * Return the config of this Wire
    * @method getConfig
    */
	getConfig: function() {
      var obj = {};

      // xtype
      if(this.options.xtype) {
         obj.xtype = this.options.xtype;
      }

      return obj;
   }


});

/**
 * The step wire widget
 * @class StepWire
 * @namespace WireIt
 * @extends WireIt.Wire
 * @constructor
 * @param  {WireIt.Terminal}    terminal1   Source terminal
 * @param  {WireIt.Terminal}    terminal2   Target terminal
 * @param  {HTMLElement} parentEl    Container of the CANVAS tag
 * @param  {Obj}                options      Wire configuration (see options property)
 */

WireIt.StepWire = function( terminal1, terminal2, parentEl, options) {
	WireIt.StepWire.superclass.constructor.call(this, terminal1, terminal2, parentEl, options);
};


YAHOO.lang.extend(WireIt.StepWire, WireIt.Wire, {
	
   /**
    * Drawing methods for arrows
    */
   draw: function() {
      var margin = [4,4];

      // Get the positions of the terminals
      var p1 = this.terminal1.getXY();
      var p2 = this.terminal2.getXY();

		
		//this.terminal1.options.direction[0]

      var min=[ Math.min(p1[0],p2[0])-margin[0], Math.min(p1[1],p2[1])-margin[1]];
      var max=[ Math.max(p1[0],p2[0])+margin[0], Math.max(p1[1],p2[1])+margin[1]];

      // Redimensionnement du canvas
      var lw=Math.abs(max[0]-min[0]);
      var lh=Math.abs(max[1]-min[1]);

      // Convert points in canvas coordinates
      p1[0] = p1[0]-min[0];
      p1[1] = p1[1]-min[1];
      p2[0] = p2[0]-min[0];
      p2[1] = p2[1]-min[1];

		var p3 = [ p2[0], p2[1] ];
		p2[1] = p1[1];

      this.SetCanvasRegion(min[0],min[1],lw,lh);

      var ctxt=this.getContext();

      // Draw the border
      ctxt.lineCap=this.options.bordercap;
      ctxt.strokeStyle=this.options.bordercolor;
      ctxt.lineWidth=this.options.width+this.options.borderwidth*2;
      ctxt.beginPath();
      ctxt.moveTo(p1[0],p1[1]);
      ctxt.lineTo(p2[0],p2[1]);

		ctxt.lineTo(p3[0],p3[1]);
		
      ctxt.stroke();

      // Draw the inner bezier curve
      ctxt.lineCap=this.options.cap;
      ctxt.strokeStyle=this.options.color;
      ctxt.lineWidth=this.options.width;
      ctxt.beginPath();

      ctxt.moveTo(p1[0],p1[1]);
      ctxt.lineTo(p2[0],p2[1]);

		ctxt.lineTo(p3[0],p3[1]);

      ctxt.stroke();
   }
	
});

/**
 * The arrow wire widget
 * @class ArrowWire
 * @namespace WireIt
 * @extends WireIt.Wire
 * @constructor
 * @param  {WireIt.Terminal}    terminal1   Source terminal
 * @param  {WireIt.Terminal}    terminal2   Target terminal
 * @param  {HTMLElement} parentEl    Container of the CANVAS tag
 * @param  {Obj}                options      Wire configuration (see options property)
 */

WireIt.ArrowWire = function( terminal1, terminal2, parentEl, options) {
	
	WireIt.ArrowWire.superclass.constructor.call(this, terminal1, terminal2, parentEl, options);
	
};


YAHOO.lang.extend(WireIt.ArrowWire, WireIt.Wire, {
	
   /**
    * Drawing methods for arrows
    */
   draw: function() {
		var d = 7; // arrow width/2
      var redim = d+3; //we have to make the canvas a little bigger because of arrows
      var margin=[4+redim,4+redim];

      // Get the positions of the terminals
      var p1 = this.terminal1.getXY();
      var p2 = this.terminal2.getXY();

      var distance=Math.sqrt(Math.pow(p1[0]-p2[0],2)+Math.pow(p1[1]-p2[1],2));

      var min=[ Math.min(p1[0],p2[0])-margin[0], Math.min(p1[1],p2[1])-margin[1]];
      var max=[ Math.max(p1[0],p2[0])+margin[0], Math.max(p1[1],p2[1])+margin[1]];
      
      // Redimensionnement du canvas
      
      var lw=Math.abs(max[0]-min[0])+redim;
      var lh=Math.abs(max[1]-min[1])+redim;

      p1[0]=p1[0]-min[0];
      p1[1]=p1[1]-min[1];
      p2[0]=p2[0]-min[0];
      p2[1]=p2[1]-min[1];

      this.SetCanvasRegion(min[0],min[1],lw,lh);

      var ctxt=this.getContext();
      
      // Draw the border
      ctxt.lineCap=this.options.bordercap;
      ctxt.strokeStyle=this.options.bordercolor;
      ctxt.lineWidth=this.options.width+this.options.borderwidth*2;
      ctxt.beginPath();
      ctxt.moveTo(p1[0],p1[1]);
      ctxt.lineTo(p2[0],p2[1]);
      ctxt.stroke();

      // Draw the inner bezier curve
      ctxt.lineCap=this.options.cap;
      ctxt.strokeStyle=this.options.color;
      ctxt.lineWidth=this.options.width;
      ctxt.beginPath();
      ctxt.moveTo(p1[0],p1[1]);
      ctxt.lineTo(p2[0],p2[1]);
      ctxt.stroke();

		/* start drawing arrows */
		var t1 = p1;
		var t2 = p2;

		var z = [0,0]; //point on the wire with constant distance (dlug) from terminal2
		var dlug = 20; //arrow length
		var t = (distance === 0) ? 0 : 1-(dlug/distance);
		z[0] = Math.abs( t1[0] +  t*(t2[0]-t1[0]) );
		z[1] = Math.abs( t1[1] + t*(t2[1]-t1[1]) );	

		//line which connects the terminals: y=ax+b
		var a,b;
		var W = t1[0] - t2[0];
		var Wa = t1[1] - t2[1];
		var Wb = t1[0]*t2[1] - t1[1]*t2[0];
		if (W !== 0) {
			a = Wa/W;
			b = Wb/W;
		}
		else {
			a = 0;
		}
		//line perpendicular to the main line: y = aProst*x + b
		var aProst, bProst;
		if (a === 0) {
			aProst = 0;
		}
		else {
			aProst = -1/a;
		}
		bProst = z[1] - aProst*z[0]; //point z lays on this line

		//we have to calculate coordinates of 2 points, which lay on perpendicular line and have the same distance (d) from point z
		var A = 1 + Math.pow(aProst,2);
		var B = 2*aProst*bProst - 2*z[0] - 2*z[1]*aProst;
		var C = -2*z[1]*bProst + Math.pow(z[0],2) + Math.pow(z[1],2) - Math.pow(d,2) + Math.pow(bProst,2);
		var delta = Math.pow(B,2) - 4*A*C;
		if (delta < 0) { return; }

		var x1 = (-B + Math.sqrt(delta)) / (2*A);
		var x2 = (-B - Math.sqrt(delta)) / (2*A);	 
		var y1 = aProst*x1 + bProst;
		var y2 = aProst*x2 + bProst;

		if(t1[1] == t2[1]) {
			var o = (t1[0] > t2[0]) ? 1 : -1;
			x1 = t2[0]+o*dlug;
			x2 = x1;
			y1 -= d;
			y2 += d;
		}

		//triangle fill
		ctxt.fillStyle = this.options.color;
		ctxt.beginPath();
		ctxt.moveTo(t2[0],t2[1]);
		ctxt.lineTo(x1,y1);
		ctxt.lineTo(x2,y2);
		ctxt.fill();

		//triangle border	
		ctxt.strokeStyle = this.options.bordercolor;
		ctxt.lineWidth = this.options.borderwidth;
		ctxt.beginPath();
		ctxt.moveTo(t2[0],t2[1]);
		ctxt.lineTo(x1,y1);
		ctxt.lineTo(x2,y2);
		ctxt.lineTo(t2[0],t2[1]);
		ctxt.stroke();
   }
	
	
	
});

/**
 * The bezier wire widget
 * @class BezierWire
 * @namespace WireIt
 * @extends WireIt.Wire
 * @constructor
 * @param  {WireIt.Terminal}    terminal1   Source terminal
 * @param  {WireIt.Terminal}    terminal2   Target terminal
 * @param  {HTMLElement} parentEl    Container of the CANVAS tag
 * @param  {Obj}                options      Wire configuration (see options property)
 */

WireIt.BezierWire = function( terminal1, terminal2, parentEl, options) {
	
	WireIt.BezierWire.superclass.constructor.call(this, terminal1, terminal2, parentEl, options);
	
};


YAHOO.lang.extend(WireIt.BezierWire, WireIt.Wire, {
	
	/**
	 * Override setOptions to add the following options :
	 * <ul>
	 * 	<li>coeffMulDirection: norm of the tangent vector at the terminals (default 100)</li>
	 * </ul>
	 */
	setOptions: function(options) {
		WireIt.BezierWire.superclass.setOptions.call(this, options);
		
		
		this.options.coeffMulDirection = YAHOO.lang.isUndefined(options.coeffMulDirection) ? 100 : options.coeffMulDirection;
	},
	
	
	/**
    * Redraw the Wire
    */
   draw: function() {
   
      // Get the positions of the terminals
      var p1 = this.terminal1.getXY();
      var p2 = this.terminal2.getXY();
      
      // Coefficient multiplicateur de direction
      // 100 par defaut, si distance(p1,p2) < 100, on passe en distance/2
      var coeffMulDirection = this.options.coeffMulDirection;
   
   
      var distance=Math.sqrt(Math.pow(p1[0]-p2[0],2)+Math.pow(p1[1]-p2[1],2));
      if(distance < coeffMulDirection){
         coeffMulDirection = distance/2;
      }
   
      // Calcul des vecteurs directeurs d1 et d2 :
      var d1 = [this.terminal1.options.direction[0]*coeffMulDirection,
                this.terminal1.options.direction[1]*coeffMulDirection];
      var d2 = [this.terminal2.options.direction[0]*coeffMulDirection,
                this.terminal2.options.direction[1]*coeffMulDirection];
   
      var bezierPoints=[];
      bezierPoints[0] = p1;
      bezierPoints[1] = [p1[0]+d1[0],p1[1]+d1[1]];
      bezierPoints[2] = [p2[0]+d2[0],p2[1]+d2[1]];
      bezierPoints[3] = p2;
      var min = [p1[0],p1[1]];
      var max = [p1[0],p1[1]];
      for(var i=1 ; i<bezierPoints.length ; i++){
         var p = bezierPoints[i];
         if(p[0] < min[0]){
            min[0] = p[0];
         }
         if(p[1] < min[1]){
            min[1] = p[1];
         }
         if(p[0] > max[0]){
            max[0] = p[0];
         }
         if(p[1] > max[1]){
            max[1] = p[1];
         }
      }
      // Redimensionnement du canvas
      var margin = [4,4];
      min[0] = min[0]-margin[0];
      min[1] = min[1]-margin[1];
      max[0] = max[0]+margin[0];
      max[1] = max[1]+margin[1];
      var lw = Math.abs(max[0]-min[0]);
      var lh = Math.abs(max[1]-min[1]);
   
      this.SetCanvasRegion(min[0],min[1],lw,lh);
   
      var ctxt = this.getContext();
      for(i = 0 ; i<bezierPoints.length ; i++){
         bezierPoints[i][0] = bezierPoints[i][0]-min[0];
         bezierPoints[i][1] = bezierPoints[i][1]-min[1];
      }
   
      // Draw the border
      ctxt.lineCap = this.options.bordercap;
      ctxt.strokeStyle = this.options.bordercolor;
      ctxt.lineWidth = this.options.width+this.options.borderwidth*2;
      ctxt.beginPath();
      ctxt.moveTo(bezierPoints[0][0],bezierPoints[0][1]);
      ctxt.bezierCurveTo(bezierPoints[1][0],bezierPoints[1][1],bezierPoints[2][0],bezierPoints[2][1],bezierPoints[3][0],bezierPoints[3][1]);
      ctxt.stroke();
   
      // Draw the inner bezier curve
      ctxt.lineCap = this.options.cap;
      ctxt.strokeStyle = this.options.color;
      ctxt.lineWidth = this.options.width;
      ctxt.beginPath();
      ctxt.moveTo(bezierPoints[0][0],bezierPoints[0][1]);
      ctxt.bezierCurveTo(bezierPoints[1][0],bezierPoints[1][1],bezierPoints[2][0],bezierPoints[2][1],bezierPoints[3][0],bezierPoints[3][1]);
      ctxt.stroke();
   }


	
});/**
 * The bezier wire widget
 * @class BezierArrowWire
 * @namespace WireIt
 * @extends WireIt.BezierWire
 * @constructor
 * @param  {WireIt.Terminal}    terminal1   Source terminal
 * @param  {WireIt.Terminal}    terminal2   Target terminal
 * @param  {HTMLElement} parentEl    Container of the CANVAS tag
 * @param  {Obj}                options      Wire configuration (see options property)
 */

WireIt.BezierArrowWire = function( terminal1, terminal2, parentEl, options) {
	WireIt.BezierArrowWire.superclass.constructor.call(this, terminal1, terminal2, parentEl, options);
};


YAHOO.lang.extend(WireIt.BezierArrowWire, WireIt.BezierWire, {

	/**
    * Attempted bezier drawing method for arrows
    */
   draw: function() {

		var arrowWidth = Math.round(this.options.width * 1.5 + 20);
		var arrowLength = Math.round(this.options.width * 1.2 + 20);
		var d = arrowWidth/2; // arrow width/2
      var redim = d+3; //we have to make the canvas a little bigger because of arrows
      var margin=[4+redim,4+redim];

      // Get the positions of the terminals
      var p1 = this.terminal1.getXY();
      var p2 = this.terminal2.getXY();

      // Coefficient multiplicateur de direction
      // 100 par defaut, si distance(p1,p2) < 100, on passe en distance/2
      var coeffMulDirection = this.options.coeffMulDirection;


      var distance=Math.sqrt(Math.pow(p1[0]-p2[0],2)+Math.pow(p1[1]-p2[1],2));
      if(distance < coeffMulDirection){
         coeffMulDirection = distance/2;
      }

      // Calcul des vecteurs directeurs d1 et d2 :
      var d1 = [this.terminal1.options.direction[0]*coeffMulDirection,
                this.terminal1.options.direction[1]*coeffMulDirection];
      var d2 = [this.terminal2.options.direction[0]*coeffMulDirection,
                this.terminal2.options.direction[1]*coeffMulDirection];

      var bezierPoints=[];
      bezierPoints[0] = p1;
      bezierPoints[1] = [p1[0]+d1[0],p1[1]+d1[1]];
      bezierPoints[2] = [p2[0]+d2[0],p2[1]+d2[1]];
      bezierPoints[3] = p2;
      var min = [p1[0],p1[1]];
      var max = [p1[0],p1[1]];
      for(var i=1 ; i<bezierPoints.length ; i++){
         var p = bezierPoints[i];
         if(p[0] < min[0]){
            min[0] = p[0];
         }
         if(p[1] < min[1]){
            min[1] = p[1];
         }
         if(p[0] > max[0]){
            max[0] = p[0];
         }
         if(p[1] > max[1]){
            max[1] = p[1];
         }
      }
      // Redimensionnement du canvas
      //var margin = [4,4];
      min[0] = min[0]-margin[0];
      min[1] = min[1]-margin[1];
      max[0] = max[0]+margin[0];
      max[1] = max[1]+margin[1];
      var lw = Math.abs(max[0]-min[0]);
      var lh = Math.abs(max[1]-min[1]);

      this.SetCanvasRegion(min[0],min[1],lw,lh);

      var ctxt = this.getContext();
      for(i = 0 ; i<bezierPoints.length ; i++){
         bezierPoints[i][0] = bezierPoints[i][0]-min[0];
         bezierPoints[i][1] = bezierPoints[i][1]-min[1];
      }

      // Draw the border
      ctxt.lineCap = this.options.bordercap;
      ctxt.strokeStyle = this.options.bordercolor;
      ctxt.lineWidth = this.options.width+this.options.borderwidth*2;
      ctxt.beginPath();
      ctxt.moveTo(bezierPoints[0][0],bezierPoints[0][1]);
      ctxt.bezierCurveTo(bezierPoints[1][0],bezierPoints[1][1],bezierPoints[2][0],bezierPoints[2][1],bezierPoints[3][0],bezierPoints[3][1]+arrowLength/2*this.terminal2.options.direction[1]);
      ctxt.stroke();

      // Draw the inner bezier curve
      ctxt.lineCap = this.options.cap;
      ctxt.strokeStyle = this.options.color;
      ctxt.lineWidth = this.options.width;
      ctxt.beginPath();
      ctxt.moveTo(bezierPoints[0][0],bezierPoints[0][1]);
      ctxt.bezierCurveTo(bezierPoints[1][0],bezierPoints[1][1],bezierPoints[2][0],bezierPoints[2][1],bezierPoints[3][0],bezierPoints[3][1]+arrowLength/2*this.terminal2.options.direction[1]);
      ctxt.stroke();

		//Variables from drawArrows
		//var t1 = p1;
		var t1 = bezierPoints[2],t2 = p2;

		var z = [0,0]; //point on the wire with constant distance (dlug) from terminal2
		var dlug = arrowLength; //arrow length
		var t = 1-(dlug/distance);
		z[0] = Math.abs( t1[0] +  t*(t2[0]-t1[0]) );
		z[1] = Math.abs( t1[1] + t*(t2[1]-t1[1]) );	

		// line which connects the terminals: y=ax+b
		var a,b;
		var W = t1[0] - t2[0];
		var Wa = t1[1] - t2[1];
		var Wb = t1[0]*t2[1] - t1[1]*t2[0];
		if (W !== 0) {
			a = Wa/W;
			b = Wb/W;
		}
		else {
			a = 0;
		}
		//line perpendicular to the main line: y = aProst*x + b
		var aProst, bProst;
		if (a === 0) {
			aProst = 0;
		}
		else {
			aProst = -1/a;
		}
		bProst = z[1] - aProst*z[0]; //point z lays on this line

		//we have to calculate coordinates of 2 points, which lay on perpendicular line and have the same distance (d) from point z
		var A = 1 + Math.pow(aProst,2),
			 B = 2*aProst*bProst - 2*z[0] - 2*z[1]*aProst,
			 C = -2*z[1]*bProst + Math.pow(z[0],2) + Math.pow(z[1],2) - Math.pow(d,2) + Math.pow(bProst,2),
			 delta = Math.pow(B,2) - 4*A*C;
			
		if (delta < 0) { return false; }
	   
		var x1 = (-B + Math.sqrt(delta)) / (2*A),
			x2 = (-B - Math.sqrt(delta)) / (2*A),
			y1 = aProst*x1 + bProst,
			y2 = aProst*x2 + bProst;

		if(t1[1] == t2[1]) {
			var o = (t1[0] > t2[0]) ? 1 : -1;
			x1 = t2[0]+o*dlug;
			x2 = x1;
			y1 -= d;
			y2 += d;
		}

		// triangle fill
		ctxt.fillStyle = this.options.color;
		ctxt.beginPath();
		ctxt.moveTo(t2[0],t2[1]);
		ctxt.lineTo(x1,y1);
		ctxt.lineTo(x2,y2);
		ctxt.fill();

		// triangle border	
		ctxt.strokeStyle = this.options.bordercolor;
		ctxt.lineWidth = this.options.borderwidth;
		ctxt.beginPath();
		ctxt.moveTo(t2[0],t2[1]);
		ctxt.lineTo(x1,y1);
		ctxt.lineTo(x2,y2);
		ctxt.lineTo(t2[0],t2[1]);
		ctxt.stroke();
		
		return [p1,p2,t1,t2];
   }
	
});/*global YAHOO,window */
(function() {

   var util = YAHOO.util;
   var lang = YAHOO.lang, CSS_PREFIX = "WireIt-";

/**
 * This class is used for wire edition. It inherits from YAHOO.util.DDProxy and acts as a "temporary" Terminal.
 * @class TerminalProxy
 * @namespace WireIt
 * @extends YAHOO.util.DDProxy
 * @constructor
 * @param {WireIt.Terminal} terminal Parent terminal
 * @param {Object} options Configuration object (see "termConfig" property for details)
 */
WireIt.TerminalProxy = function(terminal, options) {

	/**
	 * Reference to the terminal parent
	 */
	this.terminal = terminal;

	/**
	 * Object containing the configuration object
	 * <ul>
	 *   <li>type: 'type' of this terminal. If no "allowedTypes" is specified in the options, the terminal will only connect to the same type of terminal</li>
	 *   <li>allowedTypes: list of all the allowed types that we can connect to.</li>
	 *   <li>{Integer} terminalProxySize: size of the drag drop proxy element. default is 10 for "10px"</li>
	 * </ul>
	 * @property termConfig
	 */
	// WARNING: the object config cannot be called "config" because YAHOO.util.DDProxy already has a "config" property
	this.termConfig = options || {};

	this.terminalProxySize = options.terminalProxySize || 10;

	/**
	 * Object that emulate a terminal which is following the mouse
	 */
	this.fakeTerminal = null;

	// Init the DDProxy
	WireIt.TerminalProxy.superclass.constructor.call(this,this.terminal.el, undefined, {
	   dragElId: "WireIt-TerminalProxy",
	   resizeFrame: false,
	   centerFrame: true
	});
	
};

// Mode Intersect to get the DD objects
util.DDM.mode = util.DDM.INTERSECT;

lang.extend(WireIt.TerminalProxy, YAHOO.util.DDProxy, {

	/**
	 * Took this method from the YAHOO.util.DDProxy class
	 * to overwrite the creation of the proxy Element with our custom size
	 * @method createFrame
	 */
	createFrame: function() {
	     var self=this, body=document.body;
	     if (!body || !body.firstChild) {
	         window.setTimeout( function() { self.createFrame(); }, 50 );
	         return;
	     }
	     var div=this.getDragEl(), Dom=YAHOO.util.Dom;
	     if (!div) {
	         div    = document.createElement("div");
	         div.id = this.dragElId;
	         var s  = div.style;
	         s.position   = "absolute";
	         s.visibility = "hidden";
	         s.cursor     = "move";
	         s.border     = "2px solid #aaa";
	         s.zIndex     = 999;
	         var size = this.terminalProxySize+"px";
	         s.height     = size; 
	         s.width      = size;
	         var _data = document.createElement('div');
	         Dom.setStyle(_data, 'height', '100%');
	         Dom.setStyle(_data, 'width', '100%');
	         Dom.setStyle(_data, 'background-color', '#ccc');
	         Dom.setStyle(_data, 'opacity', '0');
	         div.appendChild(_data);
	         body.insertBefore(div, body.firstChild);
	     }
	 },

	/**
	 * @method startDrag
	 */
	startDrag: function() {
   
	   // If only one wire admitted, we remove the previous wire
	   if(this.terminal.options.nMaxWires == 1 && this.terminal.wires.length == 1) {
	      this.terminal.wires[0].remove();
	   }
	   // If the number of wires is at its maximum, prevent editing...
	   else if(this.terminal.wires.length >= this.terminal.options.nMaxWires) {
	      return;
	   }
   
	   var halfProxySize = this.terminalProxySize/2;
	   this.fakeTerminal = {
	      options: {direction: this.terminal.options.fakeDirection},
	      pos: [200,200], 
	      addWire: function() {},
	      removeWire: function() {},
	      getXY: function() { 
	         var layers = YAHOO.util.Dom.getElementsByClassName('WireIt-Layer');
	         if(layers.length > 0) {
	            var orig = YAHOO.util.Dom.getXY(layers[0]);
	            return [this.pos[0]-orig[0]+halfProxySize, this.pos[1]-orig[1]+halfProxySize]; 
	         }
	         return this.pos;
	      }
	   };
   
	   var parentEl = this.terminal.parentEl.parentNode;
	   if(this.terminal.container) {
	      parentEl = this.terminal.container.layer.el;
	   }
	
		var klass = WireIt.wireClassFromXtype(this.terminal.options.editingWireConfig.xtype);
		
	   this.editingWire = new klass(this.terminal, this.fakeTerminal, parentEl, this.terminal.options.editingWireConfig);
	   YAHOO.util.Dom.addClass(this.editingWire.element, CSS_PREFIX+'Wire-editing');
	},

	/**
	 * @method onDrag
	 */
	onDrag: function(e) {
   
	   // Prevention when the editing wire could not be created (due to nMaxWires)
	   if(!this.editingWire) { return; }
   
	   if(this.terminal.container) {
	      var obj = this.terminal.container.layer.el;
	      var curleft = 0, curtop = 0;
			if (obj.offsetParent) {
				do {
					curleft += obj.offsetLeft;
					curtop += obj.offsetTop;
					obj = obj.offsetParent ;
					} while ( (obj = obj.offsetParent) );
				}
				this.fakeTerminal.pos = [e.clientX-curleft+this.terminal.container.layer.el.scrollLeft,
												e.clientY-curtop+this.terminal.container.layer.el.scrollTop];
	   }
	   else {
	      this.fakeTerminal.pos = (YAHOO.env.ua.ie) ? [e.clientX, e.clientY] : [e.clientX+window.pageXOffset, e.clientY+window.pageYOffset];
	      //this.fakeTerminal.pos = [e.clientX, e.clientY];
	   }
	   this.editingWire.redraw();
	},


	/**
	 * @method endDrag
	 */
	endDrag: function(e) {
	   if(this.editingWire) {
	      this.editingWire.remove();
	      this.editingWire = null;
	   }
	},

	/**
	 * @method onDragEnter
	 */
	onDragEnter: function(e,ddTargets) {
   
	   // Prevention when the editing wire could not be created (due to nMaxWires)
	   if(!this.editingWire) { return; }
   
	   for(var i = 0 ; i < ddTargets.length ; i++) {
	      if( this.isValidWireTerminal(ddTargets[i]) ) {
	         ddTargets[i].terminal.setDropInvitation(true);
	      }
	   }
	},

	/**
	 * @method onDragOut
	 */
	onDragOut: function(e,ddTargets) { 
   
	   // Prevention when the editing wire could not be created (due to nMaxWires)
	   if(!this.editingWire) { return; }
   
	   for(var i = 0 ; i < ddTargets.length ; i++) {
	      if( this.isValidWireTerminal(ddTargets[i]) ) {
	         ddTargets[i].terminal.setDropInvitation(false);
	      }
	   }
	},

	/**
	 * @method onDragDrop
	 */
	onDragDrop: function(e,ddTargets) {

		var i;

	   // Prevention when the editing wire could not be created (due to nMaxWires)
	   if(!this.editingWire) { return; }
   
	   this.onDragOut(e,ddTargets);
   
	   // Connect to the FIRST target terminal
	   var targetTerminalProxy = null;
	   for(i = 0 ; i < ddTargets.length ; i++) {
	      if( this.isValidWireTerminal(ddTargets[i]) ) {
	         targetTerminalProxy =  ddTargets[i];
	         break;
	      }
	   }

	   // Quit if no valid terminal found
	   if( !targetTerminalProxy ) { 
	      return;
	   }
   
	   // Remove the editing wire
	   this.editingWire.remove();
	   this.editingWire = null;
      
	   // Don't create the wire if it already exists between the 2 terminals !!
	   var termAlreadyConnected = false;
	   for(i = 0 ; i < this.terminal.wires.length ; i++) {
	      if(this.terminal.wires[i].terminal1 == this.terminal) {
	         if( this.terminal.wires[i].terminal2 == targetTerminalProxy.terminal) {
	            termAlreadyConnected = true;
	            break;
	         }
	      }
	      else if(this.terminal.wires[i].terminal2 == this.terminal) {
	         if( this.terminal.wires[i].terminal1 == targetTerminalProxy.terminal) {
	            termAlreadyConnected = true;
	            break;
	         }
	      }
	   }
   
	   // Create the wire only if the terminals aren't connected yet
	   if(termAlreadyConnected) {
	      //console.log("terminals already connected ");
	      return;
	   }
      
	   var parentEl = this.terminal.parentEl.parentNode;
	   if(this.terminal.container) {
	      parentEl = this.terminal.container.layer.el;
	   }
   
	   // Switch the order of the terminals if tgt as the "alwaysSrc" property
	   var term1 = this.terminal;
	   var term2 = targetTerminalProxy.terminal;
	   if(term2.options.alwaysSrc) {
	      term1 = targetTerminalProxy.terminal;
	      term2 = this.terminal;
	   }
	
		var klass = WireIt.wireClassFromXtype(term1.options.wireConfig.xtype);
   
	   // Check the number of wires for this terminal
	   var tgtTerm = targetTerminalProxy.terminal, w;
	   if( tgtTerm.options.nMaxWires == 1) {
	      if(tgtTerm.wires.length > 0) {
	         tgtTerm.wires[0].remove();
	      }
	
	      w = new klass(term1, term2, parentEl, term1.options.wireConfig);
	      w.redraw();
	   }
	   else if(tgtTerm.wires.length < tgtTerm.options.nMaxWires) {
	      w = new klass(term1, term2, parentEl, term1.options.wireConfig);
	      w.redraw();
	   }
	   /*else {
	      console.log("Cannot connect to this terminal: nMaxWires = ", ddTargets[0].terminal.options.nMaxWires);
	   }*/
   
	},


	// to distinct from other YAHOO.util.DragDrop objects
	isWireItTerminal: true,


	/**
	 * @method isValidWireTerminal
	 */
	isValidWireTerminal: function(DDterminal) {
   
	   if( !DDterminal.isWireItTerminal ) {
	      return false;
	   }
   
	   // If this terminal has the type property:
	   if(this.termConfig.type) {
	      if(this.termConfig.allowedTypes) {
	         if( WireIt.indexOf(DDterminal.termConfig.type, this.termConfig.allowedTypes) == -1 ) {
	            return false;
	         }
	      }
	      else {
	         if(this.termConfig.type != DDterminal.termConfig.type) {
	            return false;
	         }
	      }
	   }
	   // The other terminal may have type property too:
	   else if(DDterminal.termConfig.type) {
	      if(DDterminal.termConfig.allowedTypes) {
	         if( WireIt.indexOf(this.termConfig.type, DDterminal.termConfig.allowedTypes) == -1 ) {
	            return false;
	         }
	      }
	      else {
	         if(this.termConfig.type != DDterminal.termConfig.type) {
	            return false;
	         }
	      }
	   }
   
	   // Check the allowSelfWiring
	   if(this.terminal.container) {
	      if(this.terminal.container.options.preventSelfWiring) {
	         if(DDterminal.terminal.container == this.terminal.container) {
	            return false;
	         }
	      }
	   }
   
	   return true;
	}

});

})();/*global YAHOO */
(function() {

   var util = YAHOO.util;
	var Event = util.Event, lang = YAHOO.lang, CSS_PREFIX = "WireIt-";

/**
 * Scissors widget to cut wires
 * @class Scissors
 * @namespace WireIt
 * @extends YAHOO.util.Element
 * @constructor
 * @param {WireIt.Terminal} terminal Associated terminal
 * @param {Object} oConfigs 
 */
WireIt.Scissors = function(terminal, oConfigs) {
   WireIt.Scissors.superclass.constructor.call(this, document.createElement('div'), oConfigs);

   /**
    * The terminal it is associated to
    * @property _terminal
    * @type {WireIt.Terminal}
    */
   this._terminal = terminal;
   
   this.initScissors();
};

WireIt.Scissors.visibleInstance = null;

lang.extend(WireIt.Scissors, YAHOO.util.Element, {
   
   /**
    * Init the scissors
    * @method initScissors
    */
   initScissors: function() {
      
      // Display the cut button
      this.hideNow();
      this.addClass(CSS_PREFIX+"Wire-scissors");
      
      // The scissors are within the terminal element
      this.appendTo(this._terminal.container ? this._terminal.container.layer.el : this._terminal.el.parentNode.parentNode);

      // Ajoute un listener sur le scissor:
      this.on("mouseover", this.show, this, true);
      this.on("mouseout", this.hide, this, true);
      this.on("click", this.scissorClick, this, true);
      
      // On mouseover/mouseout to display/hide the scissors
      Event.addListener(this._terminal.el, "mouseover", this.mouseOver, this, true);
      Event.addListener(this._terminal.el, "mouseout", this.hide, this, true);
   },
   
   /**
    * @method setPosition
    */
   setPosition: function() {
      var pos = this._terminal.getXY();
      this.setStyle("left", (pos[0]+this._terminal.options.direction[0]*30-8)+"px");
      this.setStyle("top", (pos[1]+this._terminal.options.direction[1]*30-8)+"px");
   },
   /**
    * @method mouseOver
    */
   mouseOver: function() {
      if(this._terminal.wires.length > 0)  {
         this.show();
      }
   },

   /**
    * @method scissorClick
    */
   scissorClick: function() {
      this._terminal.removeAllWires();
      if(this.terminalTimeout) { this.terminalTimeout.cancel(); }
      this.hideNow();
   },   
   /**
    * @method show
    */
   show: function() {
      this.setPosition();
      this.setStyle('display','');
		
		if(WireIt.Scissors.visibleInstance && WireIt.Scissors.visibleInstance != this) {
			if(WireIt.Scissors.visibleInstance.terminalTimeout) { WireIt.Scissors.visibleInstance.terminalTimeout.cancel(); }
			WireIt.Scissors.visibleInstance.hideNow(); 
		}
		WireIt.Scissors.visibleInstance = this;
		
      if(this.terminalTimeout) { this.terminalTimeout.cancel(); }
   },
   /**
    * @method hide
    */
   hide: function() {
      this.terminalTimeout = YAHOO.lang.later(700,this,this.hideNow);
   },
   /**
    * @method hideNow
    */
   hideNow: function() {
		WireIt.Scissors.visibleInstance = null;
      this.setStyle('display','none');
   }

});

})();/*global YAHOO */
(function() {

   var util = YAHOO.util;
   var Event = util.Event, lang = YAHOO.lang, Dom = util.Dom, CSS_PREFIX = "WireIt-";

/**
 * Terminals represent the end points of the "wires"
 * @class Terminal
 * @constructor
 * @param {HTMLElement} parentEl Element that will contain the terminal
 * @param {Object} options Configuration object
 * @param {WireIt.Container} container (Optional) Container containing this terminal
 */
WireIt.Terminal = function(parentEl, options, container) {
   
   /**
    * DOM parent element
    * @property parentEl
    * @type {HTMLElement}
    */
   this.parentEl = parentEl;
   
   /**
    * Container (optional). Parent container of this terminal
    * @property container
    * @type {WireIt.Container}
    */
   this.container = container;
   
   /**
    * List of the associated wires
    * @property wires
    * @type {Array}
    */
    this.wires = [];
   
   
   this.setOptions(options);
   
   /**
    * Event that is fired when a wire is added
    * You can register this event with myTerminal.eventAddWire.subscribe(function(e,params) { var wire=params[0];}, scope);
    * @event eventAddWire
    */
   this.eventAddWire = new util.CustomEvent("eventAddWire");
   
   /**
    * Event that is fired when a wire is removed
    * You can register this event with myTerminal.eventRemoveWire.subscribe(function(e,params) { var wire=params[0];}, scope);
    * @event eventRemoveWire
    */
   this.eventRemoveWire = new util.CustomEvent("eventRemoveWire");
   
   /**
    * DIV dom element that will display the Terminal
    * @property el
    * @type {HTMLElement}
    */
   this.el = null;
   
   
   this.render();
   
   // Create the TerminalProxy object to make the terminal editable
   if(this.options.editable) {
      this.dd = new WireIt.TerminalProxy(this, this.options.ddConfig);
      this.scissors = new WireIt.Scissors(this);
   }
};

WireIt.Terminal.prototype = {
   
   /**
    * @method setOptions
    * @param {Object} options
    */
   setOptions: function(options) {
      
      /**
       * <p>Object that contains the terminal configuration:</p>
       * 
       * <ul>
       *   <li><b>name</b>: terminal name</li>
       *   <li><b>direction</b>: direction vector of the wires when connected to this terminal (default [0,1])</li>
       *   <li><b>fakeDirection</b>: direction vector of the "editing" wire when it started from this terminal (default to -direction)</li>
       *   <li><b>editable</b>: boolean that makes the terminal editable (default to true)</li>
       *   <li><b>nMaxWires</b>: maximum number of wires for this terminal (default to Infinity)</li>
       *   <li><b>offsetPosition</b>: offset position from the parentEl position. Can be an array [top,left] or an object {left: 100, bottom: 20} or {right: 10, top: 5} etc... (default to [0,0])</li>
       *   <li><b>ddConfig</b>: configuration of the WireIt.TerminalProxy object (only if editable)</li>
       *   <li><b>alwaysSrc</b>: alwaysSrc forces this terminal to be the src terminal in the wire config (default false, only if editable)</li>
       *   <li><b>className</b>: CSS class name of the terminal (default to "WireIt-Terminal")</li>
       *   <li><b>connectedClassName</b>: CSS class added to the terminal when it is connected (default to "WireIt-Terminal-connected")</li>
       *   <li><b>dropinviteClassName</b>: CSS class added for drop invitation (default to "WireIt-Terminal-dropinvite")</li>
       * </ul>
       * @property options
       */  
      this.options = {};
      this.options.name = options.name;
      this.options.direction = options.direction || [0,1];
      this.options.fakeDirection = options.fakeDirection || [-this.options.direction[0],-this.options.direction[1]];
      this.options.className = options.className || CSS_PREFIX+'Terminal';
      this.options.connectedClassName = options.connectedClassName || CSS_PREFIX+'Terminal-connected';
      this.options.dropinviteClassName = options.dropinviteClassName || CSS_PREFIX+'Terminal-dropinvite';
      this.options.editable = lang.isUndefined(options.editable) ? true : options.editable;
      this.options.nMaxWires = options.nMaxWires || Infinity;
      this.options.wireConfig = options.wireConfig || {};
      this.options.editingWireConfig = options.editingWireConfig || this.options.wireConfig;
      this.options.offsetPosition = options.offsetPosition;
      this.options.alwaysSrc = lang.isUndefined(options.alwaysSrc) ? false : options.alwaysSrc;
      this.options.ddConfig = options.ddConfig || {};
   },

   /**
    * Show or hide the drop invitation. (by adding/removing this.options.dropinviteClassName CSS class)
    * @method setDropInvitation
    * @param {Boolean} display Show the invitation if true, hide it otherwise
    */
   setDropInvitation: function(display) {
      if(display) {
         Dom.addClass(this.el, this.options.dropinviteClassName);
      }
      else {
         Dom.removeClass(this.el, this.options.dropinviteClassName);
      }
   },

   /**
    * Render the DOM of the terminal
    * @method render
    */
   render: function() {
   
      // Create the DIV element
      this.el = WireIt.cn('div', {className: this.options.className} );
      if(this.options.name) { this.el.title = this.options.name; }

      // Set the offset position
      this.setPosition(this.options.offsetPosition);
   
      // Append the element to the parent
      this.parentEl.appendChild(this.el);
   },

	/**
	 * TODO
	 */
   setPosition: function(pos) {
		if(pos) {
			// Clear the current position
			this.el.style.left = "";
			this.el.style.top = "";
			this.el.style.right = "";
			this.el.style.bottom = "";
	    
			// Kept old version [x,y] for retro-compatibility
			if( lang.isArray(pos) ) {
				this.el.style.left = pos[0]+"px";
				this.el.style.top = pos[1]+"px";
			}
			// New version: {top: 32, left: 23}
			else if( lang.isObject(pos) ) {
				for(var key in pos) {
					if(pos.hasOwnProperty(key) && pos[key] !== ""){ //This will ignore the number 0 since 0 == "" in javascript (firefox 3.0
						this.el.style[key] = pos[key]+"px";
					}
				}
			}
		}
	},
    
   /**
    * Add a wire to this terminal.
    * @method addWire
    * @param {WireIt.Wire} wire Wire instance to add
    */
   addWire: function(wire) {
   
      // Adds this wire to the list of connected wires :
      this.wires.push(wire);
   
      // Set class indicating that the wire is connected
      Dom.addClass(this.el, this.options.connectedClassName);
   
      // Fire the event
      this.eventAddWire.fire(wire);
   },

   /**
    * Remove a wire
    * @method removeWire
    * @param {WireIt.Wire} wire Wire instance to remove
    */
   removeWire: function(wire) {
      var index = WireIt.indexOf(wire, this.wires); 
      if( index != -1 ) {
         
         this.wires[index].destroy();
         
         this.wires[index] = null;
         this.wires = WireIt.compact(this.wires);
      
         // Remove the connected class if it has no more wires:
         if(this.wires.length === 0) {
            Dom.removeClass(this.el, this.options.connectedClassName);
         }
      
         // Fire the event
         this.eventRemoveWire.fire(wire);
      }
   },

   /**
    * This function is a temporary test. I added the border width while traversing the DOM and
    * I calculated the offset to center the wire in the terminal just after its creation
    * @method getXY
    */
   getXY: function() {
   
      var layerEl = this.container && this.container.layer ? this.container.layer.el : document.body;

      var obj = this.el;
		var curleft = 0, curtop = 0;
		if (obj.offsetParent) {
			do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
				obj = obj.offsetParent;
			} while ( !!obj && obj != layerEl);
		}

		return [curleft+15,curtop+15];
   },

   /**
    * Remove the terminal from the DOM
    * @method remove
    */
   remove: function() {
      // This isn't very nice but...
      // the method Wire.remove calls Terminal.removeWire to remove the reference
      while(this.wires.length > 0) {
         this.wires[0].remove();
      }
      this.parentEl.removeChild(this.el);
      
      // Remove all event listeners
      Event.purgeElement(this.el);
      
      // Remove scissors widget
      if(this.scissors) {
         Event.purgeElement(this.scissors.get('element'));
      }
      
   },

   /**
    * Returns a list of all the terminals connecter to this terminal through its wires.
    * @method getConnectedTerminals
    * @return  {Array}  List of all connected terminals
    */
   getConnectedTerminals: function() {
      var terminalList = [];
      if(this.wires) {
         for(var i = 0 ; i < this.wires.length ; i++) {
            terminalList.push(this.wires[i].getOtherTerminal(this));
         }
      }
      return terminalList;
   },

   /**
    * Redraw all the wires connected to this terminal
    * @method redrawAllWires
    */
   redrawAllWires: function() {
      if(this.wires) {
         for(var i = 0 ; i < this.wires.length ; i++) {
            this.wires[i].redraw();
         }
      }
   },
   
   /** 
    * Remove all wires
    * @method removeAllWires
    */
   removeAllWires: function() {
      while(this.wires.length > 0) {
         this.wires[0].remove();
      }
   }

};

})();/*global YAHOO */
/**
 * Class that extends Terminal to differenciate Input/Output terminals
 * @class WireIt.util.TerminalInput
 * @extends WireIt.Terminal
 * @constructor
 * @param {HTMLElement} parentEl Parent dom element
 * @param {Object} options configuration object
 * @param {WireIt.Container} container (Optional) Container containing this terminal
 */
WireIt.util.TerminalInput = function(parentEl, options, container) {
   WireIt.util.TerminalInput.superclass.constructor.call(this,parentEl, options, container);
};
YAHOO.lang.extend(WireIt.util.TerminalInput, WireIt.Terminal, {
   
   /**
    * Override setOptions to add the default options for TerminalInput
    * @method setOptions
    */
   setOptions: function(options) {
      
      WireIt.util.TerminalInput.superclass.setOptions.call(this,options);
      
      this.options.direction = options.direction || [0,-1];
      this.options.fakeDirection = options.fakeDirection || [0,1];
      this.options.ddConfig = {
         type: "input",
         allowedTypes: ["output"]
      };
      this.options.nMaxWires = options.nMaxWires || 1;
   }
   
});/*global YAHOO */
/**
 * Class that extends Terminal to differenciate Input/Output terminals
 * @class WireIt.util.TerminalOutput
 * @extends WireIt.Terminal
 * @constructor
 * @param {HTMLElement} parentEl Parent dom element
 * @param {Object} options configuration object
 * @param {WireIt.Container} container (Optional) Container containing this terminal
 */
WireIt.util.TerminalOutput = function(parentEl, options, container) {
   WireIt.util.TerminalOutput.superclass.constructor.call(this,parentEl, options, container);
};
YAHOO.lang.extend(WireIt.util.TerminalOutput, WireIt.Terminal, {
   
   /**
    * Override setOptions to add the default options for TerminalOutput
    * @method setOptions
    */
   setOptions: function(options) {
      
      WireIt.util.TerminalOutput.superclass.setOptions.call(this,options);
      
      this.options.direction = options.direction || [0,1];
      this.options.fakeDirection = options.fakeDirection || [0,-1];
      this.options.ddConfig = {
         type: "output",
         allowedTypes: ["input"]
      };
      this.options.alwaysSrc = true;
   }
   
});/*global YAHOO,WireIt */
/**
 * WireIt.util.DD is a wrapper class for YAHOO.util.DD, to redraw the wires associated with the given terminals while drag-dropping
 * @class DD
 * @namespace WireIt.util
 * @extends YAHOO.util.DD
 * @constructor
 * @param {Array} terminals List of WireIt.Terminal objects associated within the DragDrop element
 * @param {String} id Parameter of YAHOO.util.DD
 * @param {String} sGroup Parameter of YAHOO.util.DD
 * @param {Object} config Parameter of YAHOO.util.DD
 */
WireIt.util.DD = function( terminals, id, sGroup, config) {
   if(!terminals) {
      throw new Error("WireIt.util.DD needs at least terminals and id");
   }
   /**
    * List of the contained terminals
    * @property _WireItTerminals
    * @type {Array}
    */
   this._WireItTerminals = terminals;
   
   WireIt.util.DD.superclass.constructor.call(this, id, sGroup, config);
};

YAHOO.extend(WireIt.util.DD, YAHOO.util.DD, {

   /**
    * Override YAHOO.util.DD.prototype.onDrag to redraw the wires
    * @method onDrag
    */
   onDrag: function(e) {
      // Make sure terminalList is an array
      var terminalList = YAHOO.lang.isArray(this._WireItTerminals) ? this._WireItTerminals : (this._WireItTerminals.isWireItTerminal ? [this._WireItTerminals] : []);
      // Redraw all the wires
      for(var i = 0 ; i < terminalList.length ; i++) {
         if(terminalList[i].wires) {
            for(var k = 0 ; k < terminalList[i].wires.length ; k++) {
               terminalList[i].wires[k].redraw();
            }
         }
      }
   },

   /**
    * In case you change the terminals since you created the WireIt.util.DD:
    * @method setTerminals
    */
   setTerminals: function(terminals) {
      this._WireItTerminals = terminals;
   }
   
});
/*global YAHOO,WireIt */
/**
 * Make a container resizable
 * @class DDResize
 * @namespace WireIt.util
 * @extends YAHOO.util.DragDrop
 * @constructor
 * @param {WireIt.Container} container The container that is to be resizable
 * @param {Object} config Configuration object
 */
WireIt.util.DDResize = function(container, config) {
   
   /**
    * Configuration object
    * <ul>
    *   <li>minWidth: minimum width (default 50)</li>
    *   <li>minHeight: minimum height (default 50)</li>
    * </ul>
    * @property myConf
    */
   // WARNING: the object config cannot be called "config" because YAHOO.util.DragDrop already has a "config" property
   this.myConf = config || {};
   this.myConf.container = container;
   this.myConf.minWidth = this.myConf.minWidth || 50;
   this.myConf.minHeight = this.myConf.minHeight || 50;
   
   // Call the superconstructor
   WireIt.util.DDResize.superclass.constructor.apply(this, [container.el, container.ddResizeHandle]);
   
   // Set the resize handle
   this.setHandleElId(container.ddResizeHandle);
   
   /**
    * The event fired when the container is resized
    * @event eventResize
    */
   this.eventResize = new YAHOO.util.CustomEvent("eventResize");
};

YAHOO.extend(WireIt.util.DDResize, YAHOO.util.DragDrop, {

   /**
    * @method onMouseDown
    */
   onMouseDown: function(e) {
        var panel = this.getEl();
        this.startWidth = panel.offsetWidth;
        this.startHeight = panel.offsetHeight;

        this.startPos = [YAHOO.util.Event.getPageX(e), YAHOO.util.Event.getPageY(e)];
    },

    /**
     * @method onDrag
     */
    onDrag: function(e) {
        var newPos = [YAHOO.util.Event.getPageX(e),  YAHOO.util.Event.getPageY(e)];

        var offsetX = newPos[0] - this.startPos[0];
        var offsetY = newPos[1] - this.startPos[1];

        var newWidth = Math.max(this.startWidth + offsetX, this.myConf.minWidth);
        var newHeight = Math.max(this.startHeight + offsetY, this.myConf.minHeight);

        var panel = this.getEl();
        panel.style.width = newWidth + "px";
        panel.style.height = newHeight + "px";

			// redraw wires
        this.myConf.container.redrawAllWires();

        // Fire the resize event
        this.eventResize.fire([newWidth, newHeight]);
    }
});
/*global YAHOO,WireIt,window */
(function() {
   
   var util = YAHOO.util;
   var Dom = util.Dom, Event = util.Event, CSS_PREFIX = "WireIt-";
   
/**
 * Visual module that contains terminals. The wires are updated when the module is dragged around.
 * @class Container
 * @namespace WireIt
 * @constructor
 * @param {Object}   options      Configuration object (see options property)
 * @param {WireIt.Layer}   layer The WireIt.Layer (or subclass) instance that contains this container
 */
WireIt.Container = function(options, layer) {
   
   // Set the options
   this.setOptions(options);
   
   /**
    * the WireIt.Layer object that schould contain this container
    * @property layer
    * @type {WireIt.Layer}
    */
   this.layer = layer;
   
   /**
    * List of the terminals 
    * @property terminals
    * @type {Array}
    */
   this.terminals = [];
   
   /**
    * List of all the wires connected to this container terminals
    * @property wires
    * @type {Array}
    */
   this.wires = [];
   
   /**
    * Container DOM element
    * @property el
    * @type {HTMLElement}
    */
   this.el = null;
   
   /**
    * Body element
    * @property bodyEl
    * @type {HTMLElement}
    */
   this.bodyEl = null;
   
   /**
    * Event that is fired when a wire is added
    * You can register this event with myTerminal.eventAddWire.subscribe(function(e,params) { var wire=params[0];}, scope);
    * @event eventAddWire
    */
   this.eventAddWire = new util.CustomEvent("eventAddWire");
   
   /**
    * Event that is fired when a wire is removed
    * You can register this event with myTerminal.eventRemoveWire.subscribe(function(e,params) { var wire=params[0];}, scope);
    * @event eventRemoveWire
    */
   this.eventRemoveWire = new util.CustomEvent("eventRemoveWire");
   
   this.eventFocus = new util.CustomEvent("eventFocus");
   
   this.eventBlur = new util.CustomEvent("eventBlur");
   
   // Render the div object
   this.render();
   
   // Init the terminals
   this.initTerminals( this.options.terminals);
   
	// Make the container draggable
	if(this.options.draggable) {
		   
	   if(this.options.resizable) {
			// Make resizeable   
			this.ddResize = new WireIt.util.DDResize(this);
			this.ddResize.eventResize.subscribe(this.onResize, this, true);
	   }
	   
	   // Use the drag'n drop utility to make the container draggable
	   this.dd = new WireIt.util.DD(this.terminals,this.el);
	   
	   // Sets ddHandle as the drag'n drop handle
	   if(this.options.ddHandle) {
			this.dd.setHandleElId(this.ddHandle);
	   }
	   
	   // Mark the resize handle as an invalid drag'n drop handle and vice versa
	   if(this.options.resizable) {
			this.dd.addInvalidHandleId(this.ddResizeHandle);
			this.ddResize.addInvalidHandleId(this.ddHandle);
	   }
   }
   
};


WireIt.Container.prototype = {
   
   /**
    * set the options
    * @method setOptions
    */
   setOptions: function(options) {
      
      /**
       * Main options object
       * <ul>
       *    <li>terminals: list of the terminals configuration</li>
       *    <li>draggable: boolean that enables drag'n drop on this container (default: true)</li>
       *    <li>className: CSS class name for the container element (default 'WireIt-Container')</li>
       *    <li>position: initial position of the container</li>
       *    <li>ddHandle: (only if draggable) boolean indicating we use a handle for drag'n drop (default true)</li>
       *    <li>ddHandleClassName: CSS class name for the drag'n drop handle (default 'WireIt-Container-ddhandle')</li>
       *    <li>resizable: boolean that makes the container resizable (default true)</li>
       *    <li>resizeHandleClassName: CSS class name for the resize handle (default 'WireIt-Container-resizehandle')</li>
       *    <li>width: initial width of the container (no default so it autoadjusts to the content)</li>
       *    <li>height: initial height of the container (default 100)</li>
       *    <li>close: display a button to close the container (default true)</li>
       *    <li>closeButtonClassName: CSS class name for the close button (default "WireIt-Container-closebutton")</li>
       *    <li>title: text that will appear in the module header</li>
       *    <li>icon: image url to be displayed in the module header</li>
       *    <li>preventSelfWiring: option to prevent connections between terminals of this same container (default true)</li>
       * </ul>
       * @property options
       * @type {Object}
       */
      this.options= YAHOO.lang.merge({ 
        terminals: [],
        draggable: true,
        position: [100,100],
        className: CSS_PREFIX+"Container",
        ddHandle: true,
        ddHandleClassName: CSS_PREFIX+"Container-ddhandle",
        resizable: true,
        resizeHandleClassName: CSS_PREFIX+"Container-resizehandle",
        close: true,
        closeButtonClassName: CSS_PREFIX+"Container-closebutton",
        groupable: true,
        preventSelfWiring:true
      }, options);

   },

   /**
    * Function called when the container is being resized.
    * It doesn't do anything, so please override it.
    * @method onResize
    */
   onResize: function(event, args) {
      var size = args[0];
      WireIt.sn(this.bodyEl, null, {width: (size[0]-10)+"px", height: (size[1]-44)+"px"});
   },

   /**
    * Render the dom of the container
    * @method render
    */
   render: function() {
   
      // Create the element
      this.el = WireIt.cn('div', {className: this.options.className});
   
      if(this.options.width) {
         this.el.style.width = this.options.width+"px";
      }
      if(this.options.height) {
         this.el.style.height = this.options.height+"px";
      }
   
      // Adds a handler for mousedown so we can notice the layer
      Event.addListener(this.el, "mousedown", this.onMouseDown, this, true);
   
      if(this.options.ddHandle) {
         // Create the drag/drop handle
			this.ddHandle = WireIt.cn('div', {className: this.options.ddHandleClassName});
			this.el.appendChild(this.ddHandle);

         // Set title
         if(this.options.title) {
            this.ddHandle.appendChild( WireIt.cn('span', {className: 'floatleft'}, null, this.options.title) );
         }
         
         // Icon
         if (this.options.icon) {
            var iconCn = WireIt.cn('img', {src: this.options.icon, className: 'WireIt-Container-icon'});
            this.ddHandle.appendChild(iconCn);
         }

      }
   
      // Create the body element
      this.bodyEl = WireIt.cn('div', {className: "body"});
      this.el.appendChild(this.bodyEl);
   
      if(this.options.resizable) {
         // Create the resize handle
			this.ddResizeHandle = WireIt.cn('div', {className: this.options.resizeHandleClassName} );
			this.el.appendChild(this.ddResizeHandle);
      }

      if(this.options.close) {
         // Close button
         this.closeButton = WireIt.cn('div', {className: this.options.closeButtonClassName} );
			if (this.options.ddHandle) {
				this.ddHandle.appendChild(this.closeButton);
			}
			else {
				this.el.appendChild(this.closeButton);
			}
         Event.addListener(this.closeButton, "click", this.onCloseButton, this, true);
      }
      
      if(this.options.groupable && this.options.ddHandle) {
         this.groupButton = WireIt.cn('div', {className: 'WireIt-Container-groupbutton'} );
			this.ddHandle.appendChild(this.groupButton);
         Event.addListener(this.groupButton, "click", this.onGroupButton, this, true);
      }   
      // Append to the layer element
      this.layer.el.appendChild(this.el);
   
		// Set the position
		this.el.style.left = this.options.position[0]+"px";
		this.el.style.top = this.options.position[1]+"px";
   },

   /**
    * Sets the content of the body element
    * @method setBody
    * @param {String or HTMLElement} content
    */
   setBody: function(content) {
      if(typeof content == "string") {
         this.bodyEl.innerHTML = content;
      }
      else {
         this.bodyEl.innerHTML = "";
         this.bodyEl.appendChild(content);
      }
   },

   /**
    * Called when the user made a mouse down on the container and sets the focus to this container (only if within a Layer)
    * @method onMouseDown
    */
   onMouseDown: function(event) {
      if(this.layer) {
         if(this.layer.focusedContainer && this.layer.focusedContainer != this) {
            this.layer.focusedContainer.removeFocus();
         }
         this.setFocus();
         this.layer.focusedContainer = this;
      }
   },

   /**
    * Adds the class that shows the container as "focused"
    * @method setFocus
    */
   setFocus: function() {
      Dom.addClass(this.el, CSS_PREFIX+"Container-focused");
      
      this.eventFocus.fire(this);
   },

   /**
    * Remove the class that shows the container as "focused"
    * @method removeFocus
    */
   removeFocus: function() {
      Dom.removeClass(this.el, CSS_PREFIX+"Container-focused");
      
      this.eventBlur.fire(this);
   },

   /**
    * Called when the user clicked on the close button
    * @method onCloseButton
    */
   onCloseButton: function(e, args) {
      Event.stopEvent(e);
      this.layer.removeContainer(this);
   },

    highlight: function()
    {
	this.el.style.border = "2px solid blue";
    },

    dehighlight: function()
    {
	this.el.style.border = "";
    },
    
    superHighlight: function()
    {
	this.el.style.border = "4px outset blue";
    },
    


   /**
    * Remove this container from the dom
    * @method remove
    */
   remove: function() {
      // Remove the terminals (and thus remove the wires)
      this.removeAllTerminals();
   
      // Remove from the dom
      this.layer.el.removeChild(this.el);
      
      // Remove all event listeners
      Event.purgeElement(this.el);
   },

   /**
    * Call the addTerminal method for each terminal configuration.
    * @method initTerminals
    */
   initTerminals: function(terminalConfigs) {
      for(var i = 0 ; i < terminalConfigs.length ; i++) {
         this.addTerminal(terminalConfigs[i]);
      }
   },


   /**
    * Instanciate the terminal from the class pointer "xtype" (default WireIt.Terminal)
    * @method addTerminal
    * @return {WireIt.Terminal}  terminal Created terminal
    */
   addTerminal: function(terminalConfig) {

   	var klass = WireIt.terminalClassFromXtype(terminalConfig.xtype);

      // Instanciate the terminal
      var term = new klass(this.el, terminalConfig, this);
   
      // Add the terminal to the list
      this.terminals.push( term );
   
      // Event listeners
      term.eventAddWire.subscribe(this.onAddWire, this, true);
      term.eventRemoveWire.subscribe(this.onRemoveWire, this, true);
   
      return term;
   },

   /**
    * This method is called when a wire is added to one of the terminals
    * @method onAddWire
    * @param {Event} event The eventAddWire event fired by the terminal
    * @param {Array} args This array contains a single element args[0] which is the added Wire instance
    */
   onAddWire: function(event, args) {
      var wire = args[0];
      // add the wire to the list if it isn't in
      if( WireIt.indexOf(wire, this.wires) == -1 ) {
         this.wires.push(wire);
         this.eventAddWire.fire(wire);
      } 
   },

   /**
    * This method is called when a wire is removed from one of the terminals
    * @method onRemoveWire
    * @param {Event} event The eventRemoveWire event fired by the terminal
    * @param {Array} args This array contains a single element args[0] which is the removed Wire instance
    */
   onRemoveWire: function(event, args) {
      var wire = args[0];
      var index = WireIt.indexOf(wire, this.wires);
      if( index != -1 ) {
         this.eventRemoveWire.fire(wire);
         this.wires[index] = null;
      }
      this.wires = WireIt.compact(this.wires);
   },

   /**
    * Remove all terminals
    * @method removeAllTerminals
    */
   removeAllTerminals: function() {
      for(var i = 0 ; i < this.terminals.length ; i++) {
         this.terminals[i].remove();
      }
      this.terminals = [];
   },

   /**
    * Redraw all the wires connected to the terminals of this container
    * @method redrawAllTerminals
    */
   redrawAllWires: function() {
      for(var i = 0 ; i < this.terminals.length ; i++) {
         this.terminals[i].redrawAllWires();
      }
   },

   /**
    * Return the config of this container.
    * @method getConfig
    */
   getConfig: function() {
      var obj = {};
   
      // Position
      obj.position = Dom.getXY(this.el);
      if(this.layer) {
         // remove the layer position to the container position
         var layerPos = Dom.getXY(this.layer.el);
         obj.position[0] -= layerPos[0];
         obj.position[1] -= layerPos[1];
         // add the scroll position of the layer to the container position
         obj.position[0] += this.layer.el.scrollLeft;
         obj.position[1] += this.layer.el.scrollTop;
      }
   
      // xtype
      if(this.options.xtype) {
         obj.xtype = this.options.xtype;
      }
   
      return obj;
   },
   
   /**
    * Subclasses should override this method.
    * @method getValue
    * @return {Object} value
    */
   getValue: function() {
      return {};
   },

   /**
    * Subclasses should override this method.
    * @method setValue
    * @param {Any} val Value 
    */
   setValue: function(val) {
   },
   
   
   /**
    * @method getTerminal
    */
   getTerminal: function(name) {
      var term;
      for(var i = 0 ; i < this.terminals.length ; i++) {
         term = this.terminals[i];
         if(term.options.name == name) {
            return term;
         }
      }
      return null;
   }

};

})();/*global YAHOO,WireIt,window */
/**
 * A layer encapsulate a bunch of containers and wires
 * @class Layer
 * @namespace WireIt
 * @constructor
 * @param {Object}   options   Configuration object (see the properties)
 */
WireIt.Layer = function(options) {
   
   this.setOptions(options);
   
   /**
    * List of all the WireIt.Container (or subclass) instances in this layer
    * @property containers
    * @type {Array}
    */
   this.containers = [];
   
   /**
    * List of all the WireIt.Wire (or subclass) instances in this layer
    * @property wires
    * @type {Array}
    */
   this.wires = [];
   
   this.groups = [];
   
   /**
    * Layer DOM element
    * @property el
    * @type {HTMLElement}
    */
   this.el = null;

	/**
    * Event that is fired when the layer has been changed
    * You can register this event with myTerminal.eventChanged.subscribe(function(e,params) { }, scope);
    * @event eventChanged
    */
   this.eventChanged = new YAHOO.util.CustomEvent("eventChanged");
   
   /**
    * Event that is fired when a wire is added
    * You can register this event with myTerminal.eventAddWire.subscribe(function(e,params) { var wire=params[0];}, scope);
    * @event eventAddWire
    */
   this.eventAddWire = new YAHOO.util.CustomEvent("eventAddWire");
   
   /**
    * Event that is fired when a wire is removed
    * You can register this event with myTerminal.eventRemoveWire.subscribe(function(e,params) { var wire=params[0];}, scope);
    * @event eventRemoveWire
    */
   this.eventRemoveWire = new YAHOO.util.CustomEvent("eventRemoveWire");
   
   /**
    * Event that is fired when a container is added
    * You can register this event with myTerminal.eventAddContainer.subscribe(function(e,params) { var container=params[0];}, scope);
    * @event eventAddContainer
    */
   this.eventAddContainer = new YAHOO.util.CustomEvent("eventAddContainer");
   
   /**
    * Event that is fired when a container is removed
    * You can register this event with myTerminal.eventRemoveContainer.subscribe(function(e,params) { var container=params[0];}, scope);
    * @event eventRemoveContainer
    */
   this.eventRemoveContainer = new YAHOO.util.CustomEvent("eventRemoveContainer");
   
   /**
    * Event that is fired when a container has been moved
    * You can register this event with myTerminal.eventContainerDragged.subscribe(function(e,params) { var container=params[0];}, scope);
    * @event eventContainerDragged
    */
   this.eventContainerDragged = new YAHOO.util.CustomEvent("eventContainerDragged");
   
   /**
    * Event that is fired when a container has been resized
    * You can register this event with myTerminal.eventContainerResized.subscribe(function(e,params) { var container=params[0];}, scope);
    * @event eventContainerResized
    */
   this.eventContainerResized = new YAHOO.util.CustomEvent("eventContainerResized");
   
   this.render();
   
   this.initContainers();
   
   this.initWires();
   
   if(this.options.layerMap) { 
		this.layermap = new WireIt.LayerMap(this, this.options.layerMapOptions);
   }
   
	if(WireIt.Grouper) {
	   this.grouper = new WireIt.Grouper(this, this.options.grouper.baseConfigFunction);
   
	   var rb = this.grouper.rubberband;
		this.el.onmousedown = function(event) { return rb.layerMouseDown.call(rb, event); };
	   var grouper = this.grouper;
	   this.el.addEventListener("mouseup", function (event)  { 
		    rb.finish(); 
		    grouper.rubberbandSelect.call(grouper); 
		}, false);
	}
};

WireIt.Layer.prototype = {

   /**
    * @method setOptions
    */
   setOptions: function(options) {
      /**
       * Configuration object of the layer
       * <ul>
       *   <li>className: CSS class name for the layer element (default 'WireIt-Layer')</li>
       *   <li>parentEl: DOM element that schould contain the layer (default document.body)</li>
       *   <li>containers: array of container configuration objects</li>  
       *   <li>wires: array of wire configuration objects</li>
       *   <li>layerMap: boolean</li>
       *   <li>layerMapOptions: layer map options</li>
       * </ul>
       * @property options
       */
      this.options = {};
      this.options.className = options.className || 'WireIt-Layer';
      this.options.parentEl = options.parentEl || document.body;
      this.options.containers = options.containers || [];
      this.options.wires = options.wires || [];
      this.options.layerMap = YAHOO.lang.isUndefined(options.layerMap) ? false : options.layerMap;
      this.options.layerMapOptions = options.layerMapOptions;
      this.options.enableMouseEvents = YAHOO.lang.isUndefined(options.enableMouseEvents) ? true : options.enableMouseEvents;
      this.options.grouper = options.grouper;
   },

   /**
    * Create the dom of the layer and insert it into the parent element
    * @method render
    */
   render: function() {
   
      this.el = WireIt.cn('div', {className: this.options.className} );
   
      this.options.parentEl.appendChild(this.el);
   },


   /**
    * Create all the containers passed as options
    * @method initContainers
    */
   initContainers: function() {
      for(var i = 0 ; i < this.options.containers.length ; i++) {
         this.addContainer(this.options.containers[i]);
      } 
   },

   /**
    * Create all the wires passed in the config
    * @method initWires
    */
   initWires: function() {
      for(var i = 0 ; i < this.options.wires.length ; i++) {
         this.addWire(this.options.wires[i]);
      }
   },

	/**
	 * TODO
	 */
	setSuperHighlighted: function(containers) {
		this.unsetSuperHighlighted();
		for (var i in containers) {
			if(containers.hasOwnProperty(i)) {
				containers[i].superHighlight();
			}
		}
		this.superHighlighted = containers;
	},

	/**
	 * TODO
	 */
	unsetSuperHighlighted: function() {
		if (YAHOO.lang.isValue(this.superHighlighted)) {
			for (var i in this.superHighlighted) {
				if(this.superHighlighted.hasOwnProperty(i)) {
					this.superHighlighted[i].highlight();
				}
			}
		}
		this.superHighlighted = null;
	},

   /**
    * Instanciate a wire given its "xtype" (default to WireIt.Wire)
    * @method addWire
    * @param {Object} wireConfig  Wire configuration object (see WireIt.Wire class for details)
    * @return {WireIt.Wire} Wire instance build from the xtype
    */
   addWire: function(wireConfig) {
	
		var klass = WireIt.wireClassFromXtype(wireConfig.xtype);
   
      var src = wireConfig.src;
      var tgt = wireConfig.tgt;
   
      var terminal1 = this.containers[src.moduleId].getTerminal(src.terminal);
      var terminal2 = this.containers[tgt.moduleId].getTerminal(tgt.terminal);
      var wire = new klass( terminal1, terminal2, this.el, wireConfig);
      wire.redraw();
   
      return wire;
   },

   /**
    * Instanciate a container given its "xtype": WireIt.Container (default) or a subclass of it.
    * @method addContainer
    * @param {Object} containerConfig  Container configuration object (see WireIt.Container class for details)
    * @return {WireIt.Container} Container instance build from the xtype
    */
   addContainer: function(containerConfig) {

		var klass = WireIt.containerClassFromXtype(containerConfig.xtype);

      var container = new klass(containerConfig, this);
   
      return this.addContainerDirect(container);
   },


   addContainerDirect: function(container) {
      this.containers.push( container );
   
      // Event listeners
      container.eventAddWire.subscribe(this.onAddWire, this, true);
      container.eventRemoveWire.subscribe(this.onRemoveWire, this, true);
   
      if(container.ddResize) {
         container.ddResize.on('endDragEvent', function() {
            this.eventContainerResized.fire(container);
				this.eventChanged.fire(this);
         }, this, true);
      }
      if(container.dd) {
         container.dd.on('endDragEvent', function() {
            this.eventContainerDragged.fire(container);
				this.eventChanged.fire(this);
         }, this, true);
      }
   
      this.eventAddContainer.fire(container);

		this.eventChanged.fire(this);
   
      return container;	
   },
   
   /**
    * Remove a container
    * @method removeContainer
    * @param {WireIt.Container} container Container instance to remove
    */
   removeContainer: function(container) {
      var index = WireIt.indexOf(container, this.containers);
      if( index != -1 ) {
	  
	container.remove();
	    
        this.containers[index] = null;
        this.containers = WireIt.compact(this.containers);
      
	this.eventRemoveContainer.fire(container);

	this.eventChanged.fire(this);
      }
   },

	/**
	 * TODO
	 */
	removeGroup: function(group, containersAsWell)  {
		var index = this.groups.indexOf(group) , i;
		
		if (index != -1) {
			this.groups.splice(index, 1);
		}

		if (containersAsWell) {
			if (YAHOO.lang.isValue(group.groupContainer)) {
				this.removeContainer(group.groupContainer);
			}
			else {
				for (i in group.containers) {
					if(group.containers.hasOwnProperty(i)) {
						var elem = group.containers[i].container;
						this.removeContainer(elem);
					}
				}

				for (i in group.groups) {
					if(group.containers.hasOwnProperty(i)) {
						var g = group.groups[i].group;
						this.removeGroup(g);
					}
				}
			}
		}
	},

   /**
    * Update the wire list when any of the containers fired the eventAddWire
    * @method onAddWire
    * @param {Event} event The eventAddWire event fired by the container
    * @param {Array} args This array contains a single element args[0] which is the added Wire instance
    */
   onAddWire: function(event, args) {
      var wire = args[0];
      // add the wire to the list if it isn't in
      if( WireIt.indexOf(wire, this.wires) == -1 ) {
         this.wires.push(wire);
         
         if(this.options.enableMouseEvents) {
            YAHOO.util.Event.addListener(wire.element, "mousemove", this.onWireMouseMove, this, true);
            YAHOO.util.Event.addListener(wire.element, "click", this.onWireClick, this, true);
         }
         
         // Re-Fire an event at the layer level
         this.eventAddWire.fire(wire);

			// Fire the layer changed event
			this.eventChanged.fire(this);
      }
   },

   /**
    * Update the wire list when a wire is removed
    * @method onRemoveWire
    * @param {Event} event The eventRemoveWire event fired by the container
    * @param {Array} args This array contains a single element args[0] which is the removed Wire instance
    */
   onRemoveWire: function(event, args) {
      var wire = args[0];
      var index = WireIt.indexOf(wire, this.wires);
      if( index != -1 ) {
         this.wires[index] = null;
         this.wires = WireIt.compact(this.wires);
         this.eventRemoveWire.fire(wire);
			this.eventChanged.fire(this);
      }
   },


   /**
    * Remove all the containers in this layer (and the associated terminals and wires)
    * @method clear
    */
   clear: function() {
		while(this.containers.length > 0) {
         this.removeContainer(this.containers[0]);
      }
   },

   /**
    * @deprecated Alias for clear
    * @method removeAllContainers
    */
   removeAllContainers: function() {
      this.clear();
   },


   /**
    * Return an object that represent the state of the layer including the containers and the wires
    * @method getWiring
    * @return {Obj} layer configuration
    */
   getWiring: function() {
   
      var i;
      var obj = {containers: [], wires: []};
   
      for( i = 0 ; i < this.containers.length ; i++) {
         obj.containers.push( this.containers[i].getConfig() );
      }
   
      for( i = 0 ; i < this.wires.length ; i++) {
         var wire = this.wires[i];
      
         var wireObj = { 
            src: {moduleId: WireIt.indexOf(wire.terminal1.container, this.containers), terminal: wire.terminal1.name }, 
            tgt: {moduleId: WireIt.indexOf(wire.terminal2.container, this.containers), terminal: wire.terminal2.name }
         };
         obj.wires.push(wireObj);
      }
   
      return obj;
   },

   /**
    * Load a layer configuration object
    * @method setWiring
    * @param {Object} wiring layer configuration
    */
   setWiring: function(wiring) {
      this.clear();
      var i;
      if(YAHOO.lang.isArray(wiring.containers)) {
         for(i = 0 ; i < wiring.containers.length ; i++) {
            this.addContainer(wiring.containers[i]);
         }
      }
      if(YAHOO.lang.isArray(wiring.wires)) {
         for(i = 0 ; i < wiring.wires.length ; i++) {
            this.addWire(wiring.wires[i]);
         }
       }
   },
   
   /**
    * Returns a position relative to the layer from a mouse event
    * @method _getMouseEvtPos
    * @param {Event} e Mouse event
    * @return {Array} position
    */
   _getMouseEvtPos: function(e) {
		var tgt = YAHOO.util.Event.getTarget(e);
		var tgtPos = [tgt.offsetLeft, tgt.offsetTop];
		return [tgtPos[0]+e.layerX, tgtPos[1]+e.layerY];
   },

   /**
    * Handles click on any wire canvas
    * Note: we treat mouse events globally so that wires behind others can still receive the events
    * @method onWireClick
    * @param {Event} e Mouse click event
    */
   onWireClick: function(e) {
      var p = this._getMouseEvtPos(e);
		var lx = p[0], ly = p[1], n = this.wires.length, w;
		for(var i = 0 ; i < n ; i++) {
			w = this.wires[i];
			var elx = w.element.offsetLeft, ely = w.element.offsetTop;
			// Check if the mouse is within the canvas boundaries
			if( lx >= elx && lx < elx+w.element.width && ly >= ely && ly < ely+w.element.height ) {
				var rx = lx-elx, ry = ly-ely; // relative to the canvas
				w.onClick(rx,ry);
			}
		}
	},

   /**
    * Handles mousemove events on any wire canvas
    * Note: we treat mouse events globally so that wires behind others can still receive the events
    * @method onWireMouseMove
    * @param {Event} e Mouse click event
    */
   onWireMouseMove: function(e) {
      var p = this._getMouseEvtPos(e);
		var lx = p[0], ly = p[1], n = this.wires.length, w;
		for(var i = 0 ; i < n ; i++) {
			w = this.wires[i];
			var elx = w.element.offsetLeft, ely = w.element.offsetTop;
			// Check if the mouse is within the canvas boundaries
			if( lx >= elx && lx < elx+w.element.width && ly >= ely && ly < ely+w.element.height ) {
				var rx = lx-elx, ry = ly-ely; // relative to the canvas
				w.onMouseMove(rx,ry);
			}
		}
	}

};
/*global YAHOO,WireIt,window */
(function() {

   var Dom = YAHOO.util.Dom, Event = YAHOO.util.Event;

/**
 * Widget to display a minimap on a layer
 * @class LayerMap
 * @namespace WireIt
 * @extends WireIt.CanvasElement
 * @constructor
 * @param {WireIt.Layer} layer the layer object it is attached to
 * @param {Obj} options configuration object
 */
WireIt.LayerMap = function(layer,options) {
   
   /**
    * @property layer
    */
   this.layer = layer;
   
   this.setOptions(options);
   
   // Create the canvas element
   WireIt.LayerMap.superclass.constructor.call(this, this.options.parentEl);
   
   // Set the className
   this.element.className = this.options.className;
   
   this.initEvents();
   
   this.draw();
};

YAHOO.lang.extend(WireIt.LayerMap, WireIt.CanvasElement, {
   
   /**
    * @method setOptions
    * @param {Object} options
    */
   setOptions: function(options) { 
      var opts = options || {};
      /**
       * Options:
       * <ul>
       *    <li>parentEl: parent element (defaut layer.el)</li>
       *    <li>className: default to "WireIt-LayerMap"</li>
       *    <li>style: display style, default to "rgba(0, 0, 200, 0.5)"</li>
       *    <li>lineWidth: default 2</li>
       * </ul>
       * @property options
       */
      this.options = {};
      this.options.parentEl = Dom.get(opts.parentEl || this.layer.el);
      this.options.className = opts.className || "WireIt-LayerMap";
      this.options.style = opts.style || "rgba(0, 0, 200, 0.5)";
      this.options.lineWidth = opts.lineWidth || 2;
   },
   
   
   /**
    * Listen for various events that should redraw the layer map
    * @method initEvents
    */
   initEvents: function() {
      
      var layer = this.layer;
      
      Event.addListener(this.element, 'mousedown', this.onMouseDown, this, true);
      Event.addListener(this.element, 'mouseup', this.onMouseUp, this, true);
      Event.addListener(this.element, 'mousemove', this.onMouseMove, this, true);
      Event.addListener(this.element, 'mouseout', this.onMouseUp, this, true);
      
      layer.eventAddWire.subscribe(this.draw, this, true);
      layer.eventRemoveWire.subscribe(this.draw, this, true);
      layer.eventAddContainer.subscribe(this.draw, this, true);
      layer.eventRemoveContainer.subscribe(this.draw, this, true);
      layer.eventContainerDragged.subscribe(this.draw, this, true);
      layer.eventContainerResized.subscribe(this.draw, this, true);

      Event.addListener(this.layer.el, "scroll", this.onLayerScroll, this, true);
   },
   
   /**
    * When a mouse move is received
    * @method onMouseMove
    * @param {Event} e Original event
    * @param {Array} args event parameters
    */
   onMouseMove: function(e, args) { 
      Event.stopEvent(e);
      if(this.isMouseDown) {
         this.scrollLayer(e.clientX,e.clientY);
		}
   },   
   
   /**
    * When a mouseup or mouseout is received
    * @method onMouseUp
    * @param {Event} e Original event
    * @param {Array} args event parameters
    */
   onMouseUp: function(e, args) {
      Event.stopEvent(e);
      this.isMouseDown = false;
   },
   
   /**
    * When a mouse down is received
    * @method onMouseDown
    * @param {Event} e Original event
    * @param {Array} args event parameters
    */
   onMouseDown: function(e, args) {
      Event.stopEvent(e);
      this.scrollLayer(e.clientX,e.clientY);
      this.isMouseDown = true;
   },
   
   /**
    * Scroll the layer from mousedown/mousemove
    * @method scrollLayer
    * @param {Integer} clientX mouse event x coordinate
    * @param {Integer} clientY mouse event y coordinate
    */
   scrollLayer: function(clientX, clientY) {
      
      var canvasPos = Dom.getXY(this.element);
      var click = [ clientX-canvasPos[0], clientY-canvasPos[1] ];
      
      // Canvas Region
      var canvasRegion = Dom.getRegion(this.element);
      var canvasWidth = canvasRegion.right-canvasRegion.left-4;
      var canvasHeight = canvasRegion.bottom-canvasRegion.top-4;
      
      // Calculate ratio
      var layerWidth = this.layer.el.scrollWidth;
      var layerHeight = this.layer.el.scrollHeight;
      var hRatio = Math.floor(100*canvasWidth/layerWidth)/100;
      var vRatio = Math.floor(100*canvasHeight/layerHeight)/100;
      
      // Center position:
      var center = [ click[0]/hRatio, click[1]/vRatio ];
      
      // Region
      var region = Dom.getRegion(this.layer.el);
      var viewportWidth = region.right-region.left;
      var viewportHeight = region.bottom-region.top;
      
      // Calculate the scroll position of the layer
      var topleft = [ Math.max(Math.floor(center[0]-viewportWidth/2),0) ,  Math.max(Math.floor(center[1]-viewportHeight/2), 0) ];
      if( topleft[0]+viewportWidth > layerWidth ) {
         topleft[0] = layerWidth-viewportWidth;
      }
      if( topleft[1]+viewportHeight > layerHeight ) {
         topleft[1] = layerHeight-viewportHeight;
      }
     
      this.layer.el.scrollLeft = topleft[0];
      this.layer.el.scrollTop = topleft[1];
   
   },
   
   /**
    * Redraw after a timeout
    * @method onLayerScroll
    */
   onLayerScroll: function() {
      
      if(this.scrollTimer) { window.clearTimeout(this.scrollTimer); }
      var that = this;
      this.scrollTimer = window.setTimeout(function() {
         that.draw();
      },50);
      
   },
   
   /**
    * Redraw the layer map
    * @method draw
    */
   draw: function() {
      var ctxt=this.getContext();
      
      // Canvas Region
      var canvasRegion = Dom.getRegion(this.element);
      var canvasWidth = canvasRegion.right-canvasRegion.left-4;
      var canvasHeight = canvasRegion.bottom-canvasRegion.top-4;
      
      // Clear Rect
      ctxt.clearRect(0,0, canvasWidth, canvasHeight);
      
      // Calculate ratio
      var layerWidth = this.layer.el.scrollWidth;
      var layerHeight = this.layer.el.scrollHeight;
      var hRatio = Math.floor(100*canvasWidth/layerWidth)/100;
      var vRatio = Math.floor(100*canvasHeight/layerHeight)/100;

      // Draw the viewport
      var region = Dom.getRegion(this.layer.el);
      var viewportWidth = region.right-region.left;
      var viewportHeight = region.bottom-region.top;
      var viewportX = this.layer.el.scrollLeft;
      var viewportY = this.layer.el.scrollTop;
      ctxt.strokeStyle= "rgb(200, 50, 50)";
      ctxt.lineWidth=1;
      ctxt.strokeRect(viewportX*hRatio, viewportY*vRatio, viewportWidth*hRatio, viewportHeight*vRatio);
   
      // Draw containers and wires
      ctxt.fillStyle = this.options.style;
      ctxt.strokeStyle= this.options.style;
      ctxt.lineWidth=this.options.lineWidth;
      this.drawContainers(ctxt, hRatio, vRatio);
      this.drawWires(ctxt, hRatio, vRatio);
   },
   
   /**
    * Subroutine to draw the containers
    * @method drawContainers
    */
   drawContainers: function(ctxt, hRatio, vRatio) {
      var containers = this.layer.containers;
      var n = containers.length,i,gIS = WireIt.getIntStyle,containerEl;
      for(i = 0 ; i < n ; i++) {
         containerEl = containers[i].el;
         ctxt.fillRect(gIS(containerEl, "left")*hRatio, gIS(containerEl, "top")*vRatio, 
                       gIS(containerEl, "width")*hRatio, gIS(containerEl, "height")*vRatio);
      }
   },
   
   /**
    * Subroutine to draw the wires
    * @method drawWires
    */
   drawWires: function(ctxt, hRatio, vRatio) {
      var wires = this.layer.wires;
      var n = wires.length,i,wire;
      for(i = 0 ; i < n ; i++) {
         wire = wires[i];
         var pos1 = wire.terminal1.getXY(), 
             pos2 = wire.terminal2.getXY();

         // Stroked line
         // TODO:
         ctxt.beginPath();
         ctxt.moveTo(pos1[0]*hRatio,pos1[1]*vRatio);
         ctxt.lineTo(pos2[0]*hRatio,pos2[1]*vRatio);
         ctxt.closePath();
         ctxt.stroke();
      }
      
   }
   
   
});

})();/*global YAHOO,WireIt */
/**
 * Container represented by an image
 * @class ImageContainer
 * @extends WireIt.Container
 * @constructor
 * @param {Object} options
 * @param {WireIt.Layer} layer
 */
WireIt.ImageContainer = function(options, layer) {
   WireIt.ImageContainer.superclass.constructor.call(this, options, layer);
};

YAHOO.lang.extend(WireIt.ImageContainer, WireIt.Container, {
   /**
    * @method setOptions
    * @param {Object} options the options object
    */
   setOptions: function(options) {
     
      WireIt.ImageContainer.superclass.setOptions.call(this, YAHOO.lang.merge( {
            resizable: false,
            ddHandle: false,
            className: "WireIt-Container WireIt-ImageContainer"
      }, options));
      this.options.xtype = "WireIt.ImageContainer"; //don't allow overriding.
   },
   
   /**
    * @method render
    */
   render: function() {
      WireIt.ImageContainer.superclass.render.call(this);
      YAHOO.util.Dom.setStyle(this.bodyEl, "background-image", "url("+this.options.image+")");
   }
   
});/*global YAHOO,WireIt */
/**
 * Container with left inputs and right outputs
 * @class InOutContainer
 * @extends WireIt.Container
 * @constructor
 * @param {Object} options
 * @param {WireIt.Layer} layer
 */
WireIt.InOutContainer = function(options, layer) {
   WireIt.InOutContainer.superclass.constructor.call(this, options, layer);
};

YAHOO.lang.extend(WireIt.InOutContainer, WireIt.Container, {
   
   /**
    * @method setOptions
    * @param {Object} options the options object
    */
   setOptions: function(options) {
      WireIt.InOutContainer.superclass.setOptions.call(this,  YAHOO.lang.merge( {
               resizable: false,
               className: "WireIt-Container WireIt-InOutContainer",
               inputs: [],
               outputs: []
         }, options));
      
      this.options.xtype = "WireIt.InOutContainer";
   },
   
   render: function() {
      WireIt.InOutContainer.superclass.render.call(this);

		for(var i = 0 ; i < this.options.inputs.length ; i++) {
			var input = this.options.inputs[i];
			this.options.terminals.push({
				"name": input, 
				"direction": [-1,0], 
				"offsetPosition": {"left": -14, "top": 3+30*(i+1) }, 
				"ddConfig": {
					"type": "input",
					"allowedTypes": ["output"]
				}
			});
			this.bodyEl.appendChild(WireIt.cn('div', null, {lineHeight: "30px"}, input));
		}
		
		for(i = 0 ; i < this.options.outputs.length ; i++) {
			var output = this.options.outputs[i];
			this.options.terminals.push({
				"name": output, 
				"direction": [1,0], 
				"offsetPosition": {"right": -14, "top": 3+30*(i+1+this.options.inputs.length) }, 
				"ddConfig": {
					"type": "output",
					"allowedTypes": ["input"]
				},
				"alwaysSrc": true
			});
			this.bodyEl.appendChild(WireIt.cn('div', null, {lineHeight: "30px", textAlign: "right"}, output));
		}
		
   }
   
});/**
 * The inputEx Library
 * @module inputEx
 */
/*global inputEx: false, YAHOO: false */
(function() {
 
 var lang = YAHOO.lang;
 
/**
 * The inputEx method lets you create a field from the JSON definition:
 * <pre>
 *    inputEx({type: 'string', name: 'company', label: 'Your company' })
 * </pre>
 * Build a field from an object like: { type: 'color' or fieldClass: inputEx.ColorField, ... }<br />
 * If the neither type or fieldClass are found, it uses inputEx.StringField
 *
 * @class inputEx
 * @static
 * @param {Object} fieldOptions
 * @param {inputEx.Group|inputEx.Form|inputEx.ListField|inputEx.CombineField} (optional) parentField The parent field instance
 * @return {inputEx.Field} Created field instance
 */
inputEx = function(fieldOptions, parentField) {
   var fieldClass = null,
       inputInstance;
   
	if(fieldOptions.type) {
	   fieldClass = inputEx.getFieldClass(fieldOptions.type);
	   if(fieldClass === null) fieldClass = inputEx.StringField;
	}
	else {
	   fieldClass = fieldOptions.fieldClass ? fieldOptions.fieldClass : inputEx.StringField;
	}

   // Instanciate the field
   
   // Retro-compatibility with deprecated inputParams Object
   if (lang.isObject(fieldOptions.inputParams)) {
      inputInstance = new fieldClass(fieldOptions.inputParams);
      
   // New prefered way to instanciate a field
   } else {
      inputInstance = new fieldClass(fieldOptions);
   }

	// If the parentField argument is provided
	if(parentField) {
		inputInstance.setParentField(parentField);
	}

   // Add the flatten attribute if present in the params
   /*if(fieldOptions.flatten) {
      inputInstance._flatten = true;
   }*/
	  
   return inputInstance;
};

lang.augmentObject(inputEx, {
   
   VERSION: "0.5.0",
   
   /**
    * Url to the spacer image. This url schould be changed according to your project directories
    * @type String
    */
   spacerUrl: "images/space.gif", // 1x1 px
   
   /**
    * Field empty state constant
    * @type String
    */
   stateEmpty: 'empty',
   
   /**
    * Field required state constant
    * @type String
    */
   stateRequired: 'required',
   
   /**
    * Field valid state constant
    * @type String
    */
   stateValid: 'valid',
   
   /**
    * Field invalid state constant
    * @type String
    */
   stateInvalid: 'invalid',
   
   /**
    * Associative array containing field messages
    */
   messages: {
   	required: "This field is required",
   	invalid: "This field is invalid",
   	valid: "This field is valid",
   	defaultDateFormat: "m/d/Y",
   	months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
   },
   
   /**
    * inputEx widget namespace
    * @static 
    */
   widget: {},
   
   /**
    * Associative array containing common regular expressions
    */
   regexps: {
      email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      url: /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(([0-9]{1,5})?\/.*)?$/i,
      password: /^[0-9a-zA-Z\x20-\x7E]*$/
   },
   
   /**
    * Hash between inputEx types and classes (ex: <code>inputEx.typeClasses.color = inputEx.ColorField</code>)<br />
    * Please register the types with the <code>registerType</code> method
    */
   typeClasses: {},
   
   /**
    * When you create a new inputEx Field Class, you can register it to give it a simple type.
    * ex:   inputEx.registerType("color", inputEx.ColorField);
    * @static
    * @param {String} type String used as the inputEx field type
    * @param {Class} fieldClass Field Class to register as this type
	 * @param {Array} groupOptions List of inputEx field description for each option
	 * @param {Boolean} dontInherit Won't inherhit the parent field properties if set to true
    */
   registerType: function(type, fieldClass, groupOptions, dontInherit) {
      if(!lang.isString(type)) {
         throw new Error("inputEx.registerType: first argument must be a string");
      }
      if(!lang.isFunction(fieldClass)) {
         throw new Error("inputEx.registerType: second argument must be a function");
      }
      this.typeClasses[type] = fieldClass;
      
      // Setup the groupOptions property on the class
      var opts = [];
      if(lang.isArray(groupOptions)) { opts = groupOptions; }
      if(fieldClass.superclass && !dontInherit && lang.isArray(fieldClass.superclass.constructor.groupOptions) ) {
         opts = opts.concat(fieldClass.superclass.constructor.groupOptions);
      }
      fieldClass.groupOptions = opts;
   },
   
   /**
    * Returns the class for the given type
    * ex: inputEx.getFieldClass("color") returns inputEx.ColorField
    * @static
    * @param {String} type String type of the field
    */
   getFieldClass: function(type) {
      return lang.isFunction(this.typeClasses[type]) ? this.typeClasses[type] : null;
   },
   
   /**
    * Get the inputex type for the given class (ex: <code>inputEx.getType(inputEx.ColorField)</code> returns "color")
    * @static
    * @param {inputEx.Field} FieldClass An inputEx.Field or derivated class
    * @return {String} returns the inputEx type string or <code>null</code>
    */
   getType: function(FieldClass) {
      for(var type in this.typeClasses) {
         if(this.typeClasses.hasOwnProperty(type) ) {
            if(this.typeClasses[type] == FieldClass) {
               return type;
            }
         }
      }
      return null;
   },
   
   /**
    * @deprecated Kept for backward compatibility (alias for inputEx() )
    * @param {Object} fieldOptions
    * @return {inputEx.Field} Created field instance
    */
   buildField: function(fieldOptions) {      
      return inputEx(fieldOptions);
   },
   
   /**
    * Helper function to set DOM node attributes and style attributes.
    * @static
    * @param {HTMLElement} el The element to set attributes to
    * @param {Object} domAttributes An object containing key/value pairs to set as node attributes (ex: {id: 'myElement', className: 'myCssClass', ...})
    * @param {Object} styleAttributes Same thing for style attributes. Please use camelCase for style attributes (ex: backgroundColor for 'background-color')
    */
   sn: function(el,domAttributes,styleAttributes){
      if(!el) { return; }
		var i;
      if(domAttributes){
         for(i in domAttributes){
            var domAttribute = domAttributes[i];
            if( lang.isFunction(domAttribute) ){
               continue;
            }
            if(i=="className"){
               i="class";
               el.className=domAttribute;
            }
            if(domAttribute!==el.getAttribute(i)){
               try{
                  if(domAttribute===false){
                     el.removeAttribute(i);
                  }else{
                     el.setAttribute(i,domAttribute);
                  }
               }
               catch(err){
                  //console.log("WARNING: WireIt.sn failed for "+el.tagName+", attr "+i+", val "+domAttribute);
               }
            }
         }
      }

      if(styleAttributes){
         for(i in styleAttributes){
            if( lang.isFunction(styleAttributes[i]) ){
               continue;
            }
            if(el.style[i]!=styleAttributes[i]){
               el.style[i]=styleAttributes[i];
            }
         }
      }
   },


   /**
    * Helper function to create a DOM node. (wrapps the document.createElement tag and the inputEx.sn functions)
    * @static
    * @param {String} tag The tagName to create (ex: 'div', 'a', ...)
    * @param {Object} [domAttributes] see inputEx.sn
    * @param {Object} [styleAttributes] see inputEx.sn
    * @param {String} [innerHTML] The html string to append into the created element
    * @return {HTMLElement} The created node
    */
   cn: function(tag, domAttributes, styleAttributes, innerHTML) {
        if (tag == 'input' && YAHOO.env.ua.ie) { //only limit to input tag that has no tag body
            var strDom = '<' + tag;
            if (domAttributes!=='undefined'){
                for (var k in domAttributes){
                    strDom += ' ' + k + '="' + domAttributes[k] + '"';
                }
            }
            strDom += '/' + '>';
            return document.createElement(strDom);

        } else {
            var el = document.createElement(tag);
            this.sn(el, domAttributes, styleAttributes);
            if (innerHTML) {
                el.innerHTML = innerHTML;
            }
            return el;
        }
    },
   
   
   /**
    * Find the position of the given element. (This method is not available in IE 6)
    * @static
    * @param {Object} el Value to search
    * @param {Array} arr The array to search
    * @return {number} Element position, -1 if not found
    */
   indexOf: function(el,arr) {
      var l=arr.length,i;
      for(i = 0 ;i < l ; i++) {
         if(arr[i] == el) return i;
      }
      return -1;
   },

   
   /**
    * Create a new array without the null or undefined values
    * @static
    * @param {Array} arr The array to compact
    * @return {Array} The new array
    */
   compactArray: function(arr) {
      var n = [], l=arr.length,i;
      for(i = 0 ; i < l ; i++) {
         if( !lang.isNull(arr[i]) && !lang.isUndefined(arr[i]) ) {
            n.push(arr[i]);
         }
      }
      return n;
   },

	/**
	 * Return a string without accent (only on lowercase)
	 * @static
	 * @param {String} str The string
	 * @return {String} String without accent
	 */
	removeAccents: function (str) {
	   return str.replace(/[àáâãäå]/g,"a").
					  replace(/[èéêë]/g,"e").
					  replace(/[ìíîï]/g,"i").
					  replace(/[òóôõö]/g,"o").
					  replace(/[ùúûü]/g,"u").
					  replace(/[ýÿ]/g,"y").
					  replace(/[ñ]/g,"n").
					  replace(/[ç]/g,"c").
					  replace(/[œ]/g,"oe").
					  replace(/[æ]/g,"ae");
	}
   
});

})();


// The main inputEx namespace shortcut
YAHOO.inputEx = inputEx;
(function() {
   var Dom = YAHOO.util.Dom, lang = YAHOO.lang, util = YAHOO.util;

/** 
 * An abstract class (never instantiated) that contains the shared features for all fields.
 * @class inputEx.Field
 * @constructor
 * @param {Object} options Configuration object
 * <ul>
 *	  <li>name: the name of the field</li>
 *	  <li>required: boolean, the field cannot be null if true</li>
 *   <li>className: CSS class name for the div wrapper (default 'inputEx-Field')</li>
 *   <li>value: initial value</li>
 *   <li>parentEl: HTMLElement or String id, append the field to this DOM element</li>
 * </ul>
 */
inputEx.Field = function(options) {
	
	// Set the default values of the options
	this.setOptions(options || {});
	
	// Call the render of the dom
	this.render();
	
	/**
	 * Event fired after the user changed the value of the field.
	 * @event updatedEvt
	 * @param {Any} value The new value of the field
	 * @desc YAHOO custom event fired when the field is "updated"<br /> subscribe with: this.updatedEvt.subscribe(function(e, params) { var value = params[0]; console.log("updated",value, this.updatedEvt); }, this, true);
	 */
	this.updatedEvt = new util.CustomEvent('updated', this);
	
	// initialize behaviour events
	this.initEvents();
	
	// Set the initial value
	//   -> no initial value = no style (setClassFromState called by setValue)
	if(!lang.isUndefined(this.options.value)) {
		this.setValue(this.options.value, false);
	}
	
	// append it immediatly to the parent DOM element
	if(options.parentEl) {
	   if( lang.isString(options.parentEl) ) {
	     Dom.get(options.parentEl).appendChild(this.getEl());  
	   }
	   else {
	      options.parentEl.appendChild(this.getEl());
      }
	}
};


inputEx.Field.prototype = {
  
   /**
    * Set the default values of the options
    * @param {Object} options Options object as passed to the constructor
    */
	setOptions: function(options) {

   	/**
   	 * Configuration object to set the options for this class and the parent classes. See constructor details for options added by this class.
   	 */
   	this.options = {};
   	
   	// Basic options
   	this.options.name = options.name;
   	this.options.value = options.value;
   	this.options.id = options.id || Dom.generateId();
   	this.options.label = options.label;
   	this.options.description = options.description;
   
      // Define default messages
	   this.options.messages = {};
	   this.options.messages.required = (options.messages && options.messages.required) ? options.messages.required : inputEx.messages.required;
	   this.options.messages.invalid = (options.messages && options.messages.invalid) ? options.messages.invalid : inputEx.messages.invalid;
	   //this.options.messages.valid = (options.messages && options.messages.valid) ? options.messages.valid : inputEx.messages.valid;
	
	   // Other options
	   this.options.className = options.className ? options.className : 'inputEx-Field';
	   this.options.required = lang.isUndefined(options.required) ? false : options.required;
	   this.options.showMsg = lang.isUndefined(options.showMsg) ? false : options.showMsg;
	},

   /**
    * Default render of the dom element. Create a divEl that wraps the field.
    */
	render: function() {
	
	   // Create a DIV element to wrap the editing el and the image
	   this.divEl = inputEx.cn('div', {className: 'inputEx-fieldWrapper'});
	   if(this.options.id) {
	      this.divEl.id = this.options.id;
	   }
	   if(this.options.required) {
	      Dom.addClass(this.divEl, "inputEx-required");
	   }
	   
	   // Label element
	   if(this.options.label) {
	      this.labelDiv = inputEx.cn('div', {id: this.divEl.id+'-label', className: 'inputEx-label', 'for': this.divEl.id+'-field'});
	      this.labelEl = inputEx.cn('label');
	      this.labelEl.appendChild( document.createTextNode(this.options.label) );
	      this.labelDiv.appendChild(this.labelEl);
	      this.divEl.appendChild(this.labelDiv);
      }
      
      this.fieldContainer = inputEx.cn('div', {className: this.options.className}); // for wrapping the field and description
	
      // Render the component directly
      this.renderComponent();
      
      // Description
      if(this.options.description) {
         this.fieldContainer.appendChild(inputEx.cn('div', {id: this.divEl.id+'-desc', className: 'inputEx-description'}, null, this.options.description));
      }
      
   	this.divEl.appendChild(this.fieldContainer);
      
	   // Insert a float breaker
	   this.divEl.appendChild( inputEx.cn('div',null, {clear: 'both'}," ") );
	
	},
	
	/**
	 * Fire the "updated" event (only if the field validated)
	 * Escape the stack using a setTimeout
	 */
	fireUpdatedEvt: function() {
      // Uses setTimeout to escape the stack (that originiated in an event)
      var that = this;
      setTimeout(function() {
         that.updatedEvt.fire(that.getValue(), that);
      },50);
	},

   /**
    * Render the interface component into this.divEl
    */
	renderComponent: function() {
 	   // override me
	},

   /**
    * The default render creates a div to put in the messages
    * @return {HTMLElement} divEl The main DIV wrapper
    */
	getEl: function() {
	   return this.divEl;
	},

   /**
    * Initialize events of the Input
    */
	initEvents: function() {
 	   // override me
	},

   /**
    * Return the value of the input
    * @return {Any} value of the field
    */
	getValue: function() { 
	   // override me
	},

   /**
    * Function to set the value
    * @param {Any} value The new value
    * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
    */
	setValue: function(value, sendUpdatedEvt) {
	   // to be inherited
	   
	   // set corresponding style
	   this.setClassFromState();
	   
	   if(sendUpdatedEvt !== false) {
	      // fire update event
         this.fireUpdatedEvt();
      }
	},

   /**
    * Set the styles for valid/invalide state
    */
	setClassFromState: function() {
		var className;
	   // remove previous class
	   if( this.previousState ) {
	      // remove invalid className for both required and invalid fields
	      className = 'inputEx-'+((this.previousState == inputEx.stateRequired) ? inputEx.stateInvalid : this.previousState);
		   Dom.removeClass(this.divEl, className);
	   }
	   
	   // add new class
	   var state = this.getState();
	   if( !(state == inputEx.stateEmpty && Dom.hasClass(this.divEl, 'inputEx-focused') ) ) {
	      // add invalid className for both required and invalid fields
	      className = 'inputEx-'+((state == inputEx.stateRequired) ? inputEx.stateInvalid : state);
	      Dom.addClass(this.divEl, className );
      }
	
	   if(this.options.showMsg) {
	      this.displayMessage( this.getStateString(state) );
      }
	   
	   this.previousState = state;
	},

   /**
    * Get the string for the given state
    */
	getStateString: function(state) {
      if(state == inputEx.stateRequired) {
         return this.options.messages.required;
      }
      else if(state == inputEx.stateInvalid) {
         return this.options.messages.invalid;
      }
      else {
         return '';
      }
	},

   /**
    * Returns the current state (given its value)
    * @return {String} One of the following states: 'empty', 'required', 'valid' or 'invalid'
    */
	getState: function() { 
	   // if the field is empty :
	   if( this.isEmpty() ) {
	      return this.options.required ? inputEx.stateRequired : inputEx.stateEmpty;
	   }
	   return this.validate() ? inputEx.stateValid : inputEx.stateInvalid;
	},

   /**
    * Validation of the field
    * @return {Boolean} field validation status (true/false)
    */
	validate: function() {
      return true;
   },

   /**
    * Function called on the focus event
    * @param {Event} e The original 'focus' event
    */
	onFocus: function(e) {
	   var el = this.getEl();
	   Dom.removeClass(el, 'inputEx-empty');
	   Dom.addClass(el, 'inputEx-focused');
	},

   /**
    * Function called on the blur event
    * @param {Event} e The original 'blur' event
    */
	onBlur: function(e) {
	   Dom.removeClass(this.getEl(), 'inputEx-focused');
	   
	   // Call setClassFromState on Blur
	   this.setClassFromState();
	},

   /**
    * onChange event handler
    * @param {Event} e The original 'change' event
    */
	onChange: function(e) {
      this.fireUpdatedEvt();
	},

   /**
    * Close the field and eventually opened popups...
    */
	close: function() {
	},

   /**
    * Disable the field
    */
	disable: function() {
	},

   /**
    * Enable the field
    */
	enable: function() {
	},

   /**
    * Focus the field
    */
   focus: function() {
   },
   
   /**
    * Purge all event listeners and remove the component from the dom
    */
   destroy: function() {
      var el = this.getEl();
      
      // Unsubscribe all listeners on the updatedEvt
      this.updatedEvt.unsubscribeAll();
      
      // Purge element (remove listeners on el and childNodes recursively)
      util.Event.purgeElement(el, true);
      
      // Remove from DOM
      if(Dom.inDocument(el)) {
         el.parentNode.removeChild(el);
      }
      
   },
   
   /**
    * Update the message 
    * @param {String} msg Message to display
    */
   displayMessage: function(msg) {
      if(!this.fieldContainer) { return; }
      if(!this.msgEl) {
         this.msgEl = inputEx.cn('div', {className: 'inputEx-message'});
          try{
             var divElements = this.divEl.getElementsByTagName('div');
             this.divEl.insertBefore(this.msgEl, divElements[(divElements.length-1>=0)?divElements.length-1:0]); //insertBefore the clear:both div
          }catch(e){alert(e);}
      }
      this.msgEl.innerHTML = msg;
   },

   /**
    * Show the field
    */
   show: function() {
      this.divEl.style.display = '';
   },
   
   /**
    * Hide the field
    */
   hide: function() {
      this.divEl.style.display = 'none';
   },
   
   /**
    * Clear the field by setting the field value to this.options.value
    * @param {boolean} [sendUpdatedEvt] (optional) Wether this clear should fire the updatedEvt or not (default is true, pass false to NOT send the event)
    */
   clear: function(sendUpdatedEvt) {
      this.setValue(lang.isUndefined(this.options.value) ? '' : this.options.value, sendUpdatedEvt);
   },
   
   /**
    * Should return true if empty
    */
   isEmpty: function() {
      return this.getValue() === '';
   },

	/**
	 * Set the parentField.
	 * Generally use by composable fields (ie. Group,Form,ListField,CombineField,...}
	 * @param {inputEx.Group|inputEx.Form|inputEx.ListField|inputEx.CombineField} parentField The parent field instance
	 */
	setParentField: function(parentField) {
		this.parentField = parentField;
	},
	
	/**
	 * Return the parent field instance
	 * @return {inputEx.Group|inputEx.Form|inputEx.ListField|inputEx.CombineField}
	 */
	getParentField: function() {
		return this.parentField;
	}
   
};

inputEx.Field.groupOptions = [
   { type: "string", label: "Label", name: "label", value: '' },
   { type: "string", label: "Name", name: "name", value: '' },
   { type: "string", label: "Description",name: "description", value: '' },
   { type: "boolean", label: "Required?",name: "required", value: false },
   { type: "boolean", label: "Show messages",name: "showMsg", value: false }
];

})();(function() {

   var lang = YAHOO.lang;

/**
 * Copy of the original inputEx.Field class that we're gonna override to extend it.
 * @class BaseField
 * @namespace inputEx
 */
inputEx.BaseField = inputEx.Field;

/**
 * Class to make inputEx Fields "wirable".Re-create inputEx.Field adding the wirable properties
 * @class Field
 * @namespace inputEx
 * @extends inputEx.BaseField
 */
inputEx.Field = function(options) {
   inputEx.Field.superclass.constructor.call(this,options);
};

lang.extend(inputEx.Field, inputEx.BaseField, {

   /**
    * Adds a wirable option to every field
    * @method setOptions
    */
   setOptions: function(options) {
      inputEx.Field.superclass.setOptions.call(this, options);
      
      this.options.wirable = lang.isUndefined(options.wirable) ? false : options.wirable;
      this.options.container = options.container;
      options.container = null;
   },
   
   /**
    * Adds a terminal to each field
    * @method render
    */
   render: function() {
      inputEx.Field.superclass.render.call(this);
      
      if(this.options.wirable) {
         this.renderTerminal();
      }
   },
   
   /**
    * Render the associated input terminal
    * @method renderTerminal
    */
   renderTerminal: function() {

      var wrapper = inputEx.cn('div', {className: 'WireIt-InputExTerminal'});
      this.divEl.insertBefore(wrapper, this.fieldContainer);

      this.terminal = new WireIt.Terminal(wrapper, {
         name: this.options.name, 
         direction: [-1,0],
         fakeDirection: [0, 1],
         ddConfig: {
            type: "input",
            allowedTypes: ["output"]
         },
      nMaxWires: 1 }, this.options.container);

      // Dfly name for this terminal
      this.terminal.dflyName = "input_"+this.options.name;

      // Reference to the container
      if(this.options.container) {
         this.options.container.terminals.push(this.terminal);
      }

      // Register the events
      this.terminal.eventAddWire.subscribe(this.onAddWire, this, true);
      this.terminal.eventRemoveWire.subscribe(this.onRemoveWire, this, true);
    },

    /**
     * Remove the input wired state on the 
     * @method onAddWire
     */
    onAddWire: function(e, params) {
       this.options.container.onAddWire(e,params);

       this.disable();
       this.el.value = "[wired]";
    },

    /**
     * Remove the input wired state on the 
     * @method onRemoveWire
     */
    onRemoveWire: function(e, params) { 
       this.options.container.onRemoveWire(e,params);

       this.enable();
       this.el.value = "";
    }

});


})();/**
 * Include the form library inputEx + WirableField + FormContainer
 *
 * WARNING: This file should be placed between "inputEx/field.js" and all other inputEx fields
 *
 * See the inputEx website for documentation of the fields & forms: http://neyric.github.com/inputex
 *
 * @module inputex-plugin
 */
/**
 * Class used to build a container with inputEx forms
 * @class FormContainer
 * @namespace WireIt
 * @extends WireIt.Container
 * @constructor
 * @param {Object}   options  Configuration object (see properties)
 * @param {WireIt.Layer}   layer The WireIt.Layer (or subclass) instance that contains this container
 */
WireIt.FormContainer = function(options, layer) {
   WireIt.FormContainer.superclass.constructor.call(this, options, layer);
};

YAHOO.lang.extend(WireIt.FormContainer, WireIt.Container, {
	   
   /**
    * @method setOptions
    */
   setOptions: function(options) {
      WireIt.FormContainer.superclass.setOptions.call(this, options);
   },
   
   /**
    * The render method is overrided to call renderForm
    * @method render
    */
   render: function() {
      WireIt.FormContainer.superclass.render.call(this);
      this.renderForm();
   },
   
   /**
    * Render the form
    * @method renderForm
    */
   renderForm: function() {
	  this.setBackReferenceOnFieldOptionsRecursively(this.options.fields);
      
      var groupParams = {parentEl: this.bodyEl, fields: this.options.fields, legend: this.options.legend, collapsible: this.options.collapsible};
      this.form = new YAHOO.inputEx.Group(groupParams);
   },
   
	/**
	 * When creating wirable input fields, the field configuration must have a reference to the current container (this is used for positionning).
	 * For complex fields (like object or list), the reference is set recursively AFTER the field creation.
	 * @method setBackReferenceOnFieldOptionsRecursively
	 */
   setBackReferenceOnFieldOptionsRecursively: function(fieldArray, container) {
       if (YAHOO.lang.isUndefined(container))
			container = this;
	
      for(var i = 0 ; i < fieldArray.length ; i++) {
    	  var inputParams = fieldArray[i];
    	  inputParams.container = container;

    	  // Checking for group sub elements
    	  if(inputParams.fields && typeof inputParams.fields == 'object') {
    		  this.setBackReferenceOnFieldOptionsRecursively(inputParams.fields);
    	  }

    	  // Checking for list sub elements
    	  if(inputParams.elementType) {
    		  inputParams.elementType.container = container;

    		  // Checking for group elements within list elements
    		  if(inputParams.elementType.fields && typeof inputParams.elementType.fields == 'object') {
    			  this.setBackReferenceOnFieldOptionsRecursively(inputParams.elementType.fields);
    		  }
    	  }
      }
   },
   
   /**
    * @method getValue
    */
   getValue: function() {
      return this.form.getValue();
   },
   
   /**
    * @method setValue
    */
   setValue: function(val) {
      this.form.setValue(val);
   }
   
});
(function() {
   
   var lang = YAHOO.lang, Dom = YAHOO.util.Dom, Event = YAHOO.util.Event;
   
/**
 * Handle a group of fields
 * @class inputEx.Group
 * @extends inputEx.Field
 * @constructor
 * @param {Object} options The following options are added for Groups and subclasses:
 * <ul>
 *   <li>fields: Array of input fields declared like { label: 'Enter the value:' , type: 'text' or fieldClass: inputEx.Field, optional: true/false, ... }</li>
 *   <li>legend: The legend for the fieldset (default is an empty string)</li>
 *   <li>collapsible: Boolean to make the group collapsible (default is false)</li>
 *   <li>collapsed: If collapsible only, will be collapsed at creation (default is false)</li>
 *   <li>flatten:</li>
 * </ul>
 */
inputEx.Group = function(options) {
   inputEx.Group.superclass.constructor.call(this,options);
   
   // Run default field interactions (if setValue has not been called before)
   if(!this.options.value) {
      this.runFieldsInteractions();
   }
};
lang.extend(inputEx.Group, inputEx.Field, {
   
   /**
    * Adds some options: legend, collapsible, fields...
    * @param {Object} options Options object as passed to the constructor
    */
   setOptions: function(options) {
      
      inputEx.Group.superclass.setOptions.call(this, options);
         	
   	this.options.className = options.className || 'inputEx-Group';
   	
   	this.options.fields = options.fields;
   	
   	this.options.flatten = options.flatten;
   
      this.options.legend = options.legend || '';
   
      this.options.collapsible = lang.isUndefined(options.collapsible) ? false : options.collapsible;
      this.options.collapsed = lang.isUndefined(options.collapsed) ? false : options.collapsed;
      
      this.options.disabled = lang.isUndefined(options.disabled) ? false : options.disabled;
      
      // Array containing the list of the field instances
      this.inputs = [];

      // Associative array containing the field instances by names
      this.inputsNames = {};
   },

   /**
    * Render the group
    */
   render: function() {
   
      // Create the div wrapper for this group
	   this.divEl = inputEx.cn('div', {className: this.options.className});
	   if(this.options.id) {
   	   this.divEl.id = this.options.id;
   	}
  	   
  	   this.renderFields(this.divEl);
  	   
  	   if(this.options.disabled) {
  	      this.disable();
  	   }
   },
   
   /**
    * Render all the fields.
    * We use the parentEl so that inputEx.Form can append them to the FORM tag
    */
   renderFields: function(parentEl) {
      
      this.fieldset = inputEx.cn('fieldset');
      this.legend = inputEx.cn('legend', {className: 'inputEx-Group-legend'});
   
      // Option Collapsible
      if(this.options.collapsible) {
         var collapseImg = inputEx.cn('div', {className: 'inputEx-Group-collapseImg'}, null, ' ');
         this.legend.appendChild(collapseImg);
         inputEx.sn(this.fieldset,{className:'inputEx-Expanded'});
      }
   
      if(!lang.isUndefined(this.options.legend) && this.options.legend !== ''){
         this.legend.appendChild( inputEx.cn("span", null, null, " "+this.options.legend) );
      }
   
      if( this.options.collapsible || (!lang.isUndefined(this.options.legend) && this.options.legend !== '') ) {
         this.fieldset.appendChild(this.legend);
      }
  	   
      // Iterate this.createInput on input fields
      for (var i = 0 ; i < this.options.fields.length ; i++) {
         var input = this.options.fields[i];
        
			// Throw Error if input is undefined
			if(!input) {
				throw new Error("inputEx.Form: One of the provided fields is undefined ! (check trailing comma)");
			}
			
         // Render the field
         var field = this.renderField(input);
         this.fieldset.appendChild(field.getEl() );
  	   }
  	
  	   // Collapsed at creation ?
  	   if(this.options.collapsed) {
  	      this.toggleCollapse();
  	   }
  	
  	   // Append the fieldset
  	   parentEl.appendChild(this.fieldset);
   },
  
   /**
    * Instanciate one field given its parameters, type or fieldClass
    * @param {Object} fieldOptions The field properties as required by the inputEx() method
    */
   renderField: function(fieldOptions) {

      // Instanciate the field
      var fieldInstance = inputEx(fieldOptions,this);
      
	   this.inputs.push(fieldInstance);
      
      // Create an index to access fields by their name
      if(fieldInstance.options.name) {
         this.inputsNames[fieldInstance.options.name] = fieldInstance;
      }
      
      // Create the this.hasInteractions to run interactions at startup
      if(!this.hasInteractions && fieldOptions.interactions) {
         this.hasInteractions = true;
      }
      
	   // Subscribe to the field "updated" event to send the group "updated" event
      fieldInstance.updatedEvt.subscribe(this.onChange, this, true);
   	  
      return fieldInstance;
   },
  
   /**
    * Add a listener for the 'collapsible' option
    */
   initEvents: function() {
      if(this.options.collapsible) {
         Event.addListener(this.legend, "click", this.toggleCollapse, this, true);
      }
   },

   /**
    * Toggle the collapse state
    */
   toggleCollapse: function() {
      if(Dom.hasClass(this.fieldset, 'inputEx-Expanded')) {
         Dom.replaceClass(this.fieldset, 'inputEx-Expanded', 'inputEx-Collapsed');
      }
      else {
         Dom.replaceClass(this.fieldset, 'inputEx-Collapsed','inputEx-Expanded');
      }
   },
   
   /**
    * Validate each field
    * @returns {Boolean} true if all fields validate and required fields are not empty
    */
   validate: function() {
      var response = true;
      
      // Validate all the sub fields
      for (var i = 0 ; i < this.inputs.length ; i++) {
   	   var input = this.inputs[i];
   	   input.setClassFromState(); // update field classes (mark invalid fields...)
   	   var state = input.getState();
   	   if( state == inputEx.stateRequired || state == inputEx.stateInvalid ) {
   		   response = false; // but keep looping on fields to set classes
   	   }
      }
      return response;
   },
	
	/**
	 * Alternative method to validate for advanced error handling
	 * @returns {Object} with all Forms's fields state, error message
	 * and validate containing a boolean for the global Form validation
	 */
	getFieldsStates: function() {
		var input, inputName, state, message,
		returnedObj = { fields:{}, validate:true };
      
      // Loop on all the sub fields
      for (var i = 0 ; i < this.inputs.length ; i++) {
	
   	   input = this.inputs[i];
			inputName = input.options.name;
   	   state = input.getState();
			message = input.getStateString(state);
						
			returnedObj.fields[inputName] = {};
			returnedObj.fields[inputName].valid = true;
			returnedObj.fields[inputName].message = message;
			
			// check if subfield validates
   	   if( state == inputEx.stateRequired || state == inputEx.stateInvalid ) {
				returnedObj.fields[inputName].valid = false;
				returnedObj.validate = false;
   	   }

      }

      return returnedObj;
	},
   
   /**
    * Enable all fields in the group
    */
   enable: function() {
 	   for (var i = 0 ; i < this.inputs.length ; i++) {
 	      this.inputs[i].enable();
      }
   },
   
   /**
    * Disable all fields in the group
    */
   disable: function() {
 	   for (var i = 0 ; i < this.inputs.length ; i++) {
 	      this.inputs[i].disable();
      }
   },
   
   /**
    * Set the values of each field from a key/value hash object
     * @param {Any} value The group value
     * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
    */
   setValue: function(oValues, sendUpdatedEvt) {
      if(!oValues) {
         return;
      }
	   for (var i = 0 ; i < this.inputs.length ; i++) {
	      var field = this.inputs[i];
	      var name = field.options.name;
	      if(name && !lang.isUndefined(oValues[name]) ) {
	         field.setValue(oValues[name], false); // don't fire the updated event !
	      }
	      else {
	         field.clear(false);
	      }
      }
      
      this.runFieldsInteractions();
      
	   if(sendUpdatedEvt !== false) {
	      // fire update event
         this.fireUpdatedEvt();
      }
   },
   
   /**
    * Return an object with all the values of the fields
    */
   getValue: function() {
	   var o = {};
	   for (var i = 0 ; i < this.inputs.length ; i++) {
	      var v = this.inputs[i].getValue();
	      if(this.inputs[i].options.name) {
	         if(this.inputs[i].options.flatten && lang.isObject(v) ) {
	            lang.augmentObject( o, v);
	         }
	         else {
		         o[this.inputs[i].options.name] = v;
	         }
	      }
      }
	   return o;
   },
  
   /**
    * Close the group (recursively calls "close" on each field, does NOT hide the group )
    * Call this function before hidding the group to close any field popup
    */
   close: function() {
      for (var i = 0 ; i < this.inputs.length ; i++) {
 	      this.inputs[i].close();
      }
   },

   /**
    * Set the focus to the first input in the group
    */
   focus: function() {
      if( this.inputs.length > 0 ) {
         this.inputs[0].focus();
      }
   },

   /**
    * Return the sub-field instance by its name property
    * @param {String} fieldName The name property
    */
   getFieldByName: function(fieldName) {
      if( !this.inputsNames.hasOwnProperty(fieldName) ) {
         return null;
      }
      return this.inputsNames[fieldName];
   },
   
   
   /**
    * Called when one of the group subfields is updated.
    * @param {String} eventName Event name
    * @param {Array} args Array of [fieldValue, fieldInstance] 
    */
   onChange: function(eventName, args) {

      // Run interactions
      var fieldValue = args[0];
      var fieldInstance = args[1];
      this.runInteractions(fieldInstance,fieldValue);
      
      //this.setClassFromState();
      
      this.fireUpdatedEvt();
   },

   /**
    * Run an action (for interactions)
    * @param {Object} action inputEx action object
    * @param {Any} triggerValue The value that triggered the interaction
    */
   runAction: function(action, triggerValue) {
      var field = this.getFieldByName(action.name);
      if( YAHOO.lang.isFunction(field[action.action]) ) {
         field[action.action].call(field);
      }
      else if( YAHOO.lang.isFunction(action.action) ) {
         action.action.call(field, triggerValue);
      }
      else {
         throw new Error("action "+action.action+" is not a valid action for field "+action.name);
      }
   },
   
   /**
    * Run the interactions for the given field instance
    * @param {inputEx.Field} fieldInstance Field that just changed
    * @param {Any} fieldValue Field value
    */
   runInteractions: function(fieldInstance,fieldValue) {
      
      var index = inputEx.indexOf(fieldInstance, this.inputs);
      var fieldConfig = this.options.fields[index];
      if( YAHOO.lang.isUndefined(fieldConfig.interactions) ) return;
      
      // Let's run the interactions !
      var interactions = fieldConfig.interactions;
      for(var i = 0 ; i < interactions.length ; i++) {
         var interaction = interactions[i];
         if(interaction.valueTrigger === fieldValue) {
            for(var j = 0 ; j < interaction.actions.length ; j++) {
               this.runAction(interaction.actions[j], fieldValue);
            }
         }
      }
      
   },
   
   /**
    * Run the interactions for all fields
    */
   runFieldsInteractions: function() {
      if(this.hasInteractions) {
         for(var i = 0 ; i < this.inputs.length ; i++) {
            this.runInteractions(this.inputs[i],this.inputs[i].getValue());
         }
      }
   },
   
	/**
	 * Clear all subfields
	 * @param {boolean} [sendUpdatedEvt] (optional) Wether this clear should fire the updatedEvt or not (default is true, pass false to NOT send the event)
	 */
	clear: function(sendUpdatedEvt) {
	   for(var i = 0 ; i < this.inputs.length ; i++) {
	      this.inputs[i].clear(false);
	   }
	   if(sendUpdatedEvt !== false) {
	      // fire update event
         this.fireUpdatedEvt();
      }
	},
	
	/**
	 * Write error messages for fields as specified in the hash
	 * @param {Object || Array} errors Hash object containing error messages as Strings referenced by the field name, or array [ ["fieldName", "Message"], ...]
	 */
	setErrors: function(errors) {	
		var i,k;
		if(YAHOO.lang.isArray(errors)) {
			for(i = 0 ; i < errors.length ; i++) {
				k = errors[i][0];
				value = errors[i][1];
				if(this.inputsNames[k]) {
					if(this.inputsNames[k].options.showMsg) {
						this.inputsNames[k].displayMessage(value);
						Dom.replaceClass(this.inputsNames[k].divEl, "inputEx-valid", "inputEx-invalid" );
					}
				}
			}
		}
		else if(YAHOO.lang.isObject(errors)) {
			for(k in errors) {
				if(errors.hasOwnProperty(k)) {
					if(this.inputsNames[k]) {
						if(this.inputsNames[k].options.showMsg) {
							this.inputsNames[k].displayMessage(errors[k]);
							Dom.replaceClass(this.inputsNames[k].divEl, "inputEx-valid", "inputEx-invalid" );
						}
					}
				}
			}
		}
	},

   
   /**
    * Purge all event listeners and remove the component from the dom
    */
   destroy: function() {
      
      var i, length, field;
      
      // Recursively destroy inputs
      for (i = 0, length = this.inputs.length ; i < length ; i++) {
         field = this.inputs[i];
         field.destroy();
      }
      
      // Destroy group itself
      inputEx.Group.superclass.destroy.call(this);
      
   }
   
   
});

   
// Register this class as "group" type
inputEx.registerType("group", inputEx.Group, [
   { type: "string", label: "Name", name: "name", value: '' },
   { type: 'string', label: 'Legend', name:'legend'},
   { type: 'boolean', label: 'Collapsible', name:'collapsible', value: false},
   { type: 'boolean', label: 'Collapsed', name:'collapsed', value: false},
   { type: 'list', label: 'Fields', name: 'fields', elementType: {type: 'type' } }
], true);


})();(function() {

   var lang = YAHOO.lang, Event = YAHOO.util.Event, Dom = YAHOO.util.Dom;

/**
 * Basic string field (equivalent to the input type "text")
 * @class inputEx.StringField
 * @extends inputEx.Field
 * @constructor
 * @param {Object} options Added options:
 * <ul>
 *	  <li>regexp: regular expression used to validate (otherwise it always validate)</li>
 *   <li>size: size attribute of the input</li>
 *   <li>maxLength: maximum size of the string field (no message display, uses the maxlength html attribute)</li>
 *   <li>minLength: minimum size of the string field (will display an error message if shorter)</li>
 *   <li>typeInvite: string displayed when the field is empty</li>
 *   <li>readonly: set the field as readonly</li>
 * </ul>
 */
inputEx.StringField = function(options) {
   inputEx.StringField.superclass.constructor.call(this, options);

	  if(this.options.typeInvite) {
	     this.updateTypeInvite();
	  }
};

lang.extend(inputEx.StringField, inputEx.Field, {
   /**
    * Set the default values of the options
    * @param {Object} options Options object as passed to the constructor
    */
	setOptions: function(options) {
	   inputEx.StringField.superclass.setOptions.call(this, options);

	   this.options.regexp = options.regexp;
	   this.options.size = options.size;
	   this.options.maxLength = options.maxLength;
	   this.options.minLength = options.minLength;
	   this.options.typeInvite = options.typeInvite;
	   this.options.readonly = options.readonly;
	   this.options.autocomplete = (options.autocomplete === false || options.autocomplete === "off") ? false : true;
	   this.options.trim = (options.trim === true) ? true : false;
   },


   /**
    * Render an 'INPUT' DOM node
    */
   renderComponent: function() {

      // This element wraps the input node in a float: none div
      this.wrapEl = inputEx.cn('div', {className: 'inputEx-StringField-wrapper'});

      // Attributes of the input field
      var attributes = {};
      attributes.type = 'text';
      attributes.id = this.divEl.id?this.divEl.id+'-field':YAHOO.util.Dom.generateId();
      if(this.options.size) { attributes.size = this.options.size; }
      if(this.options.name) { attributes.name = this.options.name; }
      if(this.options.readonly) { attributes.readonly = 'readonly'; }

      if(this.options.maxLength) { attributes.maxLength = this.options.maxLength; }
      if(!this.options.autocomplete) { attributes.autocomplete = 'off'; }

      // Create the node
      this.el = inputEx.cn('input', attributes);

      // Append it to the main element
      this.wrapEl.appendChild(this.el);
      this.fieldContainer.appendChild(this.wrapEl);
   },

   /**
    * Register the change, focus and blur events
    */
   initEvents: function() {
	   Event.addListener(this.el, "change", this.onChange, this, true);

       if (YAHOO.env.ua.ie){ // refer to inputEx-95
            var field = this.el;
            new YAHOO.util.KeyListener(this.el, {keys:[13]}, {fn:function(){
                field.blur();
                field.focus();
            }}).enable();
       }

	   Event.addFocusListener(this.el, this.onFocus, this, true);
		Event.addBlurListener(this.el, this.onBlur, this, true);
	   Event.addListener(this.el, "keypress", this.onKeyPress, this, true);
	   Event.addListener(this.el, "keyup", this.onKeyUp, this, true);
   },

   /**
    * Return the string value
    * @param {String} The string value
    */
   getValue: function() {
      
      var value;
      
      value = (this.options.typeInvite && this.el.value == this.options.typeInvite) ? '' : this.el.value;
      
      if (this.options.trim) {
         value = YAHOO.lang.trim(value);
      }
      
	   return value;
   },

   /**
    * Function to set the value
    * @param {String} value The new value
    * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
    */
   setValue: function(value, sendUpdatedEvt) {
		// + check : if Null or Undefined we put '' in the stringField
		this.el.value = ( lang.isNull(value) || lang.isUndefined(value) ) ? '' : value;

      // call parent class method to set style and fire updatedEvt
      inputEx.StringField.superclass.setValue.call(this, value, sendUpdatedEvt);
   },

   /**
    * Uses the optional regexp to validate the field value
    */
   validate: function() {
      var val = this.getValue();

      // empty field
      if (val === '') {
         // validate only if not required
         return !this.options.required;
      }

      // Check regex matching and minLength (both used in password field...)
      var result = true;

      // if we are using a regular expression
      if( this.options.regexp ) {
	      result = result && val.match(this.options.regexp);
      }
      if( this.options.minLength ) {
	      result = result && val.length >= this.options.minLength;
      }
      return result;
   },

   /**
    * Disable the field
    */
   disable: function() {
      this.el.disabled = true;
   },

   /**
    * Enable the field
    */
   enable: function() {
      this.el.disabled = false;
   },

   /**
    * Set the focus to this field
    */
   focus: function() {
      // Can't use lang.isFunction because IE >= 6 would say focus is not a function (IE says it's an object) !!
      if(!!this.el && !lang.isUndefined(this.el.focus) ) {
         this.el.focus();
      }
   },

	/**
    * Add the minLength string message handling
    */
	getStateString: function(state) {
	   if(state == inputEx.stateInvalid && this.options.minLength && this.el.value.length < this.options.minLength) {
	      return inputEx.messages.stringTooShort[0]+this.options.minLength+inputEx.messages.stringTooShort[1];
      }
	   return inputEx.StringField.superclass.getStateString.call(this, state);
	},

   /**
    * Display the type invite after setting the class
    */
   setClassFromState: function() {
	   inputEx.StringField.superclass.setClassFromState.call(this);

	   // display/mask typeInvite
	   if(this.options.typeInvite) {
	      this.updateTypeInvite();
      }
	},

	updateTypeInvite: function() {

	   // field not focused
      if (!Dom.hasClass(this.divEl, "inputEx-focused")) {

         // show type invite if field is empty
         if(this.isEmpty()) {
	         Dom.addClass(this.divEl, "inputEx-typeInvite");
	         this.el.value = this.options.typeInvite;

	      // important for setValue to work with typeInvite
         } else {
            Dom.removeClass(this.divEl, "inputEx-typeInvite");
         }

      // field focused : remove type invite
      } else {
	      if(Dom.hasClass(this.divEl,"inputEx-typeInvite")) {
	         // remove text
	         this.el.value = "";

	         // remove the "empty" state and class
	         this.previousState = null;
	         Dom.removeClass(this.divEl,"inputEx-typeInvite");
         }
      }
	},

	/**
	 * Clear the typeInvite when the field gains focus
	 */
	onFocus: function(e) {
	   inputEx.StringField.superclass.onFocus.call(this,e);

	   if(this.options.typeInvite) {
         this.updateTypeInvite();
      }
	},

	onKeyPress: function(e) {
	   // override me
	},

   onKeyUp: function(e) {
      // override me
      //
      //   example :
      //
      //   lang.later(0, this, this.setClassFromState);
      //
      //     -> Set style immediatly when typing in the field
      //     -> Call setClassFromState escaping the stack (after the event has been fully treated, because the value has to be updated)
   }

});


inputEx.messages.stringTooShort = ["This field should contain at least "," numbers or characters"];

// Register this class as "string" type
inputEx.registerType("string", inputEx.StringField, [
    { type: 'string', label: 'Type invite', name: 'typeInvite', value: ''},
    { type: 'integer', label: 'Size', name: 'size', value: 20},
    { type: 'integer', label: 'Min. length', name: 'minLength', value: 0}
]);

})();
(function() {

   var lang = YAHOO.lang, Event = YAHOO.util.Event, Dom = YAHOO.util.Dom;

/**
 * Basic string field (equivalent to the input type "text")
 * @class inputEx.StringField
 * @extends inputEx.Field
 * @constructor
 * @param {Object} options Added options:
 * <ul>
 *	  <li>regexp: regular expression used to validate (otherwise it always validate)</li>
 *   <li>size: size attribute of the input</li>
 *   <li>maxLength: maximum size of the string field (no message display, uses the maxlength html attribute)</li>
 *   <li>minLength: minimum size of the string field (will display an error message if shorter)</li>
 *   <li>typeInvite: string displayed when the field is empty</li>
 *   <li>readonly: set the field as readonly</li>
 * </ul>
 */
inputEx.StringField = function(options) {
   inputEx.StringField.superclass.constructor.call(this, options);

	  if(this.options.typeInvite) {
	     this.updateTypeInvite();
	  }
};

lang.extend(inputEx.StringField, inputEx.Field, {
   /**
    * Set the default values of the options
    * @param {Object} options Options object as passed to the constructor
    */
	setOptions: function(options) {
	   inputEx.StringField.superclass.setOptions.call(this, options);

	   this.options.regexp = options.regexp;
	   this.options.size = options.size;
	   this.options.maxLength = options.maxLength;
	   this.options.minLength = options.minLength;
	   this.options.typeInvite = options.typeInvite;
	   this.options.readonly = options.readonly;
	   this.options.autocomplete = (options.autocomplete === false || options.autocomplete === "off") ? false : true;
	   this.options.trim = (options.trim === true) ? true : false;
   },


   /**
    * Render an 'INPUT' DOM node
    */
   renderComponent: function() {

      // This element wraps the input node in a float: none div
      this.wrapEl = inputEx.cn('div', {className: 'inputEx-StringField-wrapper'});

      // Attributes of the input field
      var attributes = {};
      attributes.type = 'text';
      attributes.id = this.divEl.id?this.divEl.id+'-field':YAHOO.util.Dom.generateId();
      if(this.options.size) { attributes.size = this.options.size; }
      if(this.options.name) { attributes.name = this.options.name; }
      if(this.options.readonly) { attributes.readonly = 'readonly'; }

      if(this.options.maxLength) { attributes.maxLength = this.options.maxLength; }
      if(!this.options.autocomplete) { attributes.autocomplete = 'off'; }

      // Create the node
      this.el = inputEx.cn('input', attributes);

      // Append it to the main element
      this.wrapEl.appendChild(this.el);
      this.fieldContainer.appendChild(this.wrapEl);
   },

   /**
    * Register the change, focus and blur events
    */
   initEvents: function() {
	   Event.addListener(this.el, "change", this.onChange, this, true);

       if (YAHOO.env.ua.ie){ // refer to inputEx-95
            var field = this.el;
            new YAHOO.util.KeyListener(this.el, {keys:[13]}, {fn:function(){
                field.blur();
                field.focus();
            }}).enable();
       }

	   Event.addFocusListener(this.el, this.onFocus, this, true);
		Event.addBlurListener(this.el, this.onBlur, this, true);
	   Event.addListener(this.el, "keypress", this.onKeyPress, this, true);
	   Event.addListener(this.el, "keyup", this.onKeyUp, this, true);
   },

   /**
    * Return the string value
    * @param {String} The string value
    */
   getValue: function() {
      
      var value;
      
      value = (this.options.typeInvite && this.el.value == this.options.typeInvite) ? '' : this.el.value;
      
      if (this.options.trim) {
         value = YAHOO.lang.trim(value);
      }
      
	   return value;
   },

   /**
    * Function to set the value
    * @param {String} value The new value
    * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
    */
   setValue: function(value, sendUpdatedEvt) {
		// + check : if Null or Undefined we put '' in the stringField
		this.el.value = ( lang.isNull(value) || lang.isUndefined(value) ) ? '' : value;

      // call parent class method to set style and fire updatedEvt
      inputEx.StringField.superclass.setValue.call(this, value, sendUpdatedEvt);
   },

   /**
    * Uses the optional regexp to validate the field value
    */
   validate: function() {
      var val = this.getValue();

      // empty field
      if (val === '') {
         // validate only if not required
         return !this.options.required;
      }

      // Check regex matching and minLength (both used in password field...)
      var result = true;

      // if we are using a regular expression
      if( this.options.regexp ) {
	      result = result && val.match(this.options.regexp);
      }
      if( this.options.minLength ) {
	      result = result && val.length >= this.options.minLength;
      }
      return result;
   },

   /**
    * Disable the field
    */
   disable: function() {
      this.el.disabled = true;
   },

   /**
    * Enable the field
    */
   enable: function() {
      this.el.disabled = false;
   },

   /**
    * Set the focus to this field
    */
   focus: function() {
      // Can't use lang.isFunction because IE >= 6 would say focus is not a function (IE says it's an object) !!
      if(!!this.el && !lang.isUndefined(this.el.focus) ) {
         this.el.focus();
      }
   },

	/**
    * Add the minLength string message handling
    */
	getStateString: function(state) {
	   if(state == inputEx.stateInvalid && this.options.minLength && this.el.value.length < this.options.minLength) {
	      return inputEx.messages.stringTooShort[0]+this.options.minLength+inputEx.messages.stringTooShort[1];
      }
	   return inputEx.StringField.superclass.getStateString.call(this, state);
	},

   /**
    * Display the type invite after setting the class
    */
   setClassFromState: function() {
	   inputEx.StringField.superclass.setClassFromState.call(this);

	   // display/mask typeInvite
	   if(this.options.typeInvite) {
	      this.updateTypeInvite();
      }
	},

	updateTypeInvite: function() {

	   // field not focused
      if (!Dom.hasClass(this.divEl, "inputEx-focused")) {

         // show type invite if field is empty
         if(this.isEmpty()) {
	         Dom.addClass(this.divEl, "inputEx-typeInvite");
	         this.el.value = this.options.typeInvite;

	      // important for setValue to work with typeInvite
         } else {
            Dom.removeClass(this.divEl, "inputEx-typeInvite");
         }

      // field focused : remove type invite
      } else {
	      if(Dom.hasClass(this.divEl,"inputEx-typeInvite")) {
	         // remove text
	         this.el.value = "";

	         // remove the "empty" state and class
	         this.previousState = null;
	         Dom.removeClass(this.divEl,"inputEx-typeInvite");
         }
      }
	},

	/**
	 * Clear the typeInvite when the field gains focus
	 */
	onFocus: function(e) {
	   inputEx.StringField.superclass.onFocus.call(this,e);

	   if(this.options.typeInvite) {
         this.updateTypeInvite();
      }
	},

	onKeyPress: function(e) {
	   // override me
	},

   onKeyUp: function(e) {
      // override me
      //
      //   example :
      //
      //   lang.later(0, this, this.setClassFromState);
      //
      //     -> Set style immediatly when typing in the field
      //     -> Call setClassFromState escaping the stack (after the event has been fully treated, because the value has to be updated)
   }

});


inputEx.messages.stringTooShort = ["This field should contain at least "," numbers or characters"];

// Register this class as "string" type
inputEx.registerType("string", inputEx.StringField, [
    { type: 'string', label: 'Type invite', name: 'typeInvite', value: ''},
    { type: 'integer', label: 'Size', name: 'size', value: 20},
    { type: 'integer', label: 'Min. length', name: 'minLength', value: 0}
]);

})();
(function() {

   var Event = YAHOO.util.Event, lang = YAHOO.lang;

/**
 * Create a select field
 * @class inputEx.SelectField
 * @extends inputEx.Field
 * @constructor
 * @param {Object} options Added options:
 * <ul>
 *	   <li>selectValues: contains the list of options values</li>
 *	   <li>selectOptions: list of option element texts</li>
 *    <li>multiple: boolean to allow multiple selections</li>
 * </ul>
 */
inputEx.SelectField = function(options) {
	inputEx.SelectField.superclass.constructor.call(this,options);
 };
lang.extend(inputEx.SelectField, inputEx.Field, {
   /**
    * Set the default values of the options
    * @param {Object} options Options object as passed to the constructor
    */
	setOptions: function(options) {
	   inputEx.SelectField.superclass.setOptions.call(this,options);
	   
	   this.options.multiple = lang.isUndefined(options.multiple) ? false : options.multiple;
	   this.options.selectValues = [];
	   this.options.selectOptions = [];
	   
	   for (var i=0, length=options.selectValues.length; i<length; i++) {
	      
	      this.options.selectValues.push(options.selectValues[i]);
	      // ""+  hack to convert into text (values may be 0 for example)
	      this.options.selectOptions.push(""+((options.selectOptions && !lang.isUndefined(options.selectOptions[i])) ? options.selectOptions[i] : options.selectValues[i]));
	      
      }
      
   },
   
   /**
    * Build a select tag with options
    */
   renderComponent: function() {

      this.el = inputEx.cn('select', {id: this.divEl.id?this.divEl.id+'-field':YAHOO.util.Dom.generateId(), name: this.options.name || ''});
      
      if (this.options.multiple) {this.el.multiple = true; this.el.size = this.options.selectValues.length;}
      
      this.optionEls = [];
      
      var optionEl;
      for( var i = 0 ; i < this.options.selectValues.length ; i++) {
         
         optionEl = inputEx.cn('option', {value: this.options.selectValues[i]}, null, this.options.selectOptions[i]);
         
         this.optionEls.push(optionEl);
         this.el.appendChild(optionEl);
      }
      this.fieldContainer.appendChild(this.el);
   },
   
   /**
    * Register the "change" event
    */
   initEvents: function() {
      Event.addListener(this.el,"change", this.onChange, this, true);
	   Event.addFocusListener(this.el, this.onFocus, this, true);
	   Event.addBlurListener(this.el, this.onBlur, this, true);
   },
   
   /**
    * Set the value
    * @param {String} value The value to set
    * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
    */
   setValue: function(value, sendUpdatedEvt) {
      var index = 0;
      var option;
      for(var i = 0 ; i < this.options.selectValues.length ; i++) {
         if(value === this.options.selectValues[i]) {
            option = this.el.childNodes[i];
		      option.selected = "selected";
         }
      }
      
		// Call Field.setValue to set class and fire updated event
		inputEx.SelectField.superclass.setValue.call(this,value, sendUpdatedEvt);
   },
   
   /**
    * Return the value
    * @return {Any} the selected value from the selectValues array
    */
   getValue: function() {
      return this.options.selectValues[this.el.selectedIndex];
   },
   
   /**
    * Disable the field
    */
   disable: function() {
      this.el.disabled = true;
   },

   /**
    * Enable the field
    */
   enable: function() {
      this.el.disabled = false;
   },
   
   /**
    * Add an option in the selector
    * @param {Object} item
    */
   addOption: function(config) {

      var value = config.value,
			 option = ""+(!lang.isUndefined(config.option) ? config.option : config.value),
			 nbOptions = this.options.selectOptions.length,
      	 position = nbOptions, // position of new option (default last)
			 i;
      
      if (lang.isNumber(config.position) && config.position >= 0 && config.position <= position) {
         position = parseInt(config.position,10);
         
      } else if (lang.isString(config.before)) {
         
            for (i = 0 ; i < nbOptions ; i++) {
               if (this.options.selectOptions[i] === config.before) {
                  position = i;
                  break;
               }
            }
            
      } else if (lang.isString(config.after)) {

            for (i = 0 ; i < nbOptions ; i++) {
               if (this.options.selectOptions[i] === config.after) {
                  position = i+1;
                  break;
               }
            }
      }
      
      // update values and options lists
      this.options.selectValues.splice(position,0,value); // insert value at position
      this.options.selectOptions.splice(position,0,option);

      // new option in select
      var newOption = inputEx.cn('option', {value: value}, null, option);
      this.optionEls = this.optionEls.splice(position,0,newOption);
      
      if (position<nbOptions) {
         YAHOO.util.Dom.insertBefore(newOption,this.el.childNodes[position]);
      } else {
         this.el.appendChild(newOption);
      }

      // select new option
      if (!!config.selected) {
         // setTimeout for IE6 (let time to create dom option)
         var that = this;
         setTimeout(function() {that.setValue(value);},0);
      }
   },

   removeOption: function(config) {

      var position,
		    nbOptions = this.options.selectOptions.length,
			 selectedIndex = this.el.selectedIndex,
			 i;
      
      if (lang.isNumber(config.position) && config.position >= 0 && config.position <= nbOptions) {
         
         position = parseInt(config.position,10);
         
      } else if (lang.isString(config.option)) {
         
            for (i = 0 ; i < nbOptions ; i++) {
               if (this.options.selectOptions[i] === config.option) {
                  position = i;
                  break;
               }
            }
            
      } else if (lang.isString(config.value)) {

            for (i = 0 ; i < nbOptions ; i++) {
               if (this.options.selectValues[i] === config.value) {
                  position = i;
                  break;
               }
            }
      }
      
      if (!lang.isNumber(position)) {
         throw new Error("SelectField : invalid or missing position, option or value in removeOption");
      }

      // remove from selectValues / selectOptions array
      this.options.selectValues.splice(position,1); // remove 1 element at position
      this.options.selectOptions.splice(position,1); // remove 1 element at position

      // remove from selector
      this.el.removeChild(this.optionEls[position]);
      this.optionEls.splice(position,1); // remove 1 element at position
      
      // clear if previous selected value doesn't exist anymore
      if (selectedIndex == position) {
         this.clear();
      }
   }
   
});

// Register this class as "select" type
inputEx.registerType("select", inputEx.SelectField, [
   {  type: 'list', name: 'selectValues', label: 'Values', elementType: {type: 'string'}, required: true },
   {  type: 'list', name: 'selectOptions', label: 'Options', elementType: {type: 'string'} }
]);

})();(function() {

/**
 * Field that adds the email regexp for validation. Result is always lower case.
 * @class inputEx.EmailField
 * @extends inputEx.StringField
 * @constructor
 * @param {Object} options inputEx.Field options object
 */
inputEx.EmailField = function(options) {
   inputEx.EmailField.superclass.constructor.call(this,options);
};
YAHOO.lang.extend(inputEx.EmailField, inputEx.StringField, {
   
   /**
    * Set the email regexp and invalid message
    * @param {Object} options Options object as passed to the constructor
    */
   setOptions: function(options) {
      inputEx.EmailField.superclass.setOptions.call(this, options);
      // Overwrite options
      this.options.messages.invalid = inputEx.messages.invalidEmail;
      this.options.regexp = inputEx.regexps.email;
   },
   
   /**
    * Set the value to lower case since email have no case
    * @return {String} The email string
    */
   getValue: function() {
      
      var value;
      
      value = inputEx.EmailField.superclass.getValue.call(this);
      
      return inputEx.removeAccents(value.toLowerCase());
   }

});
   
// Specific message for the email field
inputEx.messages.invalidEmail = "Invalid email, ex: sample@test.com";

// Register this class as "email" type
inputEx.registerType("email", inputEx.EmailField, []);

})();(function() {

   var lang = YAHOO.lang;

/**
 * Adds an url regexp, and display the favicon at this url
 * @class inputEx.UrlField
 * @extends inputEx.StringField
 * @constructor
 * @param {Object} options inputEx.Field options object
 * <ul>
 *   <li>favicon: boolean whether the domain favicon.ico should be displayed or not (default is true, except for https)</li>
 * </ul>
 */
inputEx.UrlField = function(options) {
   inputEx.UrlField.superclass.constructor.call(this,options);
};

lang.extend(inputEx.UrlField, inputEx.StringField, {

   /**
    * Adds the invalid Url message
    * @param {Object} options Options object as passed to the constructor
    */
   setOptions: function(options) {
      inputEx.UrlField.superclass.setOptions.call(this, options);

      this.options.className = options.className ? options.className : "inputEx-Field inputEx-UrlField";
      this.options.messages.invalid = inputEx.messages.invalidUrl;
      this.options.favicon = lang.isUndefined(options.favicon) ? (("https:" == document.location.protocol) ? false : true) : options.favicon;
      this.options.size = options.size || 50;

      // validate with url regexp
      this.options.regexp = inputEx.regexps.url;
   },

   /**
    * Adds a img tag before the field to display the favicon
    */
   render: function() {
      inputEx.UrlField.superclass.render.call(this);
      this.el.size = this.options.size;

      if(!this.options.favicon) {
         YAHOO.util.Dom.addClass(this.el, 'nofavicon');
      }

      // Create the favicon image tag
      if(this.options.favicon) {
         this.favicon = inputEx.cn('img', {src: inputEx.spacerUrl});
         this.fieldContainer.insertBefore(this.favicon,this.fieldContainer.childNodes[0]);

         // focus field when clicking on favicon
         YAHOO.util.Event.addListener(this.favicon,"click",function(){this.focus();},this,true);
      }
   },

   setClassFromState: function() {
      inputEx.UrlField.superclass.setClassFromState.call(this);

      if(this.options.favicon) {
         // try to update with url only if valid url (else pass null to display inputEx.spacerUrl)
         this.updateFavicon((this.previousState == inputEx.stateValid) ? this.getValue() : null);
      }
   },


   updateFavicon: function(url) {
      var newSrc = url ? url.match(/https?:\/\/[^\/]*/)+'/favicon.ico' : inputEx.spacerUrl;
      if(newSrc != this.favicon.src) {

         // Hide the favicon
         inputEx.sn(this.favicon, null, {visibility: 'hidden'});

         // Change the src
         this.favicon.src = newSrc;

         // Set the timer to launch displayFavicon in 1s
         if(this.timer) { clearTimeout(this.timer); }
         var that = this;
         this.timer = setTimeout(function(){that.displayFavicon();}, 1000);
      }
   },

   /**
    * Display the favicon if the icon was found (use of the naturalWidth property)
    */
   displayFavicon: function() {
      inputEx.sn(this.favicon, null, {visibility: (this.favicon.naturalWidth!=0) ? 'visible' : 'hidden'});
   }


});

inputEx.messages.invalidUrl = "Invalid URL, ex: http://www.test.com";


// Register this class as "url" type
inputEx.registerType("url", inputEx.UrlField, [
   { type: 'boolean', label: 'Display favicon', name:'favicon', value: true}
]);

})();(function() {
	
   var lang = YAHOO.lang, Event = YAHOO.util.Event, Dom = YAHOO.util.Dom;
	
/**
 * Meta field to create a list of other fields
 * @class inputEx.ListField
 * @extends inputEx.Field
 * @constructor
 * @param options Added options:
 * <ul>
 *   <li>sortable: Add arrows to sort the items if true (default false)</li>
 *   <li>elementType: an element type definition (default is {type: 'string'})</li>
 *   <li>useButtons: use buttons instead of links (default false)</li>
 *   <li>unique: require values to be unique (default false)</li>
 *   <li>listAddLabel: if useButtons is false, text to add an item</li>
 *   <li>listRemoveLabel: if useButtons is false, text to remove an item</li>
 *   <li>maxItems: maximum number of items (leave undefined if no maximum, default)</li>
 *   <li>minItems: minimum number of items to validate (leave undefined if no minimum, default)</li>
 * </ul>
 */
inputEx.ListField = function(options) {
	   
   /**
    * List of all the subField instances
    */
   this.subFields = [];
	   
   inputEx.ListField.superclass.constructor.call(this, options);
};
lang.extend(inputEx.ListField,inputEx.Field, {
	   
	/**
	 * Set the ListField classname
	 * @param {Object} options Options object as passed to the constructor
	 */
	setOptions: function(options) {
	   inputEx.ListField.superclass.setOptions.call(this, options);
	   
	   this.options.className = options.className ? options.className : 'inputEx-Field inputEx-ListField';
	   
	   this.options.sortable = lang.isUndefined(options.sortable) ? false : options.sortable;
	   this.options.elementType = options.elementType || {type: 'string'};
	   this.options.useButtons = lang.isUndefined(options.useButtons) ? false : options.useButtons;
	   this.options.unique = lang.isUndefined(options.unique) ? false : options.unique;
	   
	   this.options.listAddLabel = options.listAddLabel || inputEx.messages.listAddLink;
	   this.options.listRemoveLabel = options.listRemoveLabel || inputEx.messages.listRemoveLink;
	   
	   this.options.maxItems = options.maxItems;
	   this.options.minItems = options.minItems;
	},
	   
	/**
	 * Render the addButton 
	 */
	renderComponent: function() {
	      
	   // Add element button
	   if(this.options.useButtons) {
	      this.addButton = inputEx.cn('img', {src: inputEx.spacerUrl, className: 'inputEx-ListField-addButton'});
	      this.fieldContainer.appendChild(this.addButton);
      }
	      
	   // List label
	   this.fieldContainer.appendChild( inputEx.cn('span', null, {marginLeft: "4px"}, this.options.listLabel) );
	      
	   // Div element to contain the children
	   this.childContainer = inputEx.cn('div', {className: 'inputEx-ListField-childContainer'});
	   this.fieldContainer.appendChild(this.childContainer);
	   
	   // Add link
	   if(!this.options.useButtons) {
	      this.addButton = inputEx.cn('a', {className: 'inputEx-List-link'}, null, this.options.listAddLabel);
	      this.fieldContainer.appendChild(this.addButton);
      }
	},
	   
	/**
	 * Handle the click event on the add button
	 */
	initEvents: function() {
	   Event.addListener(this.addButton, 'click', this.onAddButton, this, true);
	},
	
	/**
    * Validate each field
    * @returns {Boolean} true if all fields validate, required fields are not empty and unique constraint (if specified) is not violated
    */
   validate: function() {

      var response = true;
      
      var uniques = {}; // Hash for unique values option
      var l = this.subFields.length;

      // Validate maxItems / minItems
      if( lang.isNumber(this.options.minItems) && l < this.options.minItems  ) {
         response = false;
      }
      if( lang.isNumber(this.options.maxItems) && l > this.options.maxItems  ) {
         response = false;
      }

      // Validate all the sub fields
      for (var i = 0 ; i < l && response; i++) {
         var input = this.subFields[i];
         input.setClassFromState(); // update field classes (mark invalid fields...)
         var state = input.getState();
         if( state == inputEx.stateRequired || state == inputEx.stateInvalid ) {
            response = false; // but keep looping on fields to set classes
         }
         if(this.options.unique) {
            var hash = lang.dump(input.getValue());
            if(uniques[hash]) {
               response = false;    // not unique
            } else {
               uniques[hash] = true;
            }
          }
      }
      return response;
   },
	   
	/**
	 * Set the value of all the subfields
	 * @param {Array} value The list of values to set
	 * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
	 */
	setValue: function(value, sendUpdatedEvt) {
	   
	   if(!lang.isArray(value) ) {
	      throw new Error("inputEx.ListField.setValue expected an array, got "+(typeof value));
	   }
	      
	   // Set the values (and add the lines if necessary)
	   for(var i = 0 ; i < value.length ; i++) {
	      if(i == this.subFields.length) {
	         this.addElement(value[i]);
	      }
	      else {
	         this.subFields[i].setValue(value[i], false);
	      }
	   }
	      
	   // Remove additional subFields
	   var additionalElements = this.subFields.length-value.length;
	   if(additionalElements > 0) {
	      for(i = 0 ; i < additionalElements ; i++) { 
	         this.removeElement(value.length);
	      }
	   }
	   
	   inputEx.ListField.superclass.setValue.call(this, value, sendUpdatedEvt);
	},
	   
	/**
	 * Return the array of values
	 * @return {Array} The array
	 */
	getValue: function() {
	   var values = [];
	   for(var i = 0 ; i < this.subFields.length ; i++) {
	      values[i] = this.subFields[i].getValue();
	   }
	   return values;
	},
	   
	/**
	 * Adds an element
	 * @param {Any} The initial value of the subfield to create
	 * @return {inputEx.Field} SubField added instance
	 */
	addElement: function(value) {
	
	   // Render the subField
	   var subFieldEl = this.renderSubField(value);
	      
	   // Adds it to the local list
	   this.subFields.push(subFieldEl);
	   
	   return subFieldEl;
	},
	
	/**
	 * Add a new element to the list and fire updated event
	 * @param {Event} e The original click event
	 */
	onAddButton: function(e) {
	   Event.stopEvent(e);
	   
	   // Prevent adding a new field if already at maxItems
	   if( lang.isNumber(this.options.maxItems) && this.subFields.length >= this.options.maxItems ) {
	      return;
	   }
	   
	   // Add a field with no value: 
	   var subFieldEl = this.addElement();
	   
	   // Focus on this field
	   subFieldEl.focus();
	   
	   // Fire updated !
	   this.fireUpdatedEvt();
	},
	   
	/**
	 * Adds a new line to the List Field
 	 * @param {Any} The initial value of the subfield to create
	 * @return  {inputEx.Field} instance of the created field (inputEx.Field or derivative)
	 */
	renderSubField: function(value) {
	      
	   // Div that wraps the deleteButton + the subField
	   var newDiv = inputEx.cn('div'), delButton;
	      
	   // Delete button
	   if(this.options.useButtons) {
	      delButton = inputEx.cn('img', {src: inputEx.spacerUrl, className: 'inputEx-ListField-delButton'});
	      Event.addListener( delButton, 'click', this.onDelete, this, true);
	      newDiv.appendChild( delButton );
      }
	      
	   // Instantiate the new subField
	   var opts = lang.merge({}, this.options.elementType);
	   
	   // Retro-compatibility with deprecated inputParams Object : TODO -> remove
      if(lang.isObject(opts.inputParams) && !lang.isUndefined(value)) {
         opts.inputParams.value = value;
         
      // New prefered way to set options of a field
      } else if (!lang.isUndefined(value)) {
         opts.value = value;
      }
	   
	   var el = inputEx(opts,this);
	   
	   var subFieldEl = el.getEl();
	   Dom.setStyle(subFieldEl, 'margin-left', '4px');
	   Dom.setStyle(subFieldEl, 'float', 'left');
	   newDiv.appendChild( subFieldEl );
	   
	   // Subscribe the onChange event to resend it 
	   el.updatedEvt.subscribe(this.onChange, this, true);
	
	   // Arrows to order:
	   if(this.options.sortable) {
	      var arrowUp = inputEx.cn('div', {className: 'inputEx-ListField-Arrow inputEx-ListField-ArrowUp'});
	      Event.addListener(arrowUp, 'click', this.onArrowUp, this, true);
	      var arrowDown = inputEx.cn('div', {className: 'inputEx-ListField-Arrow inputEx-ListField-ArrowDown'});
	      Event.addListener(arrowDown, 'click', this.onArrowDown, this, true);
	      newDiv.appendChild( arrowUp );
	      newDiv.appendChild( arrowDown );
	   }
	   
	   // Delete link
	   if(!this.options.useButtons) {
	      delButton = inputEx.cn('a', {className: 'inputEx-List-link'}, null, this.options.listRemoveLabel);
	      Event.addListener( delButton, 'click', this.onDelete, this, true);
	      newDiv.appendChild( delButton );
      }
	
	   // Line breaker
	   newDiv.appendChild( inputEx.cn('div', null, {clear: "both"}) );
	
	   this.childContainer.appendChild(newDiv);
	      
	   return el;
	},
	   
	/**
	 * Switch a subField with its previous one
	 * Called when the user clicked on the up arrow of a sortable list
	 * @param {Event} e Original click event
	 */
	onArrowUp: function(e) {
	   var childElement = Event.getTarget(e).parentNode;
	   
	   var previousChildNode = null;
	   var nodeIndex = -1;
	   for(var i = 1 ; i < childElement.parentNode.childNodes.length ; i++) {
	      var el=childElement.parentNode.childNodes[i];
	      if(el == childElement) {
	         previousChildNode = childElement.parentNode.childNodes[i-1];
	         nodeIndex = i;
	         break;
	      }
	   }
	   
	   if(previousChildNode) {
	      // Remove the line
	      var removedEl = this.childContainer.removeChild(childElement);
	      
	      // Adds it before the previousChildNode
	      var insertedEl = this.childContainer.insertBefore(removedEl, previousChildNode);
	      
	      // Swap this.subFields elements (i,i-1)
	      var temp = this.subFields[nodeIndex];
	      this.subFields[nodeIndex] = this.subFields[nodeIndex-1];
	      this.subFields[nodeIndex-1] = temp;
	      
	      // Color Animation
	      if(this.arrowAnim) {
	         this.arrowAnim.stop(true);
	      }
	      this.arrowAnim = new YAHOO.util.ColorAnim(insertedEl, {backgroundColor: { from: '#eeee33' , to: '#eeeeee' }}, 0.4);
	      this.arrowAnim.onComplete.subscribe(function() { Dom.setStyle(insertedEl, 'background-color', ''); });
	      this.arrowAnim.animate();
	      
	      // Fire updated !
	      this.fireUpdatedEvt();
	   }
	},
	
	/**
	 * Switch a subField with its next one
	 * Called when the user clicked on the down arrow of a sortable list
	 * @param {Event} e Original click event
	 */
	onArrowDown: function(e) {
	   var childElement = Event.getTarget(e).parentNode;
	   
	   var nodeIndex = -1;
	   var nextChildNode = null;
	   for(var i = 0 ; i < childElement.parentNode.childNodes.length ; i++) {
	      var el=childElement.parentNode.childNodes[i];
	      if(el == childElement) {
	         nextChildNode = childElement.parentNode.childNodes[i+1];
	         nodeIndex = i;
	         break;
	      }
	   }
	   
	   if(nextChildNode) {
	      // Remove the line
	      var removedEl = this.childContainer.removeChild(childElement);
	      // Adds it after the nextChildNode
	      var insertedEl = Dom.insertAfter(removedEl, nextChildNode);
	      
	      // Swap this.subFields elements (i,i+1)
	      var temp = this.subFields[nodeIndex];
	      this.subFields[nodeIndex] = this.subFields[nodeIndex+1];
	      this.subFields[nodeIndex+1] = temp;
	      
	      // Color Animation
	      if(this.arrowAnim) {
	         this.arrowAnim.stop(true);
	      }
	      this.arrowAnim = new YAHOO.util.ColorAnim(insertedEl, {backgroundColor: { from: '#eeee33' , to: '#eeeeee' }}, 1);
	      this.arrowAnim.onComplete.subscribe(function() { Dom.setStyle(insertedEl, 'background-color', ''); });
	      this.arrowAnim.animate();
	      
	      // Fire updated !
	      this.fireUpdatedEvt();
	   }
	},
	   
	/**
	 * Called when the user clicked on a delete button.
	 * @param {Event} e The original click event
	 */
	onDelete: function(e) {
	      
	   Event.stopEvent(e);
	   
	   // Prevent removing a field if already at minItems
	   if( lang.isNumber(this.options.minItems) && this.subFields.length <= this.options.minItems ) {
	      return;
	   }
	      
	   // Get the wrapping div element
	   var elementDiv = Event.getTarget(e).parentNode;
	   
	   // Get the index of the subField
	   var index = -1;
	   
	   var subFieldEl = elementDiv.childNodes[this.options.useButtons ? 1 : 0];
	   for(var i = 0 ; i < this.subFields.length ; i++) {
	      if(this.subFields[i].getEl() == subFieldEl) {
	         index = i;
	         break;
	      }
	   }
	      
	   // Remove it
	   if(index != -1) {
	      this.removeElement(index);
	   }
	      
	   // Fire the updated event
	   this.fireUpdatedEvt();
	},
	   
	/**
	 * Remove the line from the dom and the subField from the list.
	 * @param {integer} index The index of the element to remove
	 */
	removeElement: function(index) {
	   var elementDiv = this.subFields[index].getEl().parentNode;
	      
	   this.subFields[index] = undefined;
	   this.subFields = inputEx.compactArray(this.subFields);
	      
	   // Remove the element
	   elementDiv.parentNode.removeChild(elementDiv);
	}
	
});
	
// Register this class as "list" type
inputEx.registerType("list", inputEx.ListField, [
   { type: 'string', label: 'List label', name: 'listLabel', value: ''},
   { type: 'type', label: 'List element type', required: true, name: 'elementType' }
]);


inputEx.messages.listAddLink = "Add";
inputEx.messages.listRemoveLink = "remove";
	
})();(function() {
	
	var lang = YAHOO.lang, Event = YAHOO.util.Event, Dom = YAHOO.util.Dom;
	
/**
 * Create a checkbox.
 * @class inputEx.CheckBox
 * @extends inputEx.Field
 * @constructor
 * @param {Object} options Added options for CheckBoxes:
 * <ul>
 *   <li>sentValues: 2D vector of values for checked/unchecked states (default is [true, false])</li>
 * </ul>
 */
inputEx.CheckBox = function(options) {
	inputEx.CheckBox.superclass.constructor.call(this,options);
};
	
lang.extend(inputEx.CheckBox, inputEx.Field, {
	   
	/**
	 * Adds the CheckBox specific options
	 * @param {Object} options Options object as passed to the constructor
	 */
	setOptions: function(options) {
	   inputEx.CheckBox.superclass.setOptions.call(this, options);
	   
	   // Overwrite options:
	   this.options.className = options.className ? options.className : 'inputEx-Field inputEx-CheckBox';
	   
	   this.options.rightLabel = options.rightLabel || '';
	   
	   // Added options
	   this.sentValues = options.sentValues || [true, false];
	   this.options.sentValues = this.sentValues; // for compatibility
	   this.checkedValue = this.sentValues[0];
	   this.uncheckedValue = this.sentValues[1];
	},
	   
	/**
	 * Render the checkbox and the hidden field
	 */
	renderComponent: function() {
	
   	var checkBoxId = this.divEl.id?this.divEl.id+'-field':YAHOO.util.Dom.generateId();
	   this.el = inputEx.cn('input', { id: checkBoxId, type: 'checkbox' });

	   this.fieldContainer.appendChild(this.el);
	
	   this.rightLabelEl = inputEx.cn('label', {"for": checkBoxId, className: 'inputEx-CheckBox-rightLabel'}, null, this.options.rightLabel);
	   this.fieldContainer.appendChild(this.rightLabelEl);
	
	   // Keep state of checkbox in a hidden field (format : this.checkedValue or this.uncheckedValue)
	   // This is useful for non-javascript form submit (it allows custom checked/unchecked values to be submitted)
	   this.hiddenEl = inputEx.cn('input', {type: 'hidden', name: this.options.name || '', value: this.uncheckedValue});
	   this.fieldContainer.appendChild(this.hiddenEl);
	},
	   
	/**
	 * Clear the previous events and listen for the "change" event
	 */
	initEvents: function() {
	   
	   // Awful Hack to work in IE6 and below (the checkbox doesn't fire the change event)
	   // It seems IE 8 removed this behavior from IE7 so it only works with IE 7 ??
	   /*if( YAHOO.env.ua.ie && parseInt(YAHOO.env.ua.ie,10) != 7 ) {
	      Event.addListener(this.el, "click", function() { this.fireUpdatedEvt(); }, this, true);	
	   }*/
	   if( YAHOO.env.ua.ie ) {
	      Event.addListener(this.el, "click", function(e) { YAHOO.lang.later(10,this,function(){this.onChange(e);}); }, this, true);	
	   } else {
	      Event.addListener(this.el, "change", this.onChange, this, true);
	   }
	   
	   Event.addFocusListener(this.el, this.onFocus, this, true);
	   Event.addBlurListener(this.el, this.onBlur, this, true);
	},
	   
	/**
	 * Function called when the checkbox is toggled
	 * @param {Event} e The original 'change' event
	 */
	onChange: function(e) {
	   this.hiddenEl.value = this.el.checked ? this.checkedValue : this.uncheckedValue;
	
	   inputEx.CheckBox.superclass.onChange.call(this,e);
	},
	
	/**
	 * Get the state value
	 * @return {Any} one of [checkedValue,uncheckedValue]
	 */
	getValue: function() {
	      return this.el.checked ? this.checkedValue : this.uncheckedValue;
	},
	
	/**
	 * Set the value of the checkedbox
	 * @param {Any} value The value schould be one of [checkedValue,uncheckedValue]
    * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
	 */
	setValue: function(value, sendUpdatedEvt) {
	   if (value===this.checkedValue || (typeof(value) == 'string' && typeof(this.checkedValue) == 'boolean' &&
		value === String(this.checkedValue))) {
			this.hiddenEl.value = this.checkedValue;
			
			// check checkbox (all browsers)
			this.el.checked = true;
			
			// hacks for IE6, because input is not operational at init, 
			// so "this.el.checked = true" would work for default values !
			// (but still work for later setValue calls)
			if (YAHOO.env.ua.ie === 6) {
			   this.el.setAttribute("defaultChecked","checked"); // for IE6
		   }
		}
	   else {
	      // DEBUG :
	      /*if (value!==this.uncheckedValue && lang.isObject(console) && lang.isFunction(console.log) ) {
	         console.log("inputEx.CheckBox: value is *"+value+"*, schould be in ["+this.checkedValue+","+this.uncheckedValue+"]");
         }*/
			this.hiddenEl.value = this.uncheckedValue;
			
			// uncheck checkbox (all browsers)
		   this.el.checked = false;
		   
			// hacks for IE6, because input is not operational at init, 
			// so "this.el.checked = false" would work for default values !
			// (but still work for later setValue calls)
			if (YAHOO.env.ua.ie === 6) {
			   this.el.removeAttribute("defaultChecked"); // for IE6
		   }
		}
		
		// Call Field.setValue to set class and fire updated event
		inputEx.CheckBox.superclass.setValue.call(this,value, sendUpdatedEvt);
	},
	
	/**
    * Disable the field
    */
   disable: function() {
      this.el.disabled = true;
   },

   /**
    * Enable the field
    */
   enable: function() {
      this.el.disabled = false;
   }
	
});   
	
// Register this class as "boolean" type
inputEx.registerType("boolean", inputEx.CheckBox, [ 
   {type: 'string', label: 'Right Label', name: 'rightLabel'}
]);
	
})();/**
 * WireIt editor
 * @module editor-plugin
 */
(function() {
    var util = YAHOO.util,lang = YAHOO.lang;
    var Event = util.Event, Dom = util.Dom, Connect = util.Connect,JSON = lang.JSON,widget = YAHOO.widget;

/**
 * The BaseEditor class provides a full page interface 
 * @class BaseEditor	
 * @namespace WireIt
 * @constructor
 * @param {Object} options (layoutOptions,propertiesFields,accordionViewParams)
 */
WireIt.BaseEditor = function(options) {
	
	/**
    * Container DOM element
    * @property el
    */
   this.el = Dom.get(options.parentEl);
	
	// set the default options
   this.setOptions(options);

   // Rendering
   this.render();
	
};

/**
 * Default options for the BaseEditor
 */
WireIt.BaseEditor.defaultOptions = {
	layoutOptions: {
	 	units: [
	   	{ position: 'top', height: 57, body: 'top'},
	      { position: 'left', width: 200, resize: true, body: 'left', gutter: '5px', collapse: true, 
	        collapseSize: 25, header: 'Modules', scroll: true, animate: true },
	      { position: 'center', body: 'center', gutter: '5px' },
	      { position: 'right', width: 320, resize: true, body: 'right', gutter: '5px', collapse: true, 
	        collapseSize: 25, /*header: 'Properties', scroll: true,*/ animate: true }
	   ]
	},

	propertiesFields: [
		{"type": "string", "name": "name", label: "Title", typeInvite: "Enter a title" },
		{"type": "text", "name": "description", label: "Description", cols: 30, rows: 4}
	],
	
	accordionViewParams: {
		collapsible: true, 
		expandable: true, // remove this parameter to open only one panel at a time
		width: 'auto', 
		expandItem: 0, 
		animationSpeed: '0.3', 
		animate: true, 
		effect: YAHOO.util.Easing.easeBothStrong
	}
};

WireIt.BaseEditor.prototype = {

	/**
	 * @method setOptions
	 * @param {Object} options
	 */
	setOptions: function(options) {

	    /**
	     * @property options
	     * @type {Object}
	     */
	    this.options = {};
	
		 // inputEx configuration of fields in the properties panel
	    this.options.propertiesFields = options.propertiesFields || WireIt.BaseEditor.defaultOptions.propertiesFields;

		 // YUI layout options
	    this.options.layoutOptions = options.layoutOptions || WireIt.BaseEditor.defaultOptions.layoutOptions;
		
		 // AccordionView
	 	 this.options.accordionViewParams = options.accordionViewParams || WireIt.BaseEditor.defaultOptions.accordionViewParams;
	},
	
	/**
	 * Render the layout & panels
	 */
  	render: function() {

		 // Render the help panel
	    this.renderHelpPanel();

	    /**
	     * @property layout
	     * @type {YAHOO.widget.Layout}
	     */
	    this.layout = new widget.Layout(this.el, this.options.layoutOptions);
	    this.layout.render();

		 // Right accordion
	    this.renderPropertiesAccordion();

	    // Render buttons
	    this.renderButtons();

	 	 // Saved status
		 this.renderSavedStatus();

	    // Properties Form
	    this.renderPropertiesForm();

  },

	/**
	 * Render the help dialog
	 */
	renderHelpPanel: function() {
		/**
	     * @property helpPanel
	     * @type {YAHOO.widget.Panel}
	     */
	    this.helpPanel = new widget.Panel('helpPanel', {
	        fixedcenter: true,
	        draggable: true,
	        visible: false,
	        modal: true
	     });
	     this.helpPanel.render();
	},

	/**
	 * Render the alert panel
	 */
 	renderAlertPanel: function() {
		
 	 /**
     * @property alertPanel
     * @type {YAHOO.widget.Panel}
     */
		this.alertPanel = new widget.Panel('WiringEditor-alertPanel', {
         fixedcenter: true,
         draggable: true,
         width: '500px',
         visible: false,
         modal: true
      });
      this.alertPanel.setHeader("Message");
      this.alertPanel.setBody("<div id='alertPanelBody'></div><button id='alertPanelButton'>Ok</button>");
      this.alertPanel.render(document.body);
		Event.addListener('alertPanelButton','click', function() {
			this.alertPanel.hide();
		}, this, true);
	},
	
	 /**
	  * Toolbar
	  * @method renderButtons
	  */
	 renderButtons: function() {
	    var toolbar = Dom.get('toolbar');
	    // Buttons :
	    var newButton = new widget.Button({ label:"New", id:"WiringEditor-newButton", container: toolbar });
	    newButton.on("click", this.onNew, this, true);

	    var loadButton = new widget.Button({ label:"Load", id:"WiringEditor-loadButton", container: toolbar });
	    loadButton.on("click", this.load, this, true);

	    var saveButton = new widget.Button({ label:"Save", id:"WiringEditor-saveButton", container: toolbar });
	    saveButton.on("click", this.onSave, this, true);

	    var deleteButton = new widget.Button({ label:"Delete", id:"WiringEditor-deleteButton", container: toolbar });
	    deleteButton.on("click", this.onDelete, this, true);

	    var helpButton = new widget.Button({ label:"Help", id:"WiringEditor-helpButton", container: toolbar });
	    helpButton.on("click", this.onHelp, this, true);
	 },


	/**
	 * @method renderSavedStatus
	 */
	renderSavedStatus: function() {
		this.savedStatusEl = WireIt.cn('div', {className: 'savedStatus', title: 'Not saved'}, {display: 'none'}, "*");
		Dom.get('toolbar').appendChild(this.savedStatusEl);
	},

	 /**
	  * @method onSave
	  */
	 onSave: function() {
	    this.save();
	 },

	/**
	 * Save method (empty)
	 */
	save: function() {
		// override
	},

	/**
	 * Displays a message
	 */
	alert: function(txt) {
		if(!this.alertPanel){ this.renderAlertPanel(); }
		Dom.get('alertPanelBody').innerHTML = txt;
		this.alertPanel.show();
	},

	 /**
	  * Create a help panel
	  * @method onHelp
	  */
	 onHelp: function() {
	    this.helpPanel.show();
	 },

	
	/**
	 * Render the accordion using yui-accordion
  	 */
	renderPropertiesAccordion: function() {
		this.accordionView = new YAHOO.widget.AccordionView('accordionView', this.options.accordionViewParams);
	},
 
	 /**
	  * Render the properties form
	  * @method renderPropertiesForm
	  */
	 renderPropertiesForm: function() {
	    this.propertiesForm = new inputEx.Group({
	       parentEl: YAHOO.util.Dom.get('propertiesForm'),
	       fields: this.options.propertiesFields
	    });

		this.propertiesForm.updatedEvt.subscribe(function() {
			this.markUnsaved();
		}, this, true);
	 },

	/** 
	 * Hide the save indicator
	 */
	markSaved: function() {
		this.savedStatusEl.style.display = 'none';
	},
	
	/** 
	 * Show the save indicator
	 */
	markUnsaved: function() {
		this.savedStatusEl.style.display = '';
	},

	/** 
	 * Is saved ?
	 */
	isSaved: function() {
		return (this.savedStatusEl.style.display == 'none');
	}
	
};


})();(function() {
    var util = YAHOO.util,lang = YAHOO.lang, Dom = util.Dom;


/**
 * Module Proxy handle the drag/dropping from the module list to the layer (in the WiringEditor)
 * @class ModuleProxy
 * @constructor
 * @param {HTMLElement} el
 * @param {WireIt.WiringEditor} WiringEditor
 */
WireIt.ModuleProxy = function(el, WiringEditor) {
   
   this._WiringEditor = WiringEditor;
   
   // Init the DDProxy
   WireIt.ModuleProxy.superclass.constructor.call(this,el, "module", {
        dragElId: "moduleProxy"
    });
    
    this.isTarget = false; 
};
lang.extend(WireIt.ModuleProxy,YAHOO.util.DDProxy, {
   
   /**
    * copy the html and apply selected classes
    * @method startDrag
    */
   startDrag: function(e) {
      WireIt.ModuleProxy.superclass.startDrag.call(this,e);
       var del = this.getDragEl(),
			  lel = this.getEl();
       del.innerHTML = lel.innerHTML;
       del.className = lel.className;
   },
   
   /**
    * Override default behavior of DDProxy
    * @method endDrag
    */
   endDrag: function(e) {},
    
   /**
    * Add the module to the WiringEditor on drop on layer
    * @method onDragDrop
    */
   onDragDrop: function(e, ddTargets) { 
      // The layer is the only target :
      var layerTarget = ddTargets[0],
			 layer = ddTargets[0]._layer,
			 del = this.getDragEl(),
			 pos = Dom.getXY(del),
			 layerPos = Dom.getXY(layer.el);
      this._WiringEditor.addModule( this._module ,[pos[0]-layerPos[0]+layer.el.scrollLeft, pos[1]-layerPos[1]+layer.el.scrollTop]);
    }
   
});

})();(function() {
    var util = YAHOO.util,lang = YAHOO.lang;
    var Event = util.Event, Dom = util.Dom, Connect = util.Connect,widget = YAHOO.widget;

/**
 * The WiringEditor class provides a full page interface 
 * @class WiringEditor
 * @extends WireIt.BaseEditor
 * @constructor
 * @param {Object} options
 */
WireIt.WiringEditor = function(options) {

	 /**
	  * Hash object to reference module definitions by their name
	  * @property modulesByName
	  * @type {Object}
	  */
   this.modulesByName = {};
	
	WireIt.WiringEditor.superclass.constructor.call(this, options);

	 // LoadWirings
	 if( this.adapter.init && YAHOO.lang.isFunction(this.adapter.init) ) {
			this.adapter.init();
 	 }
	 this.load();
};

lang.extend(WireIt.WiringEditor, WireIt.BaseEditor, {

	 /**
	  * @method setOptions
	  * @param {Object} options
	  */
	 setOptions: function(options) {
    
		WireIt.WiringEditor.superclass.setOptions.call(this, options);
    
	    // Load the modules from options
	    this.modules = options.modules || [];
	    for(var i = 0 ; i < this.modules.length ; i++) {
	       var m = this.modules[i];
	       this.modulesByName[m.name] = m;
	    }

		 this.adapter = options.adapter || WireIt.WiringEditor.adapters.JsonRpc;
     
	    this.options.languageName = options.languageName || 'anonymousLanguage';
     
	    this.options.layerOptions = {};
	    var layerOptions = options.layerOptions || {};
	

	    this.options.layerOptions.parentEl = layerOptions.parentEl ? layerOptions.parentEl : Dom.get('center');
	    this.options.layerOptions.layerMap = YAHOO.lang.isUndefined(layerOptions.layerMap) ? true : layerOptions.layerMap;
	    this.options.layerOptions.layerMapOptions = layerOptions.layerMapOptions || { parentEl: 'layerMap' };

	 	 this.options.modulesAccordionViewParams = YAHOO.lang.merge({
														collapsible: true, 
														expandable: true, // remove this parameter to open only one panel at a time
														width: 'auto', 
														expandItem: 0, 
														animationSpeed: '0.3', 
														animate: true, 
														effect: YAHOO.util.Easing.easeBothStrong
													},options.modulesAccordionViewParams || {});
													
		 // Grouping options
	    var temp = this;
	    var baseConfigFunction = function(name)  { 
				return (name == "Group") ? ({
			    "xtype": "WireIt.GroupFormContainer",
			    "title": "Group",    

			    "collapsible": true,
			    "fields": [ ],
			    "legend": "Inner group fields",
			    "getBaseConfigFunction" : baseConfigFunction
				}) : temp.modulesByName[name].container;
		};

	    this.options.layerOptions.grouper = {"baseConfigFunction": baseConfigFunction };
	
	 },


	/**
	 * Add the rendering of the layer
	 */
  	render: function() {

		 WireIt.WiringEditor.superclass.render.call(this);
	
	    /**
	     * @property layer
	     * @type {WireIt.Layer}
	     */
	    this.layer = new WireIt.Layer(this.options.layerOptions);
		 this.layer.eventChanged.subscribe(this.onLayerChanged, this, true);

		 // Left Accordion
		 this.renderModulesAccordion();

	    // Render module list
	    this.buildModulesList();
  	},

	/**
	 * render the modules accordion in the left panel
	 */
	renderModulesAccordion: function() {
		
		// Create the modules accordion DOM if not found
		if(!Dom.get('modulesAccordionView')) {
			Dom.get('left').appendChild( WireIt.cn('ul', {id: 'modulesAccordionView'}) );
			var li = WireIt.cn('li');
			li.appendChild(WireIt.cn('h2',null,null,"Main"));
			var d = WireIt.cn('div');
			d.appendChild( WireIt.cn('div', {id: "module-category-main"}) );
			li.appendChild(d);
			Dom.get('modulesAccordionView').appendChild(li);
		}
		
		this.modulesAccordionView = new YAHOO.widget.AccordionView('modulesAccordionView', this.options.modulesAccordionViewParams);
		
		// Open all panels
		for(var l = 1, n = this.modulesAccordionView.getPanels().length; l < n ; l++) {
			this.modulesAccordionView.openPanel(l);
		}
	},
	
 
 	/**
  	 * Build the left menu on the left
  	 * @method buildModulesList
  	 */
 	buildModulesList: function() {

     	var modules = this.modules;
     	for(var i = 0 ; i < modules.length ; i++) {
		  	this.addModuleToList(modules[i]);
     	}

     	// Make the layer a drag drop target
     	if(!this.ddTarget) {
       	this.ddTarget = new YAHOO.util.DDTarget(this.layer.el, "module");
       	this.ddTarget._layer = this.layer;
     	}
 	},

 	/**
  	 * Add a module definition to the left list
  	 */
 	addModuleToList: function(module) {
	try {
		var div = WireIt.cn('div', {className: "WiringEditor-module"});
		
		if(module.description) {
			div.title = module.description;
		}
		
      if(module.container.icon) {
         div.appendChild( WireIt.cn('img',{src: module.container.icon}) );
      }
      div.appendChild( WireIt.cn('span', null, null, module.name) );

      var ddProxy = new WireIt.ModuleProxy(div, this);
      ddProxy._module = module;

		// Get the category element in the accordion or create a new one
		var category = module.category || "main";
		var el = Dom.get("module-category-"+category);
		if( !el ) {
			this.modulesAccordionView.addPanel({
				label: category,
				content: "<div id='module-category-"+category+"'></div>"
			});
			this.modulesAccordionView.openPanel(this.modulesAccordionView._panels.length-1);
			el = Dom.get("module-category-"+category);
		}
		
		el.appendChild(div);
	}catch(ex){ console.log(ex);}
 	},
 
 
	getCurrentGrouper: function(editor) {
     	return editor.currentGrouper;
 	},
 
 	/**
  	 * add a module at the given pos
  	 */
	addModule: function(module, pos) {
	    try {
	       var containerConfig = module.container;
	       containerConfig.position = pos;
	       containerConfig.title = module.name;
	       var temp = this;
	       containerConfig.getGrouper = function() { return temp.getCurrentGrouper(temp); };
	       var container = this.layer.addContainer(containerConfig);
	       Dom.addClass(container.el, "WiringEditor-module-"+module.name);
	    }
	    catch(ex) {
	       this.alert("Error Layer.addContainer: "+ ex.message);
	    }    
	},

 	/**
  	 * save the current module
  	 */
 	save: function() {
  
    	var value = this.getValue();
    
    	if(value.name === "") {
       	this.alert("Please choose a name");
       	return;
    	}

		this.tempSavedWiring = {name: value.name, working: value.working, language: this.options.languageName };
                
    	this.adapter.saveWiring(this.tempSavedWiring, {
       	success: this.saveModuleSuccess,
       	failure: this.saveModuleFailure,
       	scope: this
    	});
 	},

	 /**
	  * saveModule success callback
	  * @method saveModuleSuccess
	  */
	 saveModuleSuccess: function(o) {

		this.markSaved();

	   this.alert("Saved !");

		// TODO: call a saveModuleSuccess callback...
	 },

	 /**
	  * saveModule failure callback
	  * @method saveModuleFailure
	  */
	 saveModuleFailure: function(errorStr) {
	    this.alert("Unable to save the wiring : "+errorStr);
	 },


	 /**
	  * @method onNew
	  */
	 onNew: function() {
	
		if(!this.isSaved()) {
			if( !confirm("Warning: Your work is not saved yet ! Press ok to continue anyway.") ) {
				return;
			}
		}
	
		this.preventLayerChangedEvent = true;
	
	   this.layer.clear(); 

	   this.propertiesForm.clear(false); // false to tell inputEx to NOT send the updatedEvt

		this.markSaved();

		this.preventLayerChangedEvent = false;
	 },

	 /**
	  * @method onDelete
	  */
	 onDelete: function() {
	    if( confirm("Are you sure you want to delete this wiring ?") ) {
       
	      var value = this.getValue();
	 		this.adapter.deleteWiring({name: value.name, language: this.options.languageName},{
	 			success: function(result) {
					this.onNew();
	 				this.alert("Deleted !");
	 			},
				failure: function(errorStr) {
					this.alert("Unable to delete wiring: "+errorStr);
				},
				scope: this
	 		});
       
	    }
	 },

	 /**
	  * @method renderLoadPanel
	  */
	 renderLoadPanel: function() {
	    if( !this.loadPanel) {
	       this.loadPanel = new widget.Panel('WiringEditor-loadPanel', {
	          fixedcenter: true,
	          draggable: true,
	          width: '500px',
	          visible: false,
	          modal: true
	       });
	       this.loadPanel.setHeader("Select the wiring to load");
	       this.loadPanel.setBody("Filter: <input type='text' id='loadFilter' /><div id='loadPanelBody'></div>");
	       this.loadPanel.render(document.body);

			// Listen the keyup event to filter the module list
			Event.onAvailable('loadFilter', function() {
				Event.addListener('loadFilter', "keyup", this.inputFilterTimer, this, true);
			}, this, true);

	    }
	 },

	/**
	 * Method called from each keyup on the search filter in load panel.
	 * The real filtering occurs only after 500ms so that the filter process isn't called too often
	 */
	inputFilterTimer: function() {
		if(this.inputFilterTimeout) {
			clearTimeout(this.inputFilterTimeout);
			this.inputFilterTimeout = null;
		}
		var that = this;
		this.inputFilterTimeout = setTimeout(function() {
				that.updateLoadPanelList(Dom.get('loadFilter').value);
		}, 500);
	},


	 /**
	  * @method updateLoadPanelList
	  */
	 updateLoadPanelList: function(filter) {
	
	    var list = WireIt.cn("ul");
	    if(lang.isArray(this.pipes)) {
	       for(var i = 0 ; i < this.pipes.length ; i++) {
	          var module = this.pipes[i];
	          this.pipesByName[module.name] = module;
	          if(!filter || filter === "" || module.name.match(new RegExp(filter,"i")) ) {
		          list.appendChild( WireIt.cn('li',null,{cursor: 'pointer'},module.name) );
				}
	       }
	    }
	    var panelBody = Dom.get('loadPanelBody');
	
		 // Purge element (remove listeners on panelBody and childNodes recursively)
	    YAHOO.util.Event.purgeElement(panelBody, true);

	    panelBody.innerHTML = "";
	    panelBody.appendChild(list);

	    Event.addListener(list, 'click', function(e,args) {
	    	this.loadPipe(Event.getTarget(e).innerHTML);
	    }, this, true);

	 },

	 /**
	  * @method load
	  */
	 load: function() {
    
	    this.adapter.listWirings({language: this.options.languageName},{
				success: function(result) {
					this.onLoadSuccess(result);
				},
				failure: function(errorStr) {
					this.alert("Unable to load the wirings: "+errorStr);
				},
				scope: this
			}
			);

	 },

	 /**
	  * @method onLoadSuccess
	  */
	 onLoadSuccess: function(wirings) {
			this.pipes = wirings;
			this.pipesByName = {};
		
			this.renderLoadPanel();
	    	this.updateLoadPanelList();

			if(!this.afterFirstRun) {
				var p = window.location.search.substr(1).split('&');
				var oP = {};
				for(var i = 0 ; i < p.length ; i++) {
					var v = p[i].split('=');
					oP[v[0]]=window.decodeURIComponent(v[1]);
				}
				this.afterFirstRun = true;
				if(oP.autoload) {
					this.loadPipe(oP.autoload);
					return;
				}
			}

	    this.loadPanel.show();
		},

	 /**
	  * @method getPipeByName
	  * @param {String} name Pipe's name
	  * @return {Object} return the pipe configuration
	  */
	 getPipeByName: function(name) {
	    var n = this.pipes.length,ret;
	    for(var i = 0 ; i < n ; i++) {
	       if(this.pipes[i].name == name) {
				return this.pipes[i].working;
	       }
	    }
	    return null;
	 },
 
	 /**
	  * @method loadPipe
	  * @param {String} name Pipe name
	  */
	 loadPipe: function(name) {
	
		if(!this.isSaved()) {
			if( !confirm("Warning: Your work is not saved yet ! Press ok to continue anyway.") ) {
				return;
			}
		}
	
		try {
	
			this.preventLayerChangedEvent = true;
	
	     this.loadPanel.hide();
	
	    var wiring = this.getPipeByName(name), i;

		 if(!wiring) {
			this.alert("The wiring '"+name+"' was not found.");
			return;
	  	 }
    
	    // TODO: check if current wiring is saved...
	    this.layer.clear();
    
	    this.propertiesForm.setValue(wiring.properties, false); // the false tells inputEx to NOT fire the updatedEvt
    
	    if(lang.isArray(wiring.modules)) {
      
	       // Containers
	       for(i = 0 ; i < wiring.modules.length ; i++) {
	          var m = wiring.modules[i];
	          if(this.modulesByName[m.name]) {
	             var baseContainerConfig = this.modulesByName[m.name].container;
	             YAHOO.lang.augmentObject(m.config, baseContainerConfig); 
	             m.config.title = m.name;
	             var container = this.layer.addContainer(m.config);
	             Dom.addClass(container.el, "WiringEditor-module-"+m.name);
	             container.setValue(m.value);
	          }
	          else {
	             throw new Error("WiringEditor: module '"+m.name+"' not found !");
	          }
	       }
       
	       // Wires
	       if(lang.isArray(wiring.wires)) {
	           for(i = 0 ; i < wiring.wires.length ; i++) {
	              // On doit chercher dans la liste des terminaux de chacun des modules l'index des terminaux...
	              this.layer.addWire(wiring.wires[i]);
	           }
	        }
	     }
     
		this.markSaved();
	
		this.preventLayerChangedEvent = false;
	
	  	}
	  	catch(ex) {
	     	this.alert(ex);
	  	}
	 },


	onLayerChanged: function() {
		if(!this.preventLayerChangedEvent) {
			this.markUnsaved();
		}
	},

 
 /**
  * This method return a wiring within the given vocabulary described by the modules list
  * @method getValue
  */
 getValue: function() {
    
   var i;
   var obj = {modules: [], wires: [], properties: null};

   for( i = 0 ; i < this.layer.containers.length ; i++) {
      obj.modules.push( {name: this.layer.containers[i].options.title, value: this.layer.containers[i].getValue(), config: this.layer.containers[i].getConfig()});
   }

   for( i = 0 ; i < this.layer.wires.length ; i++) {
      var wire = this.layer.wires[i];

      var wireObj = { 
         src: {moduleId: WireIt.indexOf(wire.terminal1.container, this.layer.containers), terminal: wire.terminal1.options.name}, 
         tgt: {moduleId: WireIt.indexOf(wire.terminal2.container, this.layer.containers), terminal: wire.terminal2.options.name}
      };
      obj.wires.push(wireObj);
   }
   
   obj.properties = this.propertiesForm.getValue();
    
   return {
      name: obj.properties.name,
      working: obj
   };
 }


});


/**
 * WiringEditor Adapters
 * @static
 */
WireIt.WiringEditor.adapters = {};


})();
/**
 * Some utility classes to provide grouping in the WiringEditor
 * @module grouping-plugin
 */


/**
 * Add methods to container :
 */


/*setOptions: function() {
	

this.getGrouper = this.options.getGrouper	
	
};


onGroupButton: function(e, args) {
    Event.stopEvent(e);

    this.layer.grouper.toggle(this)
    //TODO: link somehow to editor's group manager?
},

addedToGroup: function() {
    if (YAHOO.lang.isValue(this.ddHandle))
    this.ddHandle.style.backgroundColor = "green";
},

 removedFromGroup: function() {
if (YAHOO.lang.isValue(this.ddHandle))
    this.ddHandle.style.backgroundColor = "";
 },*/(function() {
    var util = YAHOO.util,lang = YAHOO.lang;
    var Event = util.Event, Dom = util.Dom, Connect = util.Connect,JSON = lang.JSON,widget = YAHOO.widget;

/**
 * Handles a Group
 * @class WireIt.Group
 */    
WireIt.Group = function(grouper, layer, serialisedGroup) {
	
	this.containers  = [];
	this.groups = [];
	this.properties = {};
	
	this.layer = layer;
	this.grouper = grouper;
	
	this.events = {};
	
	this.events.containerAdded = new YAHOO.util.CustomEvent("containerAdded");    
	this.events.containerRemoved = new YAHOO.util.CustomEvent("containerRemoved");    
	this.events.groupAdded = new YAHOO.util.CustomEvent("groupAdded");
	this.events.groupRemoved = new YAHOO.util.CustomEvent("groupRemoved");
	this.events.groupEmptied = new YAHOO.util.CustomEvent("groupEmptied");
	
	this.events.stateChanged = new YAHOO.util.CustomEvent("stateChanged");
	this.stateChangeFunc = function (eventName, objects)  { 
		this.events.stateChanged.fire({"event" : eventName, "objects" : objects});
   };
	    
	this.events.containerAdded.subscribe(this.stateChangeFunc, this, true);
	this.events.containerRemoved.subscribe(this.stateChangeFunc, this, true);
	this.events.groupAdded.subscribe(this.stateChangeFunc, this, true);
	this.events.groupRemoved.subscribe(this.stateChangeFunc, this, true);
	
	this.events.containerRemoved.subscribe(this.checkGroupEmpty, this, true);
	this.events.groupRemoved.subscribe(this.checkGroupEmpty, this, true);
	
	this.collapsing = false;
	
	//If a container is removed from the layer then remove it from the currently selected groups
	layer.eventRemoveContainer.subscribe(function(eventName, containers) 
	    {
		if (!this.collapsing)
		    this.removeContainer.call(this, containers[0]);
	    }, this, true);
    };
    


WireIt.Group.prototype = {
	
	collapse: function(expanded)
	{
	    if (lang.isValue(this.groupContainer))
		return this.groupContainer; //This group is already collapsed
	    
	    for (var gI in this.groups)
	    {
		var go = this.groups[gI];
		go.group.collapse.call(go.group, true);
	    }
	    
	    var map = WireIt.GroupUtils.getMap(this);
	    var collapsedConfig = WireIt.GroupUtils.getCollapsedConfig(this, map);
	    var containers = [];
	    WireIt.GroupUtils.addAllContainers(this, containers);
	    var sGroup = WireIt.GroupUtils.serialiseGroup(this, containers);
	    
	    var modules = WireIt.GroupUtils.getInternalModuleConfig(containers, collapsedConfig.center);
	    var getInternalContainerId = function(container) {
		    return containers.indexOf(container);
		};
	    
	    var getExternalTerminalName = function(type, index, name) {
		    var submap;
		    
		    if (type == "container")
			submap = map.containerMap;
		    else
			submap = map.groupMap;

		    
		    var terminal = submap[index].terminals[name];
		    
		    if (lang.isObject(terminal)) {
				return terminal.externalName;
			}
		    else {
				var field = submap[index].fields[name];
			
				if (lang.isObject(field) && field.fieldConfig.wirable)
			    	return field.externalName;
		    	}
		    
			};
	    
	    var wires = WireIt.GroupUtils.getWireConfig(this, getInternalContainerId, getExternalTerminalName);

	    var gc = this.layer.addContainer(
				    {
						"xtype": "WireIt.GroupFormContainer",
						"title": "Group",    

						"collapsible": false,
						"fields": collapsedConfig.fields,
						"terminals" : collapsedConfig.terminals,
						"legend": null,
						"getBaseConfigFunction" : this.grouper.baseConfigFunction,
						groupConfig : {"group" : sGroup, "center": collapsedConfig.center, "modules" : modules, "wires" : wires.internal, "map" : WireIt.GroupUtils.getExternalToInternalMap(map)},
						position : collapsedConfig.position
				    }
			    )
	    
	    this.addExternalWires(gc, wires.external);
	    //TODO: place in tempory vars since removing from layer could remove from group in future

	    this.collapsing = true;

	    var index;
	    for (index in this.containers)
		this.layer.removeContainer(this.containers[index].container);
		
	    for (index in this.groups)
		WireIt.GroupUtils.removeGroupFromLayer(this.groups[index].group, this.layer);

	    this.collapsing = false;

	    gc.group = this
	    this.containers = [];
	    this.groups = [];
	    this.groupContainer = gc;
	    this.properties.expanded = lang.isValue(expanded) ? expanded : false;
	    
	    return gc;
	},

	checkGroupEmpty: function() {
	   //Check the group is empty
	   if (!lang.isValue(this.groupContainer) && this.containers.length == 0 && this.groups.length == 0) {
			this.events.groupEmptied.fire(this);
	   }
	},

	expand: function()
	{
	    if (lang.isValue(this.groupContainer))
	    {
		this.groupContainer.expand();
	    }
	},
	
	addContainer: function(container, overrides)
	{
	    if (!lang.isObject(overrides))
		    overrides = {"fields" : {}, "terminals" : {}};
		    
	    var co = {"container" : container, "overrides" : overrides}
	    
	    this.containers.push(co);
	    container.group = this;
	    
	    container.eventAddWire.subscribe(this.stateChangeFunc, this, true);
	    container.eventRemoveWire.subscribe(this.stateChangeFunc, this, true);
	    
	    this.events.containerAdded.fire(co);
	},
	
	addGroup: function(group, overrides)
	{
	    if (!lang.isObject(overrides))
		    overrides = {"fields" : {}, "terminals" : {}};
	    
	    var go = {"group" : group, "overrides" : overrides}
	    this.groups.push(go);
	    group.group = this;
	    
	    //Listen to the inner group's state change (so we can fire our one)
	    group.events.stateChanged.subscribe(this.stateChangeFunc, this, true);
	    group.events.groupEmptied.subscribe(function() { this.removeGroup(group); }, this, true);
	    this.events.containerAdded.fire(go);
	},
	
	removeContainer: function(container, index)
	{
	    if (!lang.isValue(index))
		index = WireIt.GroupUtils.firstTestSucess(this.containers, function (co) { return co.container == container; });
	
	    if (index != -1)
	    {
		this.containers.splice(index, 1);
		
		container.group = null;
		this.events.containerRemoved.fire(container);
	    }
	},
	
	removeGroup: function(group, index)
	{
	    if (!lang.isValue(index))
		index = WireIt.GroupUtils.firstTestSucess(this.groups, function (go) { return go.group == group });
	
	    if (index != -1)
	    {
		group.group = null;
		this.events.groupRemoved.fire(this.groups.splice(index, 1));
	    }
	},
	
	unGroup: function()
	{
	    if (lang.isValue(this.groupContainer))
	    {
		this.expand();
	    }
	    
	    var temp = {};
	    temp.containers = [];
	    lang.augmentObject(temp.containers, this.containers);
	    temp.groups = [];
	    lang.augmentObject(temp.groups, this.groups);
	    
	    
	    {
		for (var cI in temp.containers)
		{
		    var co = temp.containers[cI];

		    this.removeContainer(co.container);

		    if (lang.isValue(this.group))
			this.group.addContainer(co.container, co.overrides); //TODO: name conflicts?
		}
		
		for (var gI in temp.groups)
		{
		    var go = temp.groups[gI];
		    
		    this.removeGroup(go.group);
		    
		    if (lang.isValue(this.group))
			this.group.addGroup(go.group, go.overrides);
		}
	    }
	    
	    if (lang.isValue(this.group))
	    {
		this.group.removeGroup(this);
		this.group = null;
	    }
	    else
		this.layer.removeGroup(this);
		
	    this.events.stateChanged.fire(this);
	},
	
	generateUI: function(map, changedCallback)
	{
	    if (!lang.isValue(map))
		map = WireIt.GroupUtils.getMap(this)
	    
	    listRows = [];
	    var configUITerminalMap = {};
	    var configUIFieldMap = {};
	    var layer = this.layer;
	    var self = this;
	    
	    var addRemapInput = function(name, moduleId, showOn, showCancel, defaultVisible, defaultName, visibleReadOnly, showSide, defaultSide)
		{
		    var addTds = function(row) {
			    tds = [];
			    
			    for(var i = 0; i < 4; i++)
			    {
				var td = WireIt.cn("td")
				tds.push(td);
				row.appendChild(td);
			    }
			    
			    return tds;
			}
		    
		    var row = WireIt.cn("tr")
		    row.onmouseover = showOn
		    row.onmouseout = showCancel
		    
		    var focusable = []
		    
		    var visible = WireIt.cn("input", {"type" : "checkbox"});
		    visible.checked = (typeof defaultVisible == "undefined") ? "" : defaultVisible;
		    visible.disabled = visibleReadOnly
		    focusable.push(visible);
		    
		    var externalName = WireIt.cn("input", {"type" : "text"});
		    externalName.value = (typeof defaultName == "undefined") ? "" : defaultName
		    focusable.push(externalName);
		    
		    var tds = addTds(row);
		    
		    tds[0].innerHTML = name;
		    tds[1].appendChild(visible);
		    tds[2].appendChild(externalName);
		    
		    if (showSide)
		    {
			var sideSelect = WireIt.cn("select");
			sideSelect.appendChild(WireIt.cn("option", {value: "top"}, {}, "Top"));
			sideSelect.appendChild(WireIt.cn("option", {value: "bottom"}, {}, "Bottom"));
			sideSelect.appendChild(WireIt.cn("option", {value: "left"}, {}, "Left"));
			sideSelect.appendChild(WireIt.cn("option", {value: "right"}, {}, "Right"));
			
			if (lang.isValue(defaultSide))
			    sideSelect.value = defaultSide;
			
			focusable.push(sideSelect)
			
			tds[3].appendChild(sideSelect);
		    }
		    else
		    {
			tds[3].align = "center";
			tds[3].innerHTML = "---";
		    }
		    /*
		    var showButton = WireIt.cn("button", {}, {}, "Show")
		    showButton.onmousedown = showOn
		    showButton.onmouseup = showCancel; 
		    showButton.onmouseout = showCancel;
		    
		    tds[5].appendChild(showButton);*/
		    listRows.push(row)

		    for (var i in focusable)
		    {
			var f = focusable[i];
			f.onfocus = showOn
			f.onblur = showCancel
			f.onchange = changedCallback;
		    }

		    return {"visible": visible, "externalName":  externalName, "side" : sideSelect};
		}
	
	
	    var addTerminal = function(internalName, tMap, override, moduleId, fieldTerminals, showOn, showOff)
		{
		    var visibleReadOnly = false;
		    var defaultVisible = false;
		    var nameReadOnly = false;
		    
		    var fieldTerminal = fieldTerminals[internalName];
		    if (!lang.isValue(fieldTerminal))
		    {
			var fragment = addRemapInput(internalName, moduleId, function() { showOn(moduleId) }, function() { showOff(moduleId) }, 
			    tMap.visible || override.visible,  lang.isValue(override.rename) ? override.rename : "", 
			    lang.isValue(tMap.forceVisible) ? tMap.forceVisible : false,
			    true, override.side);
		    
			//if (!lang.isValue(configUITerminalMap[moduleId]))
			// configUITerminalMap[moduleId] = {};
			    
			//configUITerminalMap[moduleId][internalName] = fragment;
			return fragment;
		    }
		}
	    
	    var addField = function(internalName, fMap, override, moduleId, fieldTerminals, showOn, showOff)
		{
		    var visibleReadOnly = false;
		    var defaultVisible = false;
		    if (fMap.fieldConfig.wirable)
		    {
			fieldTerminals[internalName] = true;
		    }
		    
		    
		    var fragment = addRemapInput(internalName, moduleId, function() { showOn(moduleId) }, function() { showOff(moduleId) }, 
			override.visible || fMap.visible, lang.isValue(override.rename) ? override.rename : "", 
			lang.isValue(fMap.forceVisible) ? fMap.forceVisible : false);
		    
		    //if (!lang.isValue(configUIFieldMap[moduleId]))
		    //	configUIFieldMap[moduleId] = {};
			    
		    //configUIFieldMap[moduleId][internalName] = fragment
		    return fragment
		}
	    
	    var containerUIMap = [];
	    var groupUIMap = [];
	    
	    var addControls = function (fieldsAndTerminals, overrides, results, showOnByIndex, showOffByIndex)
	    {
		for (var cI in fieldsAndTerminals)
		{
		    var c = fieldsAndTerminals[cI];
		    var fieldTerminals = {};
		    var index = cI;
		    
		    var fields = {}
		    var terminals = {}
		    
		    for (var fName in c.fields)
		    {
			var fMap = c.fields[fName];
			var fieldValue= overrides[cI].container.getValue();
			if( fieldValue[fName] == undefined || ( fieldValue[fName] != undefined && fieldValue[fName] != "[wired]") ) { // Skip wired fields, we won't want them exposed.
			    fields[fName] = addField(fName, fMap, WireIt.GroupUtils.valueOr(overrides[cI].overrides.fields[fName], {}), cI, fieldTerminals, showOnByIndex, showOffByIndex);
		    }
		    }
		    
		    for (var tName in c.terminals)
		    {
			var tMap = c.terminals[tName];
			
			var tFragment = addTerminal(tName, tMap, WireIt.GroupUtils.valueOr(overrides[cI].overrides.terminals[tName], {}), cI, fieldTerminals, showOnByIndex, showOffByIndex);
			
			if (lang.isValue(tFragment))
			    terminals[tName] = tFragment;
		    }
		    
		    results.push({"fields" : fields, "terminals" : terminals});
		}
	    };
	    
	    
	    addControls(map.containerMap, this.containers, containerUIMap, function(index) 
		{ 
		    self.layer.setSuperHighlighted([self.containers[index].container]) 
		}, function(index) 
		    { 
			self.layer.unsetSuperHighlighted(); 
		    }
		);
		
	    addControls(map.groupMap, this.groups, groupUIMap, function(index) 
		{ 
		    var containers = [];
		    WireIt.GroupUtils.applyToContainers(self.groups[index].group, true, function(c) { containers.push(c) });
		    self.layer.setSuperHighlighted(containers);
		    
		}, function(index) 
		    { 
			self.layer.unsetSuperHighlighted();
		    }
		);
	    
	    //this.configUITerminalMap = configUITerminalMap;
	    //this.configUIFieldMap = configUIFieldMap;
		
	    return { 
		    "listRows" : listRows,
		    "containerUIMap": containerUIMap,
		    "groupUIMap": groupUIMap
		};
	},
	
	getAndCheckOverrides: function(containerUIMap, groupUIMap)
	{
	    var tempGroup = {};
	    lang.augmentObject(tempGroup, this);
	    tempGroup.containers = [];
	    //lang.augmentObject(tempGroup.containers, this.containers);
	    tempGroup.groups = [];
	    //lang.augmentObject(tempGroup.groups, this.groups);
	    
	    var overrides = WireIt.GroupUtils.getOverridesFromUI(containerUIMap, groupUIMap);
	    
	    for (var cI in this.containers)
	    {
		var co = {};
		co.container = this.containers[cI].container;
		co.overrides = overrides.containerOverrides[cI];
		
		tempGroup.containers[cI] = co;
	    }
	    for (var gI in this.groups)
	    {
		var go = {};
		go.group = this.groups[gI].group;
		go.overrides = overrides.groupOverrides[gI];
		
		tempGroup.groups[gI] = go;
	    }
   
	    var map;
	    
	  try {
			map = WireIt.GroupUtils.getMap(tempGroup);
	  }
	  catch (err) {
			if (lang.isObject(err) && lang.isValue(err.type) && err.type == "MappingError") {
		    return {"overrides" : overrides, "valid" : false, "error" : err};
			}
			else
		    	throw err
	  }
	    
	  return {"overrides" : overrides, "valid" : true};
	},
	
	setGroupOptions: function(overrides)
	{
	    for (var cI in overrides.containerOverrides)
	    {
		var o =  overrides.containerOverrides[cI];
		
		this.containers[cI].overrides = o;
	    }
	    
	    for (var gI in overrides.groupOverrides)
	    {
		var o =  overrides.groupOverrides[cI];
		
		this.groups[gI].overrides = o;
	    }
	},
	
	addExternalWires: function(groupContainer, wireMap)
	{
		var layer = this.layer;
	
		for (var wI in wireMap)
		{
		    var w = wireMap[wI];
		    
		    var groupFragment = {};
		    groupFragment.moduleId = this.layer.containers.indexOf(groupContainer);
		    groupFragment.terminal = w.externalName;

		    var externalFragment = {};
		    externalFragment.moduleId = this.layer.containers.indexOf(w.externalTerminal.container);
		    externalFragment.terminal = w.externalTerminal.options.name;
		    
		    
		    var wireConfig = { }
		    
		    if (w.groupIsSource)
		    {
				wireConfig.src = groupFragment;
				wireConfig.tgt = externalFragment;
		    }
		    else
		    {
				wireConfig.src = externalFragment;
				wireConfig.tgt = groupFragment;
		    }
		    
		    this.layer.addWire(wireConfig);
		}
	}
    }
})();(function() {
    var util = YAHOO.util,lang = YAHOO.lang;
    var Event = util.Event, Dom = util.Dom;


/**
 * @class WireIt.Grouper
 */    
WireIt.Grouper = function (layer, baseConfigFunction) {
	
	this.layer = layer;
	this.baseConfigFunction = baseConfigFunction;
	this.containers = [];
	this.groups = [];
	this.setupWidget(Dom.get("groupConfig"));
	
	//If a container is removed from the layer then remove it from the currently selected groups
	layer.eventRemoveContainer.subscribe(function(eventName, containers) { 
		this.removeContainer(containers[0]);
   }, this, true);
	
	//If a container is added to the layer then we want to listen to the focus event so we can show group information
	layer.eventAddContainer.subscribe(function(eventName, container) {
		var display = this.display;
		container[0].eventFocus.subscribe(function(eventName, containers)  { 
		    var container = containers[0];
		    if (lang.isValue(container.group)) {
				this.showGroup(container.group);
		    }
		    else {
				this.deselectGroup();
				this.hideGroupConfigure();
		    }
		}, this, true);

   }, this, true);
	    
	this.rubberband = new WireIt.RubberBand(this);
	
	this.rubberband.style = {};
	this.rubberband.style.position = "absolute";
	
};



WireIt.Grouper.prototype = {

	/**
	 * setupWidget
	 */
   setupWidget: function(displayDiv) {
	
	    this.display = {};
	    this.display.mainDiv = displayDiv;
	    
	    this.display.buttonsElement = WireIt.cn("div");
	    displayDiv.appendChild(this.display.buttonsElement);
	    
    	    var collapseButton = WireIt.cn("button", {}, {}, "Collapse");
	    collapseButton.id = "groupConfigCollapseButton";
	    this.display.buttonsElement.appendChild(collapseButton);
	    Event.addListener('groupConfigCollapseButton','click', this.groupCollapse, this, true);
	    
	    var groupSelect = WireIt.cn("select");
	    this.display.groupSelect = groupSelect;
	    groupSelect.id = "groupConfigGroupSelect";
	    this.display.buttonsElement.appendChild(groupSelect);
	    
	    Event.addListener('groupConfigGroupSelect','change', function () { this.selectGroup.call(this, groupSelect); } , this, true);
	    
	    var ungroupButton = WireIt.cn("button", {}, {}, "Ungroup");
	    ungroupButton .id = "groupUngroupButton";
	    this.display.buttonsElement.appendChild(ungroupButton);
	    Event.addListener('groupUngroupButton','click', this.unGroup, this, true);
	    
	    var body = WireIt.cn("div");
	    displayDiv.appendChild(body);
	    
	    var list = WireIt.cn("table", {id: "groupPanelBodyList"});
	    this.display.list = list;
	    body.appendChild(list);
	    
	    var row = WireIt.cn("tr");
	    this.display.listHeadRow = row;
	    
	    list.appendChild(row);
	    row.appendChild(WireIt.cn("th", {}, {}, "Name"));
	    row.appendChild(WireIt.cn("th", {}, {}, "Visible"));
	    row.appendChild(WireIt.cn("th", {}, {}, "New name"));
	    row.appendChild(WireIt.cn("th", {}, {}, "Show"));

	    this.hideGroupConfigure();
	},
    
	/**
	 * setDisplay
	 */
   setDisplay: function (rows) {
		this.display.list.innerHTML = "";
		this.display.list.appendChild(this.display.listHeadRow);
	
		for (var rI in rows) {
	    	this.display.list.appendChild(rows[rI]);
		}
   },
   
	/**
	 * groupCollapse
	 */
   groupCollapse: function() {
		if (lang.isValue(this.selectedGroup)) {
	    	this.selectedGroup.collapse();
		}
   },
    
	/**
	 * selectGroup
	 */
   selectGroup: function(select) {
		var index = select.selectedIndex;
		if (index >= 0 && lang.isArray(this.selectedGroups) && index < this.selectedGroups.length) {
	    	var group = this.selectedGroups[index];
	    	this.showGroupConfigure(group);
		}
		else {
	   	alert("index wrong (" + index + ")");
		}
   },
    
	/**
	 * unGroup
	 */
   unGroup: function() {
		if (lang.isValue(this.selectedGroup)) {
	    	var selGroup = this.selectedGroup;
	    	this.deselectGroup();
	    	selGroup.unGroup();
		}
   },
    
   /**
 	 * setGroupOptions
	 */
	setGroupOptions: function() {
		var containerUIMap = this.display.containerUIMap;
		var groupUIMap = this.display.groupUIMap;
		var group = this.selectedGroup;
	
		var checkedOverrides = group.getAndCheckOverrides(containerUIMap, groupUIMap);
	
		if (checkedOverrides.valid) {
	    	group.setGroupOptions(checkedOverrides.overrides);
		}
		else {
	    	alert("Validation error, " + checkedOverrides.error.message);
		}
    },
   
 	 /**
 	  * addContainer
 	  */
    addContainer: function(container) {
	
		if (lang.isValue(container.group)) {
	   	var group = WireIt.GroupUtils.getOuterGroup(container.group);
	   	this.addGroup(group);
		}
		else if (this.containers.indexOf(container) == -1) {
	    	this.containers.push(container);	    
	    	container.addedToGroup();
		}
    },
	
	 /**
	  * removeContainer
	  */
    removeContainer: function(container, index) {
		if (!lang.isValue(index)) {
	    	index = this.containers.indexOf(container);
		}
	    
		if (index != -1) {
	    	this.containers.splice(index, 1);
	    	//this.group.removeContainer(container);
	    	container.removedFromGroup();
		}
		/*else
	    	alert("not here");*/
    },
	
	 /**
	  * addGroup
	  */
    addGroup: function(group) {
	
		if (this.groups.indexOf(group) == -1) {
	    	this.groups.push(group);
	    	var groupSelect = function(g) { WireIt.GroupUtils.applyToContainers(g, true, function(c) { c.addedToGroup(); }); };
	    
	    	groupSelect(group);
	    
	    	group.events.groupEmptied.subscribe(function() { this.removeGroup(group); }, this, true);
	    	group.events.containerAdded.subscribe(function(eventName, containers) { containers[0].addedToGroup(); }, this, true);
	    	group.events.groupAdded.subscribe(function(eventName, groups) { groupSelect(groups[0]); }, this, true);
	    
	    	group.events.containerRemoved.subscribe(function(eventName, containers) { this.addContainer(containers[0]); }, this, true);
	    	group.events.groupRemoved.subscribe(function(eventName, groups) { this.addGroup(groups[0]); }, this, true);
		}
   },

	/**
	 * removeGroup
	 */
   removeGroup: function(group, index) {
		
		if (!lang.isValue(index)) {
	    	index = this.groups.indexOf(group);
		}
	
		if (index != -1) {
	    	this.groups.splice(index, 1);
	    	var containers = [];
	    	WireIt.GroupUtils.addAllContainers(group, containers);
	    
	    	for (var cI in containers) {
				containers[cI].removedFromGroup();
			}
		}
   },

	/**
	 * toggle
	 */
   toggle: function(container) {
		if (lang.isValue(container.group)) {
	    	var group = WireIt.GroupUtils.getOuterGroup(container.group);
	    	var groupIndex = this.groups.indexOf(group);
	    
	    	if (groupIndex == -1)
				this.addGroup(group);
	    	else
				this.removeGroup(group, groupIndex);
		}
		else {
	    	var index = this.containers.indexOf(container);
	    	if (index == -1)
				this.addContainer(container);
	    	else
				this.removeContainer(container, index);
		}
   },
   
 	/**
	 * makeGroup
	 */
   makeGroup: function() {
		
		if (this.containers.length > 0 || this.groups.length > 0) {
	    	var group = new WireIt.Group(this, this.layer);
	    	var tempGroups = [];
	    	var tempContainers = [];
	    
	    	for (var cI in this.containers) {
				var c = this.containers[cI];
				group.addContainer(c);
				tempContainers.push(c);
	    	}
	    
	    	for (var gI in this.groups) {
				var g = this.groups[gI];
				group.addGroup(g);
				this.layer.removeGroup(g);
				tempGroups.push(g);
	    	}
	    
	    	for (var tcI in tempContainers)
				this.removeContainer(tempContainers[tcI]);
	    	for (var tgI in tempGroups)
				this.removeGroup(tempGroups[tgI]);
		
	    	this.layer.groups.push(group);
	    	group.events.groupEmptied.subscribe(function() { this.layer.removeGroup.call(this.layer, group); }, this, true);	    

	    	this.showGroup(group, true);
		}
   },
    
	/**
	 * showGroup
	 */
   showGroup: function(group, forceThisGroup) {
		
		var g;
		if (forceThisGroup)
	    	g = group;
		else
	    	g = WireIt.GroupUtils.getOuterGroup(group);
	    
		this.showGroupConfigure.call(this, g);
		this.setupSelectedGroups(group);
   },
   
 	/**
 	 * setupSelectedGroups
 	 */
   setupSelectedGroups: function(bottomGroup) {
		var selectedGroups = [];
		this.selectedGroups = selectedGroups;
	
		var display = this.display;
		display.groupSelect.innerHTML = "";
		var selectedGroup = this.selectedGroup;
	
		WireIt.GroupUtils.getOuterGroup(bottomGroup, function(current) {
			var option = WireIt.cn("option", {value: "N" + selectedGroups.length}, {}, "N" + selectedGroups.length);
			selectedGroups.push(current);
		
			display.groupSelect.appendChild(option);
		
			if (selectedGroup == current)
		    	option.selected = true;
	    	}
	    );
   },
    
	/**
	 * showGroupConfigure
	 */
   showGroupConfigure: function(group, map) {
		
		if (!lang.isValue(group) || lang.isValue(group.groupContainer)) {
	    	hideGroupConfigure(); //TODO: you should be able to modify group mappings while collapsed
		}
		else {
			var self = this;
			var ui = group.generateUI(map, function() { self.setGroupOptions.call(self); });
			this.setDisplay(ui.listRows);
	
			this.setSelectedGroup(group);
			this.display.containerUIMap = ui.containerUIMap;
			this.display.groupUIMap = ui.groupUIMap;
	
			group.events.stateChanged.subscribe(function() {
				this.deselectGroup();
				this.hideGroupConfigure();
	    	}, this, true);
	
			this.display.mainDiv.style.display = "block"; //TODO: safter visibility toggle?
		}
   },
   
 	/**
 	 * hideGroupConfigure
	 */
   hideGroupConfigure: function() {
		this.display.mainDiv.style.display = "none";//safter visibility toggle?
   },
    
	/**
	 * setSelectedGroup
	 */
   setSelectedGroup: function(group) {
		this.deselectGroup();
		this.selectedGroup = group;
		WireIt.GroupUtils.applyToContainers(this.selectedGroup, true, function(c) { c.highlight(); });
   },
    
	/**
	 * deselectGroup
	 */
   deselectGroup: function() {
		
		if (lang.isValue(this.selectedGroup))
	    	WireIt.GroupUtils.applyToContainers(this.selectedGroup, true, function(c) { c.dehighlight(); });
		
		this.selectedGroup = null;
   },
	
	/**
	 * rubberbandSelect
	 */
   rubberbandSelect: function() {
		
		for (var cI in this.layer.containers) {
	    	var c = this.layer.containers[cI];
	    
	    	var checkPoints = this.getContainerCorners(c);
	    	var inside = true;
	    
	    	for (var i in checkPoints)
				inside &= this.rubberband.pointIsInside(checkPoints[i].x, checkPoints[i].y);
		
	    	if (inside) {
				this.addContainer(c);
	    	}
		}
	
   },
   
 	/**
	 * getContainerCorners
 	 */
   getContainerCorners: function(container) {
		var top = container.el.offsetTop;
		var bottom = top+container.el.offsetHeight;
	
		var left = container.el.offsetLeft;
		var right = left+container.el.offsetWidth;
	
		return [
	    	{x : left, y: top},
	    	{x : left, y: bottom},
	    	{x : right, y: top},
	    	{x : right, y: bottom}
		];
   }

};


})();(function() {
   
   var util = YAHOO.util,lang = YAHOO.lang;
   var Dom = util.Dom, Event = util.Event, CSS_PREFIX = "WireIt-";

/**
 * Class used to build a container with inputEx forms
 * @class FormContainer
 * @namespace WireIt
 * @extends WireIt.Container
 * @constructor
 * @param {Object}   options  Configuration object (see properties)
 * @param {WireIt.Layer}   layer The WireIt.Layer (or subclass) instance that contains this container
 */
WireIt.GroupFormContainer = function(options, layer) {
   /*var fieldConfigs = WireIt.GroupUtils.fieldConfigsFromModules(options.groupConfig.modules, options.getBaseConfigFunction);
   
   var intermediate = WireIt.GroupUtils.generateFields(fieldConfigs, {fields: {}, terminals: {}}, {fields: {"0email" : true}, terminals: {}}); //TODO: wrong arguments
   options.fields = intermediate.fields;
   var terminalConfigs = WireIt.GroupUtils.terminalConfigsFromModules(options.groupConfig.modules, options.getBaseConfigFunction);
   
   options.terminals = WireIt.GroupUtils.generateTerminals(terminalConfigs , {fields: {}, terminals: {}}, {fields: {}, terminals: {}}, intermediate.usedTerminalNames);
    */ 
   WireIt.GroupFormContainer.superclass.constructor.call(this, options, layer);
   this.getBaseConfig = this.options.getBaseConfigFunction;
   
   this.positionTerminals();
};

YAHOO.lang.extend(WireIt.GroupFormContainer, WireIt.FormContainer, {
   
   /**
    * @method setOptions
    */
   setOptions: function(options) {
      WireIt.GroupFormContainer.superclass.setOptions.call(this, options);
      
      this.options.getBaseConfigFunction = options.getBaseConfigFunction
      this.options.groupConfig = options.groupConfig;
   },

   /**
    * The render method is overrided to call renderForm
    * @method render
    */
   render: function() {
      WireIt.GroupFormContainer.superclass.render.call(this);
      this.renderExpand();
   },

    positionTerminals: function()
    {
	var terminals = {};
	
	for (var i in this.options.terminals)
	{
	    var elem = this.options.terminals[i];
	    
	    var side = elem.side;
	    if (!lang.isValue(side))
		side = "top";

	    if (!lang.isArray(terminals[side]))
		terminals[side] = [];
		
	    terminals[side].push(elem);
	}

	var terminal_width = 30;

	var getRange = function(N) { return terminal_width * (N-1);  };

	var positionByNumber = function(n,N, size) {
			// n is expected to run from 0 to N-1, where N is the number of terminals on an edge
			var range = getRange(N);
			var half_range = range / 2;
			var pos = size / 2;
			pos -= half_range - n*terminal_width;
			var offset = terminal_width / 2;
			return pos-offset; // position in centre of terminal
		};

	var height = this.el.offsetHeight;
	var width = this.el.offsetWidth;	    
	var horizontalMax = Math.max(WireIt.GroupUtils.valueOr(terminals["top"], []).length, WireIt.GroupUtils.valueOr(terminals["bottom"], []).length);
	var verticalMax = Math.max(WireIt.GroupUtils.valueOr(terminals["left"], []).length, WireIt.GroupUtils.valueOr(terminals["right"], []).length);

	if (height < getRange(verticalMax))
	{
	    this.bodyEl.style.minHeight = new String(getRange(verticalMax)) + "px";
	    height = this.el.offsetHeight;
	}

	if (width < getRange(horizontalMax))
	{
	    this.bodyEl.style.minWidth = new String(getRange(horizontalMax)) + "px";
	    width = this.el.offsetWidth;
	}

	for (var side in terminals)
	{
	    var sTerminals = terminals[side];
	    var count = sTerminals.length;
	    
	    var variable, fixed, size;
	    
	    
	    if (side == "left" || side == "right")
	    {
		variable = "top";
		size = height;
	    } else
	    {
		variable = "left";
		size = width;
	    }
	    
	    fixed = side;
	    
	    for (var i = 0; i < count; i++)
	    {
		var terminal = this.getTerminal(sTerminals[i].name);
		var pos = new Object();
		pos[fixed] = -15;
		pos[variable] = new String(positionByNumber(i, count, size));
		    
		terminal.setPosition(pos);
	    }
	}
    },

   renderExpand: function() {
        this.unGroupButton = WireIt.cn('div', {className: 'WireIt-Container-ungroupbutton'} );
        Event.addListener(this.unGroupButton, "click", this.expand, this, true);

        this.ddHandle.appendChild(this.unGroupButton)
    },

    expand: function() 
    {
	//For each module add it to the layer
	//For each wire wire up the new containers
	//For each internal group add to layer groups, remap from serialised 
	//For each wire on group container make wire to new containers
	//Remove group container
	
	//var expandedContainers = WireIt.GroupUtils.expand(this.options.groupConfig, this, this.layer);
	
	var mapModuleId = function(offset, moduleId)
	    {
		return parseInt(offset)+parseInt(moduleId);
	    };
	
	var offset = this.layer.containers.length;
	
	var thisConfig = this.getConfig();
	var position = [thisConfig.position[0], thisConfig.position[1]];
	
	var expandedContainers = [];
	
	for (var mI in this.options.groupConfig.modules)
	{
	    var m = this.options.groupConfig.modules[mI];
	    
	    var baseContainerConfig = this.getBaseConfig(m.name);
	    var newConfig = YAHOO.lang.JSON.parse( YAHOO.lang.JSON.stringify( m.config ) ) //TODO: nasty deep clone, probably breaks if you have DOM elements in your config or something
	    YAHOO.lang.augmentObject(newConfig , baseContainerConfig);
	    newConfig.title = m.name;
	    var newPos = this.translatePosition(newConfig.position, position);
	    newConfig.position = newPos;
	    var container = this.layer.addContainer(newConfig);
	    //Dom.addClass(container.el, "WiringEditor-module-"+m.name);
	    container.setValue(m.value);
	    
	    expandedContainers.push(container);
	}

	var deserialise = function(sGroup, groupToSet)
	{
	    var group = groupToSet;
	    if (!lang.isValue(group))
		group = new WireIt.Group(this.group.grouper, this.layer)
		
	    group.properties = sGroup.properties; //TODO: copy rather than reference?
	    
	    if (lang.isValue(sGroup.groupContainer))
	    {
		group.groupContainer = expandedContainers[sGroup.groupContainer];
		group.groupContainer.group = group;
	    }
	    else
	    {
		group.containers = [];
		group.groups = [];
		
		for (var cI in sGroup.containers)
		{
		    var co = sGroup.containers[cI];
		    var c = expandedContainers[co.container];
		    
		    group.containers.push({"container" : c, "overrides" : co.overrides});
		    c.group = this.group;
		}

		for (var gI in sGroup.groups)
		{
		    var go = sGroup.groups[gI]
		    var g = deserialise.call(this, go.group);
		    
		    group.groups.push({"group" : g, "overrides" : go.overrides});
		    g.group = this.group;
		}
	    }
	    
	    return group;
	}

	var group = deserialise.call(this, this.options.groupConfig.group, this.group);
/*
	for (var cI in expandedContainers)
	{
	    var c = expandedContainers[cI]
	    c.group = this.innerGroup;
	}*/

	var getTerminalByName = function (terminals, name)
	    {
		for (var tI in terminals)
		{
		    var t = terminals[tI];
		    
		    if (t.options.name == name)
			return t;
		}
	    };
	var self = this;
	var reconnectTerminal = function(terminal, internalId, internalName)
	    {
		for (var wI in terminal.wires)
		{
		    var w = terminal.wires[wI];
		    
		    var wire = {}
			    
		    var thisC = {"moduleId" : mapModuleId(offset, internalId), "terminal" : internalName}
		    
		    if (w.terminal1 == terminal)
		    {
			wire.src = thisC
			wire.tgt = {"moduleId" : self.layer.containers.indexOf(w.terminal2.container), "terminal" : w.terminal2.options.name}
		    }
		    else
		    {
			wire.tgt = thisC
			wire.src = {"moduleId" : self.layer.containers.indexOf(w.terminal1.container), "terminal" : w.terminal1.options.name}		    
		    }
		    
		    self.layer.addWire(wire);
		}
	    };
	
	var reconnect = function (tfMap, getInternalConfig, offset)
	{
	    for (var fName in tfMap.fields)
	    {
		var fMap = tfMap.fields[fName];
		var f = self.form.inputsNames[fName];
		var internal = getInternalConfig(fMap.containerId, fMap.name);
		
		internal.setValue(f.getValue());
		
		if (lang.isObject(f.terminal))
		    reconnectTerminal(f.terminal, mapModuleId(offset, fMap.containerId), fMap.name);
	    }
	    
	    for (var tName in tfMap.terminals)
	    {
		var tMap = tfMap.terminals[tName];
		var t = getTerminalByName(self.terminals, tName);
		
		reconnectTerminal(t, mapModuleId(offset, tMap.containerId), tMap.name);
	    }
	}
	
	reconnect(this.options.groupConfig.map.containerMap, function(id, name) { return group.containers[id].container.form.inputsNames[name]; }, 0);
	reconnect(this.options.groupConfig.map.groupMap, function(id, name) { return group.groups[id].group.groupContainer.form.inputsNames[name] }, group.containers.length);
	//Deserialise groups
	
	//Set Field values
	/*
	for (var fName in this.form.inputsNames)
	{
	    var f = this.form.inputsNames[fName];
	    var internal = WireIt.GroupUtils.getInternalField(this.options.groupConfig, fName);
	    
	    var container = expandedContainers[internal.moduleId];
	    
	    container.form.inputsNames[internal.name].setValue(f.getValue());
	}
	*/
	for (var wI in this.options.groupConfig.wires)
	{
	    var w = this.options.groupConfig.wires[wI]

	    this.layer.addWire(
		{
			"src":{
				"moduleId": mapModuleId(offset, w.src.moduleId),
				"terminal": w.src.terminal
			},
			"tgt":{
				"moduleId": mapModuleId(offset, w.tgt.moduleId),
				"terminal": w.tgt.terminal
			}
		}
	    );
	}
	
	
	//Remap current external wires to their corresponding internal containers
	/*
	for (var tI in this.terminals)
	{
	    var t = this.terminals[tI]
	    
	    for (var wI in t.wires)
	    {
			var w = t.wires[wI]
			
			var internal = WireIt.GroupUtils.getInternalTerminal(this.options.groupConfig, t.options.name);
			
			var wire = {}
			
			var thisC = {"moduleId" : mapModuleId(offset, internal.moduleId), "terminal" : internal.name}
			
			if (w.terminal1 == t)
			{
			    wire.src = thisC
			    wire.tgt = {"moduleId" : this.layer.containers.indexOf(w.terminal2.container), "terminal" : w.terminal2.options.name}
			}
			else
			{
			    wire.tgt = thisC
			    wire.src = {"moduleId" : this.layer.containers.indexOf(w.terminal1.container), "terminal" : w.terminal1.options.name}		    
			}
			
			this.layer.addWire(wire);
	    }
	}

	*/
	this.layer.removeContainer(this);

	this.group.groupContainer = null;

	var POPIgI = 0;
	for (POPIgI = 0; POPIgI < group.groups.length; POPIgI++)
	{
	    var g = group.groups[POPIgI].group;
	    
	    if (g.properties.expanded && lang.isValue(g.groupContainer))
		g.groupContainer.expand();
	}
	
	this.group.grouper.showGroup.call(this.group.grouper, this.group);
    },

    translatePosition: function(modulePosition, position)
    {
	return [ Math.max(0, modulePosition[0]+position[0]), Math.max(0, modulePosition[1]+position[1]) ];
    },

    getConfig : function()
    {
	var config = WireIt.GroupFormContainer.superclass.getConfig.call(this);
	lang.augmentObject(config, {"fields" : this.options.fields, "terminals" : this.options.terminals, "groupConfig" : this.options.groupConfig});
	
	return config;
    }

   /**
    * @method getValue
    */
/*   getValue: function() {
      return this.group;
   },
  */ 
   /**
    * @method setValue
    */
   /*setValue: function(val) {
      this.group = val;
    
      //Terminals
      this.removeAllTerminals();
      this.initTerminals(val.terminals);
      this.dd.setTerminals(this.terminals);
      
    //Fields - have to go after terminal stuff since fields create their own terminals and above stuff would destroy them
      this.options.fields = val.fields;
      this.form.destroy();
      this.renderForm();      
   }*/
   
});
})();(function() {
    var util = YAHOO.util,lang = YAHOO.lang;
    var Event = util.Event, Dom = util.Dom, Connect = util.Connect,JSON = lang.JSON,widget = YAHOO.widget;

    /**
    * Contains utility functions to do with groups (also one or two more general ones)
    * @class GroupUtils
    * @namespace WireIt
    */    
    WireIt.GroupUtils = {
	
	/**
	* Applys the given function to all containers in the group.
	* @method applyToContainers
	* @param {WireIt.Group} group The group object to work with
	* @param {boolean} deep Whether to recurse down into sub groups applying to their containers as well
	* @param {Function} func The function to apply (takes 1 arg, the container)
	* @param {Object} context The context to call the function with
	*/
	applyToContainers: function(group, deep, func, context)
	{
	    if (!lang.isValue(context))
		context = this;
	    
	    if (lang.isValue(group.groupContainer))
		func.call(context, group.groupContainer);
	    else
	    {
		for (var cI in group.containers)
		    func.call(context, group.containers[cI].container)
		    
		if (deep)
		{
		    for (var gI in group.groups)
			WireIt.GroupUtils.applyToContainers(group.groups[gI].group, deep, func, context);
		}
	    }
	},
    
	/**
	* Gives the argument back or a default if the argument is not a value
	* @param {any} The argument to check
	* @param {any} The default value
	* @return {any} The argument if it is a value or the default
	*/
	valueOr: function(arg, def)
	{
	    return lang.isValue(arg) ? arg : def;
	},
    
	/**
	* Removes the group's containers and sub groups from the layer
	* @param {WireIt.Group} The group to remove
	* @param {WireIt.Layer} The layer to remove them from
	*/
	removeGroupFromLayer : function(group, layer)
	{
	    group.collapsing = true;
	    
	    if (lang.isValue(group.groupContainer))
		layer.removeContainer(group.groupContainer);
	    else
	    {
		for (var i in group.containers)
		    layer.removeContainer(group.containers[i])
		    
		for (var i in group.groups)
		    WireIt.GroupUtils.removeGroupFromLayer(group.groups[i], layer);
	    }
	    group.collapsing = false;
	},
    
	/**
	* Gets the outer most group (e.g. if this group is inside another one it gives you that one (or its parent group if it has one etc etc))
	* @param {WireIt.Group} The group to get the outer group for
	* @param {Function} Optional callback function for each group found (including the given one)
	* @return {WireIt.Group} The outermost group
	*/
	getOuterGroup: function(group, groupCallback)
	{
	    var last = group;
	    var current = last;
	    do
	    {
		last = current;
		current = current.group;
		
		if (lang.isFunction(groupCallback))
		    groupCallback(last);
	    }
	    while (lang.isValue(current))
	    
	    return last;
	},
    
	/**
	* Adds all(recurses down) the containers in a group to the given array
	* @param {WireIt.Group} The group to get the containers from
	* @param {Array} The array to add all the containers to
	*/
	addAllContainers: function(group, containers)
	{
	    if (lang.isObject(group.groupContainer))
		containers.push(group.groupContainer);
	    else
	    {
		for (var cI in group.containers)
		    containers.push(group.containers[cI].container);

		for (var gI in group.groups)
		    WireIt.GroupUtils.addAllContainers(group.groups[gI].group, containers)
	    }
	},
    
	/**
	* Removes direct references to group and container objects (replaces with an index), is applied recursively to sub groups
	* @param {WiteIt.Group} group The group to serialise
	* @param {Array} containers The array of containers from the group (for generating indexes)
	* @return {Object} The seriliased group
	*/
	serialiseGroup: function(group, containers)
	{
	    var sGroup = {};
	    sGroup.properties = {};
	    lang.augmentObject(sGroup.properties, group.properties);
	    
	    if (lang.isValue(group.groupContainer))
	    {
		sGroup.groupContainer = containers.indexOf(group.groupContainer);
	    }
	    else
	    {
		sGroup.containers = []
		sGroup.groups = []
		for (var cI in group.containers)
		    sGroup.containers.push({"container" : containers.indexOf(group.containers[cI].container), "overrides" : group.containers[cI].overrides}) //TODO: check if index is -1?

		for (var gI in group.groups)
		{
		    var g = group.groups[gI];
		    
		    sGroup.groups.push({"group" : WireIt.GroupUtils.serialiseGroup(g.group, containers), "overrides" : g.overrides});
		}
	    }
	    
	    return sGroup;
	},
    
	/**
	* Get the configuration to pass to a group container
	* @param {WireIt.Group} group The group to get the config for
	* @param {object} map Optional The group's map (obtained by WireIt.GroupUtils.getMap(group))
	* @return {object} The collapsed config
	*/
	getCollapsedConfig: function(group, map)
	{
	    if (!lang.isObject(map))
		map = WireIt.GroupUtils.getMap(group);
		
	    var fieldConfigs = [];
	    var terminalConfigs = [];
	    var generateExternal = function(ftMap)
		{
		    for (var cI in ftMap)
		    {
			var c = ftMap[cI];
			
			for (var fName in c.fields)
			{
			    var fMap = c.fields[fName];
			    
			    if (fMap.visible)
			    {
				var fc = {};
				lang.augmentObject(fc, fMap.fieldConfig);
				
				fc.name = fMap.externalName;
				fc.label = fMap.externalName;
				lang.augmentObject(fc, fMap.fieldConfig)
				
				fieldConfigs.push(fc);
			    }
			}
		    
			for (var tName in c.terminals)
			{
			    var tMap = c.terminals[tName];
			    
			    if (tMap.visible)
			    {
				var tc = {};
				tc.name = tMap.externalName;
				tc.side = tMap.side;
				
				lang.augmentObject(tc, tMap.terminalConfig);
				
				terminalConfigs.push(tc)
			    }
			}
		    }
		}
	    
	    if (lang.isValue(map.groupContainerMap))
		generateExternal([map.groupContainerMap])
	    else
	    {
		generateExternal(map.containerMap);
		generateExternal(map.groupMap);
	    }
	    
	    var center = this.workOutCenter(group);
	    
	    return { "fields" : fieldConfigs, "terminals" : terminalConfigs, "position" :  center, "center" : center};
	},
    
	/**
	* Works out the center point of a group
	* @param {WireIt.Group} group The group to get the center of
	* @return {Array} the x, y position of the center
	*/
	workOutCenter: function(group)
	{
	    var bounds = {};
	    
	    var setBound = function(position)
		{
		    var left, top;
		    left = position[0];
		    top = position[1];
		    
		    if ((typeof bounds["left"] == "undefined") || bounds["left"] > left)
			bounds["left"] = left;
			
		    if ((typeof bounds["right"] == "undefined") || bounds["right"] < left)
			bounds["right"] = left;

		    if ((typeof bounds["top"] == "undefined") || bounds["top"] > top)
			bounds["top"] = top;

		    if ((typeof bounds["bottom"] == "undefined") || bounds["bottom"] < top)
			bounds["bottom"] = top;
		}
	    
	    if (lang.isObject(group.groupContainer))
	    {
		setBound(group.groupContainer.getConfig().position)
	    }
	    else
	    {
		for (var cI in group.containers)
		{
		    var c = group.containers[cI].container;
		    var config = c.getConfig();
		    
		    setBound(config.position);
		}
		
		for (var gI in group.groups)
		{
		    var g = group.groups[gI].group;
		    
		    setBound(WireIt.GroupUtils.workOutCenter(g));
		}
	    }
	    return [
		    ((bounds.right + bounds.left)/2),
		    ((bounds.top + bounds.bottom)/2)
		];
	},
    
	getExternalToInternalMap: function(map)
	{
	    var containerMap = {"fields" : {}, "terminals" : {}};
	    var groupMap = {"fields" : {}, "terminals" : {}};
			    
	    for (var cI in map.containerMap)
	    {
		var c = map.containerMap[cI];
		
		for (var fName in c.fields)
		{
		    var f= c.fields[fName];
		    
		    if (f.visible)
			containerMap.fields[f.externalName] = {"containerId" : cI, "name" : fName}
		}
		
		for (var tName in c.terminals)
		{
		    var t= c.terminals[tName];
		    
		    if (t.visible)
			containerMap.terminals[t.externalName] = {"containerId" : cI, "name" : tName}
		}
	    }
	    
	    for (var cI in map.groupMap)
	    {
		var c = map.groupMap[cI];
		
		for (var fName in c.fields)
		{
		    var f= c.fields[fName];
		    
		    if (f.visible)
			groupMap.fields[f.externalName] = {"containerId" : cI, "name" : fName}
		}
		
		for (var tName in c.terminals)
		{
		    var t= c.terminals[tName];
		    
		    if (t.visible)
			groupMap.terminals[t.externalName] = {"containerId" : cI, "name" : tName}
		}
	    }
	    
	    return {"containerMap" : containerMap, "groupMap" : groupMap};
	},
    
	/**
	* Set the override options for the group (e.g. rename fields)
	* Currently sets all overrides not just the ones that are actually changed by the user
	* @method getOverridesFromUI
	*/
	getOverridesFromUI: function(containerUIMap, groupUIMap)
	{
	    containerOverrides = [];
	    groupOverrides = [];
	    
	    //for the moment set all overrides
	    for (var cI in containerUIMap)
	    {
		var c = containerUIMap[cI]
		var overrides = {"fields" : {}, "terminals" : {}};
		
		for (var fName in c.fields)
		{
		    var f = c.fields[fName];
		    var o = {}
		    o.visible = f.visible.checked;
		    var rename = f.externalName.value;
		    
		    if (rename.length > 0)
			o.rename = rename;

		    overrides.fields[fName] = o;
		}
		
		
		for (var tName in c.terminals)
		{
		    var t = c.terminals[tName];
		    var o = {}
		    o.visible = t.visible.checked;
		    var rename = t.externalName.value;
		    
		    if (rename.length > 0)
			o.rename = rename;

		    o.side = t.side.value;
		    
		    overrides.terminals[tName] = o;
		}
		
		containerOverrides.push(overrides);
	    }
	    
	    for (var gI in groupUIMap)
	    {
		var g = groupUIMap[cI]
		var overrides = {"fields" : {}, "terminals" : {}};
		
		for (var fName in g.fields)
		{
		    var f = g.fields[fName];
		    var o = {}
		    o.visible = f.visible.checked;
		    var rename = f.externalName.value;
		    
		    if (rename.length > 0)
			o.rename = rename;

		    overrides.fields[fName] = o;
		}
		
		
		for (var tName in g.terminals)
		{
		    var t = g.terminals[tName];
		    var o = {}
		    o.visible = t.visible.checked;
		    var rename = t.externalName.value;
		    
		    if (rename.length > 0)
			o.rename = rename;

		    o.side = t.side.value;

		    overrides.terminals[tName] = o;
		}
	    }
	    
	    return {"containerOverrides" : containerOverrides, "groupOverrides" : groupOverrides};
	},
    
	getMap: function(group)
	{
	    
	    //assume no group container case
	    if (lang.isValue(group.groupContainer))
	    {
		var map = {"fields" : [], "terminals" : []};
		
		var inGroup = function(container)
		    {
			return container == group.groupContainer;
		    };
		
		for (var fI in group.groupContainer.form.inputConfigs)
		{
		    var fConfig = group.groupContainer.form.inputConfigs[fI];
		    var fCopy = {}
		    lang.augmentObject(fCopy, fConfig);
		    
		    var fMap = {"fieldConfig" : fCopy};
					    
		    if (this.isFieldExternal(group.groupContainer.form.inputs[fI], inGroup))
		    {
			fMap.externalName = fConfig.name;
			fMap.visible = true;
		    }
		
		    map.fields.push(fMap);
		}
		
		for (var tI in group.groupContainer.options.terminals)
		{
		    var tConfig = group.groupContainer.options.terminals[tI];
		    
		    var tMap = {"terminalConfig" : tConfig};
		    
		    if (this.isTerminalExternal(group.groupContainer.terminals[tI], inGroup))
		    {
			tMap.visible = true;
			tMap.externalName = tConfig.name;
		    }
		    
		    map.terminals.push(tMap);
		}
		
		return { "groupContainerMap" : map };
	    }
	    
	    var usedNames = {terminals : {}, fields : {}};
	    var containerMap = {};
	    var groupMap = {};

	    this.generateFieldMap(group, usedNames, containerMap, groupMap);
	    this.generateTerminalMap(group, usedNames, containerMap, groupMap);
	    
	    this.generateDefaultFieldNames(containerMap, usedNames);
	    this.generateDefaultFieldNames(groupMap, usedNames);

	    this.generateDefaultTerminalNames(containerMap, usedNames);
	    this.generateDefaultTerminalNames(groupMap, usedNames);
	    
	    return { "containerMap" : containerMap, "groupMap" : groupMap };
	},

	generateDefaultTerminalNames : function(map, usedNames)
	{
	    for (var cI in map)
	    {
		var c = map[cI];
		
		for (var tName in c.terminals)
		{
		    var t = c.terminals[tName];
		
		    if (t.visible && !lang.isValue(t.externalName))
		    {
			t.externalName = this.generateFreshName(tName, usedNames.terminals);
			
			usedNames.terminals[t.externalName] = true;
		    }
		}
	    }
	},

	generateDefaultFieldNames : function(map, usedNames)
	{
	    for (var cI in map)
	    {
		var c = map[cI];
		
		for (var fName in c.fields)
		{
		    var f = c.fields[fName];
		
		    if (f.visible && !lang.isValue(f.externalName))
		    {
			
			if (f.fieldConfig.wirable)
			{
			    var mergedUsedNames = {};
			    lang.augmentObject(mergedUsedNames, usedNames.fields);
			    lang.augmentObject(mergedUsedNames, usedNames.terminals);
			    
			    f.externalName = WireIt.GroupUtils.generateFreshName(fName, mergedUsedNames);
			
			    usedNames.fields[f.externalName] = true;
			    usedNames.terminals[f.externalName] = true;
			}
			else
			{
			    f.externalName = WireIt.GroupUtils.generateFreshName(fName, usedNames.fields);
			
			    usedNames.fields[f.externalName] = true;
			}
		    }
		}
	    }
	},

	generateTerminalMap: function(group, usedNames, containerMap, groupMap)
	{
	    var self = this;
	    
	    var mergeTerminalOverrides = function(terminalConfigs, overrides, usedNames, forceVisible, terminalMap)
		{
		    for (var tI in terminalConfigs)
		    {
			var t = terminalConfigs[tI];
			var name = t.name;
			var o = overrides[name];
			
			var map = {terminalConfig : t};
			
			if (lang.isObject(o) && o.visible)
			{
			    map.visible = true;
			    
			    if (lang.isValue(o.rename))
			    {
				if (lang.isValue(usedNames.terminals[o.rename]))
				    throw {"type" : "MappingError", "message" : "Two identical terminal names specified (" + o.rename + ")"}
				
				usedNames.terminals[o.rename] = true;
				
				map.externalName = o.rename;
			    }
			    
			    map.side = o.side;
			}
			
			if (forceVisible(name))
			{
			    map.visible = true;
			    map.forceVisible = true;
			}
			
			terminalMap[name] = map;
		    }
		};
	    
	    var allContainers = [];
	    WireIt.GroupUtils.addAllContainers(group, allContainers);
	    var inGroup = function(container)
		{
		    for (var i in allContainers)
		    {
			if (container == allContainers[i]) //TODO: doesn't take into account expanded but in group containers?
			    return true;
		    }
		    
		    return false;
		};
	    
	    //Get default maps (with overrides)
	    for (var cI in group.containers)
	    {
		var co = group.containers[cI];
		var c = co.container;
		var os = co.overrides;
		
		var cm = {};
		
		var terminalConfigs = lang.isArray(c.options.terminals) ? c.options.terminals : [];
		var forceVisible = function(name)
		    {
			var terminal;
			for (var tI in c.terminals)
			{
			    var t = c.terminals[tI];
			    
			    if (t.options.name == name)
			    {
				terminal = t;
				break;
			    }
			}
			
			return self.isTerminalExternal(terminal, inGroup);
		    }
		    
		mergeTerminalOverrides(terminalConfigs, os.terminals, usedNames, forceVisible, cm, c.options.title);
		
		containerMap[cI].terminals = cm;
		
	    }
	    
	    //Get default maps (with overrides)
	    for (var gI in group.groups)
	    {
		var go = group.groups[gI];
		var g = go.group;
		var os = go.overrides;
		
		var gm = {};
		
		var map = WireIt.GroupUtils.getMap(g);
		var terminalConfigs = WireIt.GroupUtils.getCollapsedConfig(g, map).terminals//TODO: inefficient 
		var forceVisible;
		
		if (lang.isValue(g.groupContainer))
		{
		    forceVisible = function(name)
			{
			    var terminal;
			    for (var tI in g.groupContainer.terminals)
			    {
				var t = g.groupContainer.terminals[tI];
				
				if (t.options.name == name)
				{
				    terminal = t;
				    break;
				}
			    }
			    
			    return self.isTerminalExternal(terminal, inGroup);
			}
		}
		else
		{
		    var externalToInternalMap = WireIt.GroupUtils.getExternalToInternalMap(map);
		    
		    forceVisible = function(name)
			{
			    for (var tName in externalToInternalMap.containerMap.terminals)
			    {
				var tMap = externalToInternalMap.containerMap.terminals[tName]
			    
				var terminal;
				for (var tI in g.containers[tMap.containerId].terminals)
				{
				    var t = g.containers[tMap.containerId].terminals[tI];
				    
				    if (t.options.name == name)
				    {
					terminal = t;
					break;
				    }
				}
			    
				if (self.isTerminalExternal(terminal, inGroup))
				    return true;
			    }
			    
			    return false;
			}
		}
		
		
		mergeTerminalOverrides(terminalConfigs, os.terminals, usedNames, forceVisible, gm);
		
		groupMap[gI].terminals = gm;
	    }
	},

	isFieldExternal: function (f, inGroup)
	{
	    if (lang.isValue(f))
	    {
		return this.isTerminalExternal(f.terminal, inGroup)
	    }
	},
	
	isTerminalExternal: function(terminal, inGroup)
	{
	    if (lang.isValue(terminal))
	    {
		for (var wI in terminal.wires)
		{
		    var w = terminal.wires[wI];
		    
		    if ((w.terminal1 != terminal && !inGroup(w.terminal1.container)) ||
			(w.terminal2 != terminal && !inGroup(w.terminal2.container)))
		    {
			return true;
		    }
		}
	    }
	    
	    return false;
	},
	
	generateFieldMap: function(group, usedNames, containerMap, groupMap)
	{
	    var self = this;
	    
	    var allContainers = [];
	    WireIt.GroupUtils.addAllContainers(group, allContainers);
	    var inGroup = function(container)
		    {
			for (var i in allContainers)
			{
			    if (container == allContainers[i])
				return true;
			}
			
			return false;
		    };
	    
	    //Get default maps (with overrides)
	    for (var cI in group.containers)
	    {
		var co = group.containers[cI];
		var c = co.container;
		var os = co.overrides;
		
		var cm = {};
		
		
		if (lang.isObject(c.form))
		{
		    var fieldConfigs = c.form.inputConfigs
		    var forceVisible = function(name)
			{
			    return self.isFieldExternal.call(self, c.form.inputsNames[name], inGroup);
			}
		    this.mergeFieldOverrides(fieldConfigs, os.fields, usedNames, forceVisible, cm);
		}
		containerMap[cI] = {};
		
		containerMap[cI].fields = cm;
	    }
	    
	    //Get default maps (with overrides)
	    for (var gI in group.groups)
	    {
		var go = group.groups[gI];
		var g = go.group;
		var os = go.overrides;
		
		var gm = {};
		
		
		var map = WireIt.GroupUtils.getMap(g);
		var fieldConfigs = WireIt.GroupUtils.getCollapsedConfig(g, map).fields//TODO: inefficient since we throw away terminal results then get them again
		var forceVisible;
		
		if (lang.isValue(g.groupContainer))
		{
		    forceVisible = function(name)
			{
			    return self.isFieldExternal.call(self, g.groupContainer.form.inputsNames[name], inGroup);
			}
		}
		else
		{
		    var forceVisible2;
		    
		    forceVisible2 = function(name, group, map)
			{
			    if (!lang.isValue(map))
				map = WireIt.GroupUtils.getMap(group);
				
			    var externalToInternalMap = WireIt.GroupUtils.getExternalToInternalMap(map);
			    
			    var fMap = externalToInternalMap.containerMap.fields[name]
			    
			    if (lang.isValue(fMap))
			    {
				var f = group.containers[fMap.containerId].container.form.inputsNames[fMap.name]
			    
				if (self.isFieldExternal.call(self, f, inGroup))
				    return true;
			    }
			    else
			    {
				var fMap = externalToInternalMap.groupMap.fields[name];
				
				if (lang.isValue(fMap))
				    return forceVisible2(name, group.groups[fMap.containerId].group);
			    }
			    return false;
			}
			
		    forceVisible = function(name) { return forceVisible2(name, g, map); };
		}
		
		this.mergeFieldOverrides(fieldConfigs, os.fields, usedNames, forceVisible, gm);
		
		groupMap[gI] = {}
		groupMap[gI].fields = gm;
	    }
	},
	
	generateFreshName : function(name, usedNames)
	{
	    var used = function(name)
		    {
			    return lang.isValue(usedNames[name]);
		    };
	    
	    var freshName = name;
			    
	    if (used(freshName))
	    {
		    var i = 1;
		    var current = freshName;
	    
		    do
		    {
			    freshName = current + i;
			    i++;
		    }
		    while(used(freshName))
	    }
	    
	    usedNames[freshName] = true;
	    
	    return freshName;
	},

	mergeFieldOverrides : function(fieldConfigs, overrides, usedNames, forceVisible, fieldMap)
	{
	    for (var fI in fieldConfigs)
	    {
		var f = fieldConfigs[fI];
		var name = f.name;
		var o = overrides[name];
		
		var map = {fieldConfig : f};
		
		if (lang.isObject(o) && o.visible)
		{
		    map.visible = true;
		    
		    if (lang.isValue(o.rename))
		    {
			if (lang.isValue(usedNames.fields[o.rename]))
			    throw {"type" : "MappingError", "message" : "Two identical field names specified (" + o.rename + ")"}
			
			usedNames.fields[o.rename] = true;
			
			if (f.wirable)
			    usedNames.terminals[name] = true;
			    
			map.externalName = o.rename;
		    }
		}
		
		if (forceVisible(name))
		{
		    map.visible = true;
		    map.forceVisible = true;
		}
		fieldMap[name] = map;
	    }
	},

	generateFields: function(fieldConfigs, overrides, external)
	{
	    var fields = [];
	    var neededFields = [];
	    var terminalNamesUsed  = [];
	    var usedNames = {};
	    
	    var addFieldToUsed = function(name, fieldConfig)
		    {
			    usedNames[name] = true;
			    
			    if (fieldConfig.wirable)
				    terminalNamesUsed[name] = true;
		    }
    
	    for (var mI in fieldConfigs)
	    {
		var m = fieldConfigs[mI];
		
		for (var fI in m)
		{
			var f = m[fI];
			var str = new String(mI);
			var str2 = new String(f.name);
			var str3 = str + str2 + '';
			var o = overrides.fields[str3];
			var e = external.fields[str3];
			
			var needNames = {};
			
			if (lang.isObject(o) && o.visible)
			{
				if (lang.isValue(o.rename))
				{
					var field = {}
					lang.augmentObject(field, f, {"label" : o.rename, "name" : o.rename});
					fields.push( field );
					addFieldToUsed(o.rename, f);
				}
				else
				    neededFields.push(f);
			}
			else if (e)
			    neededFields.push(f);
		}
	    }
	    
	    for (var fI in neededFields)
	    {
		    var f = neededFields[fI];
		    var freshName = this.generateNextName(f.name, usedNames);
		    
		    addFieldToUsed(freshName, f);
		    
		    var field = {}
		    lang.augmentObject(field, f);
		    field.name = freshName;
		    fields.push( field );
	    }
	    
	    return {
		    "fields" : fields, 
		    "usedTerminalNames" : terminalNamesUsed
	    }
	},
	
	generateTerminals: function(terminalConfigs, overrides, external, usedNames)
	{
		var terminals = [];
		var visibleTerminals = [];
		for (var mI in terminalConfigs)
		{
		    var m = terminalConfigs[mI];
		    
		    for (var tI in m)
		    {
			    var t = m[tI];
			    var o = overrides.terminals[mI + t.name]
			    var e = external.terminals[mI + t.name];
			    
			    if (lang.isObject(o) && o.visible)
			    {
				    if (lang.isValue(o.rename))
				    {
					    var terminal = {};
					    lang.augmentObject(terminal, t);
					    terminal.name = o.rename;
					    //TODO: check if name already used?
					    usedNames[o.rename] = true;
					    terminals.push(terminal);
				    }
				    else
				    {
					    visibleTerminals.push(t);
				    }
			    }
			    else if (e)
				visibleTerminals.push(t);
		    }
		}
		
		for (var tI in visibleTerminals)
		{
			var t = visibleTerminals[tI];
			var freshName = this.generateNextName(t.name, usedNames);
			
			usedNames[freshName] = true;
			
			var terminal = {};
			lang.augmentObject(terminal, t);
			terminal.name = freshName;
			
			terminals.push(terminal);
		}
		
		return terminals;
	},
	
	generateNextName: function(name, usedNames)
	{
		var used = function(name)
			{
				return lang.isValue(usedNames[name]);
			};
		
		var freshName = name;
				
		if (used(freshName))
		{
			var i = 1;
			var current = freshName;
		
			do
			{
				freshName = current + i;
				i++;
			}
			while(used(freshName))
		}
		
		usedNames[freshName] = true;
		
		return freshName;
	},
	
	getExternalTerminalName: function(name, moduleId, fieldConfigs, terminalConfigs)
	{
	    for (var mI in terminalMap)
	    {
		    var m = terminalMap[mI];
		    
		    if (m.name == internalTerminal.options.name &&
			    m.moduleId == internalModuleId)
			    return mI;
	    }
	    
	    throw {"type" : "MappingError", "message" : "Couldn't find internal terminal's external name"};
	},
	
	fieldConfigsFromModules: function(modules, getBaseConfig)
	{
	    var config = {};
	    
	    for (var mI in modules)
	    {
		var m = modules[mI];
		var fullConfig = {};
		lang.augmentObject(fullConfig, m.config);
		lang.augmentObject(fullConfig, getBaseConfig(m.name))
		
		if (lang.isArray(fullConfig.fields))
		{
		    var fields = [];
		    
		    for (var fI in fullConfig.fields)
		    {
			var f = fullConfig.fields[fI];
			
			fields.push(f);
		    }
		    
		    config[mI] = fields;
		}
	    }
	    
	    return config;
	},
	
	fieldConfigsFromContainers: function(containers)
	{
	    var config = {};
	    
	    for (var cI in containers)
	    {
		var c = containers[cI];
		
		if (lang.isObject(c.form))
		{
		    var fields = [];
		    
		    for (var fI in c.form.inputConfigs)
		    {
			var f = c.form.inputConfigs[fI];
			
			fields.push(f);
		    }
		    
		    config[cI] = fields;
		}
	    }
	    
	    return config;
	},
	
	terminalConfigsFromModules: function(modules, getBaseConfig)
	{
	    var config = {};
	    
	    for (var mI in modules)
	    {
		var m = modules[mI];
		var fullConfig = {};
		lang.augmentObject(fullConfig, m.config);
		lang.augmentObject(fullConfig, getBaseConfig(m.name))
		
		if (lang.isArray(fullConfig.terminals))
		{
		    var terminals = [];
		    
		    for (var tI in fullConfig.terminals)
		    {
			var t = fullConfig.terminals[tI];
			
			terminals.push(t);
		    }
		    
		    config[mI] = terminals;
		}
	    }
	    
	    return config;
	},

	getInternalModuleConfig: function(containers, center)
	{
		var modules = []
		
		for (var cI in containers)
		{
		    var c = containers[cI];
		    var mConfig = c.getConfig();
		    
		    mConfig.position[0] = mConfig.position[0] - center[0];
		    mConfig.position[1] = mConfig.position[1] - center[1];
		    
		    //Add container to group
		    modules.push( {name: c.options.title, value: c.getValue(), config: mConfig});
		}
		
		return modules;
	},
	
	getWireConfig: function(group, getInternalContainerId, getExternalTerminalName)
	{
		var externalWires = [];
		var internalWires = [];
		
		this.addWireConfig(group, getInternalContainerId, getExternalTerminalName, externalWires, internalWires);
		
		return {"external" : externalWires, "internal" : internalWires};
	},
	
	
	
	addWireConfig: function(group, getInternalContainerId, getExternalTerminalName, externalWires, internalWires, groupIndex)
	{
	    var pushUniqueWireConfig = function(wires, newWire) {
    	  var foundWire= false;
    	  var wire;
    	  for(var w in wires) {
    	      wire= wires[w];
    	      if( wire.src.moduleId == newWire.src.moduleId && 
    	          wire.tgt.moduleId == newWire.tgt.moduleId &&
    	          wire.src.terminal == newWire.src.terminal &&
    	          wire.tgt.terminal == newWire.tgt.terminal) {
    	              foundWire=true;
    	              break;
    	          }
    	  }
    	  if(!foundWire) {
    	      wires.push(newWire);  
          }
    	};
    	
		var addWiresForContainer = function(c, getExternalName)
		    {
			for (var wI in c.wires)
			{
			    var w = c.wires[wI];
			    
			    var srcIndex = getInternalContainerId(w.terminal1.container)
			    var tgtIndex = getInternalContainerId(w.terminal2.container)
			    
			    if (srcIndex != -1 && tgtIndex != -1)
			    {
				    pushUniqueWireConfig(internalWires,{
					    src: {moduleId: srcIndex, terminal: w.terminal1.options.name}, 
					    tgt: {moduleId: tgtIndex, terminal: w.terminal2.options.name}
					});
			    }
			    else
			    {
				var ret = {};
				var et, gt;
				
				if (srcIndex == -1)
				{
				    ret.groupIsSource = false;
				    et = w.terminal1;
				    gt = w.terminal2;
				}
				else
				{
				    ret.groupIsSource = true;
				    et = w.terminal2
				    gt = w.terminal1;
				}
				
				ret.externalName = getExternalName(gt.options.name);
				ret.groupTerminal = gt;
				ret.externalTerminal = et;
			
				externalWires.push(ret);
			    }
			}
		    }
		
		if (!lang.isValue(groupIndex))
		    groupIndex = 0;
		    
		if (lang.isValue(group.groupContainer))
		{
		    addWiresForContainer(group.groupContainer, function(name) { return getExternalTerminalName("group", groupIndex, name); });
		}
		else
		{
		    
		    for (var cI in group.containers)
		    {
			var c = group.containers[cI].container;
			
			addWiresForContainer(c, function(name) { return getExternalTerminalName("container", cI, name); });
		    }
		    
		    for (var gI in group.groups)
		    {
			var g = group.groups[gI].group;
			
			this.addWireConfig(g, getInternalContainerId, getExternalTerminalName, externalWires, internalWires, parseInt(gI)+groupIndex);
		    }
		}
	},
	
	firstTestSucess: function(anarray, atest)
	{
	    var index;
	    for (index = 0; index < anarray.length; index++)
	    {
		if (atest(anarray[index]))
		    return index;
	    }
	    
	    return -1;
	}
    }
})();(function() {
    var util = YAHOO.util,lang = YAHOO.lang;
    var Event = util.Event, Dom = util.Dom, Connect = util.Connect,JSON = lang.JSON,widget = YAHOO.widget;

/**
 * A CanvasElement widget to hand-draw a selection
 * @class WireIt.RubberBand
 * @extends WireIt.CanvasElement
 */
WireIt.RubberBand = function(grouper) {
	
	WireIt.RubberBand.superclass.constructor.call(this, grouper.layer.el);
	
	this.grouper = grouper;
	var self = this;
	this.scrollThreshold = 150;
	this.scrollAmount = 20;
	this.directions = {};
	
	grouper.layer.el.addEventListener("mousemove",  function(event)  { 
		var elem = self.grouper.layer.el;
		var rect = elem.getBoundingClientRect();
		
		var xNoScroll = event.clientX-rect.left;
		var yNoScroll = event.clientY-rect.top;
		
		self.lastX = xNoScroll + elem.scrollLeft;
		self.lastY = yNoScroll + elem.scrollTop;
		
		self.directions = {};
		if (xNoScroll < self.scrollThreshold) {
		    // Near the left edge so scroll left
		    self.directions.left = true;
		}
		else if ((rect.right - event.clientX) < self.scrollThreshold) {
		    // Near the right edge
		    self.directions.right = true;
		}
		
		if (yNoScroll < self.scrollThreshold) {
		    // Near top
		    self.directions.up = true;
		}
		else if ((rect.bottom - event.clientY) < self.scrollThreshold) {
		    // Near bottom
		    self.directions.down = true;
		}
		
   }, false);

};


/**
 * Delay in ms between two points of the RubberBand when drawing
 * @static
 */
WireIt.RubberBand.defaultDelay = 50;


YAHOO.lang.extend(WireIt.RubberBand, WireIt.CanvasElement, {
	
	/**
	 * Check if clicked in the layer and start the drawing mode
	 */
	layerMouseDown: function(event) {
	   var elem = this.grouper.layer.el;
	   var rect = elem.getBoundingClientRect();
	    
	   var xNoScroll = event.clientX-rect.left;
	   var yNoScroll = event.clientY-rect.top;
	    
	   if (xNoScroll < elem.clientWidth && yNoScroll < elem.clientHeight) {
			this.start();
		}
	},
	
	/**
	 * Start the drawing mode
	 */
	start: function() {
	    this.show();
	    
	    this.SetCanvasRegion(0, 0, this.grouper.layer.el.scrollWidth, this.grouper.layer.el.scrollHeight);
	    var ctxt = this.getContext();
	    ctxt.beginPath();
	    ctxt.moveTo(this.lastX, this.lastY);
	    this.startX = this.lastX;
	    this.startY = this.lastY;
	    this.timer = YAHOO.lang.later(WireIt.RubberBand.defaultDelay, this, function()  { 
		    this.nextPoint(this.lastX, this.lastY);
		    this.scroll(this.directions);
			}, 0, true);
	},

	/**
	 * Scroll the associated WireIt.Layer
	 */
	scroll: function(directions) {
	    var elem = this.grouper.layer.el;
	    
	    if (directions.left)
		elem.scrollLeft = Math.max(0, elem.scrollLeft-this.scrollAmount);
	    else if (directions.right)
		elem.scrollLeft = Math.min(elem.scrollWidth, elem.scrollLeft+this.scrollAmount);
		
	    if (directions.up)
		elem.scrollTop = Math.max(0, elem.scrollTop-this.scrollAmount);
	    else if (directions.down)
		elem.scrollTop = Math.min(elem.scrollHeight, elem.scrollTop+this.scrollAmount);
	},

	/**
	 * End the drawing mode
	 */
	finish: function() {
	    if (lang.isObject(this.timer)) {
			this.timer.cancel();
			this.timer = null;
		
			var ctxt = this.getContext();
			this.nextPoint(this.startX, this.startY);
	
			YAHOO.lang.later(1000, this, this.hide, 0, false);
	    }
	},

	/**
	 * Hide the RubberBand
	 */
	hide: function() {
	   if (!lang.isValue(this.element.style))
			this.element.style = {};
		    
	   this.element.style.display = "none";	    
	},
    
	/**
	 * Show the RubberBand
	 */
	show: function() {
	    if (!lang.isValue(this.element.style))
			this.element.style = {};
		    
	    this.element.style.display = "";	    
	},
	
	/**
	 * Add a point to the RubberBand
	 */
	nextPoint: function(x, y) {
		if (lang.isValue(x) && lang.isValue(y)) {
			var ctxt = this.getContext();
		
			// Draw the inner bezier curve
			ctxt.lineCap= "round";
			ctxt.strokeStyle="green";
			ctxt.lineWidth="3";

			ctxt.lineTo(x, y);
			ctxt.stroke();
	   }
	},

	/**
	 * Check if the given (x,y) is within the RubberBand path
	 */
	pointIsInside: function(x, y) {
	    return (this.getContext().isPointInPath(x, y));
	}

});



})();
