---
description: Guidelines for structuring React components in the project. Covers rules for defining components, handling props, and implementing Client & Server Components efficiently in Next.js 15 with React 19. Includes best practices for interactivity, performance, and avoiding hydration issues.
globs: *.tsx
---

# Rules for component

## Important:

- You always use `export function` without "default".
- You always use an object "props" as the first argument of your component, and add type directly in the object.
- Favor React Server Components (RSC) where possible
- Minimize the use of 'use client', useEffect, and setState; favor React Server Components (RSC) and Next.js SSR features.
- Implement proper error boundaries
- Use Suspense for async operations
- Optimize for performance and Web Vitals
- Use responsive design with a mobile-first approach.

## Create Component Example

With 2 or less props :

```tsx
export function MyComponent(props: { prop1: string; prop2: number }) {
	return <div>{props.prop1}</div>;
}
```

With more than 2 props :

```tsx
type MyComponentProps = {
	prop1: string;
	prop2: number;
	prop3: number;
};

export function MyComponent(props: MyComponentProps) {
	return <div>{props.prop1}</div>;
}
```

## Client Components

Client Components allow you to write interactive UI elements that are pre-rendered on the server and can use client-side JavaScript to run in the browser.

**Why?** → **Interactivity**: Client Components can use state, effects, and event listeners, meaning they can provide immediate feedback to the user and update the UI dynamically.
**Why?** → **Browser APIs**: Client Components have access to browser APIs, such as geolocation or localStorage, enabling richer functionality.

### Example:

```tsx
'use client';

import { useState } from 'react';

export default function Counter() {
	const [count, setCount] = useState(0);

	return (
		<div>
			<p>You clicked {count} times</p>
			<button onClick={() => setCount(count + 1)}>Click me</button>
		</div>
	);
}
```

### Important:

1. Client Components need to start with `'use client'`.
2. Client Components can use `useState` and other React hooks.
3. Client Componentsed\*\* on the server, which means that they can create hydration errors. You must avoid such errors by using hooks like `@use-is-client.ts` or checking `typeof window` when using Browser APIs.

## Server Components

Server Components allow you to fetch and process data on the server before sending a fully rendered HTML response to the client.
**Why?** → **Performance Optimization**: Server Components reduce client-side JavaScript, minimizing hydration and improving page load speed.
**Why?** → **Data Security**: Server Components keep sensitive logic and API keys on the server, preventing client-side exposure.
**Why?** → **Reduced Client-Side Complexity**: They eliminate the need for unnecessary state management and effects, leading to a cleaner component architecture.

### Example:

```tsx
// Use "async" for server components
export default async function Page() {
	// Use "await" for async operations
	const result = await prisma.user.findMany();
	return (
		<div>
			{result.map((user) => (
				<p>{user.name}</p>
			))}
		</div>
	);
}
```

### Informations:

Some method are avaiable :

```tsx
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

// Redirect to another page
redirect('/login');

// Show the `not-found.tsx` file
notFound();
```

### Important:

1. Server components are always `async`
2. Server components can't use hooks
3. Server Components can't use `document` or `window` because they are only run in backend
