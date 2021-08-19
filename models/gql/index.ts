import { GQL, GQLBaseType, GQLGlobal, GQLQuery, GQLU } from "gql-ts";
import { GQLUser } from "./user";
import * as mongodb from 'mongodb';
import hera from "../../utils/hera";
import _ from "lodash";
import { EROpenAPIDocument } from "express-router-ts";

export interface IGQLMGQueryPaginationOpts {
    defaultLimit?: number;
    maxLimit?: number;
}

export class AppGQL {
    static async init(gql: GQL) {
        GQLU.Parsers.unshift((gql, spec, val) => {
            if (spec.rawType == GQLBaseType.STRING && mongodb.ObjectId.isValid(val)) {
                return `${val}`;
            }
        });

        const models = [
            GQLUser
        ]

        models.forEach(m => GQLGlobal.add(m))
        models.forEach(m => EROpenAPIDocument.COMPONENTS.schemas[m.gql.get(m).name] = m.openAPISchema())
    }

    static gqlMongoQueryPagination<T>(gqlModel: Function, gqlQuery: GQLQuery, mgCollection: mongodb.Collection<T>, mgQuery: any, opts?: IGQLMGQueryPaginationOpts) {
        const gql = GQLGlobal;
        const spec = GQLGlobal.get(gqlModel);
        _.keys(gqlQuery.pagination.from)
            .map(k => spec.getKey(k))
            .filter(ks => ks != null && !_.isEmpty(gqlQuery.pagination.from[ks.key]))
            .forEach(ks => {
                const val = gqlQuery.pagination.from[ks.key]
                const qVal = mongodb.ObjectId.isValid(val) ? new mongodb.ObjectId(val) : GQLU.gqlParse(gql, ks, val)
                _.set(mgQuery, `${ks.key}.$gt`, qVal)
            })

        _.keys(gqlQuery.pagination.to)
            .map(k => spec.getKey(k))
            .filter(ks => ks != null && !_.isEmpty(gqlQuery.pagination.to[ks.key]))
            .forEach(ks => {
                const val = gqlQuery.pagination.to[ks.key]
                const qVal = mongodb.ObjectId.isValid(val) ? new mongodb.ObjectId(val) : GQLU.gqlParse(gql, ks, val)
                _.set(mgQuery, `${ks.key}.$lt`, qVal)
            })

        const cursor = mgCollection.find(mgQuery).project(hera.arrToObj(gqlQuery.QueryFields, f => <string>f, () => true));

        const sort = gqlQuery.sort;
        if (!hera.isEmpty(sort)) {
            cursor.sort(hera.arrToObj(sort.fields, f => f.field, f => <mongodb.SortDirection>f.OrderNumber));
        }

        const defLimit = (opts && opts.defaultLimit) || 1000;
        const maxLimit = (opts && opts.maxLimit) || 10000;
        cursor.limit(Math.min(hera.parseInt(gqlQuery.pagination.limit, undefined, defLimit), maxLimit));
        return cursor.toArray()
    }
}