import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDb41764041330161 implements MigrationInterface {
    name = 'UpdateDb41764041330161'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "fistName" TO "firstName"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "firstName" TO "fistName"`);
    }

}
