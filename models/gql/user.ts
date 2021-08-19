import { ObjectID } from "bson";
import { GQLField, GQLModel, GQLObject, GQLQuery, GQLResolver, GQLU } from "gql-ts";
import { AppGQL } from ".";
import hera from '../../utils/hera';
import { IUser, User } from "../mongo";

@GQLObject("user")
export class GQLUser extends GQLModel<IUser, GQLUser> {
    @GQLField()
    _id: string;

    @GQLField()
    name: string;

    static get DefaultSelect() {
        return { _id: true }
    }

    @GQLResolver({ matches: GQLU.byFields([], ['_id', 'name']) })
    static async rootResolve(query: GQLQuery) {
        const ids = query.filter.get('_id').batch().map((id: string) => new ObjectID(id));

        const q = GQLU.notEmpty({
            _id: hera.mongoEqOrIn(ids)
        });
        
        return await AppGQL.gqlMongoQueryPagination(GQLUser, query, User, q, {defaultLimit: 50, maxLimit: 500})
    }
}