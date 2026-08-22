"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function NeonMesh({
  title = "KINETIC",
  subtitle = "",
  description = "Interactive 3D Verlet physics cloth reacting to spatial vector force, perspective rotators, and kinetic drag.",
  className = "",
  children,
  height = "min-h-[460px] md:min-h-[520px]",
  darkMode = false,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let heightPx = 0;

    // Interactive mouse camera angles & forces
    const mouse = {
      x: -1000,
      y: -1000,
      targetAngleX: 0.15,
      targetAngleY: -0.2,
      angleX: 0.15,
      angleY: -0.2,
      radius: 200,
    };

    let points = [];
    let constraints = [];

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      heightPx = rect.height;
      canvas.width = width * dpr;
      canvas.height = heightPx * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${heightPx}px`;
      ctx.scale(dpr, dpr);
      initMesh();
    };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;

      mouse.x = rawX;
      mouse.y = rawY;

      // Map mouse displacement across screen to interactive 3D tilt
      const normX = (rawX / (width || 1) - 0.5) * 2;
      const normY = (rawY / (heightPx || 1) - 0.5) * 2;
      mouse.targetAngleY = normX * 0.35;
      mouse.targetAngleX = -normY * 0.25 + 0.15;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.targetAngleX = 0.15;
      mouse.targetAngleY = 0;
    };

    const initMesh = () => {
      points = [];
      constraints = [];

      const spacing = 44;
      const cols = Math.ceil((width * 1.1) / spacing) + 1;
      const rows = Math.ceil((heightPx * 1.1) / spacing) + 1;

      const grid = [];
      const startX = -(cols * spacing) / 2;
      const startY = -(rows * spacing) / 2;

      for (let j = 0; j < rows; j++) {
        grid[j] = [];
        for (let i = 0; i < cols; i++) {
          const bx = startX + i * spacing;
          const by = startY + j * spacing;
          const bz = 0;

          const isEdge = i === 0 || i === cols - 1 || j === 0 || j === rows - 1;

          const p = {
            x: bx,
            y: by,
            z: bz,
            oldX: bx,
            oldY: by,
            oldZ: bz,
            pinned: isEdge,
            baseX: bx,
            baseY: by,
            baseZ: bz,
            projX: 0,
            projY: 0,
            projScale: 1,
          };

          points.push(p);
          grid[j][i] = p;
        }
      }

      // 3D Grid Springs
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          if (i < cols - 1) {
            constraints.push({
              p1: grid[j][i],
              p2: grid[j][i + 1],
              length: spacing,
            });
          }
          if (j < rows - 1) {
            constraints.push({
              p1: grid[j][i],
              p2: grid[j + 1][i],
              length: spacing,
            });
          }
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.025;

      // Smooth camera interpolation
      mouse.angleX += (mouse.targetAngleX - mouse.angleX) * 0.05;
      mouse.angleY += (mouse.targetAngleY - mouse.angleY) * 0.05;

      const cosX = Math.cos(mouse.angleX);
      const sinX = Math.sin(mouse.angleX);
      const cosY = Math.cos(mouse.angleY);
      const sinY = Math.sin(mouse.angleY);

      // Clean, bright white/slate background with blue/cyan wireframe
      const bgColor = darkMode ? "#080c16" : "#ffffff";
      const baseMeshColor = darkMode ? "56, 189, 248" : "59, 130, 246"; // Blue wireframe
      const hoverMeshColor = darkMode ? "#38bdf8" : "#2563eb"; // Deep vibrant blue
      const nodeHighlightColor = darkMode ? "#a855f7" : "#3b82f6";

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, heightPx);

      // Verlet Integration Step with 3D Spatial Wave Dynamics
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (p.pinned) continue;

        const vx = (p.x - p.oldX) * 0.93;
        const vy = (p.y - p.oldY) * 0.93;
        const vz = (p.z - p.oldZ) * 0.93;

        p.oldX = p.x;
        p.oldY = p.y;
        p.oldZ = p.z;

        p.x += vx;
        p.y += vy;
        p.z += vz;

        // Continuous organic 3D wave oscillation along Z
        const ambientZ = Math.sin(p.baseX * 0.015 + p.baseY * 0.015 + time) * 14;

        // Anchor Pull Restoration Force
        p.x += (p.baseX - p.x) * 0.04;
        p.y += (p.baseY - p.y) * 0.04;
        p.z += (p.baseZ + ambientZ - p.z) * 0.04;
      }

      // 3D Projection Calculation
      const perspective = 600;
      const centerX = width / 2;
      const centerY = heightPx / 2;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // 3D Y Rotation
        const rx1 = p.x * cosY + p.z * sinY;
        const ry1 = p.y;
        const rz1 = -p.x * sinY + p.z * cosY;

        // 3D X Pitch Rotation
        const rx2 = rx1;
        const ry2 = ry1 * cosX - rz1 * sinX;
        const rz2 = ry1 * sinX + rz1 * cosX + 400; // Camera distance shift

        // Perspective Scale Factor
        const scale = perspective / Math.max(1, rz2);
        p.projScale = scale;
        p.projX = centerX + rx2 * scale;
        p.projY = centerY + ry2 * scale;

        // Screen-space 3D Interactive Force
        if (!p.pinned) {
          const dx = p.projX - mouse.x;
          const dy = p.projY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 0) {
            const force = (1 - dist / mouse.radius) * 22;
            const angle = Math.atan2(dy, dx);
            p.x += (Math.cos(angle) * force) / p.projScale;
            p.y += (Math.sin(angle) * force) / p.projScale;
            p.z -= (force * 1.5) / p.projScale;
          }
        }
      }

      // Constraint Relaxation Solver
      for (let iter = 0; iter < 3; iter++) {
        for (let i = 0; i < constraints.length; i++) {
          const c = constraints[i];
          const dx = c.p2.x - c.p1.x;
          const dy = c.p2.y - c.p1.y;
          const dz = c.p2.z - c.p1.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const delta = (dist - c.length) / (dist || 1);

          if (!c.p1.pinned) {
            c.p1.x += dx * 0.5 * delta;
            c.p1.y += dy * 0.5 * delta;
            c.p1.z += dz * 0.5 * delta;
          }
          if (!c.p2.pinned) {
            c.p2.x -= dx * 0.5 * delta;
            c.p2.y -= dy * 0.5 * delta;
            c.p2.z -= dz * 0.5 * delta;
          }
        }
      }

      // Render Elastic 3D Wireframe Mesh
      for (let i = 0; i < constraints.length; i++) {
        const c = constraints[i];
        const midX = (c.p1.projX + c.p2.projX) / 2;
        const midY = (c.p1.projY + c.p2.projY) / 2;

        const dx = mouse.x - midX;
        const dy = mouse.y - midY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const isHot = dist < mouse.radius;
        const avgScale = (c.p1.projScale + c.p2.projScale) / 2;

        ctx.strokeStyle = isHot
          ? hoverMeshColor
          : `rgba(${baseMeshColor}, ${Math.min(0.25, Math.max(0.06, (darkMode ? 0.18 : 0.12) * avgScale))})`;
        ctx.lineWidth = isHot ? 1.5 * avgScale : 0.65 * avgScale;

        ctx.beginPath();
        ctx.moveTo(c.p1.projX, c.p1.projY);
        ctx.lineTo(c.p2.projX, c.p2.projY);
        ctx.stroke();
      }

      // Render Active Depth Nodes near cursor
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const dx = mouse.x - p.projX;
        const dy = mouse.y - p.projY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          ctx.fillStyle = nodeHighlightColor;
          ctx.beginPath();
          ctx.arc(p.projX, p.projY, 2.2 * p.projScale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [darkMode]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden select-none bg-white text-slate-900 flex items-center justify-center border-b border-slate-200",
        height,
        className
      )}
    >
      {/* 3D Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block cursor-crosshair z-0"
      />

      {/* Subtle overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white/90 pointer-events-none z-[1]" />

      {/* Hero Content (Interactive elements have pointer-events-auto) */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-10 sm:py-14 flex flex-col items-center justify-center text-center">
        {children ? (
          children
        ) : (
          <>
            {subtitle && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3 bg-blue-50 border border-blue-200 text-blue-700 pointer-events-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                {subtitle}
              </span>
            )}
            {title && (
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-3xl leading-tight pointer-events-none">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed pointer-events-none">
                {description}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default NeonMesh;
