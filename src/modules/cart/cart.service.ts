import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart, CartItem, Product } from "../../entities";
import { AddToCartDto, UpdateCartItemDto } from "./dto/cart.dto";
import { ServiceResponse } from "../../common/interfaces/service-response.interface";

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getCart(sessionId: string): Promise<ServiceResponse<any>> {
    const cart = await this.cartRepository.findOne({
      where: { sessionId },
      relations: ["items", "items.product", "items.product.images"],
    });

    if (!cart) {
      return {
        success: true,
        message: "Empty cart returned",
        data: { sessionId, items: [], total: 0 },
      };
    }

    const total = cart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    return {
      success: true,
      message: "Cart fetched successfully",
      data: { ...cart, total },
    };
  }

  async addToCart(sessionId: string, dto: AddToCartDto) {
    const { productId, quantity } = dto;

    // 1. Check Product Stock
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException("Product not found");
    if (product.stock < quantity)
      throw new BadRequestException("Insufficient stock");

    // 2. Get or Create Cart
    let cart = await this.cartRepository.findOne({ where: { sessionId } });
    if (!cart) {
      cart = this.cartRepository.create({ sessionId });
      cart = await this.cartRepository.save(cart);
    }

    // 3. Upsert Cart Item
    let existingItem = await this.cartItemRepository.findOne({
      where: {
        cart: { id: cart.id },
        product: { id: productId },
      },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cart: { id: cart.id },
        product: { id: productId },
        quantity,
        priceSnapshot: product.price,
      });
      await this.cartItemRepository.save(newItem);
    }

    return this.getCart(sessionId);
  }

  async updateItem(
    sessionId: string,
    productId: number,
    dto: UpdateCartItemDto,
  ) {
    const { quantity } = dto;

    const cart = await this.cartRepository.findOne({ where: { sessionId } });
    if (!cart) throw new NotFoundException("Cart not found");

    const item = await this.cartItemRepository.findOne({
      where: {
        cart: { id: cart.id },
        product: { id: productId },
      },
    });
    if (!item) throw new NotFoundException("Item not found in cart");

    item.quantity = quantity;
    await this.cartItemRepository.save(item);

    return this.getCart(sessionId);
  }

  async removeItem(sessionId: string, productId: number) {
    const cart = await this.cartRepository.findOne({ where: { sessionId } });
    if (!cart) throw new NotFoundException("Cart not found");

    await this.cartItemRepository.delete({
      cart: { id: cart.id },
      product: { id: productId },
    });

    return this.getCart(sessionId);
  }

  async deleteCart(sessionId: string): Promise<ServiceResponse<null>> {
    const cart = await this.cartRepository.findOne({ where: { sessionId } });
    if (cart) {
      await this.cartRepository.remove(cart);
    }
    return {
      success: true,
      message: "Cart cleared successfully",
      data: null,
    };
  }
}
