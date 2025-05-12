import { useEffect } from "react";

function ParallaxBackground() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/parallax/3.1.0/parallax.min.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const scene = document.getElementById("scene");
      if (scene) {
        new (window as any).Parallax(scene, {
          relativeInput: true,
          hoverOnly: true,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const shadow = document.querySelector(".gif-shadow") as HTMLElement;
      if (shadow) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const deltaX = (mouseX / window.innerWidth) * 15 - 7.5;
        const deltaY = (mouseY / window.innerHeight) * 15 - 7.5;
        shadow.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      id="scene"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center"
    >
      <div className="layer" data-depth="0.5">
        <div className="relative w-[250px] h-[250px] flex items-center justify-center">
          <img
            className="gif-shadow absolute grayscale brightness-0 z-[-1]"
            src="/gato-porro.gif"
            alt="Sombra"
          />
          <img
            src="/gato-porro.gif"
            alt="Gato porro"
            className="rounded-full w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default ParallaxBackground;
