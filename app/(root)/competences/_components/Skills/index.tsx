'use client';
import { CategorizedSkills } from '@/core/domain/entities/skills.entity';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Tab from '../Tab';
import Cursor from '../Tab/Cursor';
import TreeSkill from './TreeSkill';

export type Position = {
	left: number;
	width: number;
	opacity: number;
};

type SkillsProps = {
	skills: CategorizedSkills;
};

const Skills = ({ skills }: SkillsProps) => {
	const [tabActive, setTabActive] = useState('front-end');
	const [position, setPosition] = useState<Position>({
		left: 0,
		width: 0,
		opacity: 0,
	});

	const tabRefs = useRef<{ [key: string]: HTMLLIElement | null }>({
		'front-end': null,
		'back-end': null,
		global: null,
	});

	useEffect(() => {
		// Set initial position for the cursor
		const initialTab = tabRefs.current['front-end'];
		if (initialTab) {
			const { width } = initialTab.getBoundingClientRect();
			setPosition({
				left: initialTab.offsetLeft,
				width,
				opacity: 1,
			});
		} else {
			console.error('Initial tab reference is not set');
		}
	}, []);

	const skillCategories = {
		'front-end': skills.front,
		'back-end': skills.back,
		global: skills.global,
	};

	return (
		<>
			<div className="m-5">
				<ul className="bg-black-600 relative mx-auto flex w-fit rounded-full font-bold text-white">
					<Tab
						ref={(el) => {
							tabRefs.current['front-end'] = el;
						}}
						setTabActive={setTabActive}
						setPosition={setPosition}
					>
						Front-End
					</Tab>
					<Tab
						ref={(el) => {
							tabRefs.current['back-end'] = el;
						}}
						setTabActive={setTabActive}
						setPosition={setPosition}
					>
						Back-End
					</Tab>
					<Tab
						ref={(el) => {
							tabRefs.current['global'] = el;
						}}
						setTabActive={setTabActive}
						setPosition={setPosition}
					>
						Global
					</Tab>
					<Cursor position={position} />
				</ul>
			</div>
			<AnimatePresence mode="wait">
				<motion.div
					key={tabActive}
					transition={{ duration: 0.3, ease: 'easeInOut' }}
					initial={{ x: 30, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					exit={{ x: 30, opacity: 0 }}
				>
					<TreeSkill skills={skillCategories[tabActive as keyof typeof skillCategories] || skills.front} />
				</motion.div>
			</AnimatePresence>
		</>
	);
};

export default Skills;
