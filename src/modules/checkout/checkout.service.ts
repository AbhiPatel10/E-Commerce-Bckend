import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import {
  Cart,
  Order,
  Payment,
  CustomerDetails,
  OrderItem,
  OrderStatus,
} from "../../entities";
import { PaymentsService } from "../payments/payments.service";
import { CheckoutDto } from "./dto/checkout.dto";
import { InitiateCheckoutDto } from "./dto/initiate-checkout.dto";
import { ServiceResponse } from "../../common/interfaces/service-response.interface";

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(CustomerDetails)
    private customerDetailsRepository: Repository<CustomerDetails>,
    private paymentsService: PaymentsService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async initiateCheckout(
    dto: InitiateCheckoutDto,
  ): Promise<ServiceResponse<any>> {
    const { sessionId, customerDetails } = dto;

    // 1. Validate Cart
    const cart = await this.cartRepository.findOne({
      where: { sessionId },
      relations: ["items", "items.product"],
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException("Cart is empty");
    }

    // 2. Calculate Total & Prepare Metadata
    let totalAmount = 0;
    const cartItemsSnapshot: any[] = [];

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `Product ${item.product.name} is out of stock`,
        );
      }
      const itemTotal = Number(item.product.price) * item.quantity;
      totalAmount += itemTotal;

      cartItemsSnapshot.push({
        productId: item.product.id,
        quantity: item.quantity,
        priceSnapshot: item.product.price,
      });
    }

    // 3. Create Stripe Payment Intent FIRST
    const metadata = {
      customerDetails: JSON.stringify(customerDetails),
      cartItems: JSON.stringify(cartItemsSnapshot),
      sessionId: sessionId,
    };

    try {
      const paymentIntent = await this.paymentsService.createPaymentIntent(
        totalAmount,
        metadata,
      );

      // 4. Create Payment Record (No Order Yet)
      const payment = this.paymentRepository.create({
        stripePaymentId: paymentIntent.id,
        amount: totalAmount,
        currency: "usd",
        status: "PENDING" as any,
        metadata: metadata,
        customerEmail: customerDetails.email,
      });
      await this.paymentRepository.save(payment);

      return {
        success: true,
        message: "Payment initiated",
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          totalAmount,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        "Failed to initiate payment: " + error.message,
      );
    }
  }

  // Deprecated but kept for reference until full switch
  async processCheckout(dto: CheckoutDto): Promise<ServiceResponse<any>> {
    const { sessionId, customerDetails } = dto;

    // 1. Validate Cart
    const cart = await this.cartRepository.findOne({
      where: { sessionId },
      relations: ["items", "items.product"],
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException("Cart is empty");
    }

    // 2. Calculate Total & Prepare Order Items
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `Product ${item.product.name} is out of stock`,
        );
      }
      const itemTotal = Number(item.product.price) * item.quantity;
      totalAmount += itemTotal;

      const orderItem = new OrderItem();
      orderItem.product = item.product;
      orderItem.quantity = item.quantity;
      orderItem.priceSnapshot = item.product.price;
      orderItems.push(orderItem);
    }

    // 3. Create Order (Transaction)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = new Order();
      order.totalAmount = totalAmount;
      order.status = OrderStatus.PENDING;
      order.items = orderItems;

      const customer = this.customerDetailsRepository.create(customerDetails);
      order.customer = await queryRunner.manager.save(customer);

      const savedOrder = await queryRunner.manager.save(order);

      // 4. Create Stripe Payment Intent
      const paymentIntent = await this.paymentsService.createPaymentIntent(
        totalAmount,
        {
          orderId: savedOrder.id,
          orderNumber: savedOrder.orderNumber,
        },
      );

      // 5. Update Order with Payment Intent ID
      savedOrder.paymentIntentId = paymentIntent.id;
      await queryRunner.manager.save(savedOrder);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: "Checkout processed successfully",
        data: {
          id: savedOrder.id,
          orderNumber: savedOrder.orderNumber,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          totalAmount,
        },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        "Payment initialization failed: " + err.message,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
