import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order, OrderStatus } from "../../entities";
import { ServiceResponse } from "../../common/interfaces/service-response.interface";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async findAll(): Promise<ServiceResponse<Order[]>> {
    const orders = await this.orderRepository.find({
      relations: ["customer"],
      order: { createdAt: "DESC" },
    });

    return {
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    };
  }

  async findOne(id: number): Promise<ServiceResponse<Order>> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ["customer", "items", "items.product"],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return {
      success: true,
      message: "Order fetched successfully",
      data: order,
    };
  }

  async updateStatus(
    id: number,
    status: OrderStatus,
  ): Promise<ServiceResponse<Order>> {
    await this.orderRepository.update(id, { status });
    const order = await this.orderRepository.findOne({ where: { id } });

    return {
      success: true,
      message: "Order status updated successfully",
      data: order!,
    };
  }
}
