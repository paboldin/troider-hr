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

  if (0 && debug) {
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
  assert(result[1] === null, "left tree null");
  var result = tree._iterState(result[2]);
  assert(result[1] === null, "left tree null");

  assert(result[2].lcr.left == 3, "right subtree line is OK");
  assert(result[2].lcr.right == 3, "right subtree line is OK");
  assert(result[2].crl.left == 3, "right subtree line is OK");
  assert(result[2].crl.right == 3, "right subtree line is OK");
  var result = tree._iterState(result[2]);
  assert(result[2] === null, "right tree undefined");
  var result = tree._iterState(result[0]);
  assert(result === undefined, "result undefined");
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
  var problems = [{
    leftCenterRight: 'hal@irdamE',
    centerRightLeft: 'damEra@ilh',
    },
    {
      leftCenterRight: 'damE',
      centerRightLeft: 'damE',
    },
    {
      leftCenterRight: 'abcd',
      centerRightLeft: 'bdca',
    },
    {
      leftCenterRight: 'er muyn oaia1e 9cbi14bdcc55d15b4227fb43f8l:9e8odc7dens  0eaPl s.em.iderotrr@t h.aus c ilaemo saeelP',
      centerRightLeft: '.o elPsaec lamei.a sur@h treotrdil0ems.al Pe7  dnse8dco9e:i438f7bfc5224b5d151bdc4ai bc91eamuoy ne r',
    }
  ]

  for (var i in problems) {
    var problem = problems[i];

    var tree = new TreeGenerator(problem.centerRightLeft, problem.leftCenterRight);
    var tr = tree.iterateTree();

    console.log(printTreeRightLeftCenter(tr));
    assert(problem.leftCenterRight == printTreeLeftCenterRight(tr), "lcr ok");
    assert(problem.centerRightLeft == printTreeCenterRightLeft(tr), "crl ok");
  }
}

test_iterState();
test_iterState_ambig();
test_iterState_tree();
test_iterState_line();
