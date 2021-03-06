export class EasyRestError extends Error {
  constructor(message: string, httpCode: number) {
    super(message);
    this.httpCode = httpCode;
  }

  httpCode: number;
}

export class MethodNotAllowedError extends EasyRestError {
  constructor(message?: string) {
    super(message || 'Method not allowed.', 405);
  }
}

export class NotFoundError extends EasyRestError {
  constructor(message?: string) {
    super(message || 'Not found.', 404);
  }
}

export class BadRequestError extends EasyRestError {
  constructor(message?: string) {
    super(message || 'Bad request.', 400);
  }
}

export class InvalidEntityIdError extends NotFoundError {
  constructor(id: string, entityName: string) {
    super(`Failed to find object with id ${id} of the entity ${entityName}.`);
  }
}

export class InvalidPutUsageError extends MethodNotAllowedError {
  constructor() {
    super("It's allowed to use PUT method only for creating new objects.");
  }
}

export class EntitiesPrefixMissingError extends NotFoundError {
  constructor() {
    super(
      '"/entities/" prefix is missing. Each api request path must start with this prefix.'
    );
  }
}

export class InvalidEntityNameError extends NotFoundError {
  constructor(entityName: string) {
    super(`Failed to find entity ${entityName}.`);
  }
}

export class NoCreatorFunctionProvidedError extends NotFoundError {
  constructor(entityName: string) {
    super(
      `There is no creator function provided for the entity ${entityName}.`
    );
  }
}

export class NoMutatorFunctionProvidedError extends NotFoundError {
  constructor(entityName: string) {
    super(
      `There is no mutator function provided for the entity ${entityName}.`
    );
  }
}

export class NoDeleterFunctionProvidedError extends NotFoundError {
  constructor(entityName: string) {
    super(
      `There is no deleter function provided for the entity ${entityName}.`
    );
  }
}

export class InvalidRequestPathError extends NotFoundError {
  //deprecated
  constructor() {
    super('Invalid request path.');
  }
}

export class MemeberOrMethodNotFoundError extends NotFoundError {
  constructor(entityName: string, memberOrMethodName: string) {
    super(
      `Entity ${entityName} has no member or method member ${memberOrMethodName}.`
    );
  }
}

export class TryingToVariateNotVariableMemberError extends MethodNotAllowedError {
  constructor(entityName: string, memberName: string) {
    super(
      `It\'s not allowed to variate member ${memberName} of entity ${entityName}.`
    );
  }
}

export class IndexIsNaNError extends NotFoundError {
  constructor(index: string) {
    super(`Index must be a number. ${index} is not a number.`);
  }
}

export class InvalidMethodArguments extends BadRequestError {
  constructor() {
    super('Invalid method arguments.');
  }
}

export class InvalidCreatorArguments extends BadRequestError {
  constructor() {
    super('Invalid creator arguments.');
  }
}

export class InvalidMutatorArguments extends BadRequestError {
  constructor() {
    super('Invalid mutator arguments.');
  }
}