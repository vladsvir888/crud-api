# CRUD API

This is a simple CRUD API server implemented in Node.js using the HTTP module.

## Technical requirements

Use 22.x.x version (22.9.0 or upper) of Node.js.

## Quick Start

Clone the repository.

```bash
git clone https://github.com/vladsvir888/crud-api.git .
```

Go to the branch development.

```bash
git checkout development
```

Install dependencies.

```bash
npm install
```

Run in development mode.

```bash
npm run start:dev
```

Run in production mode.

```bash
npm run start:prod
```

## Endpoints

| Method | Endpoint            | Description             |
| ------ | ------------------- | ----------------------- |
| GET    | /api/users          | Get all users           |
| GET    | /api/users/{userId} | Get a specific user     |
| POST   | /api/users          | Create a new user       |
| PUT    | /api/users/{userId} | Update an existing user |
| DELETE | /api/users/{userId} | Delete an existing user |
