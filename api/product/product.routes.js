const express = require('express')
const { getProducts, getProductById, addProduct, updateProduct, removeProduct, addReview } = require('./product.controller')
const router = express.Router()

router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/', addProduct)
router.put('/:id', updateProduct)
router.delete('/:id', removeProduct)

module.exports = router
