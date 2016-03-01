
var debug = true;
var DEBUG = function(){console.log.apply(console, arguments)};

if (!debug)
  DEBUG = function(){};

function TreeGenerator(crl, lcr) {
    if (crl.length != lcr.length)
        throw ("Invalid arg lengths: crl.length = " + crl.length +
               " vs lcr.length = " + lcr.length);

    var stateHeap = Array.apply(null, Array(crl.length)).map(
      function(){ return null; });
    var currentLevel = -1;
    stateHeap[0] = {
        lcr: {
          left: 0,
          center: -1,
          right: lcr.length
        },
        crl: {
          left: 0,
          right: crl.length
        },
    };

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
    }


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

      var crlCenter = lcr.length - center - 1;

      var leftState = {
        lcr: {
          left: parentState.lcr.left,
          center: parentState.lcr.left - 1,
          right: center - 1,
        },
        crl: {
          left: 1 + crlCenter,
          right: parentState.crl.right,
        },
      };

      leftState = this._checkState(leftState);

      var rightState = {
        lcr: {
          left: center + 1,
          center: center,
          right: parentState.lcr.right,
        },
        crl: {
          left: parentState.crl.left + 1, /* skip the 'centerSymbol' itself */
          right: crlCenter,
        },
      };

      rightState = this._checkState(rightState);

      return [newState, leftState, rightState];
    };

    this._buildTree = function(stateHeap, i) {
      i = i || 0;
      if (!stateHeap[i])
        return null;

      return {
        center: lcr[stateHeap[i].lcr.center],
        left: this._buildTree(stateHeap, 2*i + 1),
        right: this._buildTree(stateHeap, 2*i + 2),
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

function assert(condition, message) {
  if (!condition) {
    throw message || "Assertion failed";
  }
}

function test_getStartState(problem) {
  var startState = {
      lcr: {
        left: 0,
        center: -1,
        right: problem.leftCenterRight.length - 1,
      },
      crl: {
        left: 0,
        right: problem.centerRightLeft.length - 1,
      },
  };

  return startState;
}

function test_iterState() {
  var problem = {
    leftCenterRight: 'hal@irdamE',
    centerRightLeft: 'damEra@ilh',
  };
  var tree = new TreeGenerator(problem.centerRightLeft, problem.leftCenterRight);

  var startState = test_getStartState(problem);
  var result = tree._iterState(startState);

  assert(result[0].lcr.center == 6, "Center is correct");

  assert(result[1].lcr.left == 0, "left subtree lcr.left is OK");
  assert(result[1].lcr.right == 5, "left subtree lcr.right is OK");

  assert(result[1].crl.left == 4, "left subtree crl.left is OK");
  assert(result[1].crl.right == 9, "left subtree crl.right is OK");

  assert(result[2].lcr.left == 7, "right subtree lcr.left is OK");
  assert(result[2].lcr.right == 9, "right subtree lcr.right is OK");

  assert(result[2].crl.left == 1, "right subtree crl.left is OK");
  assert(result[2].crl.right == 3, "right subtree crl.right is OK");

  if (debug) {
    tree._printState(result[0]);
    tree._printState(result[1]);
    tree._printState(result[2]);
  }
}

function test_iterState_line() {
  var problem = {
    leftCenterRight: 'damE',
    centerRightLeft: 'damE',
  };
  var tree = new TreeGenerator(problem.centerRightLeft,
                               problem.leftCenterRight);

  var startState = test_getStartState(problem);
  var result = tree._iterState(startState);
  var result = tree._iterState(result[2]);
  var result = tree._iterState(result[2]);
  assert(result[2].lcr.left == 3, "right subtree line is OK");
  assert(result[2].lcr.right == 3, "right subtree line is OK");
  assert(result[2].crl.left == 3, "right subtree line is OK");
  assert(result[2].crl.right == 3, "right subtree line is OK");
  var result = tree._iterState(result[2]);
  assert(result === undefined);
}

function test_iterState_ambig() {
  var problem = {
    leftCenterRight: 'hal@irddamE',
    centerRightLeft: 'ddamEra@ilh',
  };
  var tree = new TreeGenerator(problem.centerRightLeft,
                               problem.leftCenterRight);

  var startState = test_getStartState(problem);
  var result = tree._iterState(startState);
  assert(result[0].lcr.center == 6, "center set OK");

  result = tree._iterState(result[0]);
  assert(result[0].lcr.center == 7, "center moved forward");

  result = tree._iterState(result[0]);
  assert(result === undefined, "center finished forward");
}

function test_iterState_tree() {
  var problem = {
    //leftCenterRight: 'hal@irdamE',
    //centerRightLeft: 'damEra@ilh',
    leftCenterRight: 'bcd',
    centerRightLeft: 'bdc',
  };
  var tree = new TreeGenerator(problem.centerRightLeft, problem.leftCenterRight);

  var stateHeap = Array.apply(null, Array(problem.leftCenterRight.length*4)).map(
    function(){ return null; });
  stateHeap[0] = test_getStartState(problem);
  var currentLevel = 0, i = 0;
  while(currentLevel >= 0 && currentLevel < stateHeap.length) {
    if (stateHeap[currentLevel] === null) {
      currentLevel++;
      continue;
    }
    if (i++ > 1000)
        break;
    var result = tree._iterState(stateHeap[currentLevel]);
    if (result === undefined) {
      currentLevel--;
      continue;
    }
      
    var newResult = result[0];
    var leftResult = result[1];
    var rightResult = result[2];

    console.log(currentLevel);
    console.log('new');
    tree._printState(newResult);
    console.log('left');
    tree._printState(leftResult);
    console.log('right');
    tree._printState(rightResult);

    stateHeap[currentLevel] = newResult;
    if (leftResult)
        stateHeap[2*currentLevel + 1] = leftResult;
    if (rightResult)
        stateHeap[2*currentLevel + 2] = rightResult;
    currentLevel++;
  }
  var tr = tree._buildTree(stateHeap);
  console.log(printTreeLeftCenterRight(tr));
  /*
  for (var i in stateHeap) {
    if (stateHeap[i]) {
      console.log(i);
      tree._printState(stateHeap[i]);
    }
  }
  */
}

//test_iterState();
/*
test_iterState_ambig();
*/

test_iterState_tree();
//test_iterState_line();

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
