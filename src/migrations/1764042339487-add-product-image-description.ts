import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductImageDescription1764042339487 implements MigrationInterface {
    name = 'AddProductImageDescription1764042339487'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "product" ADD "image" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "description"`);
    }

}
