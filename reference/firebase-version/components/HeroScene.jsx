// src/components/HeroScene.jsx
// A small WebGL scene for the welcome page: three paper sheets that float, tilt toward the
// pointer with spring easing, and drift with scroll. Three.js is loaded on demand from a CDN
// so the app needs no new dependency; if WebGL or the download fails, `fallback` is shown.
import React, { useEffect, useRef, useState } from 'react';

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

function roundedShape(THREE, w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Draws the printed face of a sheet onto a canvas (transparent background).
function drawSheet({ title, ref, accent, status, detailed }) {
  const W = 880;
  const H = 1200;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const serif = 'Nunito, system-ui, sans-serif';
  const sans = 'Nunito, system-ui, sans-serif';
  const ink = '#14142B';

  // seal
  g.lineWidth = 6;
  g.strokeStyle = accent;
  g.beginPath(); g.arc(120, 130, 46, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 2;
  g.beginPath(); g.arc(120, 130, 34, 0, Math.PI * 2); g.stroke();
  g.fillStyle = accent;
  g.font = `600 26px ${sans}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('BL', 120, 132);

  g.textAlign = 'left';
  g.fillStyle = '#6B7280';
  g.font = `600 22px ${sans}`;
  g.fillText('BARANGAY LABANGON', 200, 118);
  g.font = `400 20px ${sans}`;
  g.fillText('Office of the Barangay', 200, 148);

  g.fillStyle = ink;
  g.font = `800 72px ${serif}`;
  g.fillText(title, 72, 330);

  g.fillStyle = '#9CA3AF';
  g.font = `500 22px ui-monospace, Menlo, monospace`;
  g.fillText(ref, 74, 385);

  // body lines
  g.fillStyle = 'rgba(20,20,43,0.10)';
  const widths = detailed ? [680, 620, 700, 540, 660, 480] : [680, 560, 640];
  widths.forEach((w, i) => {
    rrect(g, 72, 470 + i * 52, w, 18, 9);
    g.fill();
  });

  if (detailed) {
    // progress segments
    for (let i = 0; i < 4; i++) {
      g.fillStyle = i < 3 ? accent : 'rgba(20,20,43,0.12)';
      rrect(g, 72 + i * 182, 860, 166, 12, 6);
      g.fill();
    }
    // status pill
    g.fillStyle = `${accent}22`;
    rrect(g, 72, 920, 330, 68, 34);
    g.fill();
    g.fillStyle = accent;
    g.beginPath(); g.arc(112, 954, 8, 0, Math.PI * 2); g.fill();
    g.font = `600 26px ${sans}`;
    g.textBaseline = 'middle';
    g.fillText(status, 134, 956);

    // signature line + stamp
    g.strokeStyle = 'rgba(20,20,43,0.25)';
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(72, 1100); g.lineTo(360, 1100); g.stroke();
    g.fillStyle = '#9CA3AF';
    g.font = `400 20px ${sans}`;
    g.textBaseline = 'alphabetic';
    g.fillText('Barangay Captain', 72, 1136);

    g.save();
    g.translate(690, 1040);
    g.rotate(-0.22);
    g.strokeStyle = accent;
    g.globalAlpha = 0.7;
    g.lineWidth = 5;
    g.beginPath(); g.arc(0, 0, 70, 0, Math.PI * 2); g.stroke();
    g.fillStyle = accent;
    g.font = `700 24px ${sans}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('APPROVED', 0, 0);
    g.restore();
  }
  return c;
}

export default function HeroScene({ fallback = null, className = '' }) {
  const hostRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      try {
        const probe = document.createElement('canvas');
        if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('no webgl');

        const THREE = await import(/* @vite-ignore */ THREE_URL);
        try {
          await Promise.all([
            document.fonts.load('800 72px Nunito'),
            document.fonts.load('600 24px Nunito'),
          ]);
        } catch { /* fonts are optional for the scene */ }
        if (cancelled) return;

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        host.appendChild(renderer.domElement);
        renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y;';

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
        camera.position.set(0, 0, 9);

        scene.add(new THREE.AmbientLight(0xffffff, 1.9));
        const key = new THREE.DirectionalLight(0xffffff, 0.9);
        key.position.set(3, 4, 6);
        scene.add(key);
        const rim = new THREE.PointLight(0x7c83ff, 40, 20);
        rim.position.set(-4, -2, 3);
        scene.add(rim);

        const disposables = [];
        const SHEET_W = 2.2;
        const SHEET_H = 3.0;
        const shape = roundedShape(THREE, SHEET_W, SHEET_H, 0.16);
        const geo = new THREE.ExtrudeGeometry(shape, {
          depth: 0.05, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3, curveSegments: 14,
        });
        const faceGeo = new THREE.PlaneGeometry(SHEET_W - 0.04, SHEET_H - 0.04);
        disposables.push(geo, faceGeo);

        const sheetsDef = [
          { color: 0xe7e5ff, accent: '#4D55F5', title: 'Residency', ref: 'CERT-2026-001', pos: [1.45, 0.25, -0.9], rot: [0.05, -0.32, 0.12], detailed: false },
          { color: 0xffe5d6, accent: '#E0743B', title: 'Indigency', ref: 'CERT-2026-002', pos: [-1.5, 0.1, -0.5], rot: [-0.04, 0.3, -0.1], detailed: false },
          { color: 0xf8f6f1, accent: '#4D55F5', title: 'Clearance', ref: `BR-${new Date().getFullYear()}-004512`, pos: [0, -0.05, 0.4], rot: [0, 0, 0], detailed: true, status: 'Ready for Pickup' },
        ];

        const group = new THREE.Group();
        scene.add(group);
        const sheets = sheetsDef.map((d, i) => {
          const holder = new THREE.Group();
          const mat = new THREE.MeshStandardMaterial({ color: d.color, roughness: 0.55, metalness: 0.05 });
          const body = new THREE.Mesh(geo, mat);
          body.position.z = -0.035;
          holder.add(body);

          const tex = new THREE.CanvasTexture(drawSheet(d));
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 8;
          const faceMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
          const face = new THREE.Mesh(faceGeo, faceMat);
          face.position.z = 0.037;
          holder.add(face);
          disposables.push(mat, tex, faceMat);

          holder.position.set(...d.pos);
          holder.rotation.set(...d.rot);
          group.add(holder);
          return { holder, base: d, phase: i * 1.7 };
        });

        // Soft drifting specks for depth
        const N = 70;
        const arr = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
          arr[i * 3] = (Math.random() - 0.5) * 10;
          arr[i * 3 + 1] = (Math.random() - 0.5) * 7;
          arr[i * 3 + 2] = -2 + Math.random() * 4;
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
        const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, transparent: true, opacity: 0.45, depthWrite: false });
        const points = new THREE.Points(pGeo, pMat);
        scene.add(points);
        disposables.push(pGeo, pMat);

        // Sizing: keep the whole stack in frame on narrow screens
        const resize = () => {
          const w = host.clientWidth || 1;
          const h = host.clientHeight || 1;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          const fit = Math.min(1, camera.aspect / 0.95);
          camera.position.z = 9 / Math.max(fit, 0.62);
          camera.updateProjectionMatrix();
          if (reduce) renderer.render(scene, camera);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(host);

        // Pointer (mouse or touch) tilt target, eased with a frame-rate independent spring-like lerp
        const target = { x: 0, y: 0 };
        const cur = { x: 0, y: 0 };
        const onMove = (e) => {
          const r = host.getBoundingClientRect();
          target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
          target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        };
        const onLeave = () => { target.x = 0; target.y = 0; };
        if (!reduce) {
          window.addEventListener('pointermove', onMove, { passive: true });
          host.addEventListener('pointerleave', onLeave);
        }

        let running = false;
        let raf = 0;
        let last = performance.now();
        const tick = (now) => {
          if (!running) return;
          const dt = Math.min((now - last) / 1000, 0.05);
          last = now;
          const k = 1 - Math.exp(-dt * 4.5);
          cur.x += (target.x - cur.x) * k;
          cur.y += (target.y - cur.y) * k;
          const t = now / 1000;
          const scroll = Math.min(window.scrollY / 700, 1);

          group.rotation.y = cur.x * 0.5 + scroll * 0.35;
          group.rotation.x = cur.y * 0.28 - scroll * 0.12;
          group.position.y = Math.sin(t * 0.8) * 0.06;

          sheets.forEach((s) => {
            const f = Math.sin(t * 0.7 + s.phase);
            s.holder.position.y = s.base.pos[1] + f * 0.09;
            s.holder.rotation.z = s.base.rot[2] + f * 0.015;
            // outer sheets fan out slightly with pointer for parallax depth
            s.holder.position.x = s.base.pos[0] + cur.x * (s.base.pos[2] < 0 ? -0.25 : 0.1);
          });
          points.rotation.y = t * 0.02 + cur.x * 0.08;

          renderer.render(scene, camera);
          raf = requestAnimationFrame(tick);
        };
        const start = () => {
          if (reduce || running) return;
          running = true;
          last = performance.now();
          raf = requestAnimationFrame(tick);
        };
        const stop = () => { running = false; cancelAnimationFrame(raf); };

        // Only animate while visible
        const io = new IntersectionObserver(([en]) => (en.isIntersecting && !document.hidden ? start() : stop()), { threshold: 0.05 });
        io.observe(host);
        const onVis = () => (document.hidden ? stop() : start());
        document.addEventListener('visibilitychange', onVis);
        if (reduce) renderer.render(scene, camera);

        cleanup = () => {
          stop();
          io.disconnect();
          ro.disconnect();
          document.removeEventListener('visibilitychange', onVis);
          window.removeEventListener('pointermove', onMove);
          host.removeEventListener('pointerleave', onLeave);
          disposables.forEach((d) => d.dispose && d.dispose());
          renderer.dispose();
          if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
        };
      } catch (err) {
        console.warn('3D hero unavailable, showing the static version.', err);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <div className={className}>
      {failed ? fallback : <div ref={hostRef} className="w-full h-full" aria-hidden="true" />}
    </div>
  );
}
