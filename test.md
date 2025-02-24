---
description: Guidelines for structuring the Domain Layer in the project. Covers entities, repositories, services, DTOs, mappers, and custom errors, ensuring business logic remains isolated, testable, and independent of external dependencies.
globs: ['*.ts', '*.md', '*.mdc']
---

# Domain Layer Rules

## Overview

The **Domain Layer** is the **core business logic** of the application. It contains **entities, repositories, services, DTOs (Data Transfer Objects), mappers, and custom errors**. This layer is **completely independent** of external frameworks, databases, or UI, ensuring that the business rules remain isolated and testable.

---

## Best Practices

- **Use Interfaces for Entities** → Define entities as TypeScript interfaces rather than classes to avoid unnecessary instantiations.
- **Keep Business Logic Pure** → Domain logic should not depend on external frameworks (e.g., Next.js, Prisma, React).
- **Ensure DTO Validation** → Always validate data using **Zod** before it enters the application.
- **Centralize Mappers** → Use dedicated **mappers** to convert between entities and DTOs.

---

## Responsibilities of the Domain Layer

- **Entities** → Define core business models.
- **Repositories** → Interfaces for data access.
- **Services** → Handle business logic.
- **DTOs** → Validate and standardize data.
- **Mappers** → Convert between DTOs and entities.
- **Errors** → Centralized custom error handling.

---

## Entities

Entities represent **core business models** that define the application's domain logic.

### Example

```typescript
// src/core/domain/entities/product.entity.ts
export interface Product {
	id: string;
	name: string;
	description?: string;
	price: number;
	createdAt: Date;
}
```

**Why?** → Entities should be pure TypeScript interfaces to remain independent of external dependencies.

---

## Repositories

Repositories define **interfaces** for interacting with data sources, ensuring **loose coupling** between the domain logic and the infrastructure.

### Example

```typescript
// src/core/domain/repositories/product.repository.ts
import { Product } from '../entities/product.entity';

export interface ProductRepository {
	getLatestProducts(): Promise<Product[]>;
	create(product: Product): Promise<Product>;
	update(id: string, product: Partial<Product>): Promise<Product>;
	delete(id: string): Promise<void>;
}
```

**Why?** → This interface ensures decoupling from the database or storage implementation.

---

## DTOs (Data Transfer Objects)

DTOs **validate and standardize** data formats before they interact with the domain.

### Example

```typescript
// src/core/domain/dtos/product.dto.ts
import { z } from 'zod';

export const ProductDTO = z.object({
	id: z.string().uuid(),
	name: z.string().min(3),
	description: z.string().optional(),
	price: z.number().positive(),
	createdAt: z.date(),
});

export type ProductDTOType = z.infer<typeof ProductDTO>;
```

**Why?** → Using Zod for validation ensures data integrity before it reaches the domain logic.

---

## Mappers

Mappers **convert entities into DTOs** and vice versa.

### Example

```typescript
// src/core/domain/mappers/product.mapper.ts
import { Product } from '../entities/product.entity';
import { ProductDTO, ProductDTOType } from '../dtos/product.dto';

export class ProductMapper {
	// Transforms front-end data to back-end format
	static toBackEnd(product: Product): ProductDTOType {
		return {
			...product,
			price: parseFloat(product.price.replace('$', '')), // Convert price to number
			createdAt: new Date(product.createdAt), // Convert date to Date object
			updatedAt: new Date(product.updatedAt), // Convert date to Date object
		};
	}

	// Transforms back-end data to front-end format
	static toFrontEnd(data: ProductDTOType): Product {
		return {
			...data,
			price: `$${data.price.toFixed(2)}`, // Format price for display
			createdAt: data.createdAt.toLocaleDateString(), // Format date for display
			updatedAt: data.updatedAt.toLocaleDateString(), // Format date for display
		};
	}
}
```

**Why?** → Ensures separation between raw database models and business logic.

---

## Custom Errors

Errors help **handle domain-specific exceptions** consistently.

### Example

```typescript
// src/core/domain/errors/product.error.ts
export class ProductNotFoundError extends Error {
	constructor(productId: string) {
		super(`Product with ID ${productId} not found.`);
		this.name = 'ProductNotFoundError';
	}
}
```

**Why?** → Centralized error handling improves debugging and maintainability.

---

## Services

Services encapsulate business logic that involves multiple entities or repositories. They coordinate complex operations that go beyond simple CRUD operations.

### Example

```typescript
// src/core/domain/services/product.service.ts
import { ProductRepository } from '../repositories/product.repository';
import { Product } from '../entities/product.entity';

export class ProductService {
	private readonly repository: ProductRepository;

	constructor(repository: ProductRepository) {
		this.repository = repository;
	}

	// Method to apply a discount to a product
	async applyDiscount(productId: string, discountPercentage: number): Promise<Product> {
		// Retrieve the product from the repository
		const product = await this.repository.getProductById(productId);
		if (!product) {
			throw new Error(`Product with ID ${productId} not found.`);
		}

		// Apply the discount
		const discountAmount = product.price * (discountPercentage / 100);
		product.price -= discountAmount;

		// Update the product in the repository
		return await this.repository.update(productId, product);
	}

	// Method to calculate tax for a product
	calculateTax(product: Product, taxRate: number): number {
		return product.price * (taxRate / 100);
	}
}
```

**Why?** → Services provide a way to encapsulate and organize business logic, making it reusable and testable. They interact with repositories to perform data access operations but focus on implementing the rules and processes that define your application's behavior.

---

## Summary

- **Entities** → Define core business models.
- **Repositories** → Interfaces for data access.
- **Services** → Handle business logic.
- **DTOs** → Validate and standardize data.
- **Mappers** → Convert between DTOs and entities.
- **Errors** → Centralized custom error handling.
