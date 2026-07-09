import { Router, Request, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { asyncHandler, AppError } from '../middleware/error.middleware'
import { PaymentService } from '../services/payment.service'

const router = Router()

router.post('/solicitar', asyncHandler(async (req: Request, res: Response) => {
  const { mesaId, tipoPago } = req.body
  if (!mesaId || !tipoPago) throw new AppError('Missing required fields', 400)
  const orden = await PaymentService.solicitarPago(mesaId, tipoPago, req.app.get('io'))
  res.json({ success: true, orden })
}))

router.post('/llamar-mesero', asyncHandler(async (req: Request, res: Response) => {
  const { mesaId, motivo } = req.body
  if (!mesaId) throw new AppError('Missing table ID', 400)
  await PaymentService.llamarMesero(mesaId, motivo, req.app.get('io'))
  res.json({ success: true, message: 'Waiter notified' })
}))

router.patch('/:id/pagar', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { metodoPago } = req.body
  const orden = await PaymentService.pagarOrden(req.params.id, metodoPago, req.app.get('io'))
  res.json({ success: true, orden })
}))

export default router