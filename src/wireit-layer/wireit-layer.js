/*global YUI,window */

YUI.add("wireit-layer", function(Y){

/**
 * A layer encapsulate a bunch of containers and wires
 * @class Layer
 * @namespace WireIt
 * @constructor
 * @param {Object}   options   Configuration object (see the properties)
 */
Y.WireIt.Layer = function(options) {
   
   this.setOptions(options);
   
   /**
    * List of all the Y.WireIt.Container (or subclass) instances in this layer
    * @property containers
    * @type {Array}
    */
   this.containers = [];
   
   /**
    * List of all the Y.WireIt.Wire (or subclass) instances in this layer
    * @property wires
    * @type {Array}
    */
   this.wires = [];
   
	/**
	 * TODO
	 */
   this.groups = [];
   
   /**
    * Layer DOM element
    * @property el
    * @type {HTMLElement}
    */
   this.el = null;

	/**
    * Event that is fired when the layer has been changed
    * You can register this event with myTerminal.on('eventChanged', function(e,params) { }, scope);
    * @event eventChanged
    */
   //this.publish('eventChanged');
   
   /**
    * Event that is fired when a wire is added
    * You can register this event with myTerminal.on('eventAddWire', function(e,params) { var wire=params[0];}, scope);
    * @event eventAddWire
    */
   //this.publish('eventAddWire');
   
   /**
    * Event that is fired when a wire is removed
    * You can register this event with myTerminal.on('eventRemoveWire', function(e,params) { var wire=params[0];}, scope);
    * @event eventRemoveWire
    */
   //this.publish('eventRemoveWire');
   
   /**
    * Event that is fired when a container is added
    * You can register this event with myTerminal.on('eventAddContainer', function(e,params) { var container=params[0];}, scope);
    * @event eventAddContainer
    */
   //this.publish('eventAddContainer');
   
   /**
    * Event that is fired when a container is removed
    * You can register this event with myTerminal.on('eventRemoveContainer', function(e,params) { var container=params[0];}, scope);
    * @event eventRemoveContainer
    */
   //this.publish('eventRemoveContainer');
   
   /**
    * Event that is fired when a container has been moved
    * You can register this event with myTerminal.on('eventContainerDragged', function(e,params) { var container=params[0];}, scope);
    * @event eventContainerDragged
    */
   //this.publish('eventContainerDragged');
   
   /**
    * Event that is fired when a container has been resized
    * You can register this event with myTerminal.on('eventContainerResized', function(e,params) { var container=params[0];}, scope);
    * @event eventContainerResized
    */
   //this.publish('eventContainerResized');
   
   this.render();
   
	if( options.containers ) {
		this.initContainers(options.containers);
	}
   
	if( options.wires ) {
   	this.initWires(options.wires);
	}
   
   if(this.layerMap) { 
		this.layermap = new Y.WireIt.LayerMap(this, this.layerMapOptions);
   }
   
	if(Y.WireIt.Grouper) {
	   this.grouper = new Y.WireIt.Grouper(this, this.grouper.baseConfigFunction);
   
	   var rb = this.grouper.rubberband;
		this.el.onmousedown = function(event) { return rb.layerMouseDown.call(rb, event); };
	   var grouper = this.grouper;
	   this.el.addEventListener("mouseup", function (event)  { 
		    rb.finish(); 
		    grouper.rubberbandSelect.call(grouper); 
		}, false);
	}
};

Y.WireIt.Layer.prototype = {

	/** 
    * @property className
    * @description CSS class name for the layer element
    * @default "WireIt-Layer"
    * @type String
    */
	className: "WireIt-Layer",
	
	/** 
    * @property parentEl
    * @description DOM element that schould contain the layer
    * @default null
    * @type DOMElement
    */
	parentEl: null,

	/** 
    * @property layerMap
    * @description Display the layer map
    * @default false
    * @type Boolean
    */
	layerMap: false,

	/** 
    * @property layerMapOptions
    * @description Options for the layer map
    * @default null
    * @type Object
    */
	layerMapOptions: null,

	/** 
    * @property enableMouseEvents
    * @description Enable the mouse events
    * @default true
    * @type Boolean
    */
	enableMouseEvents: true,

	/**
	 * TODO
	 */
	grouper: null, 

	/**
    * Set the options by putting them in this (so it overrides the prototype default)
    * @method setOptions
    */
   setOptions: function(options) {
      for(var k in options) {
			if( options.hasOwnProperty(k) ) {
				this[k] = options[k];
			}
		}
		
		if(!this.parentEl) {
			this.parentEl = document.body;
		}
		
   },

   /**
    * Create the dom of the layer and insert it into the parent element
    * @method render
    */
   render: function() {
      this.el = Y.WireIt.cn('div', {className: this.className} );   
      this.parentEl.appendChild(this.el);
   },


   /**
    * Create all the containers passed as options
    * @method initContainers
    */
   initContainers: function(containers) {
      for(var i = 0 ; i < containers.length ; i++) {
         this.addContainer(containers[i]);
      } 
   },

   /**
    * Create all the wires passed in the config
    * @method initWires
    */
   initWires: function(wires) {
      for(var i = 0 ; i < wires.length ; i++) {
         this.addWire(wires[i]);
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
		if (Y.Lang.isValue(this.superHighlighted)) {
			for (var i in this.superHighlighted) {
				if(this.superHighlighted.hasOwnProperty(i)) {
					this.superHighlighted[i].highlight();
				}
			}
		}
		this.superHighlighted = null;
	},

   /**
    * Instanciate a wire given its "xtype" (default to Y.WireIt.Wire)
    * @method addWire
    * @param {Object} wireConfig  Wire configuration object (see Y.WireIt.Wire class for details)
    * @return {WireIt.Wire} Wire instance build from the xtype
    */
   addWire: function(wireConfig) {
	
		var klass = Y.WireIt.wireClassFromXtype(wireConfig.xtype);
   
      var src = wireConfig.src;
      var tgt = wireConfig.tgt;
   
      var terminal1 = this.containers[src.moduleId].getTerminal(src.terminal);
      var terminal2 = this.containers[tgt.moduleId].getTerminal(tgt.terminal);
      var wire = new klass( terminal1, terminal2, this.el, wireConfig);
      wire.redraw();
   
      return wire;
   },

   /**
    * Instanciate a container given its "xtype": Y.WireIt.Container (default) or a subclass of it.
    * @method addContainer
    * @param {Object} containerConfig  Container configuration object (see Y.WireIt.Container class for details)
    * @return {WireIt.Container} Container instance build from the xtype
    */
   addContainer: function(containerConfig) {

		var klass = Y.WireIt.containerClassFromXtype(containerConfig.xtype);

      var container = new klass(containerConfig, this);
   
      return this.addContainerDirect(container);
   },


   addContainerDirect: function(container) {
      this.containers.push( container );
   
      // Event listeners
      container.on('eventAddWire', this.onAddWire, this, true);
      container.on('eventRemoveWire', this.onRemoveWire, this, true);
   
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
   
      // TODO: this.eventAddContainer.fire(container);

		// TODO: this.eventChanged.fire(this);
   
      return container;	
   },
   
   /**
    * Remove a container
    * @method removeContainer
    * @param {WireIt.Container} container Container instance to remove
    */
   removeContainer: function(container) {
      var index = Y.Array.indexOf(this.containers, container);
      if( index != -1 ) {
	  
	container.remove();
	    
        this.containers[index] = null;
        this.containers = Y.WireIt.compact(this.containers);
      
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
			if (Y.Lang.isValue(group.groupContainer)) {
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
      if( Y.Array.indexOf(this.wires, wire) == -1 ) {
         this.wires.push(wire);
         
         if(this.enableMouseEvents) {
            Y.one(wire.element).on("mousemove", this.onWireMouseMove, this, true);
            Y.one(wire.element).on("click", this.onWireClick, this, true);
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
      var index = Y.Array.indexOf(this.wires, wire);
      if( index != -1 ) {
         this.wires[index] = null;
         this.wires = Y.WireIt.compact(this.wires);
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
      	var wireObj = wire.getConfig();
			wireObj.src = {moduleId: Y.Array.indexOf(this.containers, wire.terminal1.container), terminal: wire.terminal1.name };
			wireObj.tgt = {moduleId: Y.Array.indexOf(this.containers, wire.terminal2.container), terminal: wire.terminal2.name };
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
      if(Y.Lang.isArray(wiring.containers)) {
         for(i = 0 ; i < wiring.containers.length ; i++) {
            this.addContainer(wiring.containers[i]);
         }
      }
      if(Y.Lang.isArray(wiring.wires)) {
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
		var tgt = e.target;
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

}, '0.7.0',{
  requires: ['wireit-container']
});