import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDb1764040421879 implements MigrationInterface {
    name = 'UpdateDb1764040421879'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "amount" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "totalAmount" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "totalAmount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "amount" SET DEFAULT '0'`);
    }

}
