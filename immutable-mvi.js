var R = window.R
var Checkbox = {
  oncreate(vnode) {
    // captures user "intents"/events
    vnode.dom.onclick = m.withAttr("checked", vnode.attrs.checked$)
  },
  view(vnode) {
    return m("input[type=checkbox]", {checked:vnode.attrs.checked$()})
  }
}

var Radio = {
  oncreate(vnode) {
    // captures user "intents"/events
    vnode.dom.onclick = m.withAttr("checked", vnode.attrs.checked$)
  },
  view(vnode) {
    return m("input[type=radio]", {checked:vnode.attrs.checked$(), name: vnode.attrs.name})
  }
}

//var cons = (el, A) => [].concat([el], A)
//var add = (i) => (el) => (A) => [].concat(A.slice(0, i), [el], A.slice(i, A.length))
//var rm = (i) => (A) => [].concat(A.slice(0, i), A.slice(i+1, A.length))
//
//// Event handler
//var userModel$ = m.stream([])
//var check = (m) => m.length < 4
//var model$ = userModel$.map(function (newModel) {
//  if (!check(newModel)) {
//    console.log('Failed check.')
//    userModel$(model$())
//    return m.stream.HALT
//  }
//  return newModel
//})
//
//// Log all model updates
//model$.map(console.log)
//
//
//// Intent
//var uAdd = (i) => userModel$(add(i)(i)(userModel$()))
//uAdd(0)
//uAdd(1)
//uAdd(2)
//uAdd(2)
//uAdd(2)
//
//
//check = (m) => !m.every((v) => v)
//userModel$([true, false, true])
//
//
//var toggle = (i) => (A) => [].concat(A.slice(0, i), [!A[i]], A.slice(i + 1, A.length))
//userModel$(toggle(2)(userModel$()))


// b.ap(a) === a()(b())

// filter and augment intent ?? do we need this.
// possibility: just let the user update the state.
// but then the logic for playing with the state isn't all in one place.
// well, that's not quite true: we've mapped out the data flow.
// users just update one value and watch the rest slide into place.
// then is the intermediate intoAction necessary?
//
// try removing it, see what happens.
//var state$ = m.stream()
//var intent$ = m.stream()
//var init = (val) => m.stream(val).map((state) => intent$()(state))


//var old$ = m.stream([])

//var state = {
//  boxes$: m.stream.combine((...T) => T.slice(0, T.length -1), [true, false, true].map(m.stream)),
//  radios$: m.stream.combine((...T) => T.slice(0, T.length -1), [false, false, true, false, false].map(m.stream))
//}
//console.log(state.boxes$().map((s$) => s$()))
//
//// Handle general state changes
//m.stream.merge([state.boxes$, state.radios$]).map(() => m.redraw())
//
//
//
//// Add constraints
//var s = state
//s.boxes$().map((b$) => b$.map((v) => s.boxes$().every((b$) => b$()) ? m.stream.HALT: v))

//var ensure = (s$, f) => s$.map((v) => f(s$()) ? v : m.stream.HALT)
//
//// filters updates to s$ on condition f
//
//ensure(s.boxes$, (bs) => console.log(bs, bs.map((b$) => b$()), bs.every((b$) => b$())) && !bs.every((b$) => b$()))
//s.radios$().map((r$, i) => ensure(r$, (r) => !(i >= 4 && r)))
//s.radios$()[0] = s.boxes$()[1].map((v) => v)

// Add computed values and effects
//var sum = m.stream.scan((a, b) => a + b, 0, state.boxes$)

// old user & model
// anything the user sees and can modify is a stream
// user modifies via s$(newValue(s$()))
// user may not mutate s$()
//var user = {
//  boxes$: m.stream.combine((...T) => T.slice(0, T.length -1), [true, false, true].map(m.stream))
//}
//var u = user
//
//u.boxes$.map()
//
//var model = {
//  boxes$: boxes$.map()
//}
//
//model.map()
//m.stream.merge([state.boxes$, state.radios$]).map(() => m.redraw())
//

//var state$ = m.stream()
//var intent$ = m.stream()
//var init = (val) => m.stream(val).map((state) => intent$()(state))

var state$ = m.stream(Immutable.Map({
  boxes: Immutable.List()
}))

// consider immutable.js ?
// modifying immutable values this copy won't update state$
//var stateCopy = function (state) {
//  console.log(state)
//  return {boxes: state.boxes}
//  //console.log(Immutable.Map(state))
//  //return Immutable.Map(state)
//}

// TODO confusing pointer stuff might be clarified by functions
// non-state-mutating resolution
// {f, ...args} => f(stateCop(state)
//var resolver = function (args) {
//  var newState = stateCopy(state$())
//  args.state = newState;
//  var ret = args.f(args) || newState
//  console.log(state$())
//  return ret
//}

// pre- function application constraints
var constrain = (args) => {console.log(args); return args}

var calculateNewState = (args) => {args.state = state$(); console.log(args.state); args.state = args.f(args); return args}

// state invariants
var validateNewState = function (args) {
  if (args.state.get('boxes').every((v) => v)) {
    console.log('illegal state')
    return state$()  // old state
  }
  console.log(args); return args.state
}

// possibly extraneous
var applyState = (state) => {console.log(state); state$(state)}

state$.map(() => m.redraw())
var updateView = () => m.redraw()

var intent$ = m.stream()

intent$
  .map(constrain)
  .map(calculateNewState)
  .map(validateNewState)
  .map(applyState)
  .map(updateView)



// log state changes
state$.map((v) => {console.log(v);})
intent$.map((v) => {console.log(v);})

// pure function
//var add = (i, v, A) => [].concat(A.slice(0, i), [v], A.slice(i, A.length))
var add = (i, v, A) => A.set(i, v)


// how to apply function to the state
//var addBoxResolve = (function ({i, v, A}) {
//  var newState = stateCopy(state$())
//  newState.boxes = add(i, v, A)
//  return newState
//})

// state transformer
// mutates or returns new state
var addBoxR = ({i, v, state}) => state.set('boxes', add(i, v, state.get('boxes')))

// callback to update state--full argument definition
var addBox = (i, v) => intent$({f:addBoxR, i:i, v:v})

// caller sees
addBox(0,true)
addBox(1,true)
addBox(2,true)
addBox(3,false)


//var Sketch = {
//  view(vnode) {
//    var s = state$()
//    return m('div',
//      s.boxes.map((b, i) => m('div', [
//        m(Checkbox, {checked:b, check:() => check(i)}),
//        b$().toString()
//      ]))//, m('div',
//      //s.radios$().map((r$, i) => 
//      //  m(Radio, {type: 'radio', checked$:r$, name: 'womp'})
//      //  )
//      //)
//    )
//  }
//}
var setBox = ({i, v, state}) => state.set('boxes', state.get('boxes').set(i, v))

// argument translation -- can this be eliminated?
var set = (i, v) => intent$({f:setBox, i:i, v:v})
console.log('making dom')
set(0, false)


var Sketch = {
  oncreate(vnode) {
    var boxes = vnode.state.checkboxes
    boxes.map((b, i) => {
      b.dom.onclick = m.withAttr("checked", (v) => set(i, v))
    })
  },
  view(vnode) {
    var s = vnode.state
    s.checkboxes = state$().get('boxes').map((b, i) => m('input[type=checkbox]', {checked: b})).toArray()
    console.log(s.checkboxes)
    return m('div',
      s.checkboxes.map((b, i) => m('div', [
        b,
        b.attrs.checked.toString()
      ]))
    )
  }
}

//var Sketch = {
//  view(vnode) {
//    var s = state$()
//    return m('div',
//      s.boxes.map((b$) => m('div', [
//        m(Checkbox, {checked$:b$}),
//        b$().toString()
//      ])), m('div',
//      s.radios$().map((r$, i) => 
//        m(Radio, {type: 'radio', checked$:r$, name: 'womp'})
//        )
//      )
//    )
//  }
//}

m.mount(document.body, Sketch)
/**/
