import { ObjectID } from 'bson';

export interface IMongoModel {
    _id?: ObjectID;
    __v?: number;
}

export { ObjectID } from 'bson';