import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CustomerDetails } from "../../entities";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(CustomerDetails)
    private customerRepository: Repository<CustomerDetails>,
  ) {}

  // Admin dashboard usage: List all customers (from orders)
  async findAll() {
    return this.customerRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: number) {
    return this.customerRepository.findOne({
      where: { id },
      relations: ["order"],
    });
  }
}
