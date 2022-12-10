const dbService = require('../../services/db.service')
const utilService = require('../../services/utilService.js')
const ObjectId = require('mongodb').ObjectId
const logger = require('../../services/logger.service')


async function query(filterBy={}) {
  const collection = await dbService.getCollection('product')
  
  if(filterBy) {
    const criteria = _buildCriteria(filterBy)
    logger.info('criteria',criteria)
    var products = await collection.find(criteria).limit(30).toArray()

  }else{
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

function _buildCriteria(filterBy = {where:'',label:'',adults:0,children:0,infants:0,pets:0}) {
  const criteria = {}
  if(filterBy.where || filterBy.label || filterBy.adults>0){
    logger.info(filterBy)
    const { where, label, adults,children,infants,pets } = filterBy
    criteria.capacity = { $gte: (+adults + +children + +infants + +pets) }
    if (where) criteria["address.street"]  = { $regex: where, $options: 'i' }
    if(label) criteria.label = { $regex: label, $options: 'i' }

  }

  if(filterBy.minPrice){
    let minPrice = (+filterBy.minPrice + 0)
    let maxPrice = (+filterBy.maxPrice + 0)
    criteria.price = {$gt:minPrice,$lt:maxPrice}

    if(filterBy.beds!=='any') criteria.beds = {$eq:+filterBy.beds}

    if(filterBy.bedRooms!=='any') criteria.bedrooms = {$gte:+filterBy.bedRooms-1}

    if(filterBy?.propertyType) criteria.propertyType = {$regex: filterBy.propertyType, $options: 'i'}

    var roomsTypes = ['entirePlace','privateRoom','sharedRoom']
    var roomsToFilter = []

    roomsTypes.forEach(room => {
      let roomType = ''
      if(room==='entirePlace') roomType = 'Entire home/apt'
      else if(room==='privateRoom') roomType = 'Private room'
      else if(room==='sharedRoom') roomType = 'Room'
      if(filterBy[room]==='true') roomsToFilter.push(roomType)
    })
    
    if(roomsToFilter.length>0) criteria.roomType = { $in: roomsToFilter}

    var amenities = ['wifi','airConditioning','kitchen','washer','freeParking']
    var amenitiesToFilter = []
    amenities.forEach(a => {
      let aminity = a.replace(/([A-Z]+)/g, " $1").toLowerCase()
      aminity = aminity[0].toUpperCase() + aminity.substring(1);
      if(filterBy[a]==='true') amenitiesToFilter.push(aminity)
    })
    if(amenitiesToFilter.length>0) criteria.amenities = { $all: amenitiesToFilter }


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
