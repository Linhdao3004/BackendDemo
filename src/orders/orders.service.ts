import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID, type UUID } from 'crypto';
import { Repository, DataSource, type DeepPartial } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { OrderItem } from 'src/order-item/entities/order-item.entity';
import { Product } from 'src/product/entities/product.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import type { CreatePaymentDto } from 'src/payment/dto/create-payment.dto';

@Injectable()
export class OrdersService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly jwtService: JwtService,
        private readonly mailService: MailerService,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async create(createOrderDto: CreateOrderDto, token: any) {
        let Amount = 0;
        const payloadAccess = await this.jwtService.verify(token, {
            secret: process.env.JWT_SECRET,
        });
        console.log(payloadAccess);

        for (const item of createOrderDto.orderItems) {
            // console.log(item.idProduct);
            const product = await this.productRepository.findOne({
                where: { idProduct: item.idProduct },
            });
            // console.log(product);

            if (!product) {
                throw new NotFoundException(`Product not found id:${item.idProduct}`);
            }
            if (product.stock <= 0) {
                throw new BadRequestException(
                    `Product ${product.productName} is out of stock`,
                );
            }
            if (item.quantity > product.stock) {
                throw new BadRequestException(
                    `Product ${product.productName} only has ${product.stock} left`,
                );
            }

            Amount += item.quantity * product.price;
        }
        // console.log(Amount);

        const orderItems: DeepPartial<OrderItem>[] = await Promise.all(
            createOrderDto.orderItems.map(async (item) => {
                const product = await this.productRepository.findOne({
                    where: { idProduct: item.idProduct },
                });

                return {
                    product, // save full product entity
                    quantity: item.quantity,
                    productName: product?.productName,
                } as DeepPartial<OrderItem>;
            }),
        );

        const order = this.orderRepository.create({
            idOrder: randomUUID(),
            idUser: payloadAccess.sub,
            ...createOrderDto,
            // tạo orderItem cùng lúc với order
            orderItems,
            createdAt: new Date(),
            totalAmount: Amount,
        });
        await this.updateStockOfProduct(createOrderDto);
        return this.orderRepository.save(order);
    }

    async createOrderForManualPayment(
        createOrderDto: CreateOrderDto,
        paymentDto: CreatePaymentDto,
        token: any,
    ) {
        const queryRuner = this.dataSource.createQueryRunner();
        await queryRuner.connect();
        await queryRuner.startTransaction();
        try {
            const payloadAccess = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });

            let totalAmount = 0;

            for (const item of createOrderDto.orderItems) {
                const product = await this.productRepository.findOneBy({
                    idProduct: item.idProduct,
                });
                if (!product) {
                    throw new NotFoundException('Product not found');
                }
                if (!product) {
                    throw new NotFoundException('Product not found!');
                }
                if (product.stock <= 0) {
                    return { message: `${product.productName} is out of stock` };
                }
                if (product.stock < item.quantity) {
                    return {
                        message: `${product.productName} only has ${product.stock} left!`,
                    };
                }
                totalAmount += product.price * item.quantity;
            }
            console.log(totalAmount);

            const orderItems: DeepPartial<OrderItem>[] = await Promise.all(
                createOrderDto.orderItems.map(async (item) => {
                    const product = await this.productRepository.findOneBy({
                        idProduct: item.idProduct,
                    });

                    return {
                        product, // save full product entity
                        quantity: item.quantity,
                        productName: product?.productName,
                    } as DeepPartial<OrderItem>;
                }),
            );

            // create order

            const orderId = randomUUID();
            console.log(orderId);

            const order = queryRuner.manager.create(Order, {
                idOrder: orderId,
                idUser: payloadAccess.sub,
                ...createOrderDto,
                orderItems,
                createdAt: new Date(),
                totalAmount: totalAmount,
            });
            await queryRuner.manager.save(order);

            // create order

            // create payment

            const payment = queryRuner.manager.create(Payment, {
                idPayment: randomUUID(),
                amount: totalAmount,
                idOrder: orderId,
                ...paymentDto,
            });
            await queryRuner.manager.save(payment);

            // create payment

            //update stock product
            for (const item of createOrderDto.orderItems) {
                queryRuner.manager.decrement(
                    Product,
                    { idProduct: item.idProduct },
                    'stock',
                    item.quantity,
                );
            }
            //update stock product
            await queryRuner.commitTransaction();
            // console.log(payloadAccess);
            return { idOrder: orderId };
        } catch (error) {
            console.log(error);
        }
    }

    // cancel order
    async cancellOrder(idOrder: UUID, status: string = 'Cancelled') {
        const queryRuner = this.dataSource.createQueryRunner();
        await queryRuner.connect();
        await queryRuner.startTransaction();
        try {
            const order = await this.orderRepository.findOne({
                where: { idOrder: idOrder },
                relations: ['orderItems', 'orderItems.product'], // đảm bảo load quan hệ
            });
            console.log(order?.orderItems);

            if (!order) {
                throw new NotFoundException(`Order with id ${idOrder} not found`);
            }
            for (const item of order.orderItems) {
                const product = await this.productRepository.findOneBy({
                    idProduct: item.product.idProduct,
                });
                console.log(product);

                if (!product) {
                    throw new NotFoundException('Product not found!');
                }
                await queryRuner.manager.update(
                    Product,
                    { idProduct: item.product.idProduct },
                    { stock: item.quantity + product.stock },
                );
            }

            // Determine payment status based on order status
            let paymentStatus = 'cancelled';
            if (status.toLowerCase() === 'returned') {
                paymentStatus = 'refunded';
            }

            await queryRuner.manager.update(
                Order,
                { idOrder: idOrder },
                { status: status },
            );
            await queryRuner.manager.update(
                Payment,
                { idOrder: idOrder },
                { status: paymentStatus },
            );
            await queryRuner.commitTransaction();
        } catch (error) {
            console.log(error);

            throw new BadRequestException(error);
        }
    }

    async updateStockOfProduct(createOrderDto: CreateOrderDto) {
        for (const item of createOrderDto.orderItems) {
            // console.log(item.idProduct);
            const product = await this.productRepository.findOneBy({
                idProduct: item.idProduct,
            });
            // console.log(product?.stock);
            if (!product) {
                throw new NotFoundException(`Product not found id:${item.idProduct}`);
            }
            const newStock = product.stock - item.quantity;
            await this.productRepository.update(item.idProduct, { stock: newStock });
        }
    }

    async findAll() {
        const orders = await this.orderRepository.find({
            relations: ['orderItems', 'orderItems.product', 'user'],
        });

        return orders.map((order) => ({
            idOrder: order.idOrder,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
            orderItems: order.orderItems.map((item) => ({
                productName: item.product?.productName,
                quantity: item.quantity,
                price: item.product?.price,
            })),
            status: order.status,
            idUser: order.idUser,
            firstName: order.user.firstName,
            lastName: order.user.lastName,
        }));
    }

    findAllOrderItem() {
        return;
    }

    findOne(idOrder: string) {
        return this.orderRepository.findOneBy({ idOrder });
    }

    update(idOrder: string, updateOrderDto: UpdateOrderDto) {
        return `This action updates a #${idOrder} order`;
    }

    remove(id: number) {
        return `This action removes a #${id} order`;
    }

    removeAll() {
        return this.orderRepository.deleteAll();
    }

    async findOrderByUserId(idUser: string) {
        const orders = await this.orderRepository.find({
            where: { idUser },
            relations: ['orderItems', 'orderItems.product', 'user'],
            order: { createdAt: 'DESC' },
        });
        console.log(orders);

        return orders.map((order) => ({
            idOrder: order.idOrder,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
            orderItems: order.orderItems.map((item) => ({
                productName: item.product?.productName,
                quantity: item.quantity,
                price: item.product?.price,
                image: item.product?.image,
                idProduct: item.product?.idProduct,
            })),
            status: order.status,
            idUser: order.idUser,
        }));
    }

    async updateOrderStatus(idOrder: string, status: string) {
        const order = await this.orderRepository.findOneBy({ idOrder });
        if (!order) {
            throw new NotFoundException(`Order with id ${idOrder} not found`);
        }
        await this.orderRepository.update(idOrder, { status });
        return this.orderRepository.findOneBy({ idOrder });
    }



    async sendOrderSuccessMail(idOrder: any) {
        const order = await this.orderRepository.findOne({ where: { idOrder: idOrder }, relations: ['user'] });
        const nameUser = order?.user?.firstName;
        this.mailService.sendMail({
            from: 'Sản Phẩm xanh <daolinh031222@gmail.com>',
            to: order?.user?.email,
            subject: 'Đặt hàng thành công',
            html: this.mailOrderSuccessContent(nameUser, idOrder, order?.totalAmount),
        });
    }

    mailOrderSuccessContent(nameUser: any, orderId: any, totalAmount: any) {
        const html = `
     <h2 style="font-weight: 600; color: #2c3e50;">Đặt hàng thành công!</h2>
    <p>Xin chào ${nameUser},</p>
    <p>Cảm ơn bạn đã tin tưởng và mua sắm tại SanPhamXanh. Đơn hàng của bạn đã được hệ thống ghi nhận thành công.</p>
    
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
    <tr>
      <td align="center">
        <div style="
          border: 2px solid #2ecc71;
          width: 80%;
          max-width: 400px;
          padding: 20px;
          border-radius: 10px;
          background-color: #f0fff4;
          text-align: left;">
          <p style="margin: 5px 0; font-size: 16px;"><strong>Mã đơn hàng:</strong> #${orderId}</p>
          <p style="margin: 5px 0; font-size: 16px; color: #e74c3c;"><strong>Tổng thanh toán:</strong> $${totalAmount}</p>
        </div>
      </td>
    </tr>
    </table>

    <p>Chúng tôi sẽ sớm xử lý và giao hàng đến bạn trong thời gian sớm nhất.</p>
    <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.</p>

    <p style="margin-top: 30px;">Trân trọng cảm ơn!<br>Đội ngũ SanPhamXanh</p>
    `;
        return html;
    }
}
