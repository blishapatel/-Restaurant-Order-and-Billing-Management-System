import { useState, useEffect, useRef } from 'react';

/**
 * Animated counter hook — counts from 0 to `target` over `duration` ms.
 * Uses requestAnimationFrame with ease-out for smooth animation.
 * Starts counting when the element enters the viewport (uses IntersectionObserver).
 */
const useAnimatedCounter = (target, duration = 1500, decimals = 0) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();

          const startTime = performance.now();
          const startVal = 0;
          const endVal = Number(target) || 0;

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startVal + (endVal - startVal) * eased;

            setCount(Number(current.toFixed(decimals)));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(endVal);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  // Reset if target changes
  useEffect(() => {
    hasAnimated.current = false;
    setCount(0);
  }, [target]);

  return { count, ref };
};

export default useAnimatedCounter;
