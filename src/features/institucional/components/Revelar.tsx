import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Entra suave ao aparecer na tela (uma vez só). Com movimento reduzido, aparece parado e já visível. */
export function Revelar({ children, atraso = 0, className }: { children: ReactNode; atraso?: number; className?: string }) {
  const reduzido = useReducedMotion();
  if (reduzido) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay: atraso, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
