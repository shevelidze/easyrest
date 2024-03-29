# Easyrest

<a href="https://www.npmjs.com/package/@shevelidze/easyrest"><img src="https://img.shields.io/npm/v/@shevelidze/easyrest" alt="npm"></a>
<img src="https://img.shields.io/github/license/shevelidze/easyrest" alt="license"></img>

Easyrest is a typescript library for building RESTful APIs without repeating yourself. It takes care about all aspects that cause a headache in a RESTful API developing process.

Easyrest offers:

1. Simple entities architecture, which allows to design your api using small amount of code.
2. Opportunity to use it with any possible web framework. It doesn't have any framework specific features.
3. Opportunity to use different approaches to fetch data. For an every entity you have to provide a fetcher, mutator, and deleter functions. You decide how it will work inside.

## Installation

You can install Easyrest using `npm`:

```
npm install @shevelidze/easyrest
```

Or using `yarn`:

```
yarn add  @shevelidze/easyrest
```

## Basic usage

First of all you have to decide with the entities, which you will have in the api and develop fetcher for each. You can find out more about the fetchers in the [Fetcher](#fetcher) section.

Now, you can create an instance of EasyRest with entitity blueprints. [Entity blueprint](#entity-blueprints) is a set of entitity members, methods and data manipulation functions.

```ts
import EasyRest from '@shevelidze/easyrest';

// add fetchers definitions here

const easyRest = new EasyRest.Instance({
  zoo: {
    members: {
      address: EasyRest.string(),
      workers: EasyRest.array(EasyRest.entity('worker')),
      animals: EasyRest.array(EasyRest.entity('animal')),
    },
    fetcher: zooFetcher,
  },
  worker: {
    members: {
      name: EasyRest.string(),
      birthDate: EasyRest.string(),
      salary: EasyRest.number(),
    }
    fetcher: workerFetcher,
  },
  animal: {
    members: {
      name: EasyRest.string(),
      type: EasyRest.entity('entimal_type')
    },
    fetcher: animalFetcher,
  },
  animal_type: {
    members: {
      name: EasyRest.string()
    },
    fetcher: animalTypeFetcher,
  }
});
```

For processing queries, EasyRest.Instance has a method [processQuery](#process-query). It take as arguments, query array (for request with a path `/foo/bar/1`, for example, it will be `['foo', 'bar', '1']`), HTTP method and body object. The easiest way, use JSON for the body and than just convert it to an object, but you are free to use any other way.

When you get a request you have to call this method.

```ts
const apiResult = await easyRest.processQuery(
  queryArray,
  httpMethod,
  bodyObject
);
```

If the request is invalid, this method will throw an instance of [EasyRest.errors.EasyRestError](#easyrest-error), which will contain a HTTP code of the error and a message.

If not, it will return an instance of [EasyRest.ApiResult](#api-result), which contains a HTTP code and body for the response.

**After all theese manipulations you can:**

- get all objects of the entity: `GET /entities/worker` &rarr; `[{id: "1", name: "John"... }, {id: "2", name: "Victor"...}]`
- get an object by id: `GET /entities/animal/12` &rarr; `{id: "12", name: "Lucky", type: {id: "2", name: "Dog"}}`
- get only one member of an object: `GET /entities/animal/12/type` &rarr; `{id: 2, name: "Dog"}`

## Documentation

### Entity blueprints

When you are creationg an EasyRest instance you have to provide an entity blueprints object, in which the key is the name of the entity, and the value is an entity blueprint.

```ts
interface EntityBlueprint {
  members?: EntityBlueprint;
  fetcher: Fetcher;
  creator: Creator;
  mutator: Mutator;
  deleter: Deleter;
}
```

### Fetcher

A function, which will be called on every request, when it's neccessary. Accepts one object as an argument, and returns a promise with the array of entity objects.

```ts
interface FetcherArgs {
  ids: string[];
  include: Include;
  auth: any;
}

type Fetcher = (args: FetcherArgs) => Promise<any>;
```

`include` - it's a special object, which tells, which entity members are neccessary to include to the final promise. Each object property is either another `include`, in a case, when the member isn't a primitive, or a boolean and tells include or not appropriate member.

```ts
interface Include {
  [key: string]: Include | boolean;
}
```

`ids` - an array of object identificators.

### Creator

A function for creation new objects. Is optional in a blueprint. If there is no creator provided, `processQuery` will return an appropriate error to a create attempt.

```ts
interface CreatorArgs {
  newObject: any;
  auth: any;
}

type Creator = (args: CreatorArgs) => Primise<ApiResult>;
```

`newObject` - object with the values required for creation.

### Mutator

A function for changing objects. Is optional in a blueprint. If there is no mutator provided, `processQuery` will return an appropriate error to a mutate attempt.

```ts
interface MutatorArgs {
  id: string;
  mutate: Mutate;
  auth: any;
}

type Mutator = (args: MutatorArgs) => Promise<void>;
```

`mutate` - object, that contains new values for properties. In a case, when the property is another entity object, the value will be the same as for the creator.

### Deleter

A function for deleting objects.

```ts
interface DeleterArgs {
  id: string;
  auth: any;
}

type Deleter = (args: DeleterArgs) => Primise<void>;
```

### Members

```ts
new EasyRest.Instance({
  ...
  entity_name: {
    members: {
      ...
    }
  }
  ...
});
```

An object, where the key is the name of the member and the value is an object of one of the types below.

- `PrimitiveEntityMember`
- `ComplexEntityMember`
- `ArrayEntityMember`

To get such objects, you have to use one of the following methods:

- [`EasyRest.number`](#number)
- [`EasyRest.string`](#string)
- [`EasyRest.array`](#array)
- [`EasyRest.entity`](#entity)

### Methods

```ts
new EasyRest.Instance({
  ...
  entity_name: {
    ...
    methods: {
      ...
    }
    ...
  }
  ...
});
```

An object, where the key is the name of the method, and the value is an entity method blueprint.

```ts
type EntityMethodFunction = (args: EntityMethodArgs) => Promise<any>;

interface EntityMethodBlueprint {
  func: EntityMethodFunction;
  argumentsJtdSchema?: Schema;
}
```

### Errors

TODO: Add errors documentation.

## API Reference

### Instance

An EasyRest instance class.

```ts
constructor(memberBlueprints);
```

#### Members:

`processQuery` - a method for requests processing. Accepts request parameters as arguments and an `authObject` object.

```ts
 async processQuery(
    query: string[],
    httpMethod: string,
    bodyObject?: any,
    authObject?: any
  ): Promise<ApiResult>;
```

### number

Represents number.

```ts
function number(): PrimitiveEntityMember;
```

### string

Represents string.

```ts
function string(): PrimitiveEntityMember;
```

### entity

Represents complex property.

```ts
function entity(entityName: string): ComplexEntityMember;
```

### array

Represents array.

```ts
function array(elementEntityMember: EntityMember): ArrayEntityMember;
```

Accepts one argument - `elementEntityMember`. It must be `PrimitiveEntityMember` or `ComplexEntityMember` or `ArrayEntityMember`.

### PrimitiveEntityMember

TODO: Add docs here

### ArrayEntityMember

TODO: Add docs here.

### ComplexEntityMember

TODO: Add docs here.

### ApiResult

An object that represents HTTP response. Contains HTTP response code and may contain body object.

```ts
interface ApiResult {
  code: number;
  body?: any;
}
```
