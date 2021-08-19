import { IMongoModel } from './mongo-model';

export interface IMigration extends IMongoModel {
    code: string;
    migrateAt: number;
}