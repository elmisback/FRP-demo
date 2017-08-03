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


//// pre- function application constraints
//var constrain = (args) => {console.log(args); return args}
//
//var calculateNewState = (args) => {args.state = state$(); console.log(args.state); args.state = args.f(args); return args}
//
//// state invariants
//var validateNewState = function (args) {
//  if (args.state.get('boxes').every((v) => v)) {
//    console.log('illegal state')
//    return state$()  // old state
//  }
//  console.log(args); return args.state
//}
//
//// possibly extraneous
//var applyState = (state) => {console.log(state); state$(state)}
//
//var updateView = () => m.redraw()

// Does this need to be a stream?
// What happens if it's not?
// -- it can't update automatically after intents.
// - well, it could if we map that effect
// -- but then it would have to be a global. look at it now. it's local.
var state$ = m.stream(Immutable.Map({
  boxes: Immutable.List()
}))

var intent$ = m.stream((v) => v)

state$ = intent$.map((f) => f(state$()))

// argument translation -- can this be eliminated?
// state transformer
var addBoxR = (i, v) => function (state) {
  if (state.get('boxes').length < 4) return state
  return state.set('boxes', state.get('boxes').set(i, v))
}

// callback to update state
var addBox = (i, v) => intent$(addBoxR(i, v))
addBox(0,true)
addBox(1,true)

// dependent component (requires different handling in view)
var box2 = (s) => s.get('boxes').get(1) && s.get('boxes').get(0)
addBox(2,state$.map(box2))
addBox(3,false)
addBox(3,false)
addBox(3,false)


var setBoxR = (i, v) => (state) => state.set('boxes', state.get('boxes').set(i, v))

var set = (i, v) => intent$(setBoxR(i, v))
console.log('making dom')
set(0, false)

//var readOnly  // maybe resolve all streams in state before rendering?

var Sketch = function (s) {
  var boxes = s.get('boxes').map((b, i) => m('input[type=checkbox]', {checked: typeof b === "function"? b() : b})).toArray()

  // intents (have to be here for mithril to pick them up)
  // maybe just include these in the view itself
  boxes.map((b, i) => {
    b.attrs.onclick = m.withAttr("checked", (v) => set(i, v))
  })
  return m('div',
    boxes.map((b, i) => m('div', [
      b,
      b.attrs.checked.toString()
    ]))
  )
}

var Sub = function (s) {
  return m('div')
}


// // No syncing or mapping (you don't care about child state) (why not???)
// do nothing
//
// // Just sync changes in child state to parent
// Sub.state$.map((s) => state$(state$.set('subpart', s)))
// 
// // Sync parent to child  (I think this doesn't mix with above)
// state$.map((s) => Sub.state$(s.get('subpart')))
//
// // Use parent state for child (single source of truth) (may be too recursive)
// Sub.intent$.end(true)  // unhook child state from child intent
// Sub.state$ = () => state$().get('subpart')  // readonly copy of parent
// Sub.intent$.map((f) => state$().set('subpart', f(state$().get('subpart')))).map(state$)  // subintents set parent

// start rendering
state$.map((s) => m.render(document.body, Sketch(s)))
// log state changes
state$.map((v) => {console.log(v);})

/**/
