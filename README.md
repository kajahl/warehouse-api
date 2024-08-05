# Warehouse API

A comprehensive API for managing multiple logistics centers, parcel system, transport services.
(Still in progress)

## Future features

- **Parcel Tracking:** Monitor parcel status (received, delivered, in transit, etc.)
- **Logistics Management:** Handle operations across multiple logistics centers.

## Technologies Used

- **TypeScript:** A statically typed superset of JavaScript that enhances code quality and maintainability.
- **NestJS:** A progressive Node.js framework for building efficient and scalable server-side applications.
- **TypeORM:** An ORM for TypeScript and JavaScript that simplifies database interactions.
- **Passport.js:** Middleware for authentication in Node.js applications.
- **JWT (JSON Web Token):** Used for authentication and authorization with access and refresh tokens.
- **Jest:** A comprehensive testing framework for JavaScript and TypeScript.

## Design Patterns and Techniques

- **Repository Pattern:** Encapsulates data access logic, promoting separation of concerns.
- **Decorator Pattern:** Utilized for HTTP methods, resolving objects (e.g., authUser), and metadata reflection.
- **Data Transfer Objects (DTOs):** Ensure data consistency and validation across the application.
- **Unit Testing:** Implemented with Jest, using mocks for isolated testing.
- **Integration Testing:** Tests the integration of various modules and services.
- **Custom Errors and Exceptions:** Handling of custom errors and exceptions for better error management.
- **Serializers:** Used for transforming data before sending it to the client.
- **Validators:** Custom validators for ensuring data integrity.

## Clone repository and installation

```bash
git clone https://github.com/kajahl/warehouse-api.git
cd warehouse-api
yarn install
```

## Running the App
### Development
```bash
yarn run start
```
### Watch Mode
```bash
yarn run start:dev
```
### Production
```bash
yarn run start:prod
```

## Testing
### Unit Tests

```bash
yarn run test:unit
```

### Integration Tests

```bash
yarn run test:int
```
### End-to-End Tests
```bash
yarn run test:e2e
```
### Test Coverage

```bash
yarn run test:cov
```

## Project Structure

- ...
- ...

