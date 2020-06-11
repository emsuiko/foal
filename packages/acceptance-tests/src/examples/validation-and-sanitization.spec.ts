
// 3p
import { Contains, Length } from '@foal/typestack/node_modules/class-validator';
import * as request from 'supertest';

// FoalTS
import {
  Context,
  createApp,
  Get,
  HttpResponseCreated,
  HttpResponseOK,
  Post,
  ValidateBody,
  ValidateCookie,
  ValidateHeader,
  ValidatePathParam,
  ValidateQueryParam
} from '@foal/core';
import { ValidateBody as ValidateBodyFromClass} from '@foal/typestack';

describe('[Docs] Input Validation & Sanitization', () => {

  describe('With a JSON Schema (AJV)', () => {

    describe('Validation & Sanitization of HTTP Requests', () => {

      // Test compilation
      // tslint:disable-next-line:no-unused-variable
      class MyController {

        @Post('/user')
        @ValidateBody({
          additionalProperties: false,
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
          required: [ 'firstName', 'lastName' ],
          type: 'object'
        })
        postUser(ctx: Context) {
          // In this method we are sure that firstName and lastName
          // are defined thanks to the above hook.
          console.log(
            ctx.request.body.firstName, ctx.request.body.lastName
          );
          return new HttpResponseOK();
        }

      }

      describe('ValidateBody', () => {

        const errors = {
          body: [
            {
              dataPath: '.price',
              keyword: 'type',
              message: 'should be integer',
              params: {
                type: 'integer'
              },
              schemaPath: '#/properties/price/type'
            }
          ]
        };

        it('(first example)', () => {
          class AppController {
            @Post('/products')
            @ValidateBody({
              additionalProperties: false,
              properties: {
                price: { type: 'integer' },
              },
              required: [ 'price' ],
              type: 'object'
            })
            createProduct() {
              // ...
            }
          }

          const app = createApp(AppController);

          return request(app)
            .post('/products')
            .send({
              price: 'hello world'
            })
            .expect(400)
            .expect(errors);
        });

        it('(second example)', () => {
          class AppController {
            schema = {
              additionalProperties: false,
              properties: {
                price: { type: 'integer' },
              },
              required: [ 'price' ],
              type: 'object'
            };

            @Post('/products')
            @ValidateBody(controller => controller.schema)
            createProduct() {
              // ...
            }
          }

          const app = createApp(AppController);

          return request(app)
            .post('/products')
            .send({
              price: 'hello world'
            })
            .expect(400)
            .expect(errors);
        });

      });

      describe('ValidateHeader', () => {

        const errors = {
          headers: [
            {
              dataPath: '[\'a-number\']',
              keyword: 'type',
              message: 'should be integer',
              params: {
                type: 'integer'
              },
              schemaPath: '#/properties/a-number/type'
            }
          ]
        };

        it('(first example)', () => {
          class AppController {
            @Get('/products')
            @ValidateHeader('Authorization')
            @ValidateHeader('A-Number', { type: 'integer' }, { required: false })
            readProducts() {
              // ...
            }
          }

          const app = createApp(AppController);

          return request(app)
            .get('/products')
            .set('Authorization', 'xxx')
            .set('A-Number', 'hello')
            .expect(400)
            .expect(errors);
        });

        it('(second example)', () => {
          class AppController {
            schema = { type: 'integer' };

            @Get('/products')
            @ValidateHeader('Authorization')
            @ValidateHeader('A-Number', c => c.schema, { required: false })
            readProducts() {
              // ...
            }
          }

          const app = createApp(AppController);

          return request(app)
            .get('/products')
            .set('Authorization', 'xxx')
            .set('A-Number', 'hello')
            .expect(400)
            .expect(errors);
        });

      });

      describe('ValidateCookie', () => {

        const errors = {
          cookies: [
            {
              dataPath: '[\'A-Number\']',
              keyword: 'type',
              message: 'should be integer',
              params: {
                type: 'integer'
              },
              schemaPath: '#/properties/A-Number/type'
            }
          ]
        };

        it('(first example)', () => {
          class AppController {
            @Get('/products')
            @ValidateCookie('Authorization')
            @ValidateCookie('A-Number', { type: 'integer' }, { required: false })
            readProducts() {
              // ...
            }
          }

          const app = createApp(AppController);

          return request(app)
            .get('/products')
            .set('Cookie', [ 'Authorization=xxx', 'A-Number=hello' ])
            .expect(400)
            .expect(errors);
        });

        it('(second example)', () => {
          class AppController {
            schema = { type: 'integer' };

            @Get('/products')
            @ValidateCookie('Authorization')
            @ValidateCookie('A-Number', c => c.schema, { required: false })
            readProducts() {
              // ...
            }
          }

          const app = createApp(AppController);

          return request(app)
            .get('/products')
            .set('Cookie', [ 'Authorization=xxx', 'A-Number=hello' ])
            .expect(400)
            .expect(errors);
        });

      });

      describe('ValidatePathParam', () => {

        const errors = {
          pathParams: [
            {
              dataPath: '.productId',
              keyword: 'type',
              message: 'should be integer',
              params: {
                type: 'integer'
              },
              schemaPath: '#/properties/productId/type'
            }
          ]
        };

        it('(first example)', () => {
          class AppController {
            @Get('/products/:productId')
            @ValidatePathParam('productId', { type: 'integer' })
            readProducts() {
              // ...
            }
          }

          const app = createApp(AppController);

          return request(app)
            .get('/products/xxx')
            .expect(400)
            .expect(errors);
        });

        it('(second example)', () => {
          class AppController {
            schema = { type: 'integer' };

            @Get('/products/:productId')
            @ValidatePathParam('productId', c => c.schema)
            readProducts() {
              // ...
            }
          }

          const app = createApp(AppController);

          return request(app)
            .get('/products/xxx')
            .expect(400)
            .expect(errors);
        });

      });

      describe('ValidateQueryParam', () => {

        const errors = {
          query: [
            {
              dataPath: '[\'a-number\']',
              keyword: 'type',
              message: 'should be integer',
              params: {
                type: 'integer'
              },
              schemaPath: '#/properties/a-number/type'
            }
          ]
        };

        it('(first example)', () => {
          class AppController {
            @Get('/products')
            @ValidateQueryParam('authorization')
            @ValidateQueryParam('a-number', { type: 'integer' }, { required: false })
            readProducts() {
              // ...
            }
          }

          const app = createApp(AppController);

          return request(app)
            .get('/products?authorization=xxx&a-number=hello')
            .expect(400)
            .expect(errors);
        });

        it('(second example)', () => {
          class AppController {
            @Get('/products')
            @ValidateQueryParam('authorization')
            @ValidateQueryParam('a-number', { type: 'integer' }, { required: false })
            readProducts() {
              // ...
            }
          }

          const app = createApp(AppController);

          return request(app)
            .get('/products?authorization=xxx&a-number=hello')
            .expect(400)
            .expect(errors);
        });

      });

    });

    it('Sanitization Example', () => {
      class AppController {

        @Get('/no-sanitization')
        noSanitization(ctx: Context) {
          return new HttpResponseOK(ctx.request.body);
        }

        @Get('/sanitization')
        @ValidateBody({
          additionalProperties: false,
          properties: {
            age: { type: 'number' },
            name: { type: 'string' },
          },
          required: [ 'name', 'age' ],
          type: 'object'
        })
        sanitization(ctx: Context) {
          return new HttpResponseOK(ctx.request.body);
        }

      }

      const app = createApp(AppController);

      return Promise.all([
        request(app)
          .post('/no-sanitization')
          .send({ name: 'Alex', age: '34', city: 'Paris' })
          .expect(200)
          .expect({ name: 'Alex', apiKey: '34', city: 'Paris' }),
        request(app)
          .post('/sanitization')
          .send({ name: 'Alex', age: '34', city: 'Paris' })
          .expect(200)
          .expect({ name: 'Alex', apiKey: 34 }),
      ]);
    });

  });

  describe('With a Validation Class (class-validator)', () => {

    it('Usage with a Hook', () => {
      class SocialPost {

        @Length(10, 20)
        title: string;

        @Contains('hello')
        text: string;

      }

      class SocialPostController {

        @Post()
        @ValidateBodyFromClass(SocialPost, { /* options if relevant */ })
        createSocialPost() {
          // ...
          return new HttpResponseCreated();
        }

      }

      const app = createApp(SocialPostController);

      return request(app)
        .post('/')
        .send({ text: 'foo' })
        .expect(400)
        .expect([
          {
            children: [],
            constraints: { length: 'title must be longer than or equal to 10 characters' },
            property: 'title',
            target: { text: 'foo' },
          },
          {
            children: [],
            constraints: { contains: 'text must contain a hello string' },
            property: 'text',
            target: { text: 'foo' },
            value: 'foo',
          }
        ]);
    });

  });

});
