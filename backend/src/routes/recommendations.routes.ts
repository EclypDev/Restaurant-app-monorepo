import { Router, Request, Response } from 'express'
import { Platillo } from '../models/Platillo'
import { Orden } from '../models/Orden'
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
    const masPedidos = await Orden.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.platilloId', total: { $sum: '$items.cantidad' } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ])
    const masPedidosIds = masPedidos
      .map(i => i._id?.toString())
      .filter((id: string | undefined): id is string => !!id && !cartIds.includes(id))

    const populares = await Platillo.find({
      ...(masPedidosIds.length > 0
        ? { _id: { $in: masPedidosIds } }
        : { _id: { $nin: cartIds }, disponible: true }),
      disponible: true,
    }).limit(3)

    resultado = populares.map(p => ({ ...p.toObject(), motivo: 'Más pedido' })) as any;
  } else {
    const recomendaciones = await Platillo.find({
      _id: { $in: [...relacionadosIds] },
      disponible: true,
    }).limit(5)

    resultado = recomendaciones.map(r => ({
      ...r.toObject(),
      motivo: 'Combina con tu pedido',
    })) as any;  }

  res.json(resultado)
}))

export default router
