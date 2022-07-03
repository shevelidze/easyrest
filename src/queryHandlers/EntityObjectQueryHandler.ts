import QueryHandler, { ApiResult } from './QueryHandler';
import {
  InvalidRequestPathError,
  MemeberOrMethodNotFoundError,
  MethodNotAllowedError,
  TryingToVariateNotVariableMemberError,
} from '../errors';
import type EntitiesData from '../EntitiesData';
import EntityObject from '../EntityObject';
import ArrayQueryHandler from './ArrayQueryHandler';
import ArrayObject from '../ArrayObject';

export default class EntityObjectQueryHandler implements QueryHandler {
  constructor(entityObject: EntityObject, entitiesData: EntitiesData) {
    this.entityObject = entityObject;
    this.entitiesData = entitiesData;
  }
  async handleQueryElement(query: string[], httpMethod: string, body: any) {
    query.shift();
    if (httpMethod === 'GET' && query.length === 0)
      return new ApiResult(
        200,
        await this.entityObject.fetch(this.entityObject.entity.include)
      );
    else if (httpMethod === 'POST' && query.length === 0) {
      return new ApiResult(200, await this.entityObject.mutate(body));
    } else if (httpMethod === 'DELETE' && query.length === 0) {
      return new ApiResult(200, await this.entityObject.delete());
    } else {
      if (query.length === 0) throw new InvalidRequestPathError();

      if (query[0] in this.entityObject.entity.entityBlueprint.methods) {
        if (httpMethod !== 'POST')
          throw new MethodNotAllowedError(
            'For methods calling only POST requests are being accepted.'
          );

        //todo: add validation
        return new ApiResult(
          200,
          await this.entityObject.entity.entityBlueprint.methods[query[0]].func(
            this.entityObject.id,
            body
          )
        );
      } else if (query[0] in this.entityObject.entity.entityBlueprint.members) {
        const entityMemberName = query[0];
        const entityMember =
          this.entityObject.entity.entityBlueprint.members[entityMemberName];

        if (entityMember.isPrimitive) {
          if (entityMember.typeName === 'array')
            return new ArrayQueryHandler(
              new ArrayObject(
                entityMemberName,
                this.entityObject,
                this.entitiesData
              ),
              this.entitiesData
            );
          else if (query.length > 1) throw new InvalidRequestPathError();
          else if (httpMethod === 'GET') {
            return new ApiResult(200, {
              value: await this.entityObject.fetchOneMember(entityMemberName),
            });
          } else if (httpMethod === 'POST') {
            if (!entityMember.isVariable)
              throw new TryingToVariateNotVariableMemberError(
                this.entityObject.entity.name,
                entityMemberName
              );

            //todo: add validation
            await this.entityObject.entity.mutate(this.entityObject.id, body);
            return new ApiResult();
          }

          throw new MethodNotAllowedError();
        } else {
          return new EntityObjectQueryHandler(
            new EntityObject(
              (
                await this.entityObject.fetch({
                  [entityMemberName]: { id: true },
                })
              )[entityMemberName].id,
              this.entitiesData.entities[entityMember.typeName]
            ),
            this.entitiesData
          );
        }
      }

      throw new MemeberOrMethodNotFoundError(
        this.entityObject.entity.name,
        query[0]
      );
    }
  }

  entityObject: EntityObject;
  entitiesData: EntitiesData;
}
