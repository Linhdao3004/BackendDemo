import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDb1763144895627 implements MigrationInterface {
    name = 'UpdateDb1763144895627'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "confirmCodePass" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "confirmCodePassExpires" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "confirmCodePassExpires"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "confirmCodePass"`);
    }

}
