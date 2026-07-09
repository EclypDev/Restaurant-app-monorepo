import { IOrden } from '../../../shared/interfaces'

export interface IOrderRepository {
  findById(id: string): Promise<IOrden | null>
  findAll(page: number, limit: number): Promise<{ ordenes: IOrden[], total: number }>
  create(data: Omit<IOrden, '_id'>): Promise<IOrden>
  update(id: string, data: Partial<IOrden>): Promise<IOrden>
}
