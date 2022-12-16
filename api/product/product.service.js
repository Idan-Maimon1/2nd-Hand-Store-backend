const dbService = require('../../services/db.service')
const utilService = require('../../services/utilService.js')
const ObjectId = require('mongodb').ObjectId
const logger = require('../../services/logger.service')


async function query(filterBy = {}) {
  const collection = await dbService.getCollection('product')

  if (filterBy) {
    const criteria = _buildCriteria(filterBy)
    logger.info('criteria', criteria)
    var products = await collection.find(criteria).limit(30).toArray()

  } else {
    var products = await collection.find().limit(30).toArray()
  }
  return products
}

async function getById(productId) {
  const collection = await dbService.getCollection('product')
  const product = collection.findOne({ _id: ObjectId(productId) })
  return product
}

async function remove(productId) {
  const collection = await dbService.getCollection('product')
  await collection.deleteOne({ _id: ObjectId(productId) })
  return productId
}

async function add(product) {
  const collection = await dbService.getCollection('product')
  const { ops } = await collection.insertOne(product)
  return ops[0]
}
async function update(product) {
  var id = ObjectId(product._id)
  delete product._id
  const collection = await dbService.getCollection('product')
  await collection.updateOne({ _id: id }, { $set: { ...product } })
  product._id = id
  return product
}

async function addReview(review, productId) {
  try {
    const collection = await dbService.getCollection('product')
    review.id = utilService.makeId()
    review.createdAt = Date.now()
    await collection.updateOne({ _id: ObjectId(productId) }, { $push: { reviews: review } })
    return review
  } catch (err) {
    console.log(err)
    throw err
  }
}

async function addMsg(productId, msg) {
  const product = await getById(productId)
  product.msgs = product.msgs || []
  product.msgs.push(msg)
  update(product)
}

function _buildCriteria(filterBy = { category: '', minPrice: 0, maxPrice: 0 }) {
  const criteria = {}
  const { category, minPrice, maxPrice } = filterBy
  if (category || minPrice || maxPrice && maxPrice !== 150) {
    logger.info(filterBy)
    if (category) criteria["category"] = { $regex: category, $options: 'i' }
    if (minPrice || maxPrice && maxPrice !== 150) {
      criteria.price = { $gt: +minPrice, $lt: +maxPrice }
    }
  }
  return criteria
}



module.exports = {
  remove,
  query,
  getById,
  add,
  update,
  addReview,
  addMsg
}
