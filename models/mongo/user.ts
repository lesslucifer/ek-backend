import * as moment from 'moment';
import { IMongoModel } from './mongo-model';

export interface IUser extends IMongoModel {
    name: string;
}