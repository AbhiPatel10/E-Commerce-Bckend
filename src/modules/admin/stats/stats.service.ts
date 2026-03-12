import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order, Product, CustomerDetails, User } from "../../../entities";

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(CustomerDetails)
    private customerDetailsRepository: Repository<CustomerDetails>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getDashboardStats() {
    const [
      totalSalesResult,
      ordersCount,
      productsCount,
      customersCount,
      recentOrders,
    ] = await Promise.all([
      // Total Sales
      this.orderRepository
        .createQueryBuilder("order")
        .select("SUM(order.totalAmount)", "sum")
        .where("order.status = :status", { status: "DELIVERED" })
        .getRawOne(),
      // Total Orders
      this.orderRepository.count(),
      // Total Products
      this.productRepository.count(),
      // Total Customers (Unique emails in orders for now)
      this.customerDetailsRepository.count(),
      // Recent Orders
      this.orderRepository.find({
        take: 5,
        order: { createdAt: "DESC" },
        relations: ["customer"],
      }),
    ]);

    // For customers, let's get actual user count
    const userCount = await this.userRepository.count();

    return {
      success: true,
      data: {
        totalSales: Number(totalSalesResult?.sum || 0),
        ordersCount,
        productsCount,
        customersCount: userCount || customersCount,
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customer?.fullName || "N/A",
          totalAmount: Number(order.totalAmount),
          status: order.status,
          createdAt: order.createdAt,
        })),
      },
    };
  }
}
