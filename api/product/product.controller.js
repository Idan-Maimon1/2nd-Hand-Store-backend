const productService = require('./product.service.js')
const logger = require('../../services/logger.service')

async function getProducts(req, res) {
  try {
    const queryParams = req.query
    const products = await productService.query(queryParams)
    res.json(products)
  } catch (err) {
    res.status(404).send(err)
  }
}

async function getProductById(req, res) {
  try {
    const productId = req.params.id
    const product = await productService.getById(productId)
    res.json(product)
  } catch (err) {
    res.status(404).send(err)
  }
}

async function addProduct(req, res) {
  const product = req.body
  try {
    const addedProduct = await productService.add(product)
    broadcast({ type: 'something-changed', userId: req.session?.user._id })
    res.json(addedProduct)
  } catch (err) {
    res.status(500).send(err)
  }
}

async function updateProduct(req, res) {
  try {
    const product = req.body
    const updatedProduct = await productService.update(product)
    res.json(updatedProduct)
  } catch (err) {
    res.status(500).send(err)
  }
}

async function removeProduct(req, res) {
  try {
    const productId = req.params.id
    const removedId = await productService.remove(productId)
    logger.info('deleted',productId)
    res.send(removedId)
  } catch (err) {
    res.status(500).send(err)
  }
}

async function addReview(req, res) {
  const productId = req.params.id
  const review = req.body
  try {
    const addedReview = await productService.addReview(review, productId)
    res.send(addedReview)
  } catch (err) {
    res.status(500).send(err)
  }
}

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  removeProduct,
  addReview,
}
