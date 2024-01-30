# Coding challenge
Hi, my name is Erdenezul. I have tried to cover a lot of topics in this challenges to demonstrate my skills and knowledge.

The challenge contains two parts named **Vending machine** and **Maze**. In order to save time and resources, I've used same
resources like **login** and **signup** in both parts.

There might be an interesting topic related to security in section **Security Concerns**

## Devops

I've used AWS Codepipeline to fetch changes from github, push images to ECR and deploy it into ECS cluster.

## Technogoly choice

There were bonus challenge to avoid having same logins in the system. I've considered to use **Redis**

to create a session and check in a subsequent login. However, since the challenge already is big enough
and takes some much time, I've decided not to and we can **discuss this in a further interview** (if any)

### Nestjs

1. I am pretty comfortable in this framework
2. Built-in data validation.
3. Custom decorator to seperate user role easy to built.
4. Custom decorator to clean data also easy to built.
5. Swagger decorations are easy to automatically generate swagger definitions

### Prisma
1. ORM to avoid using raw sql (prevents potential risk like SQL Injection)
2. GraphQL like schema automatically generates migration
3. Type generation for typescript for database is really helpful

## Code structure

The code splits into **a domain**.

For example: 

src/product directory includes everything related to product. As follows: 

1. product.controller.ts
2. product.service.ts
3. product.module.ts

and respective unit tests.

### Controller

In the controller file, it **ensures the data** comes from API to be **untainted** (in other words,
meets all constraints). 

If we do not ensure data meets all criterias, the some functionality might not work.

> **For example**: The cost of product should be multiple of 5, to ensure coin change problem always have a **solution**.

### No solution for coin change problem

When creating a product, the cost should be a multiple of 5.

Otherwise, `buy` **endpoint** could not be able to return changes since we only have coins 5, 10, 20, 50, and 100. 

In order to avoid this scenario, I've used the custom constraint named `IsMultipleOfFiveConstraint` using `class-validator` package.

This custom constraint will be used in DTO to ensure cost is **always multiple of 5**.

The `create` method will use DTO to ensure data is cleaned and uses a `@untainted` decorator

## Securiy concerns

### Data ownership
Since we are using logger user's id in sql query, it is impossible to delete, edit product on someone's behalf.


### Taint analysis

I've used `@untainted` and `@precondition` decorator in the method documentation emphasizing that the method ensure all the data

is cleaned, secure to be used and the other method will assume that the data comes from callee is cleaned.

The reason behind using `@untainted` decorator in `JSDoc`:

1. Let's assume that the codebase grows in the future
2. Some other method uses service method without any **data validation** (without @untainted decorator)
3. If it happens, we will end up (using no solution for coin change example) a product with cost of non multiple of 5
4. It will break system
5. To avoid that, I was thinking to setup a custom taint analysis pipeline in CI to detect to unsafe method usage.

Basically, the custom Pipeline will fail if it found `callee` without @untainted decorator calls a method with @precondition decorator.

For that way, we can ensure security of our system. Of course, there is a possibility some developer uses @untainted decorator

without any data cleaning mechanism just to pass the CI pipeline. In that case, we can't do much except review the PR thoroughly.
