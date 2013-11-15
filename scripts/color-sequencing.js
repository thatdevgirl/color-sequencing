// Define name-space
if (typeof COLORWAY == "undefined" || !COLORWAY) { var COLORWAY = {}; }
YAHOO.namespace("colorway");

var Dom = YAHOO.util.Dom;
var Event = YAHOO.util.Event;
var Selector = YAHOO.util.Selector;
var History = YAHOO.util.History;

COLORWAY.test = {
    shift: false,
    dialog: null,

    initialize: function() {
        Event.addListener("colorway-link", "click", function() {
            COLORWAY.test.openDialog();
        });
        
        // Setting name-spaced variable to preserve if shift key is being pressed.
        var setShiftOn  = function(e) { if (e.shiftKey) { COLORWAY.test.shift = true;  } };
        var setShiftOff = function(e) { COLORWAY.test.shift = false; };
        
        Event.on(document, 'keydown', setShiftOn);
        Event.on(document, 'keyup',   setShiftOff);
    },
    
    // Function to open the main color way sequencing dialog.
    openDialog: function() {
        if (COLORWAY.test.dialog == null) {

            COLORWAY.test.dialog = new YAHOO.widget.Dialog("colorway-dialog-box", {
                close: true,
                constraintoviewport: true,
                fixedcenter: true,
                modal: true,
                visible: false,
                width: "78em"
            });
            
            COLORWAY.test.dialog.setHeader("Reorder Color Sequence");
            COLORWAY.test.dialog.render("document.body");
        }

        COLORWAY.test.dialog.show();
    },
}

YUI().use('node', 'dd', 'dd-plugin', 'dd-drop-plugin', function(Y) {
    var wrapper = Dom.get("colorway-main-container"), 
        goingUp = false,
        lastY = 0;
    
    // Listener to select and unselect colorway items (multiples via shift key).
    Event.addListener(wrapper, "click", function(e) {
        var target = Event.getTarget(e);
        
        if (Selector.test(target, "#colorway-main-container div.colorway")) {
            
            // If the shift key is not pressed, unselect all, then select that item.
            if (!COLORWAY.test.shift) {
                var selected = Selector.query("div.selected", wrapper);
                for (var i=0; i<selected.length; i++) {
                    Dom.removeClass(selected[i], "selected");
                }
                
                Dom.addClass(target, "selected");
            } 
            // If the shift key is pressed and the item is selected, unselect it.
            else if (Dom.hasClass(target, "selected")) {
                Dom.removeClass(target, "selected");
            }
            
            // If the shift key is pressed and the item is not selected, select it.
            else {
                Dom.addClass(target, "selected");
            }
        }
    });
    
    Y.DD.DDM.on('drop:over', function(e) {
        var drag = e.drag.get('node'),
            drop = e.drop.get('node');
 
        if (drop.get('tagName').toLowerCase() === 'div') {
            // Check if we are not going up.
            if (!goingUp) {  drop = drop.get('nextSibling'); }
            
            // Add node(s) to this list.
            var selected = Selector.query("#colorway-main-container div.selected");
            if (selected.length > 1) {
                for (var i=0; i<selected.length; i++) {
                    e.drop.get('node').get('parentNode').insertBefore(selected[i], drop);
                }
            } else {
                e.drop.get('node').get('parentNode').insertBefore(drag, drop);
            }
            
            // Set the new parentScroll on the nodescroll plugin; resize the node's shim.
            e.drag.nodescroll.set('parentScroll', e.drop.get('node').get('parentNode'));                        
            e.drop.sizeShim();
        }
    });
    
    Y.DD.DDM.on('drag:drag', function(e) {
        var y = e.target.lastXY[1];
        goingUp = (y < lastY) ? true : false;
        lastY = y;
        Y.DD.DDM.syncActiveShims(true);
    });
    
    Y.DD.DDM.on('drag:start', function(e) {
        var selected = Selector.query("div.selected", wrapper);
        var drag = e.target;
        
        // Unselect all if shift key is not pressed and target is not already selected.
        if (!COLORWAY.test.shift && !drag.get('node').hasClass('selected')) {
            for (var i=0; i<selected.length; i++) {
                Dom.removeClass(selected[i], "selected");
            }
        }
        
        // Select item that is being dragged.
        drag.get('node').addClass('selected');
        drag.get('node').setStyle('opacity', '.25');
        
        // Set styles of item being dragged.
        drag.get('dragNode').addClass('selected');
        drag.get('dragNode').setStyles({
            backgroundColor: drag.get('node').getStyle('backgroundColor')
        });
        
        // Need to run selector query again because clicked item may or may not have been selected above.
        selected = Selector.query("div.selected", wrapper);
        
        // Grey out the selected items being dragged.
        if (selected.length > 1) {
            for (var i=0; i<selected.length; i++) {
                Dom.addClass(selected[i], "grey");
            }
        }
        
        drag.get('dragNode').set('innerHTML', drag.get('node').get('innerHTML'));
    });
    
    Y.DD.DDM.on('drag:end', function(e) {
        var drag = e.target;
        drag.get('node').setStyles({ visibility: '', opacity: '1' });
        
        selected = Selector.query("div.selected", wrapper);
        if (selected.length > 1) {
            for (var i=0; i<selected.length; i++) {
                Dom.removeClass(selected[i], "grey");
            }
        }
    });
    
    // Get the list of colorway divs and make them draggable
    var colorwayItems = Y.all('#colorway-main-container div.colorway');
    colorwayItems.each(function(v, k) {
        var dd = new Y.DD.Drag({ node: v, target: { padding: '0 0 0 20' } })
                 .plug(Y.Plugin.DDProxy,       { moveOnEnd: false })
                 .plug(Y.Plugin.DDConstrained, { constrain2node: '#colorway-main-container' })
                 .plug(Y.Plugin.DDNodeScroll,  { node: v.get('parentNode') });
    });
});

Event.onDOMReady(function() { COLORWAY.test.initialize(); });