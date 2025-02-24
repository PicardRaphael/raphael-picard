Here is how you need to create Animation.
Framer motion : Using for animation with @tailwind-css.mdc

# Rules for Framer Motion Animations

## Overview

This guide provides best practices for integrating Framer Motion with Tailwind CSS in a Next.js project. It highlights the benefits of using both together for creating smooth, performant animations.

---

## 1. Core Principles

- **Tailwind for Basics:** Utilize Tailwind CSS utility classes for fundamental transitions (e.g., `transition`, `duration-200`, `ease-in-out`).

- **Framer Motion for Complexity:** Reserve Framer Motion for complex animations, state-driven effects, and orchestrating sequences.

- **Performance:** Prioritize smooth and performant animations. Avoid animating properties that trigger layout thrashing. Use `transform` and `opacity` when possible.

---

## 2. Framer Motion Techniques

- **`motion` Component:** Wrap elements with `<motion.div>`, `<motion.button>`, etc., to enable animation capabilities.

- **Declarative Animations:** Use `animate`, `initial`, `exit`, `whileHover`, `whileTap`, `whileFocus`, `whileInView` props for declarative control. These align well with React's component-based architecture.

- **Variants:** Define reusable animation configurations using variants for cleaner code and consistency.

    ```jsx
    const variants = {
    	hidden: { opacity: 0, x: -50 },
    	visible: {
    		opacity: 1,
    		x: 0,
    		transition: { duration: 0.5, type: 'spring', stiffness: 100 },
    	},
    };

    <motion.div variants={variants} initial="hidden" animate="visible" className="rounded-md bg-green-100 p-4">
    	Content with variant animation
    </motion.div>;
    ```

- **`transition` Prop:** Customize animation parameters like `duration`, `ease`, `delay`, and `type` (spring, tween, etc.) using the `transition` prop. Refer to the Framer Motion documentation for available options (@https://motion.dev/docs/transition).

- **`useAnimate` (Considered):** Use `useAnimate` for more imperative animation control and sequencing, especially when `animate` prop becomes unwieldy.

---

## 3. Tailwind & Framer Motion Integration

- **Styling with Tailwind:** Use Tailwind classes for initial styling and basic layout.

- **Combine:** Seamlessly integrate Tailwind classes with Framer Motion for a unified design system.

---

## 4. Examples

- **Fade-in on Mount:**

    ```jsx
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="rounded-md bg-gray-100 p-4">
    	Content fading in
    </motion.div>
    ```

- **Hover Scale Effect:**

    ```jsx
    <motion.button
    	whileHover={{ scale: 1.1 }}
    	whileTap={{ scale: 0.95 }}
    	className="rounded bg-blue-500 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-blue-700"
    >
    	Hover Me
    </motion.button>
    ```

- **Staggered Animation:**

    ```jsx
    const listVariants = {
    	visible: {
    		transition: { staggerChildren: 0.1 },
    	},
    	hidden: { opacity: 0 },
    };

    const itemVariants = {
    	visible: {
    		opacity: 1,
    		y: 0,
    		transition: {
    			duration: 0.5,
    			ease: 'easeInOut',
    		},
    	},
    	hidden: {
    		opacity: 0,
    		y: 50,
    	},
    };

    <motion.ul variants={listVariants} initial="hidden" animate="visible" className="space-y-2">
    	{[1, 2, 3].map((item) => (
    		<motion.li key={item} variants={itemVariants} className="rounded-md bg-yellow-100 p-2">
    			Item {item}
    		</motion.li>
    	))}
    </motion.ul>;
    ```

- **Modal Animation:**

    ```jsx
    <motion.div
    	initial={{ scale: 0 }}
    	animate={{ scale: 1 }}
    	exit={{ scale: 0 }}
    	transition={{ duration: 0.3 }}
    	className="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black"
    >
    	<motion.div className="rounded-lg bg-white p-6 shadow-lg">Modal Content</motion.div>
    </motion.div>
    ```

- **Carousel Animation:**

    ```jsx
    const carouselVariants = {
    	enter: { opacity: 0, x: 100 },
    	center: { opacity: 1, x: 0 },
    	exit: { opacity: 0, x: -100 },
    };

    <motion.div variants={carouselVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5 }} className="carousel">
    	Carousel Item
    </motion.div>;
    ```

- **Exit Animations (with `AnimatePresence`):** Used for components that mount/unmount.

    ```jsx
    import { AnimatePresence, motion } from 'framer-motion';

    function MyComponent({ isVisible }) {
    	return (
    		<AnimatePresence>
    			{isVisible && (
    				<motion.div
    					key="unique-id" // Important for AnimatePresence
    					initial={{ opacity: 0 }}
    					animate={{ opacity: 1 }}
    					exit={{ opacity: 0 }}
    					transition={{ duration: 0.3 }}
    					className="rounded-md bg-red-100 p-4"
    				>
    					Content that fades in and out
    				</motion.div>
    			)}
    		</AnimatePresence>
    	);
    }
    ```

---

## 5. Accessibility

- **Respect `prefers-reduced-motion`:** Use the `prefers-reduced-motion` media query to disable animations for users who prefer reduced motion. Framer Motion provides a hook for this:

    ```jsx
    import { useReducedMotion } from 'framer-motion';

    function MyAnimatedComponent() {
    	const shouldReduceMotion = useReducedMotion();

    	const animation = {
    		opacity: shouldReduceMotion ? 1 : 0,
    		transition: { duration: shouldReduceMotion ? 0 : 0.5 },
    	};

    	return <motion.div animate={animation}>Content</motion.div>;
    }
    ```

* **Avoid Distracting Animations:** Ensure animations are not overly distracting or disorienting.

---

## 6. Performance

- **`will-change` (Use Sparingly):** The `will-change` CSS property can improve performance, but use it judiciously.

- **Optimize for Mobile:** Ensure animations are smooth on mobile devices by testing and adjusting parameters as needed.

---

## 7. Framer Motion vs. CSS Animations: A Recap

- **CSS Animations (When to Use):**

    - Simple transitions (hover effects, basic fades).
    - Performance-critical scenarios where basic animations suffice.

- **Framer Motion (When to Use):**
    - Complex animations involving multiple properties and keyframes.
    - Orchestrating animation sequences (staggered animations, chained animations).
    - State-driven animations (animations based on React component state).
    - Gestural animations (hover, tap, drag).
    - Spring-based animations for natural-looking effects.
    - Declarative and maintainable animation code.

---

## 8. Key Takeaways from Framer Motion Docs:

- **`motion` as the Foundation:** Everything starts with the `motion` component.
- **Variants for Reusability:** Embrace variants for complex animations and maintainability.
- **`transition` for Customization:** Fine-tune animations with the `transition` prop.
- **`AnimatePresence` for Mounting/Unmounting:** Animate components entering and exiting the DOM.
- **Accessibility Matters:** Always consider users who prefer reduced motion.

---

## 9. Resources

- **Framer Motion Documentation:** [Framer Motion Docs](https://www.framer.com/motion/)
- **Tailwind CSS Documentation:** [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## 10. Version Specifics

- **Latest Features:** Ensure you are using the latest version of Framer Motion to take advantage of new features and improvements.
- **Breaking Changes:** Review the release notes for any breaking changes that may affect your project.

---
