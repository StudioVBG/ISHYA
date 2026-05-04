import type { Variants, Transition, Easing } from "framer-motion";

// ─────────────────────────────────────────────────────────────
// Easings premium (cubic-bezier nommés)
// ─────────────────────────────────────────────────────────────
export const easeOutQuart: Easing = [0.22, 1, 0.36, 1];
export const easeOutExpo: Easing = [0.16, 1, 0.3, 1];
export const easeInOutCubic: Easing = [0.65, 0, 0.35, 1];
export const easeOutBack: Easing = [0.34, 1.56, 0.64, 1];

// ─────────────────────────────────────────────────────────────
// Variants de base
// ─────────────────────────────────────────────────────────────
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const slideInRight: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
  exit: { x: "100%" },
};

export const slideInLeft: Variants = {
  hidden: { x: "-100%" },
  visible: { x: 0 },
  exit: { x: "-100%" },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

// ─────────────────────────────────────────────────────────────
// Stagger affiné (rythme plus aérien)
// ─────────────────────────────────────────────────────────────
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutQuart },
  },
};

// ─────────────────────────────────────────────────────────────
// Micro-interactions
// ─────────────────────────────────────────────────────────────
export const heartBounce: Variants = {
  idle: { scale: 1 },
  active: {
    scale: [1, 1.4, 1],
    transition: { duration: 0.4, type: "spring" },
  },
};

export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const softSpring: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
  mass: 0.8,
};

export const smoothTransition: Transition = {
  duration: 0.3,
  ease: "easeOut",
};

// ─────────────────────────────────────────────────────────────
// Page & drawer
// ─────────────────────────────────────────────────────────────
export const pageTransition: Variants = {
  initial: { opacity: 0, scale: 0.985 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easeOutQuart },
  },
  exit: {
    opacity: 0,
    scale: 0.985,
    transition: { duration: 0.3, ease: easeOutQuart },
  },
};

export const drawerTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 40,
};

export const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

// ─────────────────────────────────────────────────────────────
// Reveal lettre par lettre (titres fiche produit)
// ─────────────────────────────────────────────────────────────
export const letterContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.1 },
  },
};

export const letterItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOutQuart },
  },
};

// ─────────────────────────────────────────────────────────────
// Accordéon spring soft
// ─────────────────────────────────────────────────────────────
export const accordionVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.25, ease: easeOutQuart },
  },
  open: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.35, ease: easeOutQuart },
  },
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};
