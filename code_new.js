
function TreeGenerator(crl, lcr) {
    if (crl.length != lcr.length)
        throw ("Invalid arg lengths: crl.length = " + crl.length +
               " vs lcr.length = " + lcr.length);

    var newNode = function(state, value) {
        if (state === null)
            return null;

        if (state.lcr.left == state.lcr.right)
            return new NodeStatic(state);

        return new NodeIterator(state);
    };

    var NodeStatic = function(state) {
        if (state.crl.left != state.crl.right)
            throw "Not a static node";


        var center = crl[state.crl.left];
        var shown = false;

        this.reset = function() {
            shown = false;
        };

        this.next = function() {
            //console.log('NodeStatic', center, shown);
            //throw new Error("WHAT?");
            if (shown)
                return;

            shown = true;
            return {
                center: center
            };
        };
    };

    var NodeIterator = function(state) {
        var centerSymbol = crl[state.crl.left];
        var splitPosition = state.lcr.left - 1;
        var crlSplitPosition = -1;
        var left = null, right = null, leftIterator, rightIterator;

        var _print = this.print = function(logPrefix) {
            var log = console.log.bind(console);
            if (logPrefix !== undefined && logPrefix !== '')  {
                log = console.log.bind(console, "L" + logPrefix);
            }

            log('state.lcr', {left: state.lcr.left, right: state.lcr.right,
                              center: splitPosition});
            var lcr_ = lcr.substring(state.lcr.left, state.lcr.right + 1);
            log('lcr', "'" + lcr_ + "'");
            if (splitPosition >= state.lcr.left
                && splitPosition <= state.lcr.right) {
              var center = '-'.repeat(splitPosition - state.lcr.left) + '^' +
                           '-'.repeat(state.lcr.right - splitPosition);
              log('lcr', "'" + center + "'");
            }

            log('state.crl', state.crl);
            log('crl', "'" + crl.substring(state.crl.left, state.crl.right + 1) + "'");
            if (crlSplitPosition >= state.crl.left) {
              var center = '-'.repeat(crlSplitPosition - state.crl.left) + '^' +
                           '-'.repeat(state.crl.right - crlSplitPosition);
              log('crl', "'" + center + "'");
            }
        };

        this.reset = function() {
            splitPosition = state.lcr.left - 1;
            crlSplitPosition = -1;
            leftIterator = rightIterator = null;
        };

        var set = function(s) {
            return s.split('').sort().join('');
        };

        var checkState = function(state) {
            if (state.lcr.left > state.lcr.right)
                return null;

            var lcrSet = lcr.substring(state.lcr.left, state.lcr.right + 1)
            var crlSet = crl.substring(state.crl.left, state.crl.right + 1);

            if (set(lcrSet) != set(crlSet))
                return false;

            return state;
        };

        var nextSplitPosition = function(){

            splitPosition = lcr.indexOf(centerSymbol, splitPosition + 1);
            crlSplitPosition = -1;

            if (splitPosition < 0 || splitPosition > state.lcr.right)
                return false;


            crlSplitPosition = state.crl.left + state.lcr.right - splitPosition;
            return true;
        };

        var nextIterators = function() {

            var leftState = {
                lcr: {
                    left: state.lcr.left,
                    right: splitPosition - 1,
                },
                crl: {
                    left: 1 + crlSplitPosition,
                    right: state.crl.right,
                },
            };

            var rightState = {
                lcr: {
                    left: splitPosition + 1,
                    right: state.lcr.right,
                },
                crl: {
                    left: 1 + state.crl.left,
                    right: crlSplitPosition,
                },
            };

            leftState = checkState(leftState);
            rightState = checkState(rightState);

            if (leftState === false || rightState === false)
                return false;

            leftIterator = newNode(leftState);
            rightIterator = newNode(rightState);

            return true;
        };

        var nextSubtree = function(l) {
            var newSubtree = false;
 
            leftIterator = rightIterator = null;

            while (nextSplitPosition())
                if (newSubtree = nextIterators())
                    break;

            //console.log('new subtree');
            //_print(l);

            return newSubtree;
        };

        var nextLeft = function(l) {
            left = null;
            if (leftIterator) {
                left = leftIterator.next(2*l + 1);
                if (left !== undefined)
                    return true;
            }

            if (!nextSubtree(l))
                return false;

            left = null;
            if (leftIterator) {
                left = leftIterator.next(2*l + 1);
            }
            return true;
        };

        var nextRight = function(l) {
            right = null;
            if (rightIterator) {
                right = rightIterator.next(2*l + 2);
                if (right !== undefined)
                    return true;
            }

            if (!nextLeft(l))
                return false;

            right = null;
            if (rightIterator) {
                rightIterator.reset();
                right = rightIterator.next(2*l + 2);
            }
            return true;
        };

        this.next = function(l) {
            /*
            console.log("L" +l, 'next');
            this.print(l);
            console.log("L" + l, "left", left, "right", right);
            */
            do {
                if (!nextRight(l)) {
        //            console.log('failed');
         //           this.print(l);
                    return;
                }
                //console.log("L" + l, "left", left, "right", right);
            /* undefined left or right means that sibling's .next()
               failed to iterate due to impossible split
             */
            } while (left === undefined || right === undefined);

            return {
                center: centerSymbol,
                left: left,
                right: right
            };
        };

    };

    var rootState = {
        lcr: {
           left: 0,
           right: lcr.length - 1,
        },
        crl: {
           left: 0,
           right: crl.length - 1,
        },
    };
    var rootIterator = newNode(rootState);

    this.iterateTree = function(){
        var r = rootIterator.next(0);
        return r;
    };
}
