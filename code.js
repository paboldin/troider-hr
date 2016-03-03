
var debug = true;
var debug_iterState = true;
var DEBUG = function(){console.log.apply(console, arguments)};

if (!debug)
  DEBUG = function(){};

function TreeGenerator(crl, lcr) {
    if (crl.length != lcr.length)
        throw ("Invalid arg lengths: crl.length = " + crl.length +
               " vs lcr.length = " + lcr.length);

    var stateObj = [];
    var currentLevel = -1;

    this._printState = function(state) {
      if (state === null) {
        console.log('state is null');
        return;
      }
      console.log('state.lcr', state.lcr);
      var lcr_ = lcr.substring(state.lcr.left, state.lcr.right + 1);
      console.log('lcr', lcr_);
      if (state.lcr.center >= state.lcr.left) {
        var center = '-'.repeat(state.lcr.center - state.lcr.left) + '^' +
                     '-'.repeat(state.lcr.right - state.lcr.center);
        console.log('lcr', center);
      }

      console.log('state.crl', state.crl);
      console.log('crl', crl.substring(state.crl.left, state.crl.right + 1));
      if (state.crl.center >= state.crl.left) {
        var center = '-'.repeat(state.crl.center - state.crl.left) + '^' +
                     '-'.repeat(state.crl.right - state.crl.center);
        console.log('crl', center);
      }
    };


    this._checkState = function(state) {
      if (state.lcr.left > state.lcr.right)
        return null;
      return state;
    };


    this._iterState = function(parentState) {
      var centerSymbol = crl[parentState.crl.left];
      var center = lcr.indexOf(centerSymbol, parentState.lcr.center + 1);

      if (center < 0 || center > parentState.lcr.right) {
        return;
      }

      var crlCenter = parentState.lcr.right - center;

      var newState = {
        lcr: {
          left: parentState.lcr.left,
          center: center,
          right: parentState.lcr.right,
        },
        crl: {
          left: parentState.crl.left,
          center: parentState.crl.left + crlCenter,
          right: parentState.crl.right,
        },
      };


      var leftState = {
        lcr: {
          left: parentState.lcr.left,
          center: parentState.lcr.left - 1,
          right: center - 1,
        },
        crl: {
          left: 1 + parentState.crl.left + crlCenter, /* skip the 'centerSymbol' itself */
          right: parentState.crl.right,
        },
      };

      var rightState = {
        lcr: {
          left: center + 1,
          center: center,
          right: parentState.lcr.right,
        },
        crl: {
          left: 1 + parentState.crl.left, /* skip the 'centerSymbol' itself */
          right: parentState.crl.left + crlCenter,
        },
      };

      leftState = this._checkState(leftState);
      rightState = this._checkState(rightState);

      if (debug_iterState) {
          console.log('new');
          this._printState(newState);
          console.log('left');
          this._printState(leftState);
          console.log('right');
          this._printState(rightState);
      }

      return [newState, leftState, rightState];
    };

    this._startTree = function() {
      stateObj[0] = {
        lcr: {
          left: 0,
          center: -1,
          right: lcr.length - 1,
        },
        crl: {
          left: 0,
          right: crl.length - 1,
        },
      };
      currentLevel = 0;

      while(currentLevel >= 0 && currentLevel < stateObj.length) {
        var levels = Object.keys(stateObj).map(
                            function(e){return +e})
                        .filter(
                            function(a){ return a > currentLevel})
                        .sort(
                            function(a, b){ return a - b; });
        var nextLevel = levels[0] || (currentLevel + 1);
        console.log(nextLevel, currentLevel, levels);

        if (!stateObj[currentLevel]) {
          currentLevel = nextLevel;
          continue;
        }

        var result = this._iterState(stateObj[currentLevel]);
        if (result === undefined) {
          console.log('failed state');
          this._printState(stateObj[currentLevel]);
          /* Delete childs */
          delete stateObj[2*currentLevel + 1];
          delete stateObj[2*currentLevel + 2];
          currentLevel = Math.floor((currentLevel - 1) / 2);
          /* Delete self and sibling as well */
          delete stateObj[2*currentLevel + 1];
          delete stateObj[2*currentLevel + 2];
          continue;
        }
          
        stateObj[currentLevel] = result[0];

        if (result[1])
          stateObj[2 * currentLevel + 1] = result[1]; /* left */
        else
          delete stateObj[2 * currentLevel + 1];

        if (result[2])
          stateObj[2 * currentLevel + 2] = result[2]; /* left */
        else
          delete stateObj[2 * currentLevel + 2];

        currentLevel = nextLevel;
      }
    };

    this.iterateTree = function() {
      if (currentLevel == -1) {
        this._startTree();
      }
      else {
        this._iterTree();
      }

      return this._treeFromStateHeap(stateObj, 0);
    };

    this._treeFromStateHeap = function(stateObj, i) {
      i = i || 0;
      if (!stateObj[i])
        return null;
      var center = lcr[stateObj[i].lcr.center];
      console.log(i, stateObj[i].lcr, center);

      return {
        center: center,
        left: this._treeFromStateHeap(stateObj, i*2 + 1),
        right: this._treeFromStateHeap(stateObj, i*2 + 2),
      }
    };
};
