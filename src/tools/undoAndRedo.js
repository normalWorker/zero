var _config = {
    canvasState             : [],
    currentStateIndex       : -1,
    undoStatus              : false,
    redoStatus              : false,
    undoFinishedStatus      : 1,
    redoFinishedStatus      : 1,
    undoButton              : '',
    redoButton              : '',
};

var updateCanvasState = function(_canvasObject) {
    if((_config.undoStatus == false && _config.redoStatus == false)){
        var jsonData        = _canvasObject.toJSON();
        var canvasAsJson        = JSON.stringify(jsonData);
        if(_config.currentStateIndex < _config.canvasState.length-1){
            var indexToBeInserted                  = _config.currentStateIndex+1;
            _config.canvasState[indexToBeInserted] = canvasAsJson;
            var numberOfElementsToRetain           = indexToBeInserted+1;
            _config.canvasState                    = _config.canvasState.splice(0,numberOfElementsToRetain);
        }else{
        _config.canvasState.push(canvasAsJson);
        }
        _config.currentStateIndex = _config.canvasState.length-1;
        if((_config.currentStateIndex == _config.canvasState.length-1) && _config.currentStateIndex != -1){
            _config.redoButton = "disabled";
        }
    }
}

var undo = function(_canvasObject) {
    if(_config.undoButton === 'disabled') return;
    if(_config.undoFinishedStatus){
        if(_config.currentStateIndex == -1){
        _config.undoStatus = false;
        }
        else{
        if (_config.canvasState.length >= 1) {
        _config.undoFinishedStatus = 0;
          if(_config.currentStateIndex != 0){
                _config.undoStatus = true;
              _canvasObject.loadFromJSON(_config.canvasState[_config.currentStateIndex-1],function(){
                            // var jsonData = JSON.parse(_config.canvasState[_config.currentStateIndex-1]);
                        _canvasObject.renderAll();
                      _config.undoStatus = false;
                      _config.currentStateIndex -= 1;
                            _config.undoButton = '';
                            if(_config.currentStateIndex !== _config.canvasState.length-1){
                                _config.redoButton = '';
                            }
                        _config.undoFinishedStatus = 1;
              });
          }
          else if(_config.currentStateIndex == 0){
             //  _canvasObject.clear();
                    _config.undoFinishedStatus = 1;
                    _config.undoButton = "disabled";
                    _config.redoButton = '';
              _config.currentStateIndex -= 1;
          }
        }
        }
    }
}

var redo = function(_canvasObject) {
    if(_config.redoButton === 'disabled') return;
    if(_config.redoFinishedStatus){
        if((_config.currentStateIndex == _config.canvasState.length-1) && _config.currentStateIndex != -1){
            _config.redoButton = "disabled";
        }else{
          if (_config.canvasState.length > _config.currentStateIndex && _config.canvasState.length != 0){
                _config.redoFinishedStatus = 0;
            _config.redoStatus = true;
          _canvasObject.loadFromJSON(_config.canvasState[_config.currentStateIndex+1],function(){
                        // var jsonData = JSON.parse(_config.canvasState[_config.currentStateIndex+1]);
                    _canvasObject.renderAll();
                    _config.redoStatus = false;
                  _config.currentStateIndex += 1;
                        if(_config.currentStateIndex != -1){
                            _config.undoButton = '';
                        }
                    _config.redoFinishedStatus = 1;
        if((_config.currentStateIndex == _config.canvasState.length-1) && _config.currentStateIndex != -1){
          _config.redoButton = "disabled";
        }
          });
        }
        }
    }
}

var initCanvasState = function(){
    _config = {
        canvasState             : [],
        currentStateIndex       : -1,
        undoStatus              : false,
        redoStatus              : false,
        undoFinishedStatus      : 1,
        redoFinishedStatus      : 1,
        undoButton              : '',
        redoButton              : '',
    };
}
export { updateCanvasState, undo, redo, initCanvasState }