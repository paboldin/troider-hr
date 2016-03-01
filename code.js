
var debug = true;
var debug_iterState = true;
var DEBUG = function(){console.log.apply(console, arguments)};

if (!debug)
  DEBUG = function(){};

function TreeGenerator(crl, lcr) {
    if (crl.length != lcr.length)
        throw ("Invalid arg lengths: crl.length = " + crl.length +
               " vs lcr.length = " + lcr.length);

    var stateHeap = [];
    var currentElem = -1;

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
      stateHeap[0] = {
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
      currentElem = 0;

      while(currentElem >= 0 && currentElem < stateHeap.length) {
        console.log(currentElem);
        if (!stateHeap[currentElem]) {
          currentLevel++;
          continue;
        }
        var result = this._iterState(stateHeap[currentElem]);
        if (result === undefined) {
          var currentState = stateHeap[currentElem];
          this._printState(currentState);

          stateHeap[currentElem] = null;
          currentElem = currentState.parent;
          continue;
        }
          
        stateHeap[currentElem] = result[0];
        result[1].parent = result[2].parent = currentElem;
        stateHeap[currentElem + 1] = result[1]; /* left */
        stateHeap[currentElem + 2] = result[2]; /* right */
        currentElem++;
      }
    };

    this.iterateTree = function() {
      if (currentLevel == -1) {
        this._startTree();
      }
      else {
        this._iterTree();
      }

      return this._treeFromStateHeap(stateHeap, 0);
    };

    this._treeFromStateHeap = function(stateHeap, i) {
      i = i || 0;
      if (!stateHeap[i])
        return null;

      return {
        center: lcr[stateHeap[i].lcr.center],
        left: this._treeFromStateHeap(stateHeap, 2*i + 1),
        right: this._treeFromStateHeap(stateHeap, 2*i + 2),
      }
    };
};

function printTreeCenterRightLeft(tree) {
  if (tree == null) {
    return '';
  }
  return tree.center + printTreeCenterRightLeft(tree.right) + printTreeCenterRightLeft(tree.left);
}

function printTreeLeftCenterRight(tree) {
  if (tree == null) {
    return '';
  }
  return printTreeLeftCenterRight(tree.left) + tree.center + printTreeLeftCenterRight(tree.right);
}

function printTreeRightLeftCenter(tree) {
  if (tree == null) {
    return '';
  }
  return printTreeRightLeftCenter(tree.right) + printTreeRightLeftCenter(tree.left) + tree.center;
}
