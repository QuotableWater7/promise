# Promise
An implementation of promises with bluebird-like class functions.  The goal was to write easy-to-read code that anyone could grasp quickly and get a better understanding of the mechanics of these helper functions.

## Basic Usage
You can use this promise just like native JS promises:

```js
const ten = await new P((resolve, reject) => {
  setTimeout(() => resolve(5), 1000)
})
  .then(value => value * 2)

await new P((resolve, reject) => {
  reject('Oops')
})
  .catch(console.log)
```

## P.all
Provide an array of promises; `P.all` will resolve when every individual promise has resolved.

```js
const [one, two] = await P.all([promiseOne, promiseTwo])
```

## P.each
Provide an array, invoke an async function over each item:

```js
await P.each(ids, async id => {
  const item = await Model
    .findById(id)
    .lean()
    .exec()

  await Model.update({ _id: id }, { name: 'John Doe' })
})
```

## P.map
Provide an array, invoke a promise-returning function over each item and return the results in an array:

```js
await P.map(
  ids,
  id => Model.findById(id).lean().exec()
)
```

By default, concurrency is unbounded.  You can supply an options object as the third argument like so:
```js
// no more than 4 promises are executing at a time
await P.map(ids, handleId, { concurrency: 4 })
```


## P.reduce
Acts like a reducer on the provided array; function provided as second argument will receive the current `accum` value as well as the current item to be processed from the array.  Third argument is the initial `accum` value.

Each array item is processed serially.

```js
const sum = await P.reduce(
  ids,
  async (accum, id) => {
    const nextValue = Model
      .findById(id)
      .lean()
      .exec()
      .then(result => result.value)

    return accum + id
  },
  0
)
```

## P.props
Provide an object whose values are promises, and the resolved value will be an object whose values are all the values from the resolved promises.

```js
const {
  item1,
  item2,
} = await P.props({
  item1: Model.findById(id1).lean().exec(),
  item2: Model.findById(id2).lean().exec(),
})
```

## P.delay
Wait a number of milliseconds before resolving a promise.  Optionally provide a resolved value as a second argument.

```js
const boop = await P.delay(5000, 'boop')
```

## P.resolve
Create a resolved promise whose result is the optional provided value:

```js
const beep = await P.resolve('beep')
```
