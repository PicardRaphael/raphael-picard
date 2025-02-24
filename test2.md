# Application Layer Rules

## Overview

The **Application Layer** acts as the intermediary between the **Domain Layer** and external systems (UI, databases, APIs). It contains **Use Cases**, which execute **business logic workflows** by calling services from the **Domain Layer**. This layer does not know about the UI or infrastructure directly, keeping the application **flexible and maintainable**.

## Best Practices

- **Keep Use Cases Independent** → Use cases should call services and repositories but should not manage infrastructure concerns.
- **Return DTOs Instead of Entities** → Ensures that responses are consistent and formatted correctly.

## Responsibilities of the Application Layer

- **Use Cases** → Implement specific business logic workflows.
- **Orchestrates the Domain Layer** → Calls repositories and services without managing persistence.
- **Decouples Business Logic from External Dependencies** → Keeps logic pure and testable.

## Use Cases

Use Cases define **what the application does** by encapsulating **business logic workflows**. They call the **services** and **repositories** from the Domain Layer using the repository factory.

### Example

```typescript
// src/core/application/use-cases/fetch-latest-products.use-case.ts
import { repositoryFactory } from '@/core/infrastructure/factories/repository.factory';
import { ProductMapper } from '@/core/domain/mappers/product.mapper';
import { Product } from '@/core/domain/entities/product.entity';

export class FetchLatestProductsUseCase {
	private readonly repository;

	constructor(repositoryType: 'prisma' | 'localstorage' = 'prisma') {
		this.repository = repositoryFactory.getRepository(repositoryType);
	}

	async execute(): Promise<Product[]> {
		const products = await this.repository.getLatestProducts();
		return products.map((product) => ProductMapper.toFrontEnd(product));
	}
}
```

**Why?** → Use cases encapsulate business logic workflows, ensuring that the application remains modular and maintainable.

## Use Case Example for Creating a Product

This use case validates the **DTO**, interacts with the **service layer**, and returns the result using the repository factory.

### Example

```typescript
// src/core/application/use-cases/create-product.use-case.ts
import { repositoryFactory } from '@/core/infrastructure/factories/repository.factory';
import { ProductDTO, ProductDTOType } from '@/core/domain/dtos/product.dto';
import { ProductMapper } from '@/core/domain/mappers/product.mapper';
import { Product } from '@/core/domain/entities/product.entity';

export class CreateProductUseCase {
	private readonly repository;

	constructor(repositoryType: 'prisma' | 'localstorage' = 'prisma') {
		this.repository = repositoryFactory.getRepository(repositoryType);
	}

	async execute(data: ProductDTOType): Promise<Product> {
		// Transform form data to DTO for back-end
		const productDTO = ProductMapper.toBackEnd(data);
		// Validate the DTO
		const validatedData = ProductDTO.parse(productDTO);
		// Save the entity
		const newProduct = await this.repository.create(validatedData);
		// Transform to front-end format
		return ProductMapper.toFrontEnd(newProduct);
	}
}
```

**Why?** → DTO validation ensures that only valid data reaches the business logic, maintaining data integrity.

## Using the Service in a Use Case

A use case can utilize the `ProductService` to perform operations that require business logic:

### Example

```typescript
// src/core/application/use-cases/apply-discount.use-case.ts
import { ProductService } from '@/core/domain/services/product.service';
import { Product } from '@/core/domain/entities/product.entity';

export class ApplyDiscountUseCase {
	private readonly productService: ProductService;

	constructor(productService: ProductService) {
		this.productService = productService;
	}

	async execute(productId: string, discountPercentage: number): Promise<Product> {
		return await this.productService.applyDiscount(productId, discountPercentage);
	}
}
```

**Why?** → This use case demonstrates how a service can be used to encapsulate complex business logic, making the code more modular and easier to maintain.

## Summary

- **Use Cases** → Centralized business logic execution.
- **Decoupling** → Ensures that infrastructure/UI dependencies do not interfere with business rules.
- **Reusability** → Makes logic available across API routes, UI components, and services.
- **Testability** → Each use case can be **unit tested independently**.

This structure ensures that business logic remains isolated, **allowing for easy modification and expansion** without affecting the entire application.

---
