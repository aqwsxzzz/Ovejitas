"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const farmAnimals = [
	{ emoji: "🐄", name: "cow" },
	{ emoji: "🐷", name: "pig" },
	{ emoji: "🐔", name: "chicken" },
	{ emoji: "🐑", name: "sheep" },
	{ emoji: "🐴", name: "horse" },
	{ emoji: "🐐", name: "goat" },
	{ emoji: "🦆", name: "duck" },
	{ emoji: "🐓", name: "rooster" },
];

interface FarmAnimalSpinnerProps {
	size?: "sm" | "md" | "lg";
	speed?: "slow" | "normal" | "fast";
	className?: string;
}

export function FarmAnimalSpinner({
	size = "md",
	speed = "normal",
	className,
}: FarmAnimalSpinnerProps) {
	const [currentAnimalIndex, setCurrentAnimalIndex] = useState(0);
	const [scale, setScale] = useState(1);

	const sizeClasses = {
		sm: "text-2xl",
		md: "text-4xl",
		lg: "text-6xl",
	};

	const speedMs = {
		slow: 800,
		normal: 500,
		fast: 300,
	};

	useEffect(() => {
		const scaleInterval = setInterval(() => {
			setScale((prev) => (prev === 1 ? 1.3 : 1));
		}, speedMs[speed] / 4);

		const animalInterval = setInterval(() => {
			setCurrentAnimalIndex((prev) => (prev + 1) % farmAnimals.length);
			setScale(1);
		}, speedMs[speed]);

		return () => {
			clearInterval(scaleInterval);
			clearInterval(animalInterval);
		};
	}, [speed]);

	return (
		<div className={cn("flex items-center justify-center", className)}>
			<div
				className={cn(
					"animate-bounce transition-all duration-200 ease-in-out",
					sizeClasses[size],
				)}
			>
				<span
					key={currentAnimalIndex}
					className="inline-block transition-transform duration-150 ease-in-out"
					style={{ transform: `scale(${scale})` }}
					role="img"
					aria-label={`Loading... ${farmAnimals[currentAnimalIndex].name}`}
				>
					{farmAnimals[currentAnimalIndex].emoji}
				</span>
			</div>
		</div>
	);
}
