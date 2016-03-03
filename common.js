
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
