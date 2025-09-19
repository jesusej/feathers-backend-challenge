# Feathers Backend Challenge

> Currency Conversion API challenge made with FeathersJS stack. You can see the original submission [here](https://github.com/jesusej/feathers-backend-challenge/tree/archive/original-submission).

## Table of Contents

- [Feathers Backend Challenge](#feathers-backend-challenge)
  - [Table of Contents](#table-of-contents)
  - [About](#about)
  - [Objective](#objective)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Environment Variables](#environment-variables)
    - [Installation](#installation)
  - [Testing](#testing)
  - [Project Environment Variables Reference](#project-environment-variables-reference)
  - [API Documentation](#api-documentation)
    - [1. Get All Exchange Rates](#1-get-all-exchange-rates)
      - [Response](#response)
      - [Create/Update a Rate](#createupdate-a-rate)
      - [Validation Rules](#validation-rules)
      - [Errors](#errors)
    - [2. Convert Currency](#2-convert-currency)
      - [Request Body](#request-body)
      - [Validation Rules](#validation-rules-1)
      - [Response](#response-1)
      - [Errors](#errors-1)
    - [3. Get Daily Conversion Report (PDF)](#3-get-daily-conversion-report-pdf)
      - [Response](#response-2)
      - [Example](#example)
  - [Example Usage](#example-usage)
    - [Convert Currency](#convert-currency)
    - [Get All Rates](#get-all-rates)
    - [Get Daily Report (PDF)](#get-daily-report-pdf)
  - [Resources](#resources)
  - [Notes and assumptions](#notes-and-assumptions)

## About

This is a challenge for a real-world backend service using the following tech stack:

- Node.js
- FeathersJS
- MongoDB/Mongoose
- RabbitMQ
- Joi
- PDF generation tools such as pdfmake, puppeteer, or html-pdf-node.

## Objective

Build a Currency Conversion API that supports both FIAT and Cryptocurrencies.

The system should allow:

- Fetching and updating conversion rates from external APIs.
- Converting amounts between different currencies.
- Storing historical conversion logs in **MongoDB**.
- Sending logs or notifications to a **RabbitMQ** queue for downstream processing.
- Exporting daily conversion summaries in **PDF format** using `pdfmake` or `puppeteer`.
- Validating all input using **Joi**.

The system should expose endpoints via **FeathersJS** REST APIs and support real-time updates via WebSocket.

## Getting Started

### Prerequisites

- NodeJS (>= 22.18.0)
- pnpm (recommended, installs automatically if using corepack or you can use npm)
- MongoDB (local or remote instance)
- RabbitMQ (local or remote instance)
- OpenExchangeRates API key (free tier is sufficient)

### Environment Variables

Duplicate the `local-template.json` and rename it as `local.json`. Change their values to the respective IDs and URLs.

### Installation

1. Clone the repository and install dependencies:

    ```sh
    cd path/to/feathers-backend-challenge
    pnpm install # or npm install
    ```

2. Compile TypeScript source:

    ```sh
    pnpm run compile # or npm run compile
    ```

3. Start MongoDB and RabbitMQ if not already running.

4. Start your app:

    ```sh
    pnpm start # or npm start
    ```

The server will run on `http://localhost:3030` by default.

## Testing

There are no tests in this repository. I need to learn more about testing MongoDB and RabbitMQ with Jest. I will continue to work on this after the evaluation.

## Project Environment Variables Reference

| Variable           | Description                                 |
|--------------------|---------------------------------------------|
| CURRENCY_APP_ID    | OpenExchangeRates App ID                    |
| RABBITMQ_URL       | RabbitMQ connection string                  |
| FEATHERS_SECRET    | Secret for authentication                   |

## API Documentation

### 1. Get All Exchange Rates

**Endpoint:** `GET /rates`

Returns all available currency exchange rates from the database.

#### Response
```json
[
  { "_id": "USD", "rate": 1 },
  { "_id": "EUR", "rate": 0.925 },
  // ...
]
```

#### Create/Update a Rate
**Endpoint:** `POST /rates`

```json
{
  "_id": "EUR",   // 3-letter currency code
  "rate": 0.925    // Exchange rate (non-negative number)
}
```

#### Validation Rules
- `_id`: Required, 3 uppercase letters
- `rate`: Required, non-negative number

#### Errors
- 404 Not Found if currency does not exist (on update)
- 400 Bad Request if validation fails

---

### 2. Convert Currency

**Endpoint:** `POST /convert`

Converts an amount from one currency to another using stored exchange rates. It also sends data to a RabbitMQ queue at `/queue`.

#### Request Body
```json
{
  "from": "USD",   // 3-letter currency code (source)
  "to": "EUR",     // 3-letter currency code (target)
  "amount": 100.00  // Amount to convert (positive, up to 2 decimals)
}
```

#### Validation Rules
- `from` and `to`: Required, 3 uppercase letters, must be different
- `amount`: Required, positive number, up to 2 decimal places

#### Response
```json
{
  "result": 92.50 // Converted amount (rounded to 2 decimals)
}
```

#### Errors
- 400 Bad Request if currencies are not found or validation fails

---

### 3. Get Daily Conversion Report (PDF)

**Endpoint:** `GET /report`

Returns a PDF report of all conversions performed today.

#### Response
- Content-Type: `application/pdf`
- PDF file containing a table of conversions (from, to, amount, result, timestamp)

#### Example
```
GET /report
Accept: application/pdf
```

---

## Example Usage

### Convert Currency
```sh
curl -X POST http://localhost:3030/convert \
  -H "Content-Type: application/json" \
  -d '{ "from": "USD", "to": "EUR", "amount": 100 }'
```

### Get All Rates
```sh
curl http://localhost:3030/rates
```

### Get Daily Report (PDF)
```sh
curl -o report.pdf http://localhost:3030/report
```

## Resources

- [FeathersJS](http://feathersjs.com)
- [NodeJS](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [MongoDB](https://www.mongodb.com/)
- [RabbitMQ](https://www.rabbitmq.com/)
- [OpenExchangeRates](https://openexchangerates.org/)
- [FeathersJS Documentation](http://docs.feathersjs.com)

## Notes and assumptions

- Outside of the cron job, the tasks didn't mention if the currencies should be set once or updated at the start of the server. In the end, I chose the second option, ensuring that the currencies are updated at the start of the service.
- Open Exchange Rates mentioned that they supported some [cryptocurrencies](https://docs.openexchangerates.org/reference/supported-currencies#alternative-black-market-and-digital-currencies) in their documentation, so my original plan was to use those to mark it as part of the requirements and mention the CoinGecko API as a **COULD** on a possible list of tasks for future development. That said, their official library not only doesn't support this, but it is also not updated with their latest arguments. This was a clear oversight on my part, and I should have researched this subject more thoroughly.
- At first, I did not understand what to do with the RabbitMQ queue. I was going to create a REST endpoint that acted as a client to retrieve all the data from the queue, but since the tasks did not specify what to do with the data, I just left it in the queue.
- As I mentioned, I did not add any tests due to time constraints. My original plan was not only to add coverage for services, validations, and message queues with unit and integration tests, but also to create a pipeline to continuously test the server on any pull request to main. This wasn't mentioned in the requirements, but it was an extra goal of mine to better manage repository changes in the future.
- The challenge suggested using Yarn as a package manager for a better development experience. Even though I have experience with Yarn, I decided to use PNPM, not only for its faster approach but also for its storage efficiency in managing node_modules. Its usage is also similar to NPM or Yarn, unlike Bun.
- If you check the commits, you may find multiple pull requests. I did this because I worked on this project as if I were working with a team and tried not to mix my commits with those from another user. Each PR focused on a specific task or requirement.
- Each commit and branch followed the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0) specification. Gitmoji does not work well with backend-related projects.
