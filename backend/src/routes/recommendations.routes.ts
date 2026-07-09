import { Router, Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { asyncHandler } from '../middleware/error.middleware'
import { IRecomendacion } from '../../../shared/interfaces'

const router = Router()

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { cartItems } = req.body

  if (!cartItems || cartItems.length === 0) {
    return res.json([])
  }

  const cartIds = cartItems.map((item: any) => item.platilloId)

  // Find platillos in cart
  const platillosEnCarrito = await prisma.platillo.findMany({
    where: { id: { in: cartIds } }
  })

  // Recommendations: Related plates
  const relacionadosIds = new Set<string>()
  platillosEnCarrito.forEach((plat: any) => {
    // If we have itemsRelacionados stored in options or directly
    if (plat.itemsRelacionados) {
      const rels = plat.itemsRelacionados as string[]
      rels.forEach(r => {
        if (!cartIds.includes(r)) {
          relacionadosIds.add(r)
        }
      })
    }
  })

  let resultado: IRecomendacion[]

  if (relacionadosIds.size === 0) {
    // Let's compute most popular items from last 100 orders in memory
    const recentOrders = await prisma.orden.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    const counts: Record<string, number> = {}
    recentOrders.forEach((o: any) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          if (item.platilloId) {
            counts[item.platilloId] = (counts[item.platilloId] || 0) + (item.cantidad || 1)
          }
        })
      }
    })

    const masPedidosIds = Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .filter(id => !cartIds.includes(id))
      .slice(0, 5)

    const populares = await prisma.platillo.findMany({
      where: {
        id: masPedidosIds.length > 0
          ? { in: masPedidosIds }
          : { notIn: cartIds },
        disponible: true,
      },
      take: 3
    })

    resultado = populares.map(p => ({ ...p, _id: p.id, motivo: 'Más pedido' })) as any
  } else {
    const recomendaciones = await prisma.platillo.findMany({
      where: {
        id: { in: [...relacionadosIds] },
        disponible: true,
      },
      take: 5
    })

    resultado = recomendaciones.map(r => ({
      ...r,
      _id: r.id,
      motivo: 'Combina con tu pedido',
    })) as any
  }

  res.json(resultado)
}))

export default router