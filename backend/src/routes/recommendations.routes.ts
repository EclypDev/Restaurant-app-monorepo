import { Router, Request, Response } from 'express'
import { Platillo } from '../models/Platillo'
import { asyncHandler } from '../middleware/error.middleware'
import { IRecomendacion } from '../../../shared/interfaces'

const router = Router()

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { cartItems } = req.body

  if (!cartItems || cartItems.length === 0) {
    return res.json([])
  }

  const cartIds = cartItems.map((item: any) => item.platilloId)

  const platillosEnCarrito = await Platillo.find({
    _id: { $in: cartIds },
  }).populate('itemsRelacionados')

  const relacionadosIds = new Set<string>()
  platillosEnCarrito.forEach(platillo => {
    platillo.itemsRelacionados?.forEach((rel: any) => {
      if (!cartIds.includes(rel._id?.toString())) {
        relacionadosIds.add(rel._id?.toString())
      }
    })
  })

  let resultado: IRecomendacion[]

  if (relacionadosIds.size === 0) {
    const populares = await Platillo.find({
      _id: { $nin: cartIds },
      disponible: true,
    })
    .sort({ createdAt: -1 })
    .limit(3)

    resultado = populares.map(p => ({ ...p.toObject(), motivo: 'Popular' }))
  } else {
    const recomendaciones = await Platillo.find({
      _id: { $in: [...relacionadosIds] },
      disponible: true,
    }).limit(5)

    resultado = recomendaciones.map(r => ({
      ...r.toObject(),
      motivo: 'Combina con tu pedido',
    }))
  }

  res.json(resultado)
}))

export default router
