import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import Stripe from "stripe";
import {
  Order,
  OrderItem,
  Payment,
  StripeCustomer,
  StripeEvent,
  Refund,
  Cart,
  Product,
  CustomerDetails,
} from "../../entities";

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(StripeCustomer)
    private stripeCustomerRepository: Repository<StripeCustomer>,
    @InjectRepository(StripeEvent)
    private stripeEventRepository: Repository<StripeEvent>,
    @InjectRepository(Refund)
    private refundRepository: Repository<Refund>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(CustomerDetails)
    private customerDetailsRepository: Repository<CustomerDetails>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    const apiKey = this.configService.get<string>("STRIPE_SECRET_KEY");
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    this.stripe = new Stripe(apiKey);
  }

  // Create Stripe Customer
  async createCustomer(userId: number, email: string, name: string) {
    try {
      const existingCustomer = await this.stripeCustomerRepository.findOne({
        where: { user: { id: userId } },
      });

      if (existingCustomer) {
        return existingCustomer;
      }

      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: { userId: userId.toString() },
      });

      const stripeCustomer = this.stripeCustomerRepository.create({
        user: { id: userId },
        stripeCustomerId: customer.id,
      });

      return await this.stripeCustomerRepository.save(stripeCustomer);
    } catch (error) {
      this.logger.error(
        `Error creating customer for user ${userId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        "Failed to create payment customer",
      );
    }
  }

  // Create Payment Intent
  async createPaymentIntent(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ["user", "items", "payment"],
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    if (order.payment && order.payment.status === ("SUCCEEDED" as any)) {
      throw new BadRequestException("Order already paid");
    }

    const amountInCents = Math.round(Number(order.totalAmount) * 100);

    let customerId: string | undefined;
    if (order.user) {
      const stripeCustomer = await this.createCustomer(
        order.user.id,
        order.user.email,
        order.user.name,
      );
      customerId = stripeCustomer.stripeCustomerId;
    }

    // Reuse existing pending payment intent
    if (
      order.payment &&
      order.payment.status === ("PENDING" as any) &&
      order.payment.stripePaymentId
    ) {
      try {
        const existingIntent = await this.stripe.paymentIntents.retrieve(
          order.payment.stripePaymentId,
        );
        if (existingIntent.status !== "canceled") {
          return {
            clientSecret: existingIntent.client_secret,
            paymentIntentId: existingIntent.id,
          };
        }
      } catch (e) {
        // Ignore error and create new one
      }
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        customer: customerId,
        metadata: {
          orderId: orderId.toString(),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      let payment = await this.paymentRepository.findOne({
        where: { order: { id: orderId } },
      });

      if (!payment) {
        payment = this.paymentRepository.create({
          order: { id: orderId },
          stripePaymentId: paymentIntent.id,
          amount: order.totalAmount,
          currency: "usd",
          status: "PENDING" as any,
        });
      } else {
        payment.stripePaymentId = paymentIntent.id;
        payment.status = "PENDING" as any;
      }

      await this.paymentRepository.save(payment);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error(
        `Error creating payment intent for order ${orderId}: ${error.message}`,
      );
      throw new InternalServerErrorException("Failed to initialize payment");
    }
  }

  // Confirm Payment (Simulation)
  async confirmPayment(paymentIntentId: string) {
    try {
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === "succeeded") {
        return await this.handlePaymentSuccess(paymentIntent);
      } else {
        return {
          success: false,
          message: `Payment status is ${paymentIntent.status}`,
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(
        "Failed to retrieve payment intent",
      );
    }
  }

  // Handle Refund
  async createRefund(paymentId: number, amount?: number, reason?: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment || !payment.stripePaymentId) {
      throw new BadRequestException("Payment not found");
    }

    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: payment.stripePaymentId,
        reason:
          (reason as Stripe.RefundCreateParams.Reason) ||
          "requested_by_customer",
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundParams);

      const refundRecord = this.refundRepository.create({
        payment: { id: paymentId },
        stripeRefundId: refund.id,
        amount: amount ? Number(amount) : Number(payment.amount),
        status: refund.status || "pending",
        reason,
      });

      await this.refundRepository.save(refundRecord);

      return refund;
    } catch (error) {
      this.logger.error(
        `Refund failed for payment ${paymentId}: ${error.message}`,
      );
      throw new InternalServerErrorException("Refund failed");
    }
  }

  // Webhook Event Construction
  constructEvent(
    payload: Buffer,
    signature: string,
    secret: string,
  ): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (err) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw new BadRequestException("Webhook signature verification failed");
    }
  }

  // Handle Webhook Events
  async handleWebhookEvent(event: Stripe.Event) {
    const existingEvent = await this.stripeEventRepository.findOne({
      where: { id: event.id },
    });

    if (existingEvent) {
      this.logger.log(`Event ${event.id} already processed`);
      return;
    }

    const stripeEvent = this.stripeEventRepository.create({
      id: event.id,
      type: event.type,
    });
    await this.stripeEventRepository.save(stripeEvent);

    switch (event.type) {
      case "payment_intent.succeeded":
        await this.handlePaymentSuccess(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      case "payment_intent.payment_failed":
        await this.handlePaymentFailure(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      default:
        this.logger.log(`Unhandled event type ${event.type}`);
    }
  }

  public async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const orderId = Number(paymentIntent.metadata.orderId);

    // Scenario A: Order already exists
    if (orderId) {
      this.logger.log(`Payment succeeded for existing order ${orderId}`);
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.manager.update(
          Payment,
          { stripePaymentId: paymentIntent.id },
          { status: "SUCCEEDED" as any },
        );
        await queryRunner.manager.update(
          Order,
          { id: orderId },
          { status: "PAID" as any },
        );
        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Error updating order ${orderId} status: ${err.message}`,
        );
      } finally {
        await queryRunner.release();
      }
      return;
    }

    // Scenario B: Payment First Flow
    const {
      customerDetails: customerDetailsStr,
      cartItems: cartItemsStr,
      sessionId,
    } = paymentIntent.metadata;

    if (customerDetailsStr && cartItemsStr) {
      this.logger.log(
        `Creating order for successful payment ${paymentIntent.id}`,
      );
      const customerDetailsData = JSON.parse(customerDetailsStr);
      const cartItemsData = JSON.parse(cartItemsStr);

      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const item of cartItemsData) {
        totalAmount += Number(item.priceSnapshot) * item.quantity;
        const orderItem = new OrderItem();
        orderItem.product = { id: item.productId } as any;
        orderItem.quantity = item.quantity;
        orderItem.priceSnapshot = item.priceSnapshot;
        orderItems.push(orderItem);
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // 1. Create CustomerDetails
        const customer = this.customerDetailsRepository.create(
          customerDetailsData as Partial<CustomerDetails>,
        );
        const savedCustomer = await queryRunner.manager.save(customer);

        // 2. Create Order
        const order = new Order();
        order.totalAmount = totalAmount;
        order.status = "PAID" as any;
        order.paymentIntentId = paymentIntent.id;
        order.customer = savedCustomer;
        order.items = orderItems;

        const savedOrder = await queryRunner.manager.save(order);

        // 3. Update Payment
        await queryRunner.manager.update(
          Payment,
          { stripePaymentId: paymentIntent.id },
          {
            status: "SUCCEEDED" as any,
            order: { id: savedOrder.id },
          },
        );

        // 4. Clear Cart
        if (sessionId) {
          await queryRunner.manager.delete(Cart, { sessionId });
        }

        await queryRunner.commitTransaction();
        this.logger.log(
          `Order ${savedOrder.id} created successfully for payment ${paymentIntent.id}`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Error creating order for payment ${paymentIntent.id}: ${err.message}`,
        );
      } finally {
        await queryRunner.release();
      }
    } else {
      this.logger.error(
        `Payment succeeded but missing metadata for order creation: ${paymentIntent.id}`,
      );
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const orderId = Number(paymentIntent.metadata.orderId);
    if (!orderId) return;

    this.logger.warn(`Payment failed for order ${orderId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(
        Payment,
        { stripePaymentId: paymentIntent.id },
        { status: "FAILED" as any },
      );
      await queryRunner.manager.update(
        Order,
        { id: orderId },
        { status: "FAILED" as any },
      );
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error updating failure status for order ${orderId}: ${err.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
