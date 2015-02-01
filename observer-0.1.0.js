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

/**
 * set one or more properties to a new value
 * @param   {String | Number | Object}  name of property (accepts template string) you would like to change or object with changes
 * @param   {String}                    in case param 1 is a string: the value you'd like to change the property to
 * @return  {Object}                    returns `this`
 */
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
        var paths = self._parseBraceExpansions(propPath);

        if(paths.length > 1){
            for(var i = 0, l = paths.length; i < l; i++){
                changeProp(paths[i], newVal);
            }
        } else {
            //call function with
            //path to property and value to change it to
            changeProp(paths[0], newVal);
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
    this._triggerEvent('change', changes.add.concat(changes.update));

    if(changes.add.length > 0){
      //if there were additions, trigger the add event
      this._triggerEvent('add', changes.add);
    }

    if(changes.update.length > 0){
      //if there were updates, trigger the add event
      this._triggerEvent('update', changes.update);
    }

  }

  return this;
};

/**
 * get a property from the object
 * @param   {String}  propPath Path to the property you'd like to get, accepts template string
 * @return  {*}       Value of the property specified in propPath
 */
Observer.prototype.get = function(propPath){
    var obj = this[0],
        paths = this._parseBraceExpansions(propPath),
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

/**
 * delete one or multiple properties from the object
 * @param   {String}  propPath  path to property you'd like to remove
 * @return  {Object}            `this`
 */
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

    this._triggerEvent('change', changes);
    this._triggerEvent('delete', changes);
  }

  return this;
};

/**
 * listen for the firing of an event
 * @param   {String}    event     name of the event you'd like to listen for
 * @param   {Function}  callback  function to be invoked wen the event fires
 * @return  {Object}              `this`
 */
Observer.prototype.on = function(event, callback){
  this.listeners[event] = callback;
  return this;
};

/**
 * parse an object path
 * @param   {String}  objectPath  a path to the property you'd like to receive, nested props seperated by dots
 * @return  {Object}              object with the parent of the property and the property value
 */
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

/**
 * parse brace expansions in an property path
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
Observer.prototype._parseBraceExpansions = function(str){

    if(/\{([^\}]+)\}/.test(str)){

        var parseExpansionInStr = function(expansion, strs){
            //parse brace expansion
            var match = expansion.match(/\{([^\}]+)\}/),
                results = [];

            if(match !== null){

                for(var i = 0; i < strs.length; i++){
                    str = strs[i];

                    var parts = match[1].split(','),
                        curr;

                    for(var k = 0, l = parts.length; k < l; k++){
                        curr = parts[k].trim();

                        //add path with part to results
                        results.push(str.replace(expansion, curr));
                    }

                }

            }


            return results;
        };

        var expansions = str.match(/\{([^\}]+)\}/g),
            lastParsedStrs = [str];

        for(var i = 0, l = expansions.length; i < l; i++){
            lastParsedStrs = parseExpansionInStr(expansions[i], lastParsedStrs);
        }

        return lastParsedStrs;
    } else {
        return [str];
    }
};

/**
 * trigger an event using the specified data
 * @param   {String}  event  name of the event you'd like to trigger
 * @param   {Object}  data   the event details
 * @return  {Object}         `this`
 */
Observer.prototype._triggerEvent = function(event, data){
  var listeners = this.listeners;

  if(listeners[event]){
    listeners[event](data);
  }

  return this;
};

window.Observer = Observer;

}());
