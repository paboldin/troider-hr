
var debug = true;
var DEBUG = function(){console.log.apply(console, arguments)};

if (!debug)
  DEBUG = function(){};

function TreeGenerator(crl, lcr) {
    if (crl.length != lcr.length)
        throw ("Invalid arg lengths: crl.length = " + crl.length +
               " vs lcr.length = " + lcr.length);

    var stateHeap = Array.apply(null, Array(crl.length*4)).map(
      function(){ return null; });
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
    };


    this._checkState = function(state) {
      if (state.lcr.left > state.lcr.right)
        return null;
      return state;
    };


    this._iterState = function(parentState) {
      var centerSymbol = crl[parentState.crl.left];
      var center = lcr.indexOf(centerSymbol, parentState.lcr.center + 1);

      if (center < 0 || center > parentState.lcr.right)
        return;

      var newState = {
        lcr: {
          left: parentState.lcr.left,
          center: center,
          right: parentState.lcr.right,
        },
        crl: {
          left: parentState.crl.left,
          right: parentState.crl.right,
        },
      };

      var crlCenter = parentState.lcr.right - center;

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

  /*
      console.log('new');
      this._printState(newState);
      console.log('left');
      this._printState(leftState);
      console.log('right');
      this._printState(rightState);
    */

      leftState = this._checkState(leftState);
      rightState = this._checkState(rightState);

      return [newState, leftState, rightState];
    };

    this._startTree = function() {
      currentLevel = 0;
      console.log(stateHeap.length);

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

      while(currentLevel >= 0 && currentLevel < stateHeap.length) {
        if (stateHeap[currentLevel] === null) {
          console.log(currentLevel);
          currentLevel++;
          continue;
        }
        var result = this._iterState(stateHeap[currentLevel]);
        if (result === undefined)
          break;
          
        var newResult = result[0];
        var leftResult = result[1];
        var rightResult = result[2];

        console.log(newResult);

        stateHeap[currentLevel] = result[0];
        if (leftResult)
            stateHeap[2*currentLevel + 1] = result[1]; /* left */
        if (rightResult)
            stateHeap[2*currentLevel + 2] = result[2]; /* right */
        currentLevel++;
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

/*
function findEmail(centerRightLeft, leftCenterRight) {
  var generator = new TreeGenerator(centerRightLeft, leftCenterRight);
  var tree = generator.generateNextTree();
  console.log("'" + printTreeRightLeftCenter(tree) + "'");
  var tree = generator.generateNextTree();
  console.log("'" + printTreeRightLeftCenter(tree) + "'");
  console.log(tree);
  console.log(printTreeCenterRightLeft(tree) == centerRightLeft);
  console.log(printTreeLeftCenterRight(tree) == leftCenterRight);
  console.log("'" + printTreeRightLeftCenter(tree) + "'");
}

var easyProblem = {
  centerRightLeft: 'damEra@ilh',
  leftCenterRight: 'hal@irdamE',
}
findEmail(easyProblem.centerRightLeft, easyProblem.leftCenterRight);
var hardProblem = {
  centerRightLeft: '.o elPsaec lamei.a sur@h treotrdil0ems.al Pe7  dnse8dco9e:i438f7bfc5224b5d151bdc4ai bc91eamuoy ne r',
  leftCenterRight: 'er muyn oaia1e 9cbi14bdcc55d15b4227fb43f8l:9e8odc7dens  0eaPl s.em.iderotrr@t h.aus c ilaemo saeelP',
}
//findEmail(hardProblem.centerRightLeft, hardProblem.leftCenterRight);
//findEmail('5224b5d15', '55d15b422');
*/
