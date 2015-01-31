/*
* Observer.js - A teeny tiny library to listen for object changes
* http://github.com/kvendrik/Observer.js
*/

(function(){

'use strict';

var Observer = function(obj){
  this[0] = obj;
  this.listeners = {};
};

Observer.prototype.set = function(){
    var obj = this[0],
      	firstArg = arguments[0],
      	changes = { add: [], update: [] },
      	self = this;

    //changes or adds a property
    //and stores the details of the change
    var changeProp = function(propPath, newVal){
        var oldVal,
            type,
            changeDetails,
            changeObj,
            prop;

        //handle deep nested objects
        var details = self._parseObjectPath(propPath);

        changeObj = details.parentObj;
        prop = details.prop;

        if(changeObj[prop] !== newVal){
          //if it is indeed a change

          //store the current value
          oldVal = changeObj[prop];

          //get type change type
          type = changeObj[prop] === undefined ? 'add' : 'update';

          //change the property to its new value
          changeObj[prop] = newVal;

          //create the change details
          changeDetails = {
             name: propPath,
             object: obj,
             type: type
          };

          if(oldVal){
            //if we have an old value
            //and its theirfor not an add
            changeDetails.oldVal = oldVal;
          }

          //push the current change into the
          //array of changes
          changes[type].push(changeDetails);
        }
    };

    var applyChange = function(propPath, newVal){
        var props = self._parseBraceExpansions(propPath);

        if(props.length > 1){
            for(var i = 0, l = props.length; i < l; i++){
                changeProp(props[i], newVal);
            }
        } else {
            //call function with
            //path to property and value to change it to
            changeProp(props[0], newVal);
        }
    };

  if(typeof firstArg === 'object'){
    //multiple changes
    var objChanges = firstArg,
        currObjPath = '';

    var loopChangesInObj = function(obj){
        for(var prop in obj){
            //save current value
            var currVal = obj[prop];

            if(typeof currVal === 'object'){
                //if is object
                //save path and call function on new object
                currObjPath += '.'+prop;
                loopChangesInObj(currVal);
            } else {
                //if end of line
                //if there was a path saved
                if(currObjPath !== ''){
                    //add last property to path
                    currObjPath += '.'+prop;
                    prop = currObjPath.replace('.', '');
                }

                applyChange(prop, currVal);
            }
        }
    };

    //loop all changes
    loopChangesInObj(objChanges);

  } else if(typeof firstArg === 'string' || typeof firstArg === 'number'){
    //single change
    applyChange(firstArg, arguments[1]);
  }

  if(changes.add.length > 0 || changes.update.length > 0){
    //if there were indeed changes

    //trigger the global change event
    this.triggerEvent('change', changes.add.concat(changes.update));

    if(changes.add.length > 0){
      //if there were additions, trigger the add event
      this.triggerEvent('add', changes.add);
    }

    if(changes.update.length > 0){
      //if there were updates, trigger the add event
      this.triggerEvent('update', changes.update);
    }

  }

  return this;
};

Observer.prototype._parseObjectPath = function(objectPath){
    var obj = this[0],
    	props = objectPath.split('.');

    if(props.length > 1){
        var currProp = obj,
        	actualPropsLength = props.length-1;

        //deep nested property, change object
        for(var i = 0; i < actualPropsLength; i++){
            var curr = currProp[props[i]];
            if(curr === undefined){
                currProp[props[i]] = {};
            }
            currProp = currProp[props[i]];
        }

        return { parentObj: currProp, prop: props[actualPropsLength]};
    } else {
        return { parentObj: obj, prop: objectPath };
    }
};

Observer.prototype._parsePropPath = function(propPath){
	//parse prop path and return new array of parsed object paths
	//these can for example contain brace expansions
	var results = [];

	var parsedWildCards = this._parseWildcards(propPath);
	for(var i = 0; i < parsedWildCards.length; i++){
		results = results.concat(this._parseBraceExpansions(parsedWildCards[i]));
	}

	return results;
};

Observer.prototype._parseWildcards = function(propPath){

	if(propPath.indexOf('*') !== -1){
		var results = [],
            parts = propPath.split('*'),
            key = parts[0].substring(0, parts[0].length-1),
            pathDetails = this._parseObjectPath(key),
            keys = Object.keys(pathDetails.parentObj[pathDetails.prop]);

        for(var i = 0; i < keys.length; i++){
            results.push(propPath.replace('*', keys[i]));
        }

		return results;
	} else {
		return [propPath];
	}
};

Observer.prototype._parseBraceExpansions = function(str){

    if(/\{([^\}]+)\}/.test(str)){
        //parse brace expansion
        var match = str.match(/\{([^\}]+)\}/),
            results = [];

        if(match !== null){
        	if(match[0].indexOf(',') !== -1){

	            var parts = match[1].split(',');
	            for(var k = 0, l = parts.length; k < l; k++){
	                results.push(str.replace(match[0], parts[k].trim()));
	            }

            } else if(match[0].indexOf('..') !== -1){

            	var parts = match[1].split('..'),
            		keys = Object.keys(this._parseObjectPath(str.replace(/\{([^\}]+)\}/, '')).parentObj),
            		inserting = false;

            	for(var k = 0, l = keys.length; k < l; k++){
            		var curr = keys[k];
	                if(curr === parts[0]){
	                	inserting = true;
	                }
	                if(inserting){
	                	results.push(str.replace(match[0], curr.trim()));
	                }
	                if(curr === parts[1]){
	                	inserting = false;
	                }
	            }

            }
        }

        return results;
    } else {
        return [str];
    }
};

Observer.prototype.get = function(propPath){
    var obj = this[0],
        paths = this._parsePropPath(propPath),
        pathsLength;

    var getValFromPath = function(propPath){
        var props = propPath.split('.');

        if(props.length > 1){
            var currProp = obj;
            for(var j = 0, l = props.length; j < l; j++){
                var curr = currProp[props[j]];
                if(curr === undefined) return;
                currProp = curr;
            }
            return currProp;
        } else {
            return obj[propPath];
        }
    };

    pathsLength = paths.length;

    if(pathsLength > 1){
        var results = [];

        for(var i = 0; i < pathsLength; i++){
            results.push(getValFromPath(paths[i]));
        }

        return results;
    } else {
        return getValFromPath(paths[0]);
    }
};

Observer.prototype.delete = function(){
  	var originalObj = this[0],
      	changes = [],
      	oldVal;

  	var removePropFromObject = function(prop, obj, propPath){
	  	//if current prop exists
	    if(obj[prop]){

	      //store old value
	      oldVal = obj[prop];

	      //delete prop
	      delete obj[prop];

	      //store details
	      changes.push({
	        name: propPath,
	        object: originalObj,
	        type: 'delete',
	        oldVal: oldVal
	      });

	    }
	};

  for(var i = 0, al = arguments.length; i < al; i++){
    //loop given properties

    var prop = arguments[i],
    	parts = this._parseBraceExpansions(prop);

    for(var j = 0, bel = parts.length; j < bel; j++){
    	var details = this._parseObjectPath(parts[i]);
    	removePropFromObject(details.prop, details.parentObj, parts[i]);
    }
  }

  if(changes.length > 0){
    //if there were changes

    this.triggerEvent('change', changes);
    this.triggerEvent('delete', changes);
  }

  return this;
};

Observer.prototype.on = function(event, callback){
  this.listeners[event] = callback;
  return this;
};

Observer.prototype.triggerEvent = function(event, data){
  var listeners = this.listeners;

  if(listeners[event]){
    listeners[event](data);
  }

  return this;
};

window.Observer = Observer;

}());
