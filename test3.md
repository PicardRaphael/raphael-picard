# Infrastructure Layer Rules

## Overview

The **Infrastructure Layer** is responsible for handling **external system interactions**, including databases (Prisma, Supabase), local storage, APIs, and third-party services. It provides **concrete implementations** for the interfaces defined in the **Domain Layer**, ensuring that the application remains flexible and testable.

## Best Practices

- **Use Factories for Repository Selection** → Allows easy switching between Prisma, LocalStorage, and other data sources.

- **Keep Repositories Stateless** → Repositories should not store state; they should only handle persistence.

- **Centralize API Integrations in Adapters** → Avoid direct API calls from the UI.

## Responsibilities of the Infrastructure Layer

- **Repositories** → Implement data access logic using Prisma, LocalStorage, or APIs.

- **Adapters** → Provide a consistent API for external services.

- **Factories** → Dynamically instantiate repository implementations.

- **Data Persistence** → Manage how data is stored and retrieved from different sources.

## Repositories

Repositories implement the **data access logic** defined by the repository interfaces in the Domain Layer.

### Prisma Repository Example (Database Access)

```typescript
// src/core/infrastructure/prisma/prisma.product.repository.ts

import { prisma } from '@/libs/prisma';

import { ProductRepository } from '@/core/domain/repositories/product.repository';

import { ProductDTOType } from '@/core/domain/dtos/product.dto';

export class PrismaProductRepository implements ProductRepository {
	private static instance: PrismaProductRepository;

	private constructor() {}

	public static getInstance(): PrismaProductRepository {
		if (!PrismaProductRepository.instance) {
			PrismaProductRepository.instance = new PrismaProductRepository();
		}

		return PrismaProductRepository.instance;
	}

	async getLatestProducts(): Promise<ProductDTOType[]> {
		return await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
	}

	async create(product: Product): Promise<ProductDTOType> {
		return await prisma.product.create({ data: product });
	}
}
```

**Why?** → Uses Prisma ORM for database interaction while following the Singleton Pattern.

### LocalStorage Repository Example (Client-Side Persistence)

```typescript
// src/core/infrastructure/storage/localstorage.product.repository.ts

import { Product } from '@/core/domain/entities/product.entity';

import { ProductRepository } from '@/core/domain/repositories/product.repository';

export class LocalStorageProductRepository implements ProductRepository {
	private static instance: LocalStorageProductRepository;

	private constructor() {}

	public static getInstance(): LocalStorageProductRepository {
		if (!LocalStorageProductRepository.instance) {
			LocalStorageProductRepository.instance = new LocalStorageProductRepository();
		}

		return LocalStorageProductRepository.instance;
	}

	async getLatestProducts(): Promise<ProductDTOType[]> {
		const data = localStorage.getItem('products');

		return data ? JSON.parse(data) : [];
	}

	async create(product: Product): Promise<ProductDTOType> {
		const products = await this.getLatestProducts();

		products.push(product);

		localStorage.setItem('products', JSON.stringify(products));

		return product;
	}
}
```

**Why?** → Implements a repository that persists data **locally on the client-side**.

## Factories

Factories dynamically instantiate repositories based on configuration.

### Repository Factory Example

```typescript
// src/core/infrastructure/factories/repository.factory.ts
import { PrismaProductRepository } from '@/core/infrastructure/prisma/prisma.product.repository';
import { LocalStorageProductRepository } from '@/core/infrastructure/storage/localstorage.product.repository';
import { ProductRepository } from '@/core/domain/repositories/product.repository';

export const repositoryFactory = {
	getRepository: (type: 'prisma' | 'localstorage' = 'prisma'): ProductRepository => {
		const repositories: { [key: string]: ProductRepository } = {
			prisma: PrismaProductRepository.getInstance(),
			localstorage: LocalStorageProductRepository.getInstance(),
		};
		return repositories[type];
	},
};
```

**Why?** → Allows switching between **different storage mechanisms** dynamically.

## State Management Adapter

An adapter to switch between different state management libraries.

### Example

```typescript
// src/store/adapters/state-management.adapter.ts
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

export const stateManagementAdapter = {
	useGetLatestProducts: (useReactQuery: boolean) => {
		if (useReactQuery) {
			return useQuery(['latestProducts'], fetchLatestProductsUseCase.execute);
		} else {
			return useSelector((state) => state.products);
		}
	},
};
```

**Why?** → Provides a unified interface to switch between React Query and Redux for state management.

## Summary

- **Repositories** → Implement the data access logic.

- **Adapters** → Provide a unified API for different data sources.

- **Factories** → Enable dynamic repository selection.

- **Persistence Layer** → Manages interactions with databases, APIs, and local storage.

This structure ensures **flexibility, scalability, and separation of concerns** in Next.js 15 applications.
