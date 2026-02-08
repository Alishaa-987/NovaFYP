import dynamic from "next/dynamic";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
const DotLottie = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false }
);

interface LottieWrapperProps {
  animationData?: object;
  animationUrl?: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function LottieWrapper({
  animationData,
  animationUrl,
  loop = true,
  autoplay = true,
  className,
  style
}: LottieWrapperProps) {
  const isDotLottie = Boolean(animationUrl && animationUrl.includes(".lottie"));
  const [resolvedData, setResolvedData] = useState<object | null>(
    animationData ?? null
  );
  const [error, setError] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const tiltX = useTransform(rotateX, [-1, 1], [10, -10]);
  const tiltY = useTransform(rotateY, [-1, 1], [-10, 10]);

  useEffect(() => {
    let isMounted = true;

    if (!animationUrl || animationData || isDotLottie) {
      return undefined;
    }

    const loadAnimation = async () => {
      try {
        const response = await fetch(animationUrl);
        if (!response.ok) {
          throw new Error("Failed to load animation");
        }
        const data = (await response.json()) as object;
        if (isMounted) {
          setResolvedData(data);
        }
      } catch {
        if (isMounted) {
          setError(true);
        }
      }
    };

    loadAnimation();

    return () => {
      isMounted = false;
    };
  }, [animationUrl, animationData]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(y * -2);
    rotateY.set(x * 2);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  if (error || (!resolvedData && !isDotLottie)) {
    return null;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        perspective: 900,
        transformStyle: "preserve-3d",
        rotateX: tiltX,
        rotateY: tiltY
      }}
    >
      {isDotLottie && animationUrl ? (
        <DotLottie src={animationUrl} loop={loop} autoplay={autoplay} />
      ) : (
        <Lottie animationData={resolvedData} loop={loop} autoplay={autoplay} />
      )}
    </motion.div>
  );
}
