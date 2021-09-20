const crypto = require('crypto')

function hash (password, cb) {
  const salt = crypto.randomBytes(128).toString('base64')
  crypto.pbkdf2(password, salt, 10000, 64, 'sha512', cb)
}

let count = 0
console.time('pbkdf2')
for (let i = 0; i < 100; i++) {
  hash('random_password', () => {
    count++
    if (count === 100) {
      console.timeEnd('pbkdf2')
    }
  })
}


function INTERNAL () {}
function isFunction (func) {
  return typeof func === 'function'
}
function isObject (obj) {
  return typeof obj === 'object'
}
function isArray (arr) {
  return Array.isArray(arr)
}

const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

function Promise(resolver){
  // 假如传进来的参数不熟函数，返回
  if(!isFunction(resolver)){
    throw new Error('fail')
  }
  this.state = PENDING
  this.value = void 0
  this.queue = []
  if(resolver !== INTERNAL){
    safelyResolveThen(this, resolver)
  }
}
Promise.prototype.then = function () {}
Promise.prototype.catch = function () {}

Promise.resolve = function () {}
Promise.reject = function () {}
Promise.all = function () {}
Promise.race = function () {}

module.exports = Promise