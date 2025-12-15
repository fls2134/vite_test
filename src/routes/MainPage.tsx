import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LiquidGlass } from '@liquidglass/react'
import img1 from '../img/1.타이틀 및 헤더.png'
import img2 from '../img/2.강사소개.png'
import img3 from '../img/3.설명회 진행.png'
import img4 from '../img/4.설명회 장소 안내.png'
import img5 from '../img/5.커리큘럼.png'

function MainPage() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const images = [img1, img2, img3, img4, img5]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState<number | null>(null)
  const [deltaX, setDeltaX] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const spots = [
      {
        // 가장 작은 하이라이트 (푸른빛)
        x: 0.18,
        y: 0.25,
        r: 200,
        color: "oklab(0.4 -0.03 -0.12)", // 어두운 sky 블루
        vx: 0.005,
        vy: 0.0035,
      },
      {
        // 가장 큰 메인 스포트 (보라 계열)
        x: 0.78,
        y: 0.4,
        r: 400,
        color: "oklab(0.3 0.10 -0.20)", // 어두운 퍼플
        vx: -0.003,
        vy: 0.0025,
      },
      {
        // 중간 크기, 에메랄드 느낌
        x: 0.45,
        y: 0.82,
        r: 490,
        color: "oklab(0.4 -0.20 0.00)", // 어두운 그린/에메랄드 계열
        vx: 0.004,
        vy: -0.0045,
      },
      {
        // 앰버 계열, 상단 중앙 쪽
        x: 0.5,
        y: 0.1,
        r: 240,
        color: "oklab(0.35 0.06 0.12)", // 따뜻한 앰버/골드 느낌
        vx: -0.0035,
        vy: 0.003,
      },
    ];

    let frameId: number;

    const loop = () => {
      const { innerWidth: w, innerHeight: h } = window;
      ctx.clearRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";
      ctx.filter = "blur(80px)";

      for (const s of spots) {
        s.x += s.vx;
        s.y += s.vy;

        if (s.x < 0.05 || s.x > 0.95) s.vx *= -1;
        if (s.y < 0.05 || s.y > 0.95) s.vy *= -1;

        const cx = s.x * w;
        const cy = s.y * h;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, s.r);
        grad.addColorStop(0, s.color);
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // 카로셀 자동 슬라이드 (드래그 중에는 멈춤)
  useEffect(() => {
    if (images.length <= 1 || isDragging) return

    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [images.length, isDragging])

  const slideTo = (direction: 'next' | 'prev') => {
    setCurrentIndex((prev) => {
      if (direction === 'next') {
        return (prev + 1) % images.length
      }
      return (prev - 1 + images.length) % images.length
    })
  }

  const handleSwipeEnd = () => {
    if (startX === null) return

    const threshold = 50 // px 기준
    if (deltaX > threshold) {
      // 오른쪽으로 드래그 → 이전 이미지
      slideTo('prev')
    } else if (deltaX < -threshold) {
      // 왼쪽으로 드래그 → 다음 이미지
      slideTo('next')
    }

    setIsDragging(false)
    setStartX(null)
    setDeltaX(0)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setStartX(touch.clientX)
    setDeltaX(0)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || startX === null) return
    const touch = e.touches[0]
    setDeltaX(touch.clientX - startX)
  }

  const handleTouchEnd = () => {
    handleSwipeEnd()
  }

  // 마우스 드래그(데스크톱)도 지원
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    setStartX(e.clientX)
    setDeltaX(0)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || startX === null) return
    setDeltaX(e.clientX - startX)
  }

  const handleMouseUp = () => {
    handleSwipeEnd()
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      handleSwipeEnd()
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black flex items-center justify-center px-4 text-white overflow-hidden">
      {/* Canvas 기반 블러 스포트라이트 레이어 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <canvas ref={canvasRef} />
      </div>

      {/* 컨텐츠 */}
      <div className="relative z-10 w-full max-w-3xl text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight space-y-3">
          <span className="block text-white drop-shadow-[0_0_18px_rgba(59,130,246,0.8)]">
            일로SW입시연구소
          </span>
          <span className="block text-white/90 text-lg sm:text-xl md:text-2xl font-semibold">
            1기 모집 설명회
          </span>
        </h1>

        {/* 이미지 카로셀 (이미지 크기에 맞는 레이아웃 + 스와이프) */}
        <div className="mt-8 w-full flex justify-center">
          <div
            className="relative inline-block rounded-2xl bg-black/30 p-2 select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={images[currentIndex]}
              alt={`설명회 이미지 ${currentIndex + 1}`}
              className="h-auto max-h-[70vh] w-auto max-w-full object-contain block"
              loading="eager"
            />

            {/* 인디케이터 */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    idx === currentIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                  aria-label={`이미지 ${idx + 1} 보기`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 리퀴드글래스 컨테이너 (공식 예제 스타일 참고) */}
        <div className="mt-10 flex justify-center">
          <div className="w-4/5 h-14 sm:w-4/5 sm:h-16">
            <LiquidGlass
              borderRadius={16}
              blur={0.9}
              contrast={1.2}
              saturation={1.2}
              className='bg-blue-500/50 cursor-pointer'
            >
              <button
                onClick={() => navigate('/form')}
                className="h-full w-full flex flex-col items-center justify-center gap-2 text-white font-semibold text-lg sm:text-xl"
              >
                신청하기
              </button>
            </LiquidGlass>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
