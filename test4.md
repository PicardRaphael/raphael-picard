---
description: Guidelines for structuring the Presentation Layer in the project. Covers client and server components, UI structure, API routes, and state management using React Query.
globs: *.ts, *.tsx, *.md, *.mdc
---

# Presentation Layer Rules

## Overview

The **Presentation Layer** is responsible for managing **user interactions, UI components, and API routes** in a Next.js 15 application. It consists of **React components (Server and Client Components)**, **Next.js pages**, and **API handlers**, making it the entry point of the application.

## Best Practices

- **Use Server Components for Data Fetching** → Move data fetching logic to server components when possible.

- **Use Client Components for Interactions** → Only use client components when handling state, user events, or animations.

- **Structure Components Properly** → Place shared components in `/components/` and page-specific components in ex `app/_components/` or `app/products/_components/`.

- **Use React Query for API Calls** → Prevents unnecessary re-fetching and optimizes state management.

## Responsibilities of the Presentation Layer

- **Pages & Layouts** → Define the structure of the application UI.

- **Components** → Reusable UI elements that interact with the state and business logic.

- **API Routes** → Handle incoming HTTP requests, calling the Application Layer.

- **State Management** → Uses React Query, Redux, or Zustand for data fetching and caching.

## Pages & Layouts

Pages define **routes and the UI structure** of the application.

### Example

```tsx
// src/app/layout.tsx

import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body>
				<header>My App</header>

				<main>{children}</main>

				<footer>© 2024</footer>
			</body>
		</html>
	);
}
```

**Why?** → This layout wraps all pages in a consistent structure.

## Reusable UI Components

UI components manage the **presentation logic** while remaining independent of the backend logic.

### Example

```tsx
// src/components/ProductCard.tsx

import { Product } from '@/core/domain/entities/product.entity';

export default function ProductCard({ product }: { product: Product }) {
	return (
		<div className="rounded-lg border p-4">
			<h2 className="text-xl">{product.name}</h2>

			<p className="text-gray-500">{product.description}</p>

			<p className="font-bold">${product.price}</p>
		</div>
	);
}
```

**Why?** → Promotes reusability and maintainability across different pages.

## Client Components

Client Components allow dynamic interactions and handle events on the frontend using the state management adapter.

### Example

```tsx
// src/components/ProductCard.tsx
'use client';
import { useState } from 'react';
import { stateManagementAdapter } from '@/store/adapters/state-management.adapter';

export default function Counter() {
	const [count, setCount] = useState(0);
	const { data: products, isLoading } = stateManagementAdapter.useGetLatestProducts(true); // Using React Query

	if (isLoading) return <p>Loading...</p>;

	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)} className="rounded bg-blue-500 p-2 text-white">
				Increment
			</button>
			<div className="grid grid-cols-3 gap-4">
				{products?.map((product) => (
					<div key={product.id} className="rounded-lg border p-4">
						<h2 className="text-xl">{product.name}</h2>
						<p className="text-gray-500">{product.description}</p>
					</div>
				))}
			</div>
		</div>
	);
}
```

**Why?** → Uses the state management adapter to switch between React Query and Redux for managing state and updating the UI dynamically.

## Server Component Example

Server Components allow **fetching data directly on the server** without client-side JavaScript.

### Example

```tsx
// src/components/ProductList.tsx

import { fetchLatestProductsUseCase } from '@/core/application/use-cases/fetch-latest-products.use-case';

export default async function ProductList() {
	const products = await fetchLatestProductsUseCase.execute();

	return (
		<div className="grid grid-cols-3 gap-4">
			{products.map((product) => (
				<div key={product.id} className="rounded-lg border p-4">
					<h2 className="text-xl">{product.name}</h2>

					<p className="text-gray-500">{product.description}</p>
				</div>
			))}
		</div>
	);
}
```

**Why?** → Fetches data directly from the server **before rendering** the component, improving performance.

## API Routes

Next.js API routes serve as the backend interface for handling client requests and can utilize use cases with constructor-based repository initialization.

### Example

```typescript
// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { FetchLatestProductsUseCase } from '@/core/application/use-cases/fetch-latest-products.use-case';

export async function GET() {
	const fetchLatestProductsUseCase = new FetchLatestProductsUseCase('prisma');
	const products = await fetchLatestProductsUseCase.execute();

	return NextResponse.json(products);
}
```

**Why?** → This approach allows for easy switching between different repository implementations by simply changing the constructor parameter.

## React Query for Data Fetching

React Query is used to handle data fetching and caching, and can utilize use cases with constructor-based repository initialization.

### Example

```tsx
// src/store/react-query/product/use-fetch-products.query.ts
import { useQuery } from '@tanstack/react-query';
import { FetchLatestProductsUseCase } from '@/core/application/use-cases/fetch-latest-products.use-case';

export const useGetLatestProducts = () => {
	const fetchLatestProductsUseCase = new FetchLatestProductsUseCase('prisma');

	return useQuery({
		queryKey: ['latestProducts'],
		queryFn: () => fetchLatestProductsUseCase.execute(),
	});
};
```

**Why?** → Enables efficient state management and caching while allowing for easy switching between different repository implementations.

## Summary

- **Pages & Layouts** → Define the UI structure.

- **Reusable Components** → Promote reusability and maintainability.

- **API Routes** → Handle server-side logic and data fetching.

- **State Management** → Uses React Query for efficient data handling.

- **Client Components** → Handle dynamic user interactions.

- **Server Components** → Optimize data fetching on the server side.

This structure ensures **separation of concerns, reusability, and scalability** in a Next.js 15 application.
